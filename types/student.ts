export interface Student {
  id: string
  roster_id: string
  first_name: string
  last_name: string
  student_id: string | null
  photo: string | null
  ratings: {
    behavior?: number
    academic?: number
    participation?: number
    [key: string]: number | undefined
  }
  created_at: Date
  updated_at: Date
}

export interface StudentFormData {
  first_name: string
  last_name: string
  student_id?: string
  photo?: string | null
  ratings?: {
    behavior?: number
    academic?: number
    participation?: number
    [key: string]: number | undefined
  }
}

export interface StudentFilters {
  search?: string
  hasPhoto?: boolean
  ratingFilters?: {
    category: string
    minValue: number
  }[]
}