import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { SimpleViewToggle } from '@/components/plan/SimpleViewToggle'
import { DisplayOptionsProvider } from '@/contexts/DisplayOptionsContext'

// Mock the useDisplayOptions hook
const mockToggleSimpleView = jest.fn()

jest.mock('@/hooks/useDisplayOptions', () => ({
  useDisplayOptions: jest.fn(() => ({
    displayOptions: {
      showPhoto: true,
      showName: true,
      showRatings: false,
      ratingCategories: ['behavior', 'academic', 'participation'],
      compactMode: false,
      simpleView: false
    },
    toggleSimpleView: mockToggleSimpleView,
    isSimpleViewActive: false
  }))
}))

describe('SimpleViewToggle', () => {
  beforeEach(() => {
    mockToggleSimpleView.mockClear()
    const { useDisplayOptions } = require('@/hooks/useDisplayOptions')
    useDisplayOptions.mockReturnValue({
      displayOptions: {
        showPhoto: true,
        showName: true,
        showRatings: false,
        ratingCategories: ['behavior', 'academic', 'participation'],
        compactMode: false,
        simpleView: false
      },
      toggleSimpleView: mockToggleSimpleView,
      isSimpleViewActive: false
    })
  })

  it('renders toggle button correctly when simple view is inactive', () => {
    render(
      <DisplayOptionsProvider>
        <SimpleViewToggle />
      </DisplayOptionsProvider>
    )

    const button = screen.getByTitle('Show simple view (names only)')
    expect(button).toBeInTheDocument()
    expect(screen.getByText('Simple')).toBeInTheDocument()
    
    const eyeIcon = document.querySelector('svg')
    expect(eyeIcon).toBeInTheDocument()
  })

  it('renders toggle button correctly when simple view is active', () => {
    const { useDisplayOptions } = require('@/hooks/useDisplayOptions')
    useDisplayOptions.mockReturnValue({
      displayOptions: {
        showPhoto: true,
        showName: true,
        showRatings: false,
        ratingCategories: ['behavior', 'academic', 'participation'],
        compactMode: false,
        simpleView: true
      },
      toggleSimpleView: mockToggleSimpleView,
      isSimpleViewActive: true
    })

    render(
      <DisplayOptionsProvider>
        <SimpleViewToggle />
      </DisplayOptionsProvider>
    )

    const button = screen.getByTitle('Show full student data')
    expect(button).toBeInTheDocument()
    expect(button).toHaveClass('bg-blue-50', 'border-blue-200', 'text-blue-700')
  })

  it('calls toggleSimpleView when clicked', async () => {
    render(
      <DisplayOptionsProvider>
        <SimpleViewToggle />
      </DisplayOptionsProvider>
    )

    const button = screen.getByTitle('Show simple view (names only)')
    fireEvent.click(button)

    await waitFor(() => {
      expect(mockToggleSimpleView).toHaveBeenCalledTimes(1)
    })
  })

  it('shows loading state when toggle is in progress', async () => {
    mockToggleSimpleView.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)))

    render(
      <DisplayOptionsProvider>
        <SimpleViewToggle />
      </DisplayOptionsProvider>
    )

    const button = screen.getByTitle('Show simple view (names only)')
    fireEvent.click(button)

    await waitFor(() => {
      expect(button).toBeDisabled()
      expect(button).toHaveClass('opacity-50', 'cursor-not-allowed')
    })

    // Check for loading spinner
    const spinner = document.querySelector('.animate-spin')
    expect(spinner).toBeInTheDocument()
  })

  it('applies custom className correctly', () => {
    render(
      <DisplayOptionsProvider>
        <SimpleViewToggle className="custom-class" />
      </DisplayOptionsProvider>
    )

    const button = screen.getByTitle('Show simple view (names only)')
    expect(button).toHaveClass('custom-class')
  })

  it('handles toggleSimpleView error gracefully', async () => {
    mockToggleSimpleView.mockRejectedValue(new Error('Toggle failed'))

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

    render(
      <DisplayOptionsProvider>
        <SimpleViewToggle />
      </DisplayOptionsProvider>
    )

    const button = screen.getByTitle('Show simple view (names only)')
    fireEvent.click(button)

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Failed to toggle simple view:', expect.any(Error))
    })

    consoleSpy.mockRestore()
  })
})