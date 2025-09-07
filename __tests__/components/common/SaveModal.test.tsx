/**
 * @jest-environment jsdom
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import SaveModal from '@/components/common/SaveModal'

describe('SaveModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    onSave: jest.fn()
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should not render when isOpen is false', () => {
    render(<SaveModal {...defaultProps} isOpen={false} />)
    expect(screen.queryByText('Save Layout')).not.toBeInTheDocument()
  })

  it('should render when isOpen is true', () => {
    render(<SaveModal {...defaultProps} />)
    expect(screen.getByRole('heading', { name: 'Save Layout' })).toBeInTheDocument()
    expect(screen.getByLabelText('Layout Name:')).toBeInTheDocument()
    expect(screen.getByText('Cancel')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Save Layout' })).toBeInTheDocument()
  })

  it('should focus the input field when opened', () => {
    render(<SaveModal {...defaultProps} />)
    const input = screen.getByLabelText('Layout Name:')
    expect(input).toHaveFocus()
  })

  it('should call onClose when close button is clicked', () => {
    render(<SaveModal {...defaultProps} />)
    const closeButton = screen.getByLabelText('Close')
    fireEvent.click(closeButton)
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1)
  })

  it('should call onClose when Cancel button is clicked', () => {
    render(<SaveModal {...defaultProps} />)
    const cancelButton = screen.getByText('Cancel')
    fireEvent.click(cancelButton)
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1)
  })

  it('should call onClose when overlay is clicked', () => {
    render(<SaveModal {...defaultProps} />)
    const overlay = screen.getByRole('heading', { name: 'Save Layout' }).closest('.modal-overlay')
    fireEvent.click(overlay!)
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1)
  })

  it('should not call onClose when modal content is clicked', () => {
    render(<SaveModal {...defaultProps} />)
    const modalContent = screen.getByRole('heading', { name: 'Save Layout' }).closest('.modal-content')
    fireEvent.click(modalContent!)
    expect(defaultProps.onClose).not.toHaveBeenCalled()
  })

  it('should update input value when typing', () => {
    render(<SaveModal {...defaultProps} />)
    const input = screen.getByLabelText('Layout Name:') as HTMLInputElement
    fireEvent.change(input, { target: { value: 'My Test Layout' } })
    expect(input.value).toBe('My Test Layout')
  })

  it('should show error for empty layout name when form is submitted', async () => {
    render(<SaveModal {...defaultProps} />)
    const input = screen.getByLabelText('Layout Name:')
    const form = screen.getByRole('form')
    
    // Add text then clear it to enable the button
    fireEvent.change(input, { target: { value: 'Test' } })
    fireEvent.change(input, { target: { value: ' ' } }) // Space that will be trimmed
    
    // Submit the form directly
    fireEvent.submit(form)
    
    await waitFor(() => {
      expect(screen.getByText('Please enter a layout name')).toBeInTheDocument()
    })
    expect(defaultProps.onSave).not.toHaveBeenCalled()
  })

  it('should call onSave with layout name when form is submitted', async () => {
    const onSave = jest.fn().mockResolvedValue(undefined)
    render(<SaveModal {...defaultProps} onSave={onSave} />)
    
    const input = screen.getByLabelText('Layout Name:')
    const saveButton = screen.getByRole('button', { name: 'Save Layout' })
    
    fireEvent.change(input, { target: { value: 'Test Layout' } })
    fireEvent.click(saveButton)
    
    expect(onSave).toHaveBeenCalledWith('Test Layout')
  })

  it('should trim whitespace from layout name', async () => {
    const onSave = jest.fn().mockResolvedValue(undefined)
    render(<SaveModal {...defaultProps} onSave={onSave} />)
    
    const input = screen.getByLabelText('Layout Name:')
    const saveButton = screen.getByRole('button', { name: 'Save Layout' })
    
    fireEvent.change(input, { target: { value: '  Test Layout  ' } })
    fireEvent.click(saveButton)
    
    expect(onSave).toHaveBeenCalledWith('Test Layout')
  })

  it('should handle save errors and display them', async () => {
    const onSave = jest.fn().mockRejectedValue(new Error('Save failed'))
    render(<SaveModal {...defaultProps} onSave={onSave} />)
    
    const input = screen.getByLabelText('Layout Name:')
    const saveButton = screen.getByRole('button', { name: 'Save Layout' })
    
    fireEvent.change(input, { target: { value: 'Test Layout' } })
    fireEvent.click(saveButton)
    
    await waitFor(() => {
      expect(screen.getByText('Save failed')).toBeInTheDocument()
    })
  })

  it('should show loading state while saving', async () => {
    let resolvePromise: () => void
    const savePromise = new Promise<void>((resolve) => {
      resolvePromise = resolve
    })
    const onSave = jest.fn().mockReturnValue(savePromise)
    
    render(<SaveModal {...defaultProps} onSave={onSave} />)
    
    const input = screen.getByLabelText('Layout Name:')
    const saveButton = screen.getByRole('button', { name: 'Save Layout' })
    
    fireEvent.change(input, { target: { value: 'Test Layout' } })
    fireEvent.click(saveButton)
    
    // Check loading state
    expect(screen.getByText('Saving...')).toBeInTheDocument()
    expect(input).toBeDisabled()
    expect(screen.queryByLabelText('Close')).not.toBeInTheDocument()
    
    // Resolve the promise
    resolvePromise!()
    
    await waitFor(() => {
      expect(screen.queryByText('Saving...')).not.toBeInTheDocument()
    })
  })

  it('should disable save button when input is empty', () => {
    render(<SaveModal {...defaultProps} />)
    const saveButton = screen.getByRole('button', { name: 'Save Layout' })
    expect(saveButton).toBeDisabled()
  })

  it('should enable save button when input has value', () => {
    render(<SaveModal {...defaultProps} />)
    const input = screen.getByLabelText('Layout Name:')
    const saveButton = screen.getByRole('button', { name: 'Save Layout' })
    
    fireEvent.change(input, { target: { value: 'Test' } })
    expect(saveButton).toBeEnabled()
  })

  it('should show warning message for existing name', () => {
    render(<SaveModal {...defaultProps} existingName="Existing Layout" />)
    expect(screen.getByText(/A layout named "Existing Layout" already exists/)).toBeInTheDocument()
  })

  it('should clear form and close modal on successful save', async () => {
    const onSave = jest.fn().mockResolvedValue(undefined)
    const onClose = jest.fn()
    
    render(<SaveModal {...defaultProps} onSave={onSave} onClose={onClose} />)
    
    const input = screen.getByLabelText('Layout Name:') as HTMLInputElement
    const saveButton = screen.getByRole('button', { name: 'Save Layout' })
    
    fireEvent.change(input, { target: { value: 'Test Layout' } })
    fireEvent.click(saveButton)
    
    await waitFor(() => {
      expect(onClose).toHaveBeenCalled()
    })
  })

  it('should enforce maxLength on input', () => {
    render(<SaveModal {...defaultProps} />)
    const input = screen.getByLabelText('Layout Name:') as HTMLInputElement
    expect(input.maxLength).toBe(50)
  })

  it('should submit form when Enter key is pressed', async () => {
    const onSave = jest.fn().mockResolvedValue(undefined)
    render(<SaveModal {...defaultProps} onSave={onSave} />)
    
    const input = screen.getByLabelText('Layout Name:')
    fireEvent.change(input, { target: { value: 'Test Layout' } })
    fireEvent.submit(screen.getByRole('form'))
    
    expect(onSave).toHaveBeenCalledWith('Test Layout')
  })
})