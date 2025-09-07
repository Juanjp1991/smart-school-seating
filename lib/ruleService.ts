import { dbService } from '@/lib/db'
import { Rule, CreateRuleData, RuleType, ValidationResult, RuleValidationError, RULE_TYPES, RuleFilters } from '@/types/rule'

export class RuleService {
  async createRule(rosterId: string, ruleData: CreateRuleData): Promise<Rule> {
    // Validate the rule data
    const validation = await this.validateRule({ ...ruleData, roster_id: rosterId })
    if (!validation.valid) {
      throw new Error(`Rule validation failed: ${validation.errors.map(e => e.message).join(', ')}`)
    }

    const ruleId = await dbService.createRule({
      roster_id: rosterId,
      priority: ruleData.priority,
      type: ruleData.type,
      student_ids: ruleData.student_ids,
      is_active: ruleData.is_active
    })

    // Return the created rule with full data
    const rules = await dbService.getRulesByRoster(rosterId)
    const createdRule = rules.find(r => r.id === ruleId)
    
    if (!createdRule) {
      throw new Error('Failed to retrieve created rule')
    }

    return createdRule
  }

  async getRulesByRoster(rosterId: string): Promise<Rule[]> {
    return await dbService.getRulesByRoster(rosterId)
  }

  async updateRule(ruleId: string, updates: Partial<Rule>): Promise<Rule> {
    // Get current rule first
    const currentRule = await this.getRuleById(ruleId)
    if (!currentRule) {
      throw new Error('Rule not found')
    }

    // Validate updates if they include rule-specific fields
    if (updates.type || updates.student_ids || updates.priority) {
      const validation = await this.validateRule({
        ...currentRule,
        ...updates
      })
      
      if (!validation.valid) {
        throw new Error(`Rule validation failed: ${validation.errors.map(e => e.message).join(', ')}`)
      }
    }

    await dbService.updateRule(ruleId, updates)
    
    // Return the updated rule by getting it from the roster
    const rosterRules = await dbService.getRulesByRoster(currentRule.roster_id)
    const updatedRule = rosterRules.find(r => r.id === ruleId)
    
    if (!updatedRule) {
      throw new Error('Failed to retrieve updated rule')
    }

    return updatedRule
  }

  async deleteRule(ruleId: string): Promise<void> {
    await dbService.deleteRule(ruleId)
  }

  async toggleRuleActive(ruleId: string): Promise<Rule> {
    const rule = await this.getRuleById(ruleId)
    if (!rule) {
      throw new Error('Rule not found')
    }

    return await this.updateRule(ruleId, { is_active: !rule.is_active })
  }

  async reorderRules(rosterId: string, reorderedRules: Rule[]): Promise<Rule[]> {
    // Validate that all rules belong to the roster
    const invalidRules = reorderedRules.filter(rule => rule.roster_id !== rosterId)
    if (invalidRules.length > 0) {
      throw new Error('All rules must belong to the specified roster')
    }

    // Update priorities and timestamps
    const updatesPromises = reorderedRules.map(async (rule, index) => {
      const newPriority = index + 1
      if (rule.priority !== newPriority) {
        return await this.updateRule(rule.id, { 
          priority: newPriority, 
          updated_at: new Date() 
        })
      }
      return rule
    })

    const updatedRules = await Promise.all(updatesPromises)
    return updatedRules.sort((a, b) => a.priority - b.priority)
  }

  async updateRulePriorities(priorityUpdates: Array<{ruleId: string; newPriority: number}>): Promise<void> {
    const updatePromises = priorityUpdates.map(update => 
      this.updateRule(update.ruleId, { 
        priority: update.newPriority,
        updated_at: new Date()
      })
    )
    
    await Promise.all(updatePromises)
  }

  async getMaxPriority(rosterId: string): Promise<number> {
    const rules = await this.getRulesByRoster(rosterId)
    if (rules.length === 0) return 0
    return Math.max(...rules.map(rule => rule.priority))
  }

  async validatePriorityConsistency(rosterId: string): Promise<boolean> {
    const rules = await this.getRulesByRoster(rosterId)
    const priorities = rules.map(rule => rule.priority)
    const uniquePriorities = new Set(priorities)
    
    // Check for duplicates and ensure all are positive integers
    return priorities.length === uniquePriorities.size && 
           priorities.every(p => Number.isInteger(p) && p > 0)
  }

  async getFilteredRules(rosterId: string, filters: RuleFilters): Promise<Rule[]> {
    let rules = await this.getRulesByRoster(rosterId)
    
    // Apply status filter
    if (filters.status === 'active') {
      rules = rules.filter(rule => rule.is_active)
    } else if (filters.status === 'inactive') {
      rules = rules.filter(rule => !rule.is_active)
    }
    
    // Apply type filter
    if (filters.type && filters.type !== 'all') {
      rules = rules.filter(rule => rule.type === filters.type)
    }
    
    // Apply search filter - now includes student names
    if (filters.searchQuery && filters.searchQuery.trim()) {
      const searchQuery = filters.searchQuery.toLowerCase().trim()
      
      // Get all students to enable student name search
      const students = await dbService.getAllStudentsForRoster(rosterId)
      
      rules = rules.filter(rule => {
        const ruleTypeInfo = RULE_TYPES[rule.type]
        
        // Search in rule type and description
        const ruleMatches = (
          ruleTypeInfo.name.toLowerCase().includes(searchQuery) ||
          ruleTypeInfo.description.toLowerCase().includes(searchQuery)
        )
        
        // Search in student names
        const ruleStudents = rule.student_ids
          .map(id => students.find(s => s.id === id))
          .filter(student => student !== undefined)
        
        const studentMatches = ruleStudents.some(student => 
          `${student!.first_name} ${student!.last_name}`.toLowerCase().includes(searchQuery) ||
          student!.first_name.toLowerCase().includes(searchQuery) ||
          student!.last_name.toLowerCase().includes(searchQuery)
        )
        
        return ruleMatches || studentMatches
      })
    }
    
    // Apply sorting
    if (filters.sortBy) {
      rules = this.sortRules(rules, filters.sortBy, filters.sortOrder || 'asc')
    } else {
      // Default sort by priority ascending (high priority first)
      rules = this.sortRules(rules, 'priority', 'asc')
    }
    
    return rules
  }

  async getActiveRules(rosterId: string): Promise<Rule[]> {
    const rules = await this.getRulesByRoster(rosterId)
    return rules.filter(rule => rule.is_active)
  }

  async getInactiveRules(rosterId: string): Promise<Rule[]> {
    const rules = await this.getRulesByRoster(rosterId)
    return rules.filter(rule => !rule.is_active)
  }

  async getRulesByType(rosterId: string, type: RuleType): Promise<Rule[]> {
    const rules = await this.getRulesByRoster(rosterId)
    return rules.filter(rule => rule.type === type)
  }

  async searchRules(rosterId: string, query: string): Promise<Rule[]> {
    const filters: RuleFilters = {
      searchQuery: query,
      status: 'all',
      type: 'all'
    }
    return await this.getFilteredRules(rosterId, filters)
  }

  private sortRules(rules: Rule[], sortBy: string, sortOrder: 'asc' | 'desc'): Rule[] {
    const sortedRules = [...rules]
    
    switch (sortBy) {
      case 'priority':
        sortedRules.sort((a, b) => sortOrder === 'asc' ? a.priority - b.priority : b.priority - a.priority)
        break
      case 'created_at':
        sortedRules.sort((a, b) => {
          const dateA = new Date(a.created_at).getTime()
          const dateB = new Date(b.created_at).getTime()
          return sortOrder === 'asc' ? dateA - dateB : dateB - dateA
        })
        break
      case 'updated_at':
        sortedRules.sort((a, b) => {
          const dateA = new Date(a.updated_at).getTime()
          const dateB = new Date(b.updated_at).getTime()
          return sortOrder === 'asc' ? dateA - dateB : dateB - dateA
        })
        break
      case 'type':
        sortedRules.sort((a, b) => {
          const typeA = RULE_TYPES[a.type].name
          const typeB = RULE_TYPES[b.type].name
          return sortOrder === 'asc' ? typeA.localeCompare(typeB) : typeB.localeCompare(typeA)
        })
        break
      default:
        break
    }
    
    return sortedRules
  }

  async validateRule(rule: Partial<Rule>): Promise<ValidationResult> {
    const errors: RuleValidationError[] = []

    // Validate required fields
    if (!rule.roster_id) {
      errors.push({ field: 'roster_id', message: 'Roster ID is required' })
    }

    if (!rule.type) {
      errors.push({ field: 'type', message: 'Rule type is required' })
    }

    if (rule.priority === undefined || rule.priority === null) {
      errors.push({ field: 'priority', message: 'Priority is required' })
    }

    if (!rule.student_ids || !Array.isArray(rule.student_ids)) {
      errors.push({ field: 'student_ids', message: 'Student IDs must be an array' })
    }

    // Validate rule type
    if (rule.type && !Object.keys(RULE_TYPES).includes(rule.type)) {
      errors.push({ field: 'type', message: 'Invalid rule type' })
    }

    // Validate priority
    if (rule.priority !== undefined && rule.priority !== null) {
      if (typeof rule.priority !== 'number' || rule.priority < 1) {
        errors.push({ field: 'priority', message: 'Priority must be a positive number' })
      }
    }

    // Validate student selection based on rule type
    if (rule.student_ids && Array.isArray(rule.student_ids)) {
      const studentCount = rule.student_ids.length

      if (rule.type === 'SEPARATE' || rule.type === 'TOGETHER') {
        if (studentCount < 2) {
          errors.push({ 
            field: 'student_ids', 
            message: `${rule.type === 'SEPARATE' ? 'Separate' : 'Together'} rules require at least 2 students` 
          })
        }
      } else if (rule.type === 'FRONT_ROW' || rule.type === 'BACK_ROW' || 
                 rule.type === 'NEAR_TEACHER' || rule.type === 'NEAR_DOOR') {
        if (studentCount < 1) {
          errors.push({ 
            field: 'student_ids', 
            message: 'Location preference rules require at least 1 student' 
          })
        }
      }

      // Check for duplicate student IDs
      const uniqueStudentIds = new Set(rule.student_ids)
      if (uniqueStudentIds.size !== rule.student_ids.length) {
        errors.push({ field: 'student_ids', message: 'Duplicate student IDs are not allowed' })
      }
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }

  private async getRuleById(ruleId: string): Promise<Rule | null> {
    return await dbService.getRuleById(ruleId)
  }
}

export const ruleService = new RuleService()