'use client'

import { useState, useEffect, useCallback } from 'react'
import { DisplayOptions } from '@/types/display'
import { DisplayOptionsService } from '@/lib/displayOptionsService'
import { DEFAULT_DISPLAY_OPTIONS } from '@/types/display'

export function useDisplayOptions() {
  const [options, setOptions] = useState<DisplayOptions>(DEFAULT_DISPLAY_OPTIONS)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load options from storage on mount
  useEffect(() => {
    const loadOptions = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const savedOptions = await DisplayOptionsService.getDisplayOptions()
        setOptions(savedOptions)
      } catch (err) {
        console.error('Error loading display options:', err)
        setError('Failed to load display preferences')
        setOptions(DEFAULT_DISPLAY_OPTIONS)
      } finally {
        setIsLoading(false)
      }
    }

    loadOptions()
  }, [])

  // Update options and save to storage
  const updateOptions = useCallback(async (newOptions: Partial<DisplayOptions>) => {
    try {
      setError(null)
      const updatedOptions = { ...options, ...newOptions }
      
      // Save to storage
      await DisplayOptionsService.saveDisplayOptions(updatedOptions)
      
      // Update local state
      setOptions(updatedOptions)
    } catch (err) {
      console.error('Error updating display options:', err)
      setError('Failed to save display preferences')
      throw err
    }
  }, [options])

  // Reset to defaults
  const resetToDefaults = useCallback(async () => {
    try {
      setError(null)
      const defaults = await DisplayOptionsService.resetToDefaults()
      setOptions(defaults)
    } catch (err) {
      console.error('Error resetting display options:', err)
      setError('Failed to reset display preferences')
      throw err
    }
  }, [])

  // Toggle individual options
  const togglePhoto = useCallback(() => {
    return updateOptions({ showPhoto: !options.showPhoto })
  }, [options.showPhoto, updateOptions])

  const toggleName = useCallback(() => {
    return updateOptions({ showName: !options.showName })
  }, [options.showName, updateOptions])

  const toggleRatings = useCallback(() => {
    return updateOptions({ showRatings: !options.showRatings })
  }, [options.showRatings, updateOptions])

  const toggleCompactMode = useCallback(() => {
    return updateOptions({ compactMode: !options.compactMode })
  }, [options.compactMode, updateOptions])

  // Update rating categories
  const updateRatingCategories = useCallback((categories: string[]) => {
    return updateOptions({ ratingCategories: categories })
  }, [updateOptions])

  // Add a rating category
  const addRatingCategory = useCallback((category: string) => {
    if (!options.ratingCategories.includes(category)) {
      return updateOptions({
        ratingCategories: [...options.ratingCategories, category]
      })
    }
    return Promise.resolve()
  }, [options.ratingCategories, updateOptions])

  // Remove a rating category
  const removeRatingCategory = useCallback((category: string) => {
    return updateOptions({
      ratingCategories: options.ratingCategories.filter(c => c !== category)
    })
  }, [options.ratingCategories, updateOptions])

  // Check if a rating category is enabled
  const isRatingCategoryEnabled = useCallback((category: string) => {
    return options.ratingCategories.includes(category)
  }, [options.ratingCategories])

  // Get active rating categories (those that exist in student data)
  const getActiveRatingCategories = useCallback((studentRatings: Record<string, number | undefined>) => {
    return options.ratingCategories.filter(category => 
      studentRatings[category] !== undefined
    )
  }, [options.ratingCategories])

  return {
    options,
    isLoading,
    error,
    updateOptions,
    resetToDefaults,
    togglePhoto,
    toggleName,
    toggleRatings,
    toggleCompactMode,
    updateRatingCategories,
    addRatingCategory,
    removeRatingCategory,
    isRatingCategoryEnabled,
    getActiveRatingCategories
  }
}