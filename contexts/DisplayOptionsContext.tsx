'use client'

import React, { createContext, useContext, ReactNode } from 'react'
import { DisplayOptions } from '@/types/display'
import { useDisplayOptions } from '@/hooks/useDisplayOptions'

interface DisplayOptionsContextType {
  displayOptions: DisplayOptions
  isLoading: boolean
  error: string | null
  updateDisplayOptions: (newOptions: Partial<DisplayOptions>) => Promise<void>
  resetToDefaults: () => Promise<void>
  togglePhoto: () => Promise<void>
  toggleName: () => Promise<void>
  toggleRatings: () => Promise<void>
  toggleCompactMode: () => Promise<void>
  updateRatingCategories: (categories: string[]) => Promise<void>
  addRatingCategory: (category: string) => Promise<void>
  removeRatingCategory: (category: string) => Promise<void>
  isRatingCategoryEnabled: (category: string) => boolean
  getActiveRatingCategories: (studentRatings: Record<string, number | undefined>) => string[]
  toggleSimpleView: () => Promise<void>
  exitSimpleView: () => Promise<void>
  isSimpleViewActive: boolean
}

const DisplayOptionsContext = createContext<DisplayOptionsContextType | undefined>(undefined)

export function DisplayOptionsProvider({ children }: { children: ReactNode }) {
  const displayOptions = useDisplayOptions()

  return (
    <DisplayOptionsContext.Provider value={displayOptions}>
      {children}
    </DisplayOptionsContext.Provider>
  )
}

export function useDisplayOptionsContext() {
  const context = useContext(DisplayOptionsContext)
  if (context === undefined) {
    throw new Error('useDisplayOptionsContext must be used within a DisplayOptionsProvider')
  }
  return context
}