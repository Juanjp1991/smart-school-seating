import { Rule } from '@/types/rule'

export interface PriorityUpdate {
  ruleId: string
  newPriority: number
  oldPriority: number
}

/**
 * Sorts rules by priority (1 = highest priority)
 */
export function sortRulesByPriority(rules: Rule[]): Rule[] {
  return [...rules].sort((a, b) => a.priority - b.priority)
}

/**
 * Calculates priority updates needed when reordering rules
 */
export function calculatePriorityUpdates(
  originalRules: Rule[],
  reorderedRules: Rule[]
): PriorityUpdate[] {
  const updates: PriorityUpdate[] = []
  
  reorderedRules.forEach((rule, index) => {
    const newPriority = index + 1
    if (rule.priority !== newPriority) {
      updates.push({
        ruleId: rule.id,
        newPriority,
        oldPriority: rule.priority
      })
    }
  })
  
  return updates
}

/**
 * Validates priority consistency across rules
 */
export function validatePriorityConsistency(rules: Rule[]): {
  isValid: boolean
  issues: string[]
} {
  const issues: string[] = []
  const priorities = rules.map(r => r.priority)
  const uniquePriorities = new Set(priorities)
  
  // Check for duplicate priorities
  if (priorities.length !== uniquePriorities.size) {
    issues.push('Duplicate priority values found')
  }
  
  // Check for negative or zero priorities
  if (priorities.some(p => p <= 0)) {
    issues.push('Priority values must be positive integers')
  }
  
  // Check for non-integer priorities
  if (priorities.some(p => !Number.isInteger(p))) {
    issues.push('Priority values must be integers')
  }
  
  return {
    isValid: issues.length === 0,
    issues
  }
}

/**
 * Gets the next available priority for a new rule
 */
export function getNextPriority(existingRules: Rule[]): number {
  if (existingRules.length === 0) return 1
  
  const maxPriority = Math.max(...existingRules.map(r => r.priority))
  return maxPriority + 1
}

/**
 * Normalizes priorities to ensure they start at 1 and are consecutive
 */
export function normalizePriorities(rules: Rule[]): Rule[] {
  const sortedRules = sortRulesByPriority(rules)
  
  return sortedRules.map((rule, index) => ({
    ...rule,
    priority: index + 1
  }))
}

/**
 * Creates a visual priority indicator (emoji or text)
 */
export function getPriorityIndicator(priority: number, totalRules: number): string {
  const percentage = (totalRules - priority + 1) / totalRules
  
  if (percentage >= 0.8) return '🔥' // High priority
  if (percentage >= 0.6) return '⚡' // Medium-high priority
  if (percentage >= 0.4) return '📍' // Medium priority
  if (percentage >= 0.2) return '📝' // Low-medium priority
  return '💤' // Low priority
}

/**
 * Gets priority level name for accessibility
 */
export function getPriorityLevel(priority: number, totalRules: number): string {
  const percentage = (totalRules - priority + 1) / totalRules
  
  if (percentage >= 0.8) return 'Highest priority'
  if (percentage >= 0.6) return 'High priority'
  if (percentage >= 0.4) return 'Medium priority'
  if (percentage >= 0.2) return 'Low priority'
  return 'Lowest priority'
}

/**
 * Formats priority for display (e.g., "1st", "2nd", "3rd")
 */
export function formatPriorityOrdinal(priority: number): string {
  if (priority % 10 === 1 && priority % 100 !== 11) return `${priority}st`
  if (priority % 10 === 2 && priority % 100 !== 12) return `${priority}nd`
  if (priority % 10 === 3 && priority % 100 !== 13) return `${priority}rd`
  return `${priority}th`
}