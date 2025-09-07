import { useState, useCallback } from 'react'
import { DropResult } from 'react-beautiful-dnd'
import { Rule } from '@/types/rule'
import { ruleService } from '@/lib/ruleService'
import { validatePriorityConsistency, calculatePriorityUpdates } from '@/utils/priorityHelpers'

interface PriorityUpdate {
  ruleId: string
  newPriority: number
  oldPriority: number
}

export interface UseDragAndDropResult {
  isReordering: boolean
  reorderRules: (result: DropResult, rules: Rule[], rosterId: string) => Promise<Rule[] | null>
  priorityUpdates: PriorityUpdate[]
  clearPriorityUpdates: () => void
  lastError: string | null
  clearError: () => void
}

export function useDragAndDrop(): UseDragAndDropResult {
  const [isReordering, setIsReordering] = useState(false)
  const [priorityUpdates, setPriorityUpdates] = useState<PriorityUpdate[]>([])
  const [lastError, setLastError] = useState<string | null>(null)

  const clearPriorityUpdates = useCallback(() => {
    setPriorityUpdates([])
  }, [])

  const clearError = useCallback(() => {
    setLastError(null)
  }, [])

  const reorderRules = useCallback(async (
    result: DropResult, 
    rules: Rule[], 
    rosterId: string
  ): Promise<Rule[] | null> => {
    // Clear any previous errors
    setLastError(null)

    // Validate input parameters
    if (!result.destination) {
      return null
    }

    if (result.destination.index === result.source.index) {
      return null
    }

    if (!rules || rules.length === 0) {
      setLastError('No rules available to reorder')
      return null
    }

    if (!rosterId) {
      setLastError('Invalid roster ID provided')
      return null
    }

    // Validate that all rules belong to the roster
    const invalidRules = rules.filter(rule => rule.roster_id !== rosterId)
    if (invalidRules.length > 0) {
      setLastError(`${invalidRules.length} rule(s) don't belong to this roster`)
      return null
    }

    // Validate initial priority consistency
    const initialValidation = validatePriorityConsistency(rules)
    if (!initialValidation.isValid) {
      setLastError(`Priority validation failed: ${initialValidation.issues.join(', ')}`)
      return null
    }

    setIsReordering(true)
    
    try {
      // Create new array with reordered items
      const reorderedRules = Array.from(rules)
      const [movedRule] = reorderedRules.splice(result.source.index, 1)
      
      // Validate move indices
      if (result.destination.index < 0 || result.destination.index >= rules.length) {
        throw new Error('Invalid destination index for rule reordering')
      }
      
      reorderedRules.splice(result.destination.index, 0, movedRule)

      // Calculate priority updates and validate
      const updates = calculatePriorityUpdates(rules, reorderedRules)
      const updatedRules = reorderedRules.map((rule, index) => ({
        ...rule, 
        priority: index + 1, 
        updated_at: new Date()
      }))

      // Validate final priority consistency
      const finalValidation = validatePriorityConsistency(updatedRules)
      if (!finalValidation.isValid) {
        throw new Error(`Priority validation failed after reordering: ${finalValidation.issues.join(', ')}`)
      }

      // Update priority tracking
      setPriorityUpdates(updates)

      // Save to database with retry mechanism
      let retries = 3
      while (retries > 0) {
        try {
          await ruleService.reorderRules(rosterId, updatedRules)
          break
        } catch (dbError) {
          retries--
          if (retries === 0) {
            throw new Error(`Database update failed after 3 attempts: ${dbError}`)
          }
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
      }

      // Validate database consistency after save
      const consistencyValid = await ruleService.validatePriorityConsistency(rosterId)
      if (!consistencyValid) {
        throw new Error('Priority consistency validation failed after database update')
      }

      return updatedRules

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error during rule reordering'
      console.error('Error reordering rules:', error)
      setLastError(errorMessage)
      
      // Clear updates on error to trigger rollback
      setPriorityUpdates([])
      
      // Return null to indicate failure without throwing
      return null
    } finally {
      setIsReordering(false)
    }
  }, [])

  return {
    isReordering,
    reorderRules,
    priorityUpdates,
    clearPriorityUpdates,
    lastError,
    clearError
  }
}