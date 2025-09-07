/**
 * @jest-environment jsdom
 */

import 'fake-indexeddb/auto'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import LayoutEditor from '@/app/layout-editor/page'

// Mock the database service
jest.mock('@/lib/db', () => ({
  dbService: {
    saveLayout: jest.fn(),
    updateLayout: jest.fn(),
    getLayoutByName: jest.fn(),
    getAllLayouts: jest.fn()
  }
}))

import { dbService } from '@/lib/db'
const mockDbService = dbService as jest.Mocked<typeof dbService>

describe('Layout Editor Page', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockDbService.getAllLayouts.mockResolvedValue([])
  })
  test('renders layout editor with default grid dimensions', () => {
    render(<LayoutEditor />)
    
    // Check for row input with default value
    const rowsInput = screen.getByDisplayValue('8')
    expect(rowsInput).toBeInTheDocument()
    
    // Check for cols input with default value
    const colsInput = screen.getByDisplayValue('6') 
    expect(colsInput).toBeInTheDocument()
    
    // Should render grid with default 8*6 = 48 cells
    const cells = document.querySelectorAll('.grid-cell')
    expect(cells).toHaveLength(48)
  })

  test('updates grid when rows input changes', () => {
    render(<LayoutEditor />)
    
    const rowsInput = screen.getByDisplayValue('8')
    
    // Change rows to 5
    fireEvent.change(rowsInput, { target: { value: '5' } })
    
    // Should now render 5*6 = 30 cells
    const cells = document.querySelectorAll('.grid-cell')
    expect(cells).toHaveLength(30)
  })

  test('updates grid when cols input changes', () => {
    render(<LayoutEditor />)
    
    const colsInput = screen.getByDisplayValue('6')
    
    // Change cols to 4
    fireEvent.change(colsInput, { target: { value: '4' } })
    
    // Should now render 8*4 = 32 cells
    const cells = document.querySelectorAll('.grid-cell')
    expect(cells).toHaveLength(32)
  })

  test('validates input ranges - ignores invalid values', () => {
    render(<LayoutEditor />)
    
    const rowsInput = screen.getByDisplayValue('8') as HTMLInputElement
    
    // Try to set negative value
    fireEvent.change(rowsInput, { target: { value: '-1' } })
    
    // Should still have 8 rows (invalid input ignored)
    expect(rowsInput.value).toBe('8')
    
    // Try to set zero
    fireEvent.change(rowsInput, { target: { value: '0' } })
    expect(rowsInput.value).toBe('8')
    
    // Try to set too large value
    fireEvent.change(rowsInput, { target: { value: '25' } })
    expect(rowsInput.value).toBe('8')
  })

  test('accepts valid input ranges', () => {
    render(<LayoutEditor />)
    
    const rowsInput = screen.getByDisplayValue('8') as HTMLInputElement
    const colsInput = screen.getByDisplayValue('6') as HTMLInputElement
    
    // Set valid values
    fireEvent.change(rowsInput, { target: { value: '10' } })
    fireEvent.change(colsInput, { target: { value: '12' } })
    
    expect(rowsInput.value).toBe('10')
    expect(colsInput.value).toBe('12')
    
    // Should render 10*12 = 120 cells
    const cells = document.querySelectorAll('.grid-cell')
    expect(cells).toHaveLength(120)
  })

  test('renders toolbar with all required elements', () => {
    render(<LayoutEditor />)
    
    // Check for labels
    expect(screen.getByText('Rows:')).toBeInTheDocument()
    expect(screen.getByText('Cols:')).toBeInTheDocument()
    
    // Check for tool buttons
    expect(screen.getByText('Seat')).toBeInTheDocument()
    expect(screen.getByText('Desk')).toBeInTheDocument()
    expect(screen.getByText('Door')).toBeInTheDocument()
    expect(screen.getByText('Save')).toBeInTheDocument()
    
    // Check for tools section
    expect(screen.getByText('Tools:')).toBeInTheDocument()
  })

  test('opens save modal when Save button is clicked', async () => {
    render(<LayoutEditor />)
    
    const saveButton = screen.getByText('Save')
    fireEvent.click(saveButton)
    
    // Should open save modal
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Save Layout' })).toBeInTheDocument()
      expect(screen.getByLabelText('Layout Name:')).toBeInTheDocument()
    })
  })

  test('saves layout with correct data when form is submitted', async () => {
    mockDbService.getLayoutByName.mockResolvedValue(null)
    mockDbService.saveLayout.mockResolvedValue('test-id-123')

    render(<LayoutEditor />)
    
    // Change grid dimensions
    const rowsInput = screen.getByDisplayValue('8')
    const colsInput = screen.getByDisplayValue('6')
    fireEvent.change(rowsInput, { target: { value: '10' } })
    fireEvent.change(colsInput, { target: { value: '5' } })
    
    // Add some furniture by selecting desk tool and clicking grid
    const deskButton = screen.getByText('Desk')
    fireEvent.click(deskButton)
    
    const gridCells = document.querySelectorAll('.grid-cell')
    if (gridCells.length > 0) {
      fireEvent.click(gridCells[0])
    }

    // Open save modal
    const saveButton = screen.getByText('Save')
    fireEvent.click(saveButton)
    
    // Fill in name and submit
    await waitFor(() => {
      expect(screen.getByLabelText('Layout Name:')).toBeInTheDocument()
    })
    
    const nameInput = screen.getByLabelText('Layout Name:')
    fireEvent.change(nameInput, { target: { value: 'Test Layout' } })
    
    const saveLayoutButtons = screen.getAllByRole('button', { name: 'Save Layout' })
    const saveLayoutButton = saveLayoutButtons[saveLayoutButtons.length - 1] // Get the form submit button (last one)
    fireEvent.click(saveLayoutButton)
    
    await waitFor(() => {
      expect(mockDbService.saveLayout).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Test Layout',
          grid_rows: 10,
          grid_cols: 5,
          seats: expect.any(Array)
        })
      )
    })
  })

  test('shows success notification when layout is saved', async () => {
    mockDbService.getLayoutByName.mockResolvedValue(null)
    mockDbService.saveLayout.mockResolvedValue('test-id-123')

    render(<LayoutEditor />)
    
    // Open save modal and save
    const saveButton = screen.getByText('Save')
    fireEvent.click(saveButton)
    
    await waitFor(() => {
      expect(screen.getByLabelText('Layout Name:')).toBeInTheDocument()
    })
    
    const nameInput = screen.getByLabelText('Layout Name:')
    fireEvent.change(nameInput, { target: { value: 'Success Test' } })
    
    const saveLayoutButtons = screen.getAllByRole('button', { name: 'Save Layout' })
    const saveLayoutButton = saveLayoutButtons[saveLayoutButtons.length - 1] // Get the form submit button (last one)
    fireEvent.click(saveLayoutButton)
    
    // Should show success notification
    await waitFor(() => {
      expect(screen.getByText('Layout "Success Test" saved successfully!')).toBeInTheDocument()
    })
  })

  test('handles save errors gracefully', async () => {
    mockDbService.getLayoutByName.mockResolvedValue(null)
    mockDbService.saveLayout.mockRejectedValue(new Error('Save failed'))

    render(<LayoutEditor />)
    
    // Open save modal and attempt save
    const saveButton = screen.getByText('Save')
    fireEvent.click(saveButton)
    
    await waitFor(() => {
      expect(screen.getByLabelText('Layout Name:')).toBeInTheDocument()
    })
    
    const nameInput = screen.getByLabelText('Layout Name:')
    fireEvent.change(nameInput, { target: { value: 'Error Test' } })
    
    const saveLayoutButtons = screen.getAllByRole('button', { name: 'Save Layout' })
    const saveLayoutButton = saveLayoutButtons[saveLayoutButtons.length - 1] // Get the form submit button (last one)
    fireEvent.click(saveLayoutButton)
    
    // Should show error notification
    await waitFor(() => {
      expect(screen.getByText('Save failed')).toBeInTheDocument()
    })
  })

  test('handles overwrite confirmation for existing layout names', async () => {
    const existingLayout = {
      id: 'existing-id',
      name: 'Existing Layout',
      grid_rows: 8,
      grid_cols: 6,
      furniture: [],
      seats: [],
      created_at: new Date(),
      updated_at: new Date()
    }

    // First call returns existing layout, second call returns same for confirmation
    mockDbService.getLayoutByName
      .mockResolvedValueOnce(existingLayout)
      .mockResolvedValueOnce(existingLayout)
    mockDbService.updateLayout.mockResolvedValue(undefined)

    render(<LayoutEditor />)
    
    // Open save modal
    const saveButton = screen.getByText('Save')
    fireEvent.click(saveButton)
    
    await waitFor(() => {
      expect(screen.getByLabelText('Layout Name:')).toBeInTheDocument()
    })
    
    const nameInput = screen.getByLabelText('Layout Name:')
    fireEvent.change(nameInput, { target: { value: 'Existing Layout' } })
    
    const saveLayoutButtons = screen.getAllByRole('button', { name: 'Save Layout' })
    const saveLayoutButton = saveLayoutButtons[saveLayoutButtons.length - 1] // Get the form submit button (last one)
    fireEvent.click(saveLayoutButton)
    
    // Should show overwrite warning in modal
    await waitFor(() => {
      expect(screen.getAllByText(/A layout named "Existing Layout" already exists/)[0]).toBeInTheDocument()
    })
    
    // Click save again to confirm overwrite
    fireEvent.click(saveLayoutButton)
    
    await waitFor(() => {
      expect(mockDbService.updateLayout).toHaveBeenCalledWith(
        'existing-id',
        expect.objectContaining({
          name: 'Existing Layout'
        })
      )
    })
  })

  test('closes notification when close button is clicked', async () => {
    mockDbService.getLayoutByName.mockResolvedValue(null)
    mockDbService.saveLayout.mockResolvedValue('test-id')

    render(<LayoutEditor />)
    
    // Trigger a save to show notification
    const saveButton = screen.getByText('Save')
    fireEvent.click(saveButton)
    
    await waitFor(() => {
      expect(screen.getByLabelText('Layout Name:')).toBeInTheDocument()
    })
    
    const nameInput = screen.getByLabelText('Layout Name:')
    fireEvent.change(nameInput, { target: { value: 'Close Test' } })
    
    const saveLayoutButtons = screen.getAllByRole('button', { name: 'Save Layout' })
    const saveLayoutButton = saveLayoutButtons[saveLayoutButtons.length - 1] // Get the form submit button (last one)
    fireEvent.click(saveLayoutButton)
    
    // Wait for notification
    await waitFor(() => {
      expect(screen.getByText('Layout "Close Test" saved successfully!')).toBeInTheDocument()
    })
    
    // Close notification
    const closeNotificationButton = screen.getByLabelText('Close notification')
    fireEvent.click(closeNotificationButton)
    
    await waitFor(() => {
      expect(screen.queryByText('Layout "Close Test" saved successfully!')).not.toBeInTheDocument()
    })
  })
})