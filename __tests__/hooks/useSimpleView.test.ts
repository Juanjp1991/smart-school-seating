import { renderHook, act, waitFor } from '@testing-library/react'
import { useSimpleView } from '@/hooks/useSimpleView'
import { DisplayOptionsProvider } from '@/contexts/DisplayOptionsContext'

// Mock the useDisplayOptions hook
const mockUpdateDisplayOptions = jest.fn()
const mockDisplayOptions = {
  showPhoto: true,
  showName: true,
  showRatings: false,
  ratingCategories: ['behavior', 'academic', 'participation'],
  compactMode: false,
  simpleView: false
}

jest.mock('@/hooks/useDisplayOptions', () => ({
  useDisplayOptions: () => ({
    displayOptions: mockDisplayOptions,
    updateDisplayOptions: mockUpdateDisplayOptions
  })
}))

describe('useSimpleView', () => {
  beforeEach(() => {
    mockUpdateDisplayOptions.mockClear()
    mockDisplayOptions.simpleView = false
    mockDisplayOptions.savedOptions = undefined
  })

  it('returns correct initial state when simple view is inactive', () => {
    const { result } = renderHook(() => useSimpleView(), {
      wrapper: DisplayOptionsProvider
    })

    expect(result.current.isSimpleViewActive).toBe(false)
    expect(typeof result.current.toggleSimpleView).toBe('function')
    expect(typeof result.current.exitSimpleView).toBe('function')
    expect(typeof result.current.getSavedOptions).toBe('function')
  })

  it('returns correct initial state when simple view is active', () => {
    mockDisplayOptions.simpleView = true
    
    const { result } = renderHook(() => useSimpleView(), {
      wrapper: DisplayOptionsProvider
    })

    expect(result.current.isSimpleViewActive).toBe(true)
  })

  it('toggles to simple view and saves current options', async () => {
    const { result } = renderHook(() => useSimpleView(), {
      wrapper: DisplayOptionsProvider
    })

    mockUpdateDisplayOptions.mockResolvedValue()

    await act(async () => {
      await result.current.toggleSimpleView()
    })

    expect(mockUpdateDisplayOptions).toHaveBeenCalledWith({
      ...mockDisplayOptions,
      simpleView: true,
      savedOptions: mockDisplayOptions,
      showPhoto: false,
      showRatings: false,
      compactMode: true
    })
  })

  it('toggles from simple view to normal view with saved options', async () => {
    mockDisplayOptions.simpleView = true
    mockDisplayOptions.savedOptions = {
      showPhoto: true,
      showName: true,
      showRatings: true,
      ratingCategories: ['behavior', 'academic'],
      compactMode: false,
      simpleView: false
    }

    const { result } = renderHook(() => useSimpleView(), {
      wrapper: DisplayOptionsProvider
    })

    mockUpdateDisplayOptions.mockResolvedValue()

    await act(async () => {
      await result.current.toggleSimpleView()
    })

    expect(mockUpdateDisplayOptions).toHaveBeenCalledWith({
      ...mockDisplayOptions.savedOptions,
      simpleView: false,
      savedOptions: undefined
    })
  })

  it('exits simple view without saved options uses defaults', async () => {
    mockDisplayOptions.simpleView = true
    mockDisplayOptions.savedOptions = undefined

    const { result } = renderHook(() => useSimpleView(), {
      wrapper: DisplayOptionsProvider
    })

    mockUpdateDisplayOptions.mockResolvedValue()

    await act(async () => {
      await result.current.exitSimpleView()
    })

    expect(mockUpdateDisplayOptions).toHaveBeenCalledWith({
      ...mockDisplayOptions,
      simpleView: false,
      savedOptions: undefined,
      showPhoto: true,
      showName: true,
      showRatings: false,
      compactMode: false
    })
  })

  it('returns saved options when they exist', () => {
    const savedOptions = {
      showPhoto: false,
      showName: true,
      showRatings: true,
      ratingCategories: ['behavior'],
      compactMode: true,
      simpleView: false
    }
    
    mockDisplayOptions.savedOptions = savedOptions

    const { result } = renderHook(() => useSimpleView(), {
      wrapper: DisplayOptionsProvider
    })

    expect(result.current.getSavedOptions()).toEqual(savedOptions)
  })

  it('returns null when no saved options exist', () => {
    mockDisplayOptions.savedOptions = undefined

    const { result } = renderHook(() => useSimpleView(), {
      wrapper: DisplayOptionsProvider
    })

    expect(result.current.getSavedOptions()).toBeNull()
  })

  it('handles updateDisplayOptions error gracefully', async () => {
    const { result } = renderHook(() => useSimpleView(), {
      wrapper: DisplayOptionsProvider
    })

    mockUpdateDisplayOptions.mockRejectedValue(new Error('Update failed'))

    await expect(result.current.toggleSimpleView()).rejects.toThrow('Update failed')
  })

  it('preserves non-display option fields when toggling', async () => {
    const { result } = renderHook(() => useSimpleView(), {
      wrapper: DisplayOptionsProvider
    })

    mockUpdateDisplayOptions.mockResolvedValue()

    await act(async () => {
      await result.current.toggleSimpleView()
    })

    const callArgs = mockUpdateDisplayOptions.mock.calls[0][0]
    
    // Should preserve these fields
    expect(callArgs.ratingCategories).toEqual(mockDisplayOptions.ratingCategories)
    expect(callArgs.showName).toEqual(mockDisplayOptions.showName)
    
    // Should modify these fields
    expect(callArgs.simpleView).toBe(true)
    expect(callArgs.showPhoto).toBe(false)
    expect(callArgs.showRatings).toBe(false)
    expect(callArgs.compactMode).toBe(true)
  })
})