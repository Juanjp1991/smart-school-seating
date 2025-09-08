/**
 * @jest-environment jsdom
 */

import { renderHook, act, waitFor } from '@testing-library/react'
import { useDisplayOptions } from '@/hooks/useDisplayOptions'
import { DisplayOptionsService } from '@/lib/displayOptionsService'
import { DEFAULT_DISPLAY_OPTIONS } from '@/types/display'

// Mock the DisplayOptionsService
jest.mock('@/lib/displayOptionsService', () => ({
  DisplayOptionsService: {
    getDisplayOptions: jest.fn(),
    saveDisplayOptions: jest.fn(),
    resetToDefaults: jest.fn()
  }
}))

const mockDisplayOptionsService = DisplayOptionsService as jest.Mocked<typeof DisplayOptionsService>

describe('useDisplayOptions', () => {
  const mockOptions = {
    showPhoto: true,
    showName: true,
    showRatings: true,
    ratingCategories: ['behavior', 'academic'],
    compactMode: false
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockDisplayOptionsService.getDisplayOptions.mockResolvedValue(mockOptions)
    mockDisplayOptionsService.saveDisplayOptions.mockResolvedValue()
    mockDisplayOptionsService.resetToDefaults.mockResolvedValue(DEFAULT_DISPLAY_OPTIONS)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('should initialize with default options and loading state', () => {
    const { result } = renderHook(() => useDisplayOptions())
    
    expect(result.current.options).toEqual(DEFAULT_DISPLAY_OPTIONS)
    expect(result.current.isLoading).toBe(true)
    expect(result.current.error).toBe(null)
  })

  it('should load options from service on mount', async () => {
    const { result } = renderHook(() => useDisplayOptions())
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
    
    expect(mockDisplayOptionsService.getDisplayOptions).toHaveBeenCalledTimes(1)
    expect(result.current.options).toEqual(mockOptions)
    expect(result.current.error).toBe(null)
  })

  it('should handle loading errors gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
    mockDisplayOptionsService.getDisplayOptions.mockRejectedValue(new Error('Load error'))
    
    const { result } = renderHook(() => useDisplayOptions())
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
    
    expect(result.current.options).toEqual(DEFAULT_DISPLAY_OPTIONS)
    expect(result.current.error).toBe('Failed to load display preferences')
    expect(consoleSpy).toHaveBeenCalledWith('Error loading display options:', expect.any(Error))
    
    consoleSpy.mockRestore()
  })

  it('should update options and save to service', async () => {
    const { result } = renderHook(() => useDisplayOptions())
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
    
    const newOptions = { showPhoto: false }
    
    await act(async () => {
      await result.current.updateOptions(newOptions)
    })
    
    expect(mockDisplayOptionsService.saveDisplayOptions).toHaveBeenCalledWith({
      ...mockOptions,
      ...newOptions
    })
    expect(result.current.options.showPhoto).toBe(false)
  })

  it('should handle update errors gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
    mockDisplayOptionsService.saveDisplayOptions.mockRejectedValue(new Error('Save error'))
    
    const { result } = renderHook(() => useDisplayOptions())
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
    
    const newOptions = { showPhoto: false }
    
    await act(async () => {
      try {
        await result.current.updateOptions(newOptions)
      } catch (error) {
        // Expected to throw
      }
    })
    
    expect(result.current.error).toBe('Failed to save display preferences')
    expect(consoleSpy).toHaveBeenCalledWith('Error updating display options:', expect.any(Error))
    
    consoleSpy.mockRestore()
  })

  it('should reset to defaults', async () => {
    const { result } = renderHook(() => useDisplayOptions())
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
    
    await act(async () => {
      await result.current.resetToDefaults()
    })
    
    expect(mockDisplayOptionsService.resetToDefaults).toHaveBeenCalledTimes(1)
    expect(result.current.options).toEqual(DEFAULT_DISPLAY_OPTIONS)
  })

  it('should handle reset errors gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
    mockDisplayOptionsService.resetToDefaults.mockRejectedValue(new Error('Reset error'))
    
    const { result } = renderHook(() => useDisplayOptions())
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
    
    await act(async () => {
      try {
        await result.current.resetToDefaults()
      } catch (error) {
        // Expected to throw
      }
    })
    
    expect(result.current.error).toBe('Failed to reset display preferences')
    expect(consoleSpy).toHaveBeenCalledWith('Error resetting display options:', expect.any(Error))
    
    consoleSpy.mockRestore()
  })

  describe('Toggle Functions', () => {
    it('should toggle photo display', async () => {
      const { result } = renderHook(() => useDisplayOptions())
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
      
      const originalValue = result.current.options.showPhoto
      
      await act(async () => {
        await result.current.togglePhoto()
      })
      
      expect(mockDisplayOptionsService.saveDisplayOptions).toHaveBeenCalledWith({
        ...mockOptions,
        showPhoto: !originalValue
      })
      expect(result.current.options.showPhoto).toBe(!originalValue)
    })

    it('should toggle name display', async () => {
      const { result } = renderHook(() => useDisplayOptions())
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
      
      const originalValue = result.current.options.showName
      
      await act(async () => {
        await result.current.toggleName()
      })
      
      expect(result.current.options.showName).toBe(!originalValue)
    })

    it('should toggle ratings display', async () => {
      const { result } = renderHook(() => useDisplayOptions())
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
      
      const originalValue = result.current.options.showRatings
      
      await act(async () => {
        await result.current.toggleRatings()
      })
      
      expect(result.current.options.showRatings).toBe(!originalValue)
    })

    it('should toggle compact mode', async () => {
      const { result } = renderHook(() => useDisplayOptions())
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
      
      const originalValue = result.current.options.compactMode
      
      await act(async () => {
        await result.current.toggleCompactMode()
      })
      
      expect(result.current.options.compactMode).toBe(!originalValue)
    })
  })

  describe('Rating Category Functions', () => {
    it('should update rating categories', async () => {
      const { result } = renderHook(() => useDisplayOptions())
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
      
      const newCategories = ['behavior', 'participation']
      
      await act(async () => {
        await result.current.updateRatingCategories(newCategories)
      })
      
      expect(result.current.options.ratingCategories).toEqual(newCategories)
    })

    it('should add rating category', async () => {
      const { result } = renderHook(() => useDisplayOptions())
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
      
      await act(async () => {
        await result.current.addRatingCategory('participation')
      })
      
      expect(result.current.options.ratingCategories).toContain('participation')
      expect(result.current.options.ratingCategories).toEqual(['behavior', 'academic', 'participation'])
    })

    it('should not add duplicate rating category', async () => {
      const { result } = renderHook(() => useDisplayOptions())
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
      
      const originalLength = result.current.options.ratingCategories.length
      
      await act(async () => {
        await result.current.addRatingCategory('behavior') // Already exists
      })
      
      expect(result.current.options.ratingCategories).toHaveLength(originalLength)
      expect(mockDisplayOptionsService.saveDisplayOptions).not.toHaveBeenCalled()
    })

    it('should remove rating category', async () => {
      const { result } = renderHook(() => useDisplayOptions())
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
      
      await act(async () => {
        await result.current.removeRatingCategory('academic')
      })
      
      expect(result.current.options.ratingCategories).not.toContain('academic')
      expect(result.current.options.ratingCategories).toEqual(['behavior'])
    })

    it('should check if rating category is enabled', async () => {
      const { result } = renderHook(() => useDisplayOptions())
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
      
      expect(result.current.isRatingCategoryEnabled('behavior')).toBe(true)
      expect(result.current.isRatingCategoryEnabled('participation')).toBe(false)
    })

    it('should get active rating categories from student data', async () => {
      const { result } = renderHook(() => useDisplayOptions())
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
      
      const studentRatings = {
        behavior: 3,
        academic: 4,
        participation: undefined, // Not set
        social: 2 // Not in enabled categories
      }
      
      const activeCategories = result.current.getActiveRatingCategories(studentRatings)
      expect(activeCategories).toEqual(['behavior', 'academic'])
    })
  })

  describe('Error Handling', () => {
    it('should clear error when successful operation occurs', async () => {
      // First cause an error
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      mockDisplayOptionsService.saveDisplayOptions.mockRejectedValueOnce(new Error('Save error'))
      
      const { result } = renderHook(() => useDisplayOptions())
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
      
      // Cause error
      await act(async () => {
        try {
          await result.current.updateOptions({ showPhoto: false })
        } catch (error) {
          // Expected
        }
      })
      
      expect(result.current.error).toBe('Failed to save display preferences')
      
      // Now make a successful call
      mockDisplayOptionsService.saveDisplayOptions.mockResolvedValueOnce()
      
      await act(async () => {
        await result.current.updateOptions({ showName: false })
      })
      
      expect(result.current.error).toBe(null)
      
      consoleSpy.mockRestore()
    })
  })

  describe('Memoization', () => {
    it('should maintain stable function references', async () => {
      const { result, rerender } = renderHook(() => useDisplayOptions())
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
      
      const firstRender = {
        updateOptions: result.current.updateOptions,
        resetToDefaults: result.current.resetToDefaults,
        togglePhoto: result.current.togglePhoto,
        toggleName: result.current.toggleName,
        toggleRatings: result.current.toggleRatings,
        toggleCompactMode: result.current.toggleCompactMode,
        updateRatingCategories: result.current.updateRatingCategories,
        addRatingCategory: result.current.addRatingCategory,
        removeRatingCategory: result.current.removeRatingCategory,
        isRatingCategoryEnabled: result.current.isRatingCategoryEnabled,
        getActiveRatingCategories: result.current.getActiveRatingCategories
      }
      
      rerender()
      
      // Functions should maintain same reference for memoization
      expect(result.current.updateOptions).toBe(firstRender.updateOptions)
      expect(result.current.resetToDefaults).toBe(firstRender.resetToDefaults)
      expect(result.current.isRatingCategoryEnabled).toBe(firstRender.isRatingCategoryEnabled)
      expect(result.current.getActiveRatingCategories).toBe(firstRender.getActiveRatingCategories)
    })
  })
})