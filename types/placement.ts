export interface PlacementResult {
  success: boolean
  placements: StudentPlacement[]
  ruleSatisfaction: RuleSatisfactionReport[]
  conflicts: RuleConflict[]
  unplacedStudents: string[]
  executionTime: number
}

export interface StudentPlacement {
  studentId: string
  seatPosition: SeatPosition
  appliedRules: string[] // Rule IDs that influenced this placement
}

export interface SeatPosition {
  row: number
  col: number
}

export interface RuleSatisfactionReport {
  ruleId: string
  ruleType: string
  satisfied: boolean
  reason?: string
  affectedStudents: string[]
  priority: number
}

export interface RuleConflict {
  ruleIds: string[]
  conflictType: 'IMPOSSIBLE' | 'COMPETING' | 'INSUFFICIENT_SEATS'
  description: string
  affectedStudents: string[]
}

export interface PlacementProgress {
  currentStep: string
  rulesProcessed: number
  totalRules: number
  studentsPlaced: number
  totalStudents: number
  currentRule?: {
    id: string
    type: string
    description: string
  }
}

export interface PlacementOptions {
  clearExisting?: boolean
  maxAttempts?: number
  prioritizeRules?: boolean
  allowPartialPlacement?: boolean
}

export interface PlacementContext {
  availableSeats: SeatPosition[]
  occupiedSeats: Map<string, StudentPlacement>
  seatMap: SeatMap
  furniture: FurniturePosition[]
}

export interface SeatMap {
  rows: number
  cols: number
  seats: boolean[][] // true if seat exists at position
  teacherDesk?: SeatPosition[]
  door?: SeatPosition
}

export interface FurniturePosition {
  type: 'desk' | 'door'
  positions: SeatPosition[]
}

export interface PlacementValidation {
  valid: boolean
  errors: string[]
  warnings: string[]
}

// Algorithm internal types
export interface PlacementCandidate {
  student: string
  position: SeatPosition
  score: number
  satisfiedRules: string[]
  violatedRules: string[]
}

export interface RuleConstraint {
  ruleId: string
  type: string
  priority: number
  students: string[]
  validator: (candidate: PlacementCandidate, context: PlacementContext) => ConstraintResult
}

export interface ConstraintResult {
  satisfied: boolean
  score: number
  reason?: string
}

export interface PlacementStrategy {
  name: string
  description: string
  execute: (
    students: string[],
    constraints: RuleConstraint[],
    context: PlacementContext,
    onProgress?: (progress: PlacementProgress) => void
  ) => Promise<PlacementResult>
}