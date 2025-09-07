import React from 'react'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import '@testing-library/jest-dom'
import LoadModal from '@/components/common/LoadModal'
import { dbService, Layout } from '@/lib/db'

// Mock the database service
jest.mock('@/lib/db')
const mockDbService = dbService as jest.Mocked<typeof dbService>

const mockLayout: Layout = {
  id: '123',
  name: 'Test Layout',
  grid_rows: 6,
  grid_cols: 8,
  furniture: [],
  seats: ['0-0', '0-1'],
  created_at: new Date('2023-01-01T00:00:00.000Z'),
  updated_at: new Date('2023-01-01T00:00:00.000Z')
}

const mockOnLoad = jest.fn()
const mockOnClose = jest.fn()

describe('LoadModal', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockDbService.getAllLayouts.mockResolvedValue([])
  })

  it('should not render when isOpen is false', () => {
    render(<LoadModal isOpen={false} onClose={mockOnClose} onLoad={mockOnLoad} />)
    expect(screen.queryByText('Load Layout Template')).not.toBeInTheDocument()
  })

  it('should render when isOpen is true', async () => {
    await act(async () => {
      render(<LoadModal isOpen={true} onClose={mockOnClose} onLoad={mockOnLoad} />)
    })
    expect(screen.getByText('Load Layout Template')).toBeInTheDocument()
  })

  it('should show loading state initially', async () => {
    mockDbService.getAllLayouts.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve([]), 100)))
    
    await act(async () => {
      render(<LoadModal isOpen={true} onClose={mockOnClose} onLoad={mockOnLoad} />)
    })
    
    expect(screen.getByText('Loading templates...')).toBeInTheDocument()
  })

  it('should display empty state when no templates available', async () => {
    mockDbService.getAllLayouts.mockResolvedValue([])
    
    await act(async () => {
      render(<LoadModal isOpen={true} onClose={mockOnClose} onLoad={mockOnLoad} />)
    })
    
    await waitFor(() => {
      expect(screen.getByText('No templates available')).toBeInTheDocument()
      expect(screen.getByText('Save a layout first to see it here')).toBeInTheDocument()
    })
  })

  it('should display template list when templates are available', async () => {
    mockDbService.getAllLayouts.mockResolvedValue([mockLayout])
    
    await act(async () => {
      render(<LoadModal isOpen={true} onClose={mockOnClose} onLoad={mockOnLoad} />)
    })
    
    await waitFor(() => {
      expect(screen.getByText('Test Layout')).toBeInTheDocument()
      expect(screen.getByText('6 × 8 grid')).toBeInTheDocument()
      expect(screen.getByText(/Created:/)).toBeInTheDocument()
    })
  })

  it('should sort templates by creation date (newest first)', async () => {
    const oldLayout = { ...mockLayout, id: '1', name: 'Old Layout', created_at: new Date('2022-01-01') }
    const newLayout = { ...mockLayout, id: '2', name: 'New Layout', created_at: new Date('2024-01-01') }
    
    mockDbService.getAllLayouts.mockResolvedValue([oldLayout, newLayout])
    
    await act(async () => {
      render(<LoadModal isOpen={true} onClose={mockOnClose} onLoad={mockOnLoad} />)
    })
    
    await waitFor(() => {
      expect(screen.queryByText('Loading templates...')).not.toBeInTheDocument()
    })
    
    const templateNames = screen.getAllByText(/Layout$/)
    expect(templateNames[0]).toHaveTextContent('New Layout')
    expect(templateNames[1]).toHaveTextContent('Old Layout')
  })

  it('should call onLoad when Load button is clicked', async () => {
    mockDbService.getAllLayouts.mockResolvedValue([mockLayout])
    
    render(<LoadModal isOpen={true} onClose={mockOnClose} onLoad={mockOnLoad} />)
    
    await waitFor(() => {
      const loadButton = screen.getByRole('button', { name: 'Load' })
      fireEvent.click(loadButton)
    })
    
    expect(mockOnLoad).toHaveBeenCalledWith(mockLayout)
  })

  it('should show loading state for the specific template being loaded', async () => {
    mockDbService.getAllLayouts.mockResolvedValue([mockLayout])
    mockOnLoad.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))
    
    render(<LoadModal isOpen={true} onClose={mockOnClose} onLoad={mockOnLoad} />)
    
    await waitFor(() => {
      const loadButton = screen.getByRole('button', { name: 'Load' })
      fireEvent.click(loadButton)
    })
    
    expect(screen.getByRole('button', { name: 'Loading...' })).toBeInTheDocument()
  })

  it('should call onClose when modal is closed', () => {
    render(<LoadModal isOpen={true} onClose={mockOnClose} onLoad={mockOnLoad} />)
    
    const closeButton = screen.getByRole('button', { name: 'Close' })
    fireEvent.click(closeButton)
    
    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  it('should call onClose when overlay is clicked', () => {
    render(<LoadModal isOpen={true} onClose={mockOnClose} onLoad={mockOnLoad} />)
    
    const overlay = screen.getByText('Load Layout Template').closest('.modal-overlay')
    fireEvent.click(overlay!)
    
    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  it('should call onClose when Cancel button is clicked', async () => {
    mockDbService.getAllLayouts.mockResolvedValue([])
    
    render(<LoadModal isOpen={true} onClose={mockOnClose} onLoad={mockOnLoad} />)
    
    await waitFor(() => {
      const cancelButton = screen.getByRole('button', { name: 'Cancel' })
      fireEvent.click(cancelButton)
    })
    
    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  it('should handle database errors gracefully', async () => {
    mockDbService.getAllLayouts.mockRejectedValue(new Error('Database error'))
    
    render(<LoadModal isOpen={true} onClose={mockOnClose} onLoad={mockOnLoad} />)
    
    await waitFor(() => {
      expect(screen.getByText('Database error')).toBeInTheDocument()
    })
  })

  it('should handle load errors gracefully', async () => {
    mockDbService.getAllLayouts.mockResolvedValue([mockLayout])
    mockOnLoad.mockRejectedValue(new Error('Load failed'))
    
    render(<LoadModal isOpen={true} onClose={mockOnClose} onLoad={mockOnLoad} />)
    
    await waitFor(() => {
      const loadButton = screen.getByRole('button', { name: 'Load' })
      fireEvent.click(loadButton)
    })
    
    await waitFor(() => {
      expect(screen.getByText('Load failed')).toBeInTheDocument()
    })
  })

  it('should not close modal during loading', async () => {
    mockDbService.getAllLayouts.mockResolvedValue([mockLayout])
    mockOnLoad.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))
    
    render(<LoadModal isOpen={true} onClose={mockOnClose} onLoad={mockOnLoad} />)
    
    await waitFor(() => {
      const loadButton = screen.getByRole('button', { name: 'Load' })
      fireEvent.click(loadButton)
    })
    
    // Close button should not be visible during loading
    expect(screen.queryByRole('button', { name: 'Close' })).not.toBeInTheDocument()
  })

  it('should display multiple templates correctly', async () => {
    const template1 = { ...mockLayout, id: '1', name: 'Template 1' }
    const template2 = { ...mockLayout, id: '2', name: 'Template 2', grid_rows: 10, grid_cols: 12 }
    
    mockDbService.getAllLayouts.mockResolvedValue([template1, template2])
    
    render(<LoadModal isOpen={true} onClose={mockOnClose} onLoad={mockOnLoad} />)
    
    await waitFor(() => {
      expect(screen.getByText('Template 1')).toBeInTheDocument()
      expect(screen.getByText('Template 2')).toBeInTheDocument()
      expect(screen.getByText('6 × 8 grid')).toBeInTheDocument()
      expect(screen.getByText('10 × 12 grid')).toBeInTheDocument()
    })
  })

  it('should format dates correctly', async () => {
    const testDate = new Date('2023-06-15T14:30:00.000Z')
    const layoutWithDate = { ...mockLayout, created_at: testDate }
    
    mockDbService.getAllLayouts.mockResolvedValue([layoutWithDate])
    
    render(<LoadModal isOpen={true} onClose={mockOnClose} onLoad={mockOnLoad} />)
    
    await waitFor(() => {
      expect(screen.getByText(/Created: Jun 15, 2023/)).toBeInTheDocument()
    })
  })

  it('should prevent event bubbling when clicking inside modal content', () => {
    render(<LoadModal isOpen={true} onClose={mockOnClose} onLoad={mockOnLoad} />)
    
    const modalContent = screen.getByText('Load Layout Template').closest('.modal-content')
    fireEvent.click(modalContent!)
    
    expect(mockOnClose).not.toHaveBeenCalled()
  })
})