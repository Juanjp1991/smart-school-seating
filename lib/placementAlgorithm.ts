import { Rule, RuleType } from '@/types/rule'
import { Student, Layout } from '@/lib/db'
import {
  PlacementResult,
  StudentPlacement,
  RuleSatisfactionReport,
  RuleConflict,
  PlacementProgress,
  PlacementContext,
  SeatMap,
  SeatPosition,
  PlacementCandidate,
  RuleConstraint,
  ConstraintResult,
  PlacementOptions
} from '@/types/placement'
import {
  calculateDistance,
  areAdjacent,
  areAdjacentIncludingDiagonal,
  getAdjacentSeats,
  getFrontRowSeats,
  getBackRowSeats,
  getSeatsNearTeacher,
  getSeatsNearDoor,
  calculateSeatScore,
  findGroupPosition,
  isValidSeat
} from '@/utils/geometryUtils'

export class PlacementAlgorithm {
  private onProgress?: (progress: PlacementProgress) => void

  constructor(onProgress?: (progress: PlacementProgress) => void) {
    this.onProgress = onProgress
  }

  /**
   * Main placement algorithm entry point
   */
  async executePlacement(
    students: Student[],
    rules: Rule[],
    layout: Layout,
    options: PlacementOptions = {}
  ): Promise<PlacementResult> {
    const startTime = Date.now()
    
    try {
      // Validate inputs
      const validation = this.validateInputs(students, rules, layout)
      if (!validation.valid) {
        return {
          success: false,
          placements: [],
          ruleSatisfaction: [],
          conflicts: [{ 
            ruleIds: [], 
            conflictType: 'IMPOSSIBLE',
            description: validation.errors.join(', '),
            affectedStudents: []
          }],
          unplacedStudents: students.map(s => s.id),
          executionTime: Date.now() - startTime
        }
      }

      // Initialize context
      const context = this.createPlacementContext(layout, options.clearExisting ? [] : [])
      
      // Convert rules to constraints
      const constraints = this.createRuleConstraints(rules, students)
      
      // Sort students by how constrained they are (most constrained first)
      const sortedStudents = this.sortStudentsByConstraints(students, constraints)
      
      this.reportProgress({
        currentStep: 'Starting placement algorithm',
        rulesProcessed: 0,
        totalRules: rules.length,
        studentsPlaced: 0,
        totalStudents: students.length
      })

      // Execute placement using constraint satisfaction
      const result = await this.constraintSatisfactionPlacement(
        sortedStudents,
        constraints,
        context
      )

      const finalResult = {
        ...result,
        executionTime: Date.now() - startTime
      }
      
      return finalResult

    } catch (error) {
      console.error('Placement algorithm error:', error)
      return {
        success: false,
        placements: [],
        ruleSatisfaction: [],
        conflicts: [{
          ruleIds: [],
          conflictType: 'IMPOSSIBLE',
          description: `Algorithm error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          affectedStudents: students.map(s => s.id)
        }],
        unplacedStudents: students.map(s => s.id),
        executionTime: Date.now() - startTime
      }
    }
  }

  /**
   * Validate inputs before placement
   */
  private validateInputs(students: Student[], rules: Rule[], layout: Layout): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    if (students.length === 0) {
      errors.push('No students to place')
    }

    if (!layout.seats || layout.seats.length === 0) {
      errors.push('No seats available in layout')
    }

    const availableSeatCount = layout.seats ? layout.seats.length : 0
    if (students.length > availableSeatCount) {
      errors.push(`Too many students (${students.length}) for available seats (${availableSeatCount})`)
    }

    // Validate rules reference existing students
    const studentIds = new Set(students.map(s => s.id))
    for (const rule of rules) {
      const invalidStudents = rule.student_ids.filter(id => !studentIds.has(id))
      if (invalidStudents.length > 0) {
        errors.push(`Rule ${rule.id} references non-existent students: ${invalidStudents.join(', ')}`)
      }
    }

    return { valid: errors.length === 0, errors }
  }

  /**
   * Create placement context from layout
   */
  private createPlacementContext(layout: Layout, existingPlacements: StudentPlacement[] = []): PlacementContext {
    const seatMap = this.createSeatMap(layout)
    const occupiedSeats = new Map<string, StudentPlacement>()
    
    // Mark existing placements as occupied
    existingPlacements.forEach(placement => {
      const key = `${placement.seatPosition.row}-${placement.seatPosition.col}`
      occupiedSeats.set(key, placement)
    })

    const availableSeats: SeatPosition[] = []
    layout.seats?.forEach(seatString => {
      const [rowStr, colStr] = seatString.split('-')
      const position = { row: parseInt(rowStr), col: parseInt(colStr) }
      const key = `${position.row}-${position.col}`
      
      if (!occupiedSeats.has(key)) {
        availableSeats.push(position)
      }
    })

    return {
      availableSeats,
      occupiedSeats,
      seatMap,
      furniture: layout.furniture || []
    }
  }

  /**
   * Create seat map from layout
   */
  private createSeatMap(layout: Layout): SeatMap {
    const seatMap: SeatMap = {
      rows: layout.grid_rows,
      cols: layout.grid_cols,
      seats: Array(layout.grid_rows).fill(null).map(() => Array(layout.grid_cols).fill(false))
    }

    // Mark seats
    layout.seats?.forEach(seatString => {
      const [rowStr, colStr] = seatString.split('-')
      const row = parseInt(rowStr)
      const col = parseInt(colStr)
      if (row >= 0 && row < layout.grid_rows && col >= 0 && col < layout.grid_cols) {
        seatMap.seats[row][col] = true
      }
    })

    // Mark furniture
    layout.furniture?.forEach(furniture => {
      if (furniture.type === 'desk') {
        seatMap.teacherDesk = furniture.positions
      } else if (furniture.type === 'door') {
        seatMap.door = furniture.positions[0] // Assume single door position
      }
    })

    return seatMap
  }

  /**
   * Convert rules to constraint objects
   */
  private createRuleConstraints(rules: Rule[], students: Student[]): RuleConstraint[] {
    return rules
      .filter(rule => rule.is_active)
      .sort((a, b) => a.priority - b.priority) // Higher priority (lower number) first
      .map(rule => ({
        ruleId: rule.id,
        type: rule.type,
        priority: rule.priority,
        students: rule.student_ids,
        validator: this.createConstraintValidator(rule)
      }))
  }

  /**
   * Create constraint validator for a rule
   */
  private createConstraintValidator(rule: Rule) {
    return (candidate: PlacementCandidate, context: PlacementContext): ConstraintResult => {
      switch (rule.type) {
        case 'SEPARATE':
          return this.validateSeparateConstraint(candidate, rule, context)
        
        case 'TOGETHER':
          return this.validateTogetherConstraint(candidate, rule, context)
        
        case 'FRONT_ROW':
        case 'BACK_ROW':
        case 'NEAR_TEACHER':
        case 'NEAR_DOOR':
          return this.validateLocationConstraint(candidate, rule, context)
        
        default:
          return { satisfied: true, score: 0 }
      }
    }
  }

  /**
   * Validate SEPARATE constraint
   */
  private validateSeparateConstraint(
    candidate: PlacementCandidate, 
    rule: Rule, 
    context: PlacementContext
  ): ConstraintResult {
    if (!rule.student_ids.includes(candidate.student)) {
      return { satisfied: true, score: 0 }
    }

    // Check if any other students from this rule are adjacent
    for (const [key, placement] of context.occupiedSeats) {
      if (rule.student_ids.includes(placement.studentId) && placement.studentId !== candidate.student) {
        if (areAdjacentIncludingDiagonal(candidate.position, placement.seatPosition)) {
          return {
            satisfied: false,
            score: -100,
            reason: `Student would be adjacent to ${placement.studentId} (violates separation rule)`
          }
        }
      }
    }

    return { satisfied: true, score: 10 }
  }

  /**
   * Validate TOGETHER constraint
   */
  private validateTogetherConstraint(
    candidate: PlacementCandidate, 
    rule: Rule, 
    context: PlacementContext
  ): ConstraintResult {
    if (!rule.student_ids.includes(candidate.student)) {
      return { satisfied: true, score: 0 }
    }

    // Check how many students from this rule are already placed
    const placedGroupStudents: StudentPlacement[] = []
    for (const [key, placement] of context.occupiedSeats) {
      if (rule.student_ids.includes(placement.studentId)) {
        placedGroupStudents.push(placement)
      }
    }

    if (placedGroupStudents.length === 0) {
      return { satisfied: true, score: 5 } // First student in group
    }

    // Check if candidate position is adjacent to any placed group member
    const isAdjacentToGroup = placedGroupStudents.some(placement =>
      areAdjacentIncludingDiagonal(candidate.position, placement.seatPosition)
    )

    if (isAdjacentToGroup) {
      return { satisfied: true, score: 20 }
    }

    // Not adjacent - calculate penalty based on distance
    const minDistance = Math.min(...placedGroupStudents.map(placement =>
      calculateDistance(candidate.position, placement.seatPosition)
    ))

    return {
      satisfied: false,
      score: -Math.floor(minDistance * 10),
      reason: `Student would be too far from group (distance: ${minDistance.toFixed(1)})`
    }
  }

  /**
   * Validate location constraints (FRONT_ROW, BACK_ROW, etc.)
   */
  private validateLocationConstraint(
    candidate: PlacementCandidate, 
    rule: Rule, 
    context: PlacementContext
  ): ConstraintResult {
    if (!rule.student_ids.includes(candidate.student)) {
      return { satisfied: true, score: 0 }
    }

    const score = calculateSeatScore(candidate.position, rule.type, context.seatMap)
    
    return {
      satisfied: score > 50, // Threshold for satisfaction
      score: score - 50, // Convert to relative score
      reason: score <= 50 ? `Position doesn't satisfy ${rule.type} preference` : undefined
    }
  }

  /**
   * Sort students by constraint complexity (most constrained first)
   */
  private sortStudentsByConstraints(students: Student[], constraints: RuleConstraint[]): Student[] {
    return students.slice().sort((a, b) => {
      const aConstraints = constraints.filter(c => c.students.includes(a.id)).length
      const bConstraints = constraints.filter(c => c.students.includes(b.id)).length
      return bConstraints - aConstraints // Most constrained first
    })
  }

  /**
   * Main constraint satisfaction placement algorithm
   */
  private async constraintSatisfactionPlacement(
    students: Student[],
    constraints: RuleConstraint[],
    context: PlacementContext
  ): Promise<PlacementResult> {
    const placements: StudentPlacement[] = []
    const ruleSatisfaction: RuleSatisfactionReport[] = []
    const conflicts: RuleConflict[] = []
    const unplacedStudents: string[] = []

    // Initialize rule satisfaction tracking
    constraints.forEach(constraint => {
      ruleSatisfaction.push({
        ruleId: constraint.ruleId,
        ruleType: constraint.type,
        satisfied: false,
        affectedStudents: constraint.students,
        priority: constraint.priority
      })
    })

    let placedCount = 0

    for (const student of students) {
      this.reportProgress({
        currentStep: `Placing ${student.first_name} ${student.last_name}`,
        rulesProcessed: placedCount,
        totalRules: constraints.length,
        studentsPlaced: placedCount,
        totalStudents: students.length
      })

      const placement = await this.findBestPlacement(student, constraints, context)
      
      if (placement) {
        placements.push(placement)
        
        // Update context
        const key = `${placement.seatPosition.row}-${placement.seatPosition.col}`
        context.occupiedSeats.set(key, placement)
        context.availableSeats = context.availableSeats.filter(seat =>
          !(seat.row === placement.seatPosition.row && seat.col === placement.seatPosition.col)
        )

        placedCount++
      } else {
        unplacedStudents.push(student.id)
        
        // Try to identify why placement failed
        const failureReason = this.analyzeFailureReason(student, constraints, context)
        if (failureReason) {
          conflicts.push(failureReason)
        }
      }
    }

    // Update rule satisfaction based on final placements
    this.updateRuleSatisfaction(ruleSatisfaction, placements, constraints, context)

    return {
      success: unplacedStudents.length === 0,
      placements,
      ruleSatisfaction,
      conflicts,
      unplacedStudents,
      executionTime: 0 // Will be set by caller
    }
  }

  /**
   * Find the best placement for a student
   */
  private async findBestPlacement(
    student: Student,
    constraints: RuleConstraint[],
    context: PlacementContext
  ): Promise<StudentPlacement | null> {
    const candidates: PlacementCandidate[] = []

    // Generate candidates for all available seats
    for (const position of context.availableSeats) {
      const candidate: PlacementCandidate = {
        student: student.id,
        position,
        score: 0,
        satisfiedRules: [],
        violatedRules: []
      }

      // Evaluate candidate against all constraints
      let totalScore = 0
      for (const constraint of constraints) {
        const result = constraint.validator(candidate, context)
        
        totalScore += result.score
        
        if (result.satisfied) {
          candidate.satisfiedRules.push(constraint.ruleId)
        } else {
          candidate.violatedRules.push(constraint.ruleId)
        }
      }

      candidate.score = totalScore
      candidates.push(candidate)
    }

    // Sort by score (highest first)
    candidates.sort((a, b) => b.score - a.score)

    // Return best candidate if it has a positive or neutral score
    const bestCandidate = candidates[0]
    if (bestCandidate && bestCandidate.score >= -50) { // Allow some flexibility
      return {
        studentId: student.id,
        seatPosition: bestCandidate.position,
        appliedRules: bestCandidate.satisfiedRules
      }
    }

    return null
  }

  /**
   * Analyze why placement failed for a student
   */
  private analyzeFailureReason(
    student: Student,
    constraints: RuleConstraint[],
    context: PlacementContext
  ): RuleConflict | null {
    const relevantConstraints = constraints.filter(c => c.students.includes(student.id))
    
    if (relevantConstraints.length === 0) {
      return {
        ruleIds: [],
        conflictType: 'INSUFFICIENT_SEATS',
        description: `No available seats for ${student.first_name} ${student.last_name}`,
        affectedStudents: [student.id]
      }
    }

    return {
      ruleIds: relevantConstraints.map(c => c.ruleId),
      conflictType: 'IMPOSSIBLE',
      description: `Cannot satisfy constraints for ${student.first_name} ${student.last_name}`,
      affectedStudents: [student.id]
    }
  }

  /**
   * Update rule satisfaction based on final placements
   */
  private updateRuleSatisfaction(
    satisfaction: RuleSatisfactionReport[],
    placements: StudentPlacement[],
    constraints: RuleConstraint[],
    context: PlacementContext
  ): void {
    satisfaction.forEach(report => {
      const constraint = constraints.find(c => c.ruleId === report.ruleId)
      if (!constraint) return

      const studentPlacements = placements.filter(p => constraint.students.includes(p.studentId))
      
      if (studentPlacements.length === 0) {
        report.satisfied = false
        report.reason = 'No students from this rule were placed'
        return
      }

      // Check if rule is satisfied based on type
      const satisfied = this.checkRuleSatisfaction(constraint, studentPlacements, context)
      report.satisfied = satisfied.satisfied
      report.reason = satisfied.reason
    })
  }

  /**
   * Check if a rule is satisfied by the final placements
   */
  private checkRuleSatisfaction(
    constraint: RuleConstraint,
    studentPlacements: StudentPlacement[],
    context: PlacementContext
  ): { satisfied: boolean; reason?: string } {
    switch (constraint.type) {
      case 'SEPARATE':
        return this.checkSeparateRuleSatisfaction(studentPlacements)
      
      case 'TOGETHER':
        return this.checkTogetherRuleSatisfaction(studentPlacements)
      
      case 'FRONT_ROW':
      case 'BACK_ROW':
      case 'NEAR_TEACHER':
      case 'NEAR_DOOR':
        return this.checkLocationRuleSatisfaction(constraint.type, studentPlacements, context)
      
      default:
        return { satisfied: true }
    }
  }

  /**
   * Check SEPARATE rule satisfaction
   */
  private checkSeparateRuleSatisfaction(placements: StudentPlacement[]): { satisfied: boolean; reason?: string } {
    for (let i = 0; i < placements.length; i++) {
      for (let j = i + 1; j < placements.length; j++) {
        if (areAdjacentIncludingDiagonal(placements[i].seatPosition, placements[j].seatPosition)) {
          return {
            satisfied: false,
            reason: 'Some students are seated adjacent to each other'
          }
        }
      }
    }
    return { satisfied: true }
  }

  /**
   * Check TOGETHER rule satisfaction
   */
  private checkTogetherRuleSatisfaction(placements: StudentPlacement[]): { satisfied: boolean; reason?: string } {
    if (placements.length < 2) {
      return { satisfied: placements.length === 1, reason: 'Not enough students placed' }
    }

    // Check if all students are in a connected group
    const positions = placements.map(p => p.seatPosition)
    const visited = new Set<string>()
    const stack = [positions[0]]
    visited.add(`${positions[0].row}-${positions[0].col}`)

    while (stack.length > 0) {
      const current = stack.pop()!
      
      for (const pos of positions) {
        const key = `${pos.row}-${pos.col}`
        if (!visited.has(key) && areAdjacentIncludingDiagonal(current, pos)) {
          visited.add(key)
          stack.push(pos)
        }
      }
    }

    const allConnected = visited.size === positions.length
    return {
      satisfied: allConnected,
      reason: allConnected ? undefined : 'Students are not seated in a connected group'
    }
  }

  /**
   * Check location rule satisfaction
   */
  private checkLocationRuleSatisfaction(
    ruleType: string,
    placements: StudentPlacement[],
    context: PlacementContext
  ): { satisfied: boolean; reason?: string } {
    const averageScore = placements.reduce((sum, placement) => 
      sum + calculateSeatScore(placement.seatPosition, ruleType, context.seatMap), 0
    ) / placements.length

    return {
      satisfied: averageScore >= 70,
      reason: averageScore >= 70 ? undefined : `Average position score (${averageScore.toFixed(0)}) below threshold`
    }
  }

  /**
   * Report progress to callback
   */
  private reportProgress(progress: PlacementProgress): void {
    if (this.onProgress) {
      this.onProgress(progress)
    }
  }
}