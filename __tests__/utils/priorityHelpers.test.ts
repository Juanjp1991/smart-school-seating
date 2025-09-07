import {
  sortRulesByPriority,
  calculatePriorityUpdates,
  validatePriorityConsistency,
  getNextPriority,
  normalizePriorities,
  getPriorityIndicator,
  getPriorityLevel,
  formatPriorityOrdinal
} from '@/utils/priorityHelpers'
import { Rule } from '@/types/rule'

describe('priorityHelpers', () => {
  const mockRules: Rule[] = [
    {
      id: 'rule-1',
      roster_id: 'roster-1',
      priority: 3,
      type: 'SEPARATE',
      student_ids: ['student-1', 'student-2'],
      is_active: true,
      created_at: new Date('2025-01-01'),
      updated_at: new Date('2025-01-01')
    },
    {
      id: 'rule-2',
      roster_id: 'roster-1',
      priority: 1,
      type: 'TOGETHER',
      student_ids: ['student-3', 'student-4'],
      is_active: true,
      created_at: new Date('2025-01-01'),
      updated_at: new Date('2025-01-01')
    },
    {
      id: 'rule-3',
      roster_id: 'roster-1',
      priority: 2,
      type: 'FRONT_ROW',
      student_ids: ['student-5'],
      is_active: true,
      created_at: new Date('2025-01-01'),
      updated_at: new Date('2025-01-01')
    }
  ]

  describe('sortRulesByPriority', () => {
    it('sorts rules by priority ascending (1 = highest)', () => {
      const sorted = sortRulesByPriority(mockRules)
      
      expect(sorted[0].priority).toBe(1)
      expect(sorted[1].priority).toBe(2)
      expect(sorted[2].priority).toBe(3)
      expect(sorted[0].id).toBe('rule-2')
      expect(sorted[1].id).toBe('rule-3')
      expect(sorted[2].id).toBe('rule-1')
    })

    it('does not mutate original array', () => {
      const originalOrder = mockRules.map(r => r.id)
      sortRulesByPriority(mockRules)
      
      expect(mockRules.map(r => r.id)).toEqual(originalOrder)
    })

    it('handles empty array', () => {
      const result = sortRulesByPriority([])
      expect(result).toEqual([])
    })
  })

  describe('calculatePriorityUpdates', () => {
    it('only returns updates for changed priorities', () => {
      const reordered = [mockRules[1], mockRules[2], mockRules[0]] // rule-2 (p1), rule-3 (p2), rule-1 (p3)
      const updates = calculatePriorityUpdates(mockRules, reordered)
      
      // rule-2: position 0 -> newPriority 1, oldPriority 1 (no change, not included)
      // rule-3: position 1 -> newPriority 2, oldPriority 2 (no change, not included)  
      // rule-1: position 2 -> newPriority 3, oldPriority 3 (no change, not included)
      expect(updates).toHaveLength(0) // No changes with this order
    })

    it('calculates updates for actual reordering', () => {
      const reordered = [mockRules[2], mockRules[0], mockRules[1]] // rule-3 (p2), rule-1 (p3), rule-2 (p1)
      const updates = calculatePriorityUpdates(mockRules, reordered)
      
      // rule-3: position 0 -> newPriority 1, oldPriority 2 (change)
      // rule-1: position 1 -> newPriority 2, oldPriority 3 (change)  
      // rule-2: position 2 -> newPriority 3, oldPriority 1 (change)
      expect(updates).toHaveLength(3) // All have changes
      expect(updates.find(u => u.ruleId === 'rule-3')?.newPriority).toBe(1)
      expect(updates.find(u => u.ruleId === 'rule-1')?.newPriority).toBe(2)
      expect(updates.find(u => u.ruleId === 'rule-2')?.newPriority).toBe(3)
    })

    it('handles same order (no changes)', () => {
      // First sort rules by priority to get them in priority order
      const sortedRules = sortRulesByPriority(mockRules) // [rule-2 (p1), rule-3 (p2), rule-1 (p3)]
      const updates = calculatePriorityUpdates(sortedRules, sortedRules)
      
      // Since the function only returns changed priorities, this should be empty
      expect(updates).toHaveLength(0)
    })
  })

  describe('validatePriorityConsistency', () => {
    it('validates consistent priorities', () => {
      const result = validatePriorityConsistency(mockRules)
      
      expect(result.isValid).toBe(true)
      expect(result.issues).toEqual([])
    })

    it('detects duplicate priorities', () => {
      const duplicateRules = [
        { ...mockRules[0], priority: 1 },
        { ...mockRules[1], priority: 1 } // Duplicate
      ]
      
      const result = validatePriorityConsistency(duplicateRules)
      
      expect(result.isValid).toBe(false)
      expect(result.issues).toContain('Duplicate priority values found')
    })

    it('detects negative priorities', () => {
      const invalidRules = [
        { ...mockRules[0], priority: -1 }
      ]
      
      const result = validatePriorityConsistency(invalidRules)
      
      expect(result.isValid).toBe(false)
      expect(result.issues).toContain('Priority values must be positive integers')
    })

    it('detects zero priorities', () => {
      const invalidRules = [
        { ...mockRules[0], priority: 0 }
      ]
      
      const result = validatePriorityConsistency(invalidRules)
      
      expect(result.isValid).toBe(false)
      expect(result.issues).toContain('Priority values must be positive integers')
    })

    it('detects non-integer priorities', () => {
      const invalidRules = [
        { ...mockRules[0], priority: 1.5 }
      ]
      
      const result = validatePriorityConsistency(invalidRules)
      
      expect(result.isValid).toBe(false)
      expect(result.issues).toContain('Priority values must be integers')
    })

    it('handles empty array', () => {
      const result = validatePriorityConsistency([])
      
      expect(result.isValid).toBe(true)
      expect(result.issues).toEqual([])
    })
  })

  describe('getNextPriority', () => {
    it('returns 1 for empty array', () => {
      const result = getNextPriority([])
      expect(result).toBe(1)
    })

    it('returns max priority + 1', () => {
      const result = getNextPriority(mockRules)
      expect(result).toBe(4) // Max is 3, so next is 4
    })

    it('handles gaps in priorities', () => {
      const gappyRules = [
        { ...mockRules[0], priority: 1 },
        { ...mockRules[1], priority: 5 } // Gap from 2-4
      ]
      
      const result = getNextPriority(gappyRules)
      expect(result).toBe(6) // Next after max (5)
    })
  })

  describe('normalizePriorities', () => {
    it('normalizes priorities to consecutive numbers starting at 1', () => {
      const gappyRules = [
        { ...mockRules[0], priority: 5 },
        { ...mockRules[1], priority: 2 },
        { ...mockRules[2], priority: 10 }
      ]
      
      const normalized = normalizePriorities(gappyRules)
      
      expect(normalized[0].priority).toBe(1) // Was 2 (lowest)
      expect(normalized[1].priority).toBe(2) // Was 5 (middle)
      expect(normalized[2].priority).toBe(3) // Was 10 (highest)
      expect(normalized[0].id).toBe('rule-2') // Original rule with priority 2
    })

    it('maintains order based on original priorities', () => {
      const normalized = normalizePriorities(mockRules)
      
      expect(normalized[0].id).toBe('rule-2') // Original priority 1
      expect(normalized[1].id).toBe('rule-3') // Original priority 2
      expect(normalized[2].id).toBe('rule-1') // Original priority 3
    })

    it('handles empty array', () => {
      const result = normalizePriorities([])
      expect(result).toEqual([])
    })
  })

  describe('getPriorityIndicator', () => {
    it('returns correct emoji for priority 1 of 5 (100%)', () => {
      const indicator = getPriorityIndicator(1, 5) // (5-1+1)/5 = 1.0 = 100%
      expect(indicator).toBe('🔥') // >= 0.8 -> highest
    })

    it('returns correct emoji for priority 2 of 5 (80%)', () => {
      const indicator = getPriorityIndicator(2, 5) // (5-2+1)/5 = 0.8 = 80%
      expect(indicator).toBe('🔥') // >= 0.8 -> highest
    })

    it('returns correct emoji for priority 3 of 5 (60%)', () => {
      const indicator = getPriorityIndicator(3, 5) // (5-3+1)/5 = 0.6 = 60%
      expect(indicator).toBe('⚡') // >= 0.6 -> medium-high
    })

    it('returns correct emoji for priority 4 of 5 (40%)', () => {
      const indicator = getPriorityIndicator(4, 5) // (5-4+1)/5 = 0.4 = 40%
      expect(indicator).toBe('📍') // >= 0.4 -> medium
    })

    it('returns correct emoji for priority 5 of 5 (20%)', () => {
      const indicator = getPriorityIndicator(5, 5) // (5-5+1)/5 = 0.2 = 20%
      expect(indicator).toBe('📝') // >= 0.2 -> low-medium
    })

    it('handles edge cases', () => {
      expect(getPriorityIndicator(1, 1)).toBe('🔥') // Only rule = 100%
      expect(getPriorityIndicator(10, 10)).toBe('💤') // Last of 10 = 10% -> lowest (< 0.2)
    })
  })

  describe('getPriorityLevel', () => {
    it('returns correct level names based on percentage', () => {
      expect(getPriorityLevel(1, 5)).toBe('Highest priority') // 100%
      expect(getPriorityLevel(2, 5)).toBe('Highest priority') // 80%
      expect(getPriorityLevel(3, 5)).toBe('High priority')     // 60%
      expect(getPriorityLevel(4, 5)).toBe('Medium priority')   // 40%
      expect(getPriorityLevel(5, 5)).toBe('Low priority')      // 20%
    })

    it('handles single rule', () => {
      expect(getPriorityLevel(1, 1)).toBe('Highest priority')
    })

    it('handles lowest priority scenario', () => {
      expect(getPriorityLevel(10, 10)).toBe('Lowest priority') // 10% -> lowest priority (< 0.2)
      expect(getPriorityLevel(100, 100)).toBe('Lowest priority') // 1% -> lowest
    })
  })

  describe('formatPriorityOrdinal', () => {
    it('formats 1st correctly', () => {
      expect(formatPriorityOrdinal(1)).toBe('1st')
      expect(formatPriorityOrdinal(21)).toBe('21st')
      expect(formatPriorityOrdinal(31)).toBe('31st')
    })

    it('formats 2nd correctly', () => {
      expect(formatPriorityOrdinal(2)).toBe('2nd')
      expect(formatPriorityOrdinal(22)).toBe('22nd')
      expect(formatPriorityOrdinal(32)).toBe('32nd')
    })

    it('formats 3rd correctly', () => {
      expect(formatPriorityOrdinal(3)).toBe('3rd')
      expect(formatPriorityOrdinal(23)).toBe('23rd')
      expect(formatPriorityOrdinal(33)).toBe('33rd')
    })

    it('formats th correctly', () => {
      expect(formatPriorityOrdinal(4)).toBe('4th')
      expect(formatPriorityOrdinal(10)).toBe('10th')
      expect(formatPriorityOrdinal(11)).toBe('11th') // Special case
      expect(formatPriorityOrdinal(12)).toBe('12th') // Special case
      expect(formatPriorityOrdinal(13)).toBe('13th') // Special case
      expect(formatPriorityOrdinal(24)).toBe('24th')
      expect(formatPriorityOrdinal(100)).toBe('100th')
    })
  })
})