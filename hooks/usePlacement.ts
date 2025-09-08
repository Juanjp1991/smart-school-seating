import { useState, useCallback } from 'react'
import { placementService } from '@/lib/placementService'
import { Student, Layout } from '@/lib/db'
import {
  PlacementResult,
  PlacementProgress,
  PlacementOptions,
  PlacementValidation,
  StudentPlacement
} from '@/types/placement'

interface UsePlacementReturn {
  // State
  isPlacing: boolean
  progress: PlacementProgress | null
  lastResult: PlacementResult | null
  lastError: string | null
  validation: PlacementValidation | null
  
  // Actions
  executePlacement: (
    rosterId: string,
    students: Student[],
    layout: Layout,
    options?: PlacementOptions
  ) => Promise<PlacementResult | null>
  
  validateInputs: (
    rosterId: string,
    students: Student[],
    layout: Layout
  ) => Promise<PlacementValidation | null>
  
  getRecommendations: (
    rosterId: string,
    students: Student[],
    layout: Layout
  ) => Promise<{
    feasible: boolean
    recommendations: string[]
    potentialIssues: string[]
  } | null>
  
  cancelPlacement: () => void
  clearError: () => void
  clearResults: () => void
}

export function usePlacement(): UsePlacementReturn {
  const [isPlacing, setIsPlacing] = useState(false)
  const [progress, setProgress] = useState<PlacementProgress | null>(null)
  const [lastResult, setLastResult] = useState<PlacementResult | null>(null)
  const [lastError, setLastError] = useState<string | null>(null)
  const [validation, setValidation] = useState<PlacementValidation | null>(null)

  const handleProgress = useCallback((newProgress: PlacementProgress) => {
    setProgress(newProgress)
  }, [])

  const executePlacement = useCallback(async (
    rosterId: string,
    students: Student[],
    layout: Layout,
    options: PlacementOptions = {}
  ): Promise<PlacementResult | null> => {
    if (isPlacing) {
      console.warn('Placement already in progress')
      return null
    }

    setIsPlacing(true)
    setProgress(null)
    setLastError(null)
    setLastResult(null)

    try {
      setProgress({
        currentStep: 'Validating inputs...',
        rulesProcessed: 0,
        totalRules: 0,
        studentsPlaced: 0,
        totalStudents: students.length
      })

      const result = await placementService.executeAutoPlacement(
        rosterId,
        students,
        layout,
        options,
        handleProgress
      )

      setLastResult(result)

      if (!result.success && result.conflicts.length > 0) {
        setLastError(result.conflicts[0].description)
      }

      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown placement error'
      setLastError(errorMessage)
      console.error('Placement execution error:', error)
      return null
    } finally {
      setIsPlacing(false)
      setProgress(null)
    }
  }, [isPlacing, handleProgress])

  const validateInputs = useCallback(async (
    rosterId: string,
    students: Student[],
    layout: Layout
  ): Promise<PlacementValidation | null> => {
    try {
      const validationResult = await placementService.validatePlacementInputs(
        rosterId,
        students,
        layout
      )
      
      setValidation(validationResult)
      return validationResult
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Validation error'
      setLastError(errorMessage)
      console.error('Placement validation error:', error)
      return null
    }
  }, [])

  const getRecommendations = useCallback(async (
    rosterId: string,
    students: Student[],
    layout: Layout
  ) => {
    try {
      return await placementService.getPlacementRecommendations(
        rosterId,
        students,
        layout
      )
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error getting recommendations'
      setLastError(errorMessage)
      console.error('Placement recommendations error:', error)
      return null
    }
  }, [])

  const cancelPlacement = useCallback(() => {
    if (isPlacing) {
      placementService.cancelPlacement()
      setIsPlacing(false)
      setProgress(null)
      setLastError('Placement cancelled by user')
    }
  }, [isPlacing])

  const clearError = useCallback(() => {
    setLastError(null)
  }, [])

  const clearResults = useCallback(() => {
    setLastResult(null)
    setLastError(null)
    setProgress(null)
    setValidation(null)
  }, [])

  return {
    isPlacing,
    progress,
    lastResult,
    lastError,
    validation,
    executePlacement,
    validateInputs,
    getRecommendations,
    cancelPlacement,
    clearError,
    clearResults
  }
}