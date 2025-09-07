import { ruleService } from '@/lib/ruleService'
import { dbService } from '@/lib/db'
import { Rule, CreateRuleData } from '@/types/rule'

// Mock the database service
jest.mock('@/lib/db', () => ({
  dbService: {
    createRule: jest.fn(),
    getRulesByRoster: jest.fn(),
    updateRule: jest.fn(),
    deleteRule: jest.fn(),
    reorderRules: jest.fn(),
    getRuleById: jest.fn()
  }
}))

describe('RuleService', () => {
  const mockRosterId = 'roster-1'
  const mockRuleData: CreateRuleData = {
    priority: 1,
    type: 'SEPARATE',
    student_ids: ['student-1', 'student-2'],
    is_active: true
  }

  const mockRule: Rule = {
    id: 'rule-1',
    roster_id: mockRosterId,
    priority: 1,
    type: 'SEPARATE',
    student_ids: ['student-1', 'student-2'],
    is_active: true,
    created_at: new Date(),
    updated_at: new Date()
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('createRule', () => {
    it('creates a rule successfully', async () => {
      const { dbService } = require('@/lib/db')
      dbService.createRule.mockResolvedValue('rule-1')
      dbService.getRulesByRoster.mockResolvedValue([mockRule])

      const result = await ruleService.createRule(mockRosterId, mockRuleData)

      expect(dbService.createRule).toHaveBeenCalledWith({
        roster_id: mockRosterId,
        priority: 1,
        type: 'SEPARATE',
        student_ids: ['student-1', 'student-2'],
        is_active: true
      })
      expect(result).toEqual(mockRule)
    })

    it('throws error for invalid rule data', async () => {
      const invalidRuleData = {
        ...mockRuleData,
        student_ids: [] // Empty student list
      }

      await expect(ruleService.createRule(mockRosterId, invalidRuleData))
        .rejects.toThrow('Rule validation failed')
    })

    it('throws error for separate rule with only one student', async () => {
      const invalidRuleData = {
        ...mockRuleData,
        student_ids: ['student-1'], // Only one student for separate rule
        type: 'SEPARATE' as const
      }

      await expect(ruleService.createRule(mockRosterId, invalidRuleData))
        .rejects.toThrow('Rule validation failed')
    })
  })

  describe('getRulesByRoster', () => {
    it('returns rules for a roster', async () => {
      const { dbService } = require('@/lib/db')
      const mockRules = [mockRule]
      dbService.getRulesByRoster.mockResolvedValue(mockRules)

      const result = await ruleService.getRulesByRoster(mockRosterId)

      expect(dbService.getRulesByRoster).toHaveBeenCalledWith(mockRosterId)
      expect(result).toEqual(mockRules)
    })
  })

  describe('updateRule', () => {
    it('updates a rule successfully', async () => {
      const { dbService } = require('@/lib/db')
      dbService.updateRule.mockResolvedValue()
      dbService.getRulesByRoster.mockResolvedValue([mockRule])
      dbService.getRuleById.mockResolvedValue(mockRule)

      const updates = { priority: 2, is_active: false }
      
      await ruleService.updateRule('rule-1', updates)

      expect(dbService.updateRule).toHaveBeenCalledWith('rule-1', updates)
    })

    it('throws error for invalid updates', async () => {
      const invalidUpdates = {
        priority: -1 // Invalid priority
      }

      await expect(ruleService.updateRule('rule-1', invalidUpdates))
        .rejects.toThrow('Rule validation failed')
    })
  })

  describe('deleteRule', () => {
    it('deletes a rule successfully', async () => {
      const { dbService } = require('@/lib/db')
      dbService.deleteRule.mockResolvedValue()

      await ruleService.deleteRule('rule-1')

      expect(dbService.deleteRule).toHaveBeenCalledWith('rule-1')
    })
  })

  describe('toggleRuleActive', () => {
    it('toggles rule active status', async () => {
      const { dbService } = require('@/lib/db')
      const inactiveRule = { ...mockRule, is_active: false }
      const activeRule = { ...mockRule, is_active: true }
      dbService.updateRule.mockResolvedValue()
      dbService.getRulesByRoster.mockResolvedValue([activeRule]) // Return the updated rule
      dbService.getRuleById.mockResolvedValue(inactiveRule)

      const result = await ruleService.toggleRuleActive('rule-1')

      expect(dbService.updateRule).toHaveBeenCalledWith('rule-1', { is_active: true })
      expect(result.is_active).toBe(true)
    })
  })

  describe('reorderRules', () => {
    it('reorders rules successfully', async () => {
      const { dbService } = require('@/lib/db')
      const mockRule2: Rule = {
        id: 'rule-2',
        roster_id: mockRosterId,
        priority: 2,
        type: 'TOGETHER',
        student_ids: ['student-3', 'student-4'],
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
      
      dbService.updateRule.mockResolvedValue({ ...mockRule, priority: 2 })
      dbService.getRuleById.mockResolvedValue(mockRule)
      dbService.getRulesByRoster.mockResolvedValue([mockRule2, { ...mockRule, priority: 2 }])

      const reorderedRules = [
        mockRule2,
        { ...mockRule, priority: 2 }
      ]
      
      const result = await ruleService.reorderRules(mockRosterId, reorderedRules)

      expect(result).toHaveLength(2)
      expect(result[0].priority).toBe(1) // mockRule2 should get priority 1
      expect(result[1].priority).toBe(2) // mockRule should get priority 2
    })
  })

  describe('validateRule', () => {
    it('validates a correct rule', async () => {
      const result = await ruleService['validateRule']({
        roster_id: mockRosterId,
        ...mockRuleData
      })

      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('detects missing required fields', async () => {
      const result = await ruleService['validateRule']({})

      expect(result.valid).toBe(false)
      expect(result.errors.some(e => e.field === 'roster_id')).toBe(true)
      expect(result.errors.some(e => e.field === 'type')).toBe(true)
      expect(result.errors.some(e => e.field === 'priority')).toBe(true)
      expect(result.errors.some(e => e.field === 'student_ids')).toBe(true)
    })

    it('detects invalid priority', async () => {
      const result = await ruleService['validateRule']({
        roster_id: mockRosterId,
        ...mockRuleData,
        priority: 0
      })

      expect(result.valid).toBe(false)
      expect(result.errors.some(e => e.message.includes('Priority must be a positive number'))).toBe(true)
    })

    it('detects insufficient students for separate rule', async () => {
      const result = await ruleService['validateRule']({
        roster_id: mockRosterId,
        ...mockRuleData,
        type: 'SEPARATE',
        student_ids: ['student-1']
      })

      expect(result.valid).toBe(false)
      expect(result.errors.some(e => e.message.includes('Separate rules require at least 2 students'))).toBe(true)
    })

    it('detects duplicate student IDs', async () => {
      const result = await ruleService['validateRule']({
        roster_id: mockRosterId,
        ...mockRuleData,
        student_ids: ['student-1', 'student-1'] // Duplicate
      })

      expect(result.valid).toBe(false)
      expect(result.errors.some(e => e.message.includes('Duplicate student IDs'))).toBe(true)
    })

    it('accepts single student for location rules', async () => {
      const result = await ruleService['validateRule']({
        roster_id: mockRosterId,
        ...mockRuleData,
        type: 'FRONT_ROW',
        student_ids: ['student-1']
      })

      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })
  })
})