export interface Rule {
  id: string
  roster_id: string
  priority: number
  type: 'SEPARATE' | 'TOGETHER' | 'FRONT_ROW' | 'BACK_ROW' | 'NEAR_TEACHER' | 'NEAR_DOOR'
  student_ids: string[]
  is_active: boolean
  created_at: Date
  updated_at: Date
}

export const RULE_TYPES = {
  SEPARATE: { 
    name: 'Must Not Sit Together', 
    description: 'Selected students should not be seated adjacent to each other' 
  },
  TOGETHER: { 
    name: 'Must Sit Together', 
    description: 'Selected students should be seated in adjacent seats' 
  },
  FRONT_ROW: { 
    name: 'Front Row Preference', 
    description: 'Selected students should be seated in the front rows' 
  },
  BACK_ROW: { 
    name: 'Back Row Preference', 
    description: 'Selected students should be seated in the back rows' 
  },
  NEAR_TEACHER: { 
    name: 'Near Teacher', 
    description: 'Selected students should be seated near the teacher desk' 
  },
  NEAR_DOOR: { 
    name: 'Near Door', 
    description: 'Selected students should be seated near the classroom door' 
  }
} as const

export type RuleType = keyof typeof RULE_TYPES

export interface CreateRuleData {
  priority: number
  type: RuleType
  student_ids: string[]
  is_active: boolean
}

export interface RuleValidationError {
  field: string
  message: string
}

export interface ValidationResult {
  valid: boolean
  errors: RuleValidationError[]
}

export interface RuleFilters {
  status?: 'active' | 'inactive' | 'all'
  type?: RuleType | 'all'
  sortBy?: 'priority' | 'created_at' | 'updated_at' | 'type'
  sortOrder?: 'asc' | 'desc'
  searchQuery?: string
}

export interface RuleDisplayOptions {
  showDescriptions?: boolean
  showCreatedDate?: boolean
  showUpdatedDate?: boolean
  compact?: boolean
}