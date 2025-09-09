export interface DisplayOptions {
  showPhoto: boolean
  showName: boolean
  showRatings: boolean
  ratingCategories: string[]
  compactMode: boolean
  simpleView: boolean
  savedOptions?: DisplayOptions
}

export interface DisplayPreferences {
  id: string
  user_id: string
  options: DisplayOptions
  created_at: Date
  updated_at: Date
}

export interface StudentDisplayData {
  student: Student
  displayOptions: DisplayOptions
  position: { row: number; col: number }
}

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

export interface RatingDisplay {
  category: string
  value: number
  color: string
  label: string
}

export const DEFAULT_DISPLAY_OPTIONS: DisplayOptions = {
  showPhoto: true,
  showName: true,
  showRatings: false,
  ratingCategories: ['behavior', 'academic', 'participation'],
  compactMode: false,
  simpleView: false
}

export const RATING_CATEGORIES = {
  behavior: {
    label: 'Behavior',
    colorScale: ['🔴', '🟠', '🟡', '🟢', '🟢']
  },
  academic: {
    label: 'Academic',
    colorScale: ['🔴', '🟠', '🟡', '🟢', '🟢']
  },
  participation: {
    label: 'Participation',
    colorScale: ['🔵', '🔵', '🔵', '⚪', '⚪']
  }
}