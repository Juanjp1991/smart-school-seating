import { PlacementAlgorithm } from '@/lib/placementAlgorithm'
import { ruleService } from '@/lib/ruleService'
import { Student, Layout } from '@/lib/db'
import {
  PlacementResult,
  PlacementProgress,
  PlacementOptions,
  PlacementValidation
} from '@/types/placement'

export class PlacementService {
  private algorithm: PlacementAlgorithm | null = null

  /**
   * Execute automatic student placement
   */
  async executeAutoPlacement(
    rosterId: string,
    students: Student[],
    layout: Layout,
    options: PlacementOptions = {},
    onProgress?: (progress: PlacementProgress) => void
  ): Promise<PlacementResult> {
    // Initialize algorithm with progress callback
    this.algorithm = new PlacementAlgorithm(onProgress)

    try {
      // Get active rules for the roster
      const rules = await ruleService.getActiveRules(rosterId)
      
      // Execute placement
      const result = await this.algorithm.executePlacement(
        students,
        rules,
        layout,
        options
      )

      return result
    } catch (error) {
      console.error('Placement service error:', error)
      return {
        success: false,
        placements: [],
        ruleSatisfaction: [],
        conflicts: [{
          ruleIds: [],
          conflictType: 'IMPOSSIBLE',
          description: `Service error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          affectedStudents: students.map(s => s.id)
        }],
        unplacedStudents: students.map(s => s.id),
        executionTime: 0
      }
    } finally {
      this.algorithm = null
    }
  }

  /**
   * Validate inputs before attempting placement
   */
  async validatePlacementInputs(
    rosterId: string,
    students: Student[],
    layout: Layout
  ): Promise<PlacementValidation> {
    const errors: string[] = []
    const warnings: string[] = []

    // Basic validation
    if (!rosterId) {
      errors.push('Roster ID is required')
    }

    if (!students || students.length === 0) {
      errors.push('No students provided for placement')
    }

    if (!layout) {
      errors.push('Layout is required')
    } else {
      if (!layout.seats || layout.seats.length === 0) {
        errors.push('Layout has no seats defined')
      } else if (students && students.length > layout.seats.length) {
        errors.push(`Too many students (${students.length}) for available seats (${layout.seats.length})`)
      }
    }

    // Rule validation
    try {
      const rules = await ruleService.getActiveRules(rosterId)
      
      if (rules.length === 0) {
        warnings.push('No active rules found - placement will be random')
      }

      // Check if rules reference existing students
      if (students) {
        const studentIds = new Set(students.map(s => s.id))
        const invalidRules = rules.filter(rule => 
          rule.student_ids.some(id => !studentIds.has(id))
        )

        if (invalidRules.length > 0) {
          warnings.push(`${invalidRules.length} rule(s) reference students not in current roster`)
        }
      }

      // Check for potential conflicts
      const separateRules = rules.filter(r => r.type === 'SEPARATE')
      const togetherRules = rules.filter(r => r.type === 'TOGETHER')
      
      if (separateRules.length > 0 && togetherRules.length > 0) {
        // Check for conflicting rules involving same students
        for (const sepRule of separateRules) {
          for (const togRule of togetherRules) {
            const commonStudents = sepRule.student_ids.filter(id => 
              togRule.student_ids.includes(id)
            )
            if (commonStudents.length > 0) {
              warnings.push('Conflicting rules found: some students have both SEPARATE and TOGETHER constraints')
              break
            }
          }
          if (warnings.some(w => w.includes('Conflicting rules'))) break
        }
      }

    } catch (error) {
      warnings.push('Could not validate rules - placement may fail')
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    }
  }

  /**
   * Cancel ongoing placement operation
   */
  cancelPlacement(): void {
    // In a real implementation, this would signal the algorithm to stop
    // For now, we just clear the reference
    this.algorithm = null
  }

  /**
   * Get placement recommendations without actually placing students
   */
  async getPlacementRecommendations(
    rosterId: string,
    students: Student[],
    layout: Layout
  ): Promise<{
    feasible: boolean
    recommendations: string[]
    potentialIssues: string[]
  }> {
    const validation = await this.validatePlacementInputs(rosterId, students, layout)
    const recommendations: string[] = []
    const potentialIssues: string[] = []

    if (!validation.valid) {
      return {
        feasible: false,
        recommendations: ['Fix validation errors before attempting placement'],
        potentialIssues: validation.errors
      }
    }

    try {
      const rules = await ruleService.getActiveRules(rosterId)
      const seatCount = layout.seats?.length || 0
      const studentCount = students.length

      // Capacity analysis
      if (studentCount === seatCount) {
        recommendations.push('Perfect capacity match - all students can be seated')
      } else if (studentCount < seatCount) {
        const extra = seatCount - studentCount
        recommendations.push(`${extra} empty seat(s) will remain - good flexibility for rules`)
      }

      // Rule analysis
      if (rules.length === 0) {
        recommendations.push('Add placement rules to optimize seating arrangement')
        recommendations.push('Students will be placed randomly without rules')
      } else {
        recommendations.push(`${rules.length} active rule(s) will guide placement`)

        // Analyze rule complexity
        const ruleTypes = new Set(rules.map(r => r.type))
        if (ruleTypes.has('SEPARATE') && ruleTypes.has('TOGETHER')) {
          potentialIssues.push('Mixed SEPARATE and TOGETHER rules may be difficult to satisfy')
        }

        const totalConstrainedStudents = new Set(
          rules.flatMap(r => r.student_ids)
        ).size

        if (totalConstrainedStudents === studentCount) {
          potentialIssues.push('All students have rule constraints - limited placement flexibility')
        } else {
          const unconstrained = studentCount - totalConstrainedStudents
          recommendations.push(`${unconstrained} student(s) have no specific constraints - will fill remaining seats`)
        }
      }

      // Layout analysis
      if (layout.furniture && layout.furniture.length > 0) {
        const hasTeacherDesk = layout.furniture.some(f => f.type === 'desk')
        const hasDoor = layout.furniture.some(f => f.type === 'door')

        if (hasTeacherDesk) {
          recommendations.push('Teacher desk detected - NEAR_TEACHER rules will be effective')
        }
        if (hasDoor) {
          recommendations.push('Door detected - NEAR_DOOR rules will be effective')
        }
      }

    } catch (error) {
      potentialIssues.push('Could not analyze rules - placement may not work optimally')
    }

    return {
      feasible: validation.valid,
      recommendations,
      potentialIssues: [...validation.warnings, ...potentialIssues]
    }
  }
}

// Export singleton instance
export const placementService = new PlacementService()