'use client'

import { useCallback } from 'react'
import { useDisplayOptions } from './useDisplayOptions'
import { DisplayOptions } from '@/types/display'

interface SimpleViewHookReturn {
  isSimpleViewActive: boolean
  toggleSimpleView: () => Promise<void>
  exitSimpleView: () => Promise<void>
  getSavedOptions: () => DisplayOptions | null
}

export function useSimpleView(): SimpleViewHookReturn {
  const { displayOptions, updateDisplayOptions } = useDisplayOptions()

  const isSimpleViewActive = displayOptions.simpleView

  const toggleSimpleView = useCallback(async () => {
    if (isSimpleViewActive) {
      // Exit simple view - restore saved options
      await exitSimpleView()
    } else {
      // Enter simple view - save current options and enable simple view
      const savedOptions = { ...displayOptions }
      const simpleViewOptions: DisplayOptions = {
        ...displayOptions,
        simpleView: true,
        savedOptions,
        showPhoto: false,
        showRatings: false,
        compactMode: true
      }
      await updateDisplayOptions(simpleViewOptions)
    }
  }, [isSimpleViewActive, displayOptions, updateDisplayOptions])

  const exitSimpleView = useCallback(async () => {
    if (displayOptions.savedOptions) {
      // Restore saved options
      const restoredOptions = {
        ...displayOptions.savedOptions,
        simpleView: false,
        savedOptions: undefined
      }
      await updateDisplayOptions(restoredOptions)
    } else {
      // No saved options, use defaults
      await updateDisplayOptions({
        ...displayOptions,
        simpleView: false,
        savedOptions: undefined,
        showPhoto: true,
        showName: true,
        showRatings: false,
        compactMode: false
      })
    }
  }, [displayOptions, updateDisplayOptions])

  const getSavedOptions = useCallback((): DisplayOptions | null => {
    return displayOptions.savedOptions || null
  }, [displayOptions.savedOptions])

  return {
    isSimpleViewActive,
    toggleSimpleView,
    exitSimpleView,
    getSavedOptions
  }
}