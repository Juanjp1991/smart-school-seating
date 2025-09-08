/**
 * @jest-environment jsdom
 */

import React from 'react'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import '@testing-library/jest-dom'
import DisplayOptionsMenu from '@/components/plan/DisplayOptionsMenu'
import { DisplayOptionsService } from '@/lib/displayOptionsService'
import { DisplayOptions } from '@/types/display'

// Mock the DisplayOptionsService
jest.mock('@/lib/displayOptionsService', () => ({
  DisplayOptionsService: {
    getDisplayOptions: jest.fn(),
    saveDisplayOptions: jest.fn(),
    resetToDefaults: jest.fn()
  }
}))

const mockDisplayOptionsService = DisplayOptionsService as jest.Mocked<typeof DisplayOptionsService>

describe('DisplayOptionsMenu', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    onOptionsChange: jest.fn(),
    anchorElement: document.createElement('button')
  }

  const mockOptions: DisplayOptions = {
    showPhoto: true,
    showName: true,
    showRatings: false,
    ratingCategories: ['behavior', 'academic'],
    compactMode: false
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockDisplayOptionsService.getDisplayOptions.mockResolvedValue(mockOptions)
    mockDisplayOptionsService.saveDisplayOptions.mockResolvedValue()
    mockDisplayOptionsService.resetToDefaults.mockResolvedValue({
      showPhoto: true,
      showName: true,
      showRatings: false,
      ratingCategories: ['behavior', 'academic', 'participation'],
      compactMode: false
    })
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('should not render when isOpen is false', () => {
    render(<DisplayOptionsMenu {...defaultProps} isOpen={false} />)
    expect(screen.queryByText('Display Options')).not.toBeInTheDocument()
  })

  it('should render when isOpen is true', async () => {
    render(<DisplayOptionsMenu {...defaultProps} />)
    await waitFor(() => {
      expect(screen.getByText('Display Options')).toBeInTheDocument()
    })
  })

  it('should load display options on mount', async () => {
    render(<DisplayOptionsMenu {...defaultProps} />)
    await waitFor(() => {
      expect(mockDisplayOptionsService.getDisplayOptions).toHaveBeenCalledTimes(1)
    })
  })

  it('should display student information checkboxes', async () => {
    render(<DisplayOptionsMenu {...defaultProps} />)
    await waitFor(() => {
      expect(screen.getByText('Name')).toBeInTheDocument()
      expect(screen.getByText('Photo')).toBeInTheDocument()
      expect(screen.getByText('Show Ratings')).toBeInTheDocument()
    })
  })

  it('should display rating categories when showRatings is enabled', async () => {
    const optionsWithRatings = { ...mockOptions, showRatings: true }
    mockDisplayOptionsService.getDisplayOptions.mockResolvedValue(optionsWithRatings)
    
    render(<DisplayOptionsMenu {...defaultProps} />)
    
    await waitFor(() => {
      expect(screen.getByText('Rating Categories')).toBeInTheDocument()
      expect(screen.getByLabelText(/behavior/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/academic/i)).toBeInTheDocument()
    })
  })

  it('should not display rating categories when showRatings is disabled', async () => {
    render(<DisplayOptionsMenu {...defaultProps} />)
    
    await waitFor(() => {
      expect(screen.queryByText('Rating Categories')).not.toBeInTheDocument()
    })
  })

  it('should display display mode radio buttons', async () => {
    render(<DisplayOptionsMenu {...defaultProps} />)
    
    await waitFor(() => {
      expect(screen.getByText('Standard')).toBeInTheDocument()
      expect(screen.getByText('Compact')).toBeInTheDocument()
    })
  })

  it('should save options when checkboxes are toggled', async () => {
    render(<DisplayOptionsMenu {...defaultProps} />)
    
    await waitFor(() => {
      expect(screen.getByText('Name')).toBeInTheDocument()
    })

    const nameCheckbox = screen.getByText('Name').closest('label')?.querySelector('input')
    fireEvent.click(nameCheckbox!)
    
    await waitFor(() => {
      expect(mockDisplayOptionsService.saveDisplayOptions).toHaveBeenCalledWith(
        expect.objectContaining({
          showName: false
        })
      )
    })
  })

  it('should save rating category changes', async () => {
    const optionsWithRatings = { ...mockOptions, showRatings: true, ratingCategories: ['behavior'] }
    mockDisplayOptionsService.getDisplayOptions.mockResolvedValue(optionsWithRatings)
    
    render(<DisplayOptionsMenu {...defaultProps} />)
    
    await waitFor(() => {
      expect(screen.getByLabelText(/academic/i)).toBeInTheDocument()
    })

    const academicCheckbox = screen.getByLabelText(/academic/i)
    fireEvent.click(academicCheckbox)
    
    await waitFor(() => {
      expect(mockDisplayOptionsService.saveDisplayOptions).toHaveBeenCalledWith(
        expect.objectContaining({
          ratingCategories: expect.arrayContaining(['behavior', 'academic'])
        })
      )
    })
  })

  it('should handle display mode changes', async () => {
    render(<DisplayOptionsMenu {...defaultProps} />)
    
    await waitFor(() => {
      expect(screen.getByLabelText(/compact/i)).toBeInTheDocument()
    })

    const compactRadio = screen.getByLabelText(/compact/i)
    fireEvent.click(compactRadio)
    
    await waitFor(() => {
      expect(mockDisplayOptionsService.saveDisplayOptions).toHaveBeenCalledWith(
        expect.objectContaining({
          compactMode: true
        })
      )
    })
  })

  it('should call onClose when close button is clicked', async () => {
    render(<DisplayOptionsMenu {...defaultProps} />)
    
    await waitFor(() => {
      expect(screen.getByLabelText('Close menu')).toBeInTheDocument()
    })

    const closeButton = screen.getByLabelText('Close menu')
    fireEvent.click(closeButton)
    
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1)
  })

  it('should call onClose when Done button is clicked', async () => {
    render(<DisplayOptionsMenu {...defaultProps} />)
    
    await waitFor(() => {
      expect(screen.getByText('Done')).toBeInTheDocument()
    })

    const doneButton = screen.getByText('Done')
    fireEvent.click(doneButton)
    
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1)
  })

  it('should reset to defaults when Reset button is clicked', async () => {
    render(<DisplayOptionsMenu {...defaultProps} />)
    
    await waitFor(() => {
      expect(screen.getByText('Reset to Defaults')).toBeInTheDocument()
    })

    const resetButton = screen.getByText('Reset to Defaults')
    fireEvent.click(resetButton)
    
    await waitFor(() => {
      expect(mockDisplayOptionsService.resetToDefaults).toHaveBeenCalledTimes(1)
    })
  })

  it('should handle keyboard navigation', async () => {
    render(<DisplayOptionsMenu {...defaultProps} />)
    
    await waitFor(() => {
      expect(screen.getByText('Display Options')).toBeInTheDocument()
    })

    // Test Escape key
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1)
  })

  it('should handle click outside to close', async () => {
    render(<DisplayOptionsMenu {...defaultProps} />)
    
    await waitFor(() => {
      expect(screen.getByText('Display Options')).toBeInTheDocument()
    })

    // Click outside the menu
    fireEvent.mouseDown(document.body)
    
    await waitFor(() => {
      expect(defaultProps.onClose).toHaveBeenCalledTimes(1)
    })
  })

  it('should handle service errors gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
    mockDisplayOptionsService.getDisplayOptions.mockRejectedValue(new Error('Service error'))
    
    render(<DisplayOptionsMenu {...defaultProps} />)
    
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Error loading display options:', expect.any(Error))
    })
    
    consoleSpy.mockRestore()
  })
})