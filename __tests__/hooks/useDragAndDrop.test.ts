import { renderHook, act } from '@testing-library/react'
import { useDragAndDrop } from '@/hooks/useDragAndDrop'
import { ruleService } from '@/lib/ruleService'
import { Rule } from '@/types/rule'

// Mock dependencies
jest.mock('@/lib/ruleService')
jest.mock('@/utils/priorityHelpers', () => ({
  validatePriorityConsistency: jest.fn(),
  calculatePriorityUpdates: jest.fn(),
  sortRulesByPriority: jest.fn()
}))

const mockRuleService = ruleService as jest.Mocked<typeof ruleService>
const mockValidatePriorityConsistency = require('@/utils/priorityHelpers').validatePriorityConsistency
const mockCalculatePriorityUpdates = require('@/utils/priorityHelpers').calculatePriorityUpdates

describe('useDragAndDrop', () => {
  const mockRules: Rule[] = [
    {
      id: 'rule-1',
      roster_id: 'roster-1',
      priority: 1,
      type: 'SEPARATE',
      student_ids: ['student-1', 'student-2'],
      is_active: true,
      created_at: new Date('2025-01-01'),
      updated_at: new Date('2025-01-01')
    },
    {
      id: 'rule-2',
      roster_id: 'roster-1',
      priority: 2,
      type: 'TOGETHER',
      student_ids: ['student-3', 'student-4'],
      is_active: true,
      created_at: new Date('2025-01-01'),
      updated_at: new Date('2025-01-01')
    }
  ]

  beforeEach(() => {
    jest.clearAllMocks()
    mockValidatePriorityConsistency.mockReturnValue({ isValid: true, issues: [] })
    mockCalculatePriorityUpdates.mockReturnValue([])
    mockRuleService.reorderRules.mockResolvedValue(mockRules)
    mockRuleService.validatePriorityConsistency.mockResolvedValue(true)
  })

  it('initializes with correct default values', () => {
    const { result } = renderHook(() => useDragAndDrop())

    expect(result.current.isReordering).toBe(false)
    expect(result.current.priorityUpdates).toEqual([])
    expect(result.current.lastError).toBeNull()
  })

  it('clears priority updates', () => {
    const { result } = renderHook(() => useDragAndDrop())

    act(() => {
      result.current.clearPriorityUpdates()
    })

    expect(result.current.priorityUpdates).toEqual([])
  })

  it('clears errors', () => {
    const { result } = renderHook(() => useDragAndDrop())

    act(() => {
      result.current.clearError()
    })

    expect(result.current.lastError).toBeNull()
  })

  describe('reorderRules', () => {
    const dropResult = {
      destination: { index: 1 },
      source: { index: 0 },
      draggableId: 'rule-1'
    }

    it('returns null when no destination', async () => {
      const { result } = renderHook(() => useDragAndDrop())

      const resultValue = await act(async () => {
        return await result.current.reorderRules(
          { ...dropResult, destination: null },
          mockRules,
          'roster-1'
        )
      })

      expect(resultValue).toBeNull()
    })

    it('returns null when dropped in same position', async () => {
      const { result } = renderHook(() => useDragAndDrop())

      const resultValue = await act(async () => {
        return await result.current.reorderRules(
          { ...dropResult, destination: { index: 0 } },
          mockRules,
          'roster-1'
        )
      })

      expect(resultValue).toBeNull()
    })

    it('returns null and sets error when rules array is empty', async () => {
      const { result } = renderHook(() => useDragAndDrop())

      const resultValue = await act(async () => {
        return await result.current.reorderRules(dropResult, [], 'roster-1')
      })

      expect(resultValue).toBeNull()
      expect(result.current.lastError).toBe('No rules available to reorder')
    })

    it('returns null and sets error when rosterId is invalid', async () => {
      const { result } = renderHook(() => useDragAndDrop())

      const resultValue = await act(async () => {
        return await result.current.reorderRules(dropResult, mockRules, '')
      })

      expect(resultValue).toBeNull()
      expect(result.current.lastError).toBe('Invalid roster ID provided')
    })

    it('returns null and sets error when rules don\'t belong to roster', async () => {
      const { result } = renderHook(() => useDragAndDrop())
      const invalidRules = [
        { ...mockRules[0], roster_id: 'different-roster' }
      ]

      const resultValue = await act(async () => {
        return await result.current.reorderRules(dropResult, invalidRules, 'roster-1')
      })

      expect(resultValue).toBeNull()
      expect(result.current.lastError).toBe('1 rule(s) don\'t belong to this roster')
    })

    it('returns null and sets error when initial validation fails', async () => {
      const { result } = renderHook(() => useDragAndDrop())
      mockValidatePriorityConsistency.mockReturnValueOnce({
        isValid: false,
        issues: ['Duplicate priorities']
      })

      const resultValue = await act(async () => {
        return await result.current.reorderRules(dropResult, mockRules, 'roster-1')
      })

      expect(resultValue).toBeNull()
      expect(result.current.lastError).toBe('Priority validation failed: Duplicate priorities')
    })

    it('successfully reorders rules', async () => {
      const { result } = renderHook(() => useDragAndDrop())
      const expectedUpdates = [
        { ruleId: 'rule-1', newPriority: 2, oldPriority: 1 },
        { ruleId: 'rule-2', newPriority: 1, oldPriority: 2 }
      ]
      
      mockCalculatePriorityUpdates.mockReturnValue(expectedUpdates)
      const reorderedRules = [
        { ...mockRules[1], priority: 1 },
        { ...mockRules[0], priority: 2 }
      ]
      mockRuleService.reorderRules.mockResolvedValue(reorderedRules)

      let resultValue: any
      await act(async () => {
        resultValue = await result.current.reorderRules(dropResult, mockRules, 'roster-1')
      })

      expect(resultValue).toBeDefined()
      expect(resultValue).toHaveLength(2)
      expect(resultValue[0].priority).toBe(2) // First rule moved to second position
      expect(resultValue[1].priority).toBe(1) // Second rule moved to first position
      expect(result.current.priorityUpdates).toEqual(expectedUpdates)
    })

    it('handles database errors with retry mechanism', async () => {
      const { result } = renderHook(() => useDragAndDrop())
      mockRuleService.reorderRules
        .mockRejectedValueOnce(new Error('Database error'))
        .mockRejectedValueOnce(new Error('Database error'))
        .mockResolvedValueOnce(mockRules)

      await act(async () => {
        await result.current.reorderRules(dropResult, mockRules, 'roster-1')
      })

      expect(mockRuleService.reorderRules).toHaveBeenCalledTimes(3)
    })

    it('handles database errors after retries exhausted', async () => {
      const { result } = renderHook(() => useDragAndDrop())
      mockRuleService.reorderRules.mockRejectedValue(new Error('Persistent DB error'))

      const resultValue = await act(async () => {
        return await result.current.reorderRules(dropResult, mockRules, 'roster-1')
      })

      expect(resultValue).toBeNull()
      expect(result.current.lastError).toContain('Database update failed after 3 attempts')
      expect(mockRuleService.reorderRules).toHaveBeenCalledTimes(3)
    })

    it('handles consistency validation failure after database save', async () => {
      const { result } = renderHook(() => useDragAndDrop())
      mockRuleService.validatePriorityConsistency.mockResolvedValue(false)

      const resultValue = await act(async () => {
        return await result.current.reorderRules(dropResult, mockRules, 'roster-1')
      })

      expect(resultValue).toBeNull()
      expect(result.current.lastError).toBe('Priority consistency validation failed after database update')
    })

    it('sets isReordering state during operation', async () => {
      const { result } = renderHook(() => useDragAndDrop())
      
      // Add a delay to the mock to test state management
      mockRuleService.reorderRules.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve(mockRules), 100))
      )

      act(() => {
        result.current.reorderRules(dropResult, mockRules, 'roster-1')
      })

      expect(result.current.isReordering).toBe(true)

      // Wait for the operation to complete
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 150))
      })

      expect(result.current.isReordering).toBe(false)
    })

    it('validates destination index bounds', async () => {
      const { result } = renderHook(() => useDragAndDrop())
      const invalidDropResult = {
        ...dropResult,
        destination: { index: 10 } // Beyond array bounds
      }

      const resultValue = await act(async () => {
        return await result.current.reorderRules(invalidDropResult, mockRules, 'roster-1')
      })

      expect(resultValue).toBeNull()
      expect(result.current.lastError).toContain('Invalid destination index')
    })
  })
})