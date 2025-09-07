/**
 * @jest-environment jsdom
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import 'fake-indexeddb/auto'
import RosterModal from '@/components/roster/RosterModal'

// Mock the dbService
jest.mock('@/lib/db', () => ({
  dbService: {
    getRosterByName: jest.fn()
  }
}))

import { dbService } from '@/lib/db'
const mockGetRosterByName = dbService.getRosterByName as jest.MockedFunction<typeof dbService.getRosterByName>

describe('RosterModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    onSave: jest.fn(),
    isEditing: false
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockGetRosterByName.mockResolvedValue(null)
  })

  it('should not render when isOpen is false', () => {
    render(<RosterModal {...defaultProps} isOpen={false} />)
    expect(screen.queryByText('Create New Roster')).not.toBeInTheDocument()
  })

  it('should render create modal when isOpen is true and not editing', () => {
    render(<RosterModal {...defaultProps} />)
    expect(screen.getByText('Create New Roster')).toBeInTheDocument()
    expect(screen.getByText('Create Roster')).toBeInTheDocument()
  })

  it('should render edit modal when isEditing is true', () => {
    render(<RosterModal {...defaultProps} isEditing={true} existingName="Math Class" />)
    expect(screen.getByText('Edit Roster')).toBeInTheDocument()
    expect(screen.getByText('Update Roster')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Math Class')).toBeInTheDocument()
  })

  it('should call onClose when close button is clicked', () => {
    const onClose = jest.fn()
    render(<RosterModal {...defaultProps} onClose={onClose} />)
    
    const closeButton = screen.getByLabelText('Close')
    fireEvent.click(closeButton)
    
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('should call onClose when overlay is clicked', () => {
    const onClose = jest.fn()
    render(<RosterModal {...defaultProps} onClose={onClose} />)
    
    const overlay = screen.getByText('Create New Roster').closest('.modal-overlay')!
    fireEvent.click(overlay)
    
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('should handle escape key press', () => {
    const onClose = jest.fn()
    render(<RosterModal {...defaultProps} onClose={onClose} />)
    
    const modal = screen.getByText('Create New Roster').closest('.modal-overlay')!
    fireEvent.keyDown(modal, { key: 'Escape' })
    
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('should update roster name input', () => {
    render(<RosterModal {...defaultProps} />)
    
    const input = screen.getByLabelText('Roster Name:')
    fireEvent.change(input, { target: { value: 'Science Class' } })
    
    expect(input).toHaveValue('Science Class')
  })

  it('should show character count', () => {
    render(<RosterModal {...defaultProps} />)
    
    const input = screen.getByLabelText('Roster Name:')
    fireEvent.change(input, { target: { value: 'Test' } })
    
    expect(screen.getByText('4/50 characters')).toBeInTheDocument()
  })

  it('should disable submit button when name is empty', () => {
    render(<RosterModal {...defaultProps} />)
    
    const submitButton = screen.getByText('Create Roster')
    expect(submitButton).toBeDisabled()
  })

  it('should enable submit button when name is provided', () => {
    render(<RosterModal {...defaultProps} />)
    
    const input = screen.getByLabelText('Roster Name:')
    fireEvent.change(input, { target: { value: 'Test Roster' } })
    
    const submitButton = screen.getByText('Create Roster')
    expect(submitButton).not.toBeDisabled()
  })

  it('should show error for empty name on submit', async () => {
    render(<RosterModal {...defaultProps} />)
    
    const form = screen.getByRole('form')
    fireEvent.submit(form)
    
    await waitFor(() => {
      expect(screen.getByText('Please enter a roster name')).toBeInTheDocument()
    })
  })

  it('should show error for name too long', async () => {
    render(<RosterModal {...defaultProps} />)
    
    const input = screen.getByLabelText('Roster Name:')
    const longName = 'a'.repeat(51)
    fireEvent.change(input, { target: { value: longName } })
    
    const form = screen.getByRole('form')
    fireEvent.submit(form)
    
    expect(screen.getByText('Roster name must be 50 characters or less')).toBeInTheDocument()
  })

  it('should call onSave with trimmed name on valid submit', async () => {
    const onSave = jest.fn().mockResolvedValue(undefined)
    render(<RosterModal {...defaultProps} onSave={onSave} />)
    
    const input = screen.getByLabelText('Roster Name:')
    fireEvent.change(input, { target: { value: '  Math Class  ' } })
    
    const form = screen.getByRole('form')
    fireEvent.submit(form)
    
    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith('Math Class')
    })
  })

  it('should show loading state during save', async () => {
    const onSave = jest.fn().mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))
    render(<RosterModal {...defaultProps} onSave={onSave} />)
    
    const input = screen.getByLabelText('Roster Name:')
    fireEvent.change(input, { target: { value: 'Test Roster' } })
    
    const form = screen.getByRole('form')
    fireEvent.submit(form)
    
    expect(screen.getByText('Saving...')).toBeInTheDocument()
    expect(screen.getByText('Cancel')).toBeDisabled()
  })

  it('should show error message when save fails', async () => {
    const onSave = jest.fn().mockRejectedValue(new Error('Database error'))
    render(<RosterModal {...defaultProps} onSave={onSave} />)
    
    const input = screen.getByLabelText('Roster Name:')
    fireEvent.change(input, { target: { value: 'Test Roster' } })
    
    const form = screen.getByRole('form')
    fireEvent.submit(form)
    
    await waitFor(() => {
      expect(screen.getByText('Database error')).toBeInTheDocument()
    })
  })

  it('should show warning for existing roster name during create', async () => {
    mockGetRosterByName.mockResolvedValue({
      id: 'existing-id',
      name: 'Existing Roster',
      created_at: new Date(),
      updated_at: new Date()
    })
    
    render(<RosterModal {...defaultProps} />)
    
    const input = screen.getByLabelText('Roster Name:')
    fireEvent.change(input, { target: { value: 'Existing Roster' } })
    
    await waitFor(() => {
      expect(screen.getByText(/A roster named "Existing Roster" already exists/)).toBeInTheDocument()
    })
  })

  it('should not show warning for existing name during edit', async () => {
    mockGetRosterByName.mockResolvedValue({
      id: 'existing-id', 
      name: 'Math Class',
      created_at: new Date(),
      updated_at: new Date()
    })
    
    render(<RosterModal {...defaultProps} isEditing={true} existingName="Math Class" />)
    
    const input = screen.getByLabelText('Roster Name:')
    fireEvent.change(input, { target: { value: 'Math Class' } })
    
    // Wait a bit to ensure debounced check doesn't trigger
    await new Promise(resolve => setTimeout(resolve, 400))
    
    expect(screen.queryByText(/already exists/)).not.toBeInTheDocument()
  })

  it('should focus input when modal opens', async () => {
    jest.useFakeTimers()
    
    const { rerender } = render(<RosterModal {...defaultProps} isOpen={false} />)
    rerender(<RosterModal {...defaultProps} isOpen={true} />)
    
    jest.advanceTimersByTime(100)
    
    const input = screen.getByLabelText('Roster Name:')
    expect(input).toHaveFocus()
    
    jest.useRealTimers()
  })

  it('should clear form when closed and reopened', () => {
    const { rerender } = render(<RosterModal {...defaultProps} isOpen={true} />)
    
    const input = screen.getByLabelText('Roster Name:')
    fireEvent.change(input, { target: { value: 'Test' } })
    expect(input).toHaveValue('Test')
    
    rerender(<RosterModal {...defaultProps} isOpen={false} />)
    rerender(<RosterModal {...defaultProps} isOpen={true} />)
    
    const newInput = screen.getByLabelText('Roster Name:')
    expect(newInput).toHaveValue('')
  })

  it('should maintain form state when props change but modal stays open', () => {
    const { rerender } = render(<RosterModal {...defaultProps} />)
    
    const input = screen.getByLabelText('Roster Name:')
    fireEvent.change(input, { target: { value: 'Test Roster' } })
    
    rerender(<RosterModal {...defaultProps} />)
    
    expect(input).toHaveValue('Test Roster')
  })
})