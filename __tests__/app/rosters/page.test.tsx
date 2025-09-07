/**
 * @jest-environment jsdom
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import 'fake-indexeddb/auto'
import RostersPage from '@/app/rosters/page'

// Mock the components to focus on page logic
jest.mock('@/components/roster/RosterList', () => {
  return function MockRosterList({ 
    rosters, 
    selectedRosterId, 
    isLoading, 
    onSelectRoster, 
    onCreateRoster,
    onEditRoster,
    onDeleteRoster 
  }: any) {
    if (isLoading) return <div>Loading rosters...</div>
    
    return (
      <div data-testid="roster-list">
        <button onClick={onCreateRoster}>Create Roster</button>
        {rosters.map((roster: any) => (
          <div key={roster.id} data-testid={`roster-${roster.id}`}>
            <button onClick={() => onSelectRoster(roster.id)}>{roster.name}</button>
            <button onClick={() => onEditRoster(roster)}>Edit {roster.name}</button>
            <button onClick={() => onDeleteRoster(roster)}>Delete {roster.name}</button>
          </div>
        ))}
      </div>
    )
  }
})

jest.mock('@/components/roster/RosterDetails', () => {
  return function MockRosterDetails({ roster, isLoading }: any) {
    if (isLoading) return <div>Loading details...</div>
    if (!roster) return <div>No roster selected</div>
    return <div data-testid="roster-details">Details for {roster.name}</div>
  }
})

jest.mock('@/components/roster/RosterModal', () => {
  return function MockRosterModal({ isOpen, onClose, onSave, existingName, isEditing }: any) {
    if (!isOpen) return null
    
    return (
      <div data-testid="roster-modal">
        <h2>{isEditing ? 'Edit Roster' : 'Create Roster'}</h2>
        <input 
          data-testid="modal-input"
          defaultValue={existingName || ''}
          placeholder="Roster name"
        />
        <button onClick={() => onSave('Test Roster')}>Save</button>
        <button onClick={onClose}>Cancel</button>
      </div>
    )
  }
})

jest.mock('@/components/common/Notification', () => {
  return function MockNotification({ message, type, isVisible }: any) {
    if (!isVisible) return null
    return <div data-testid="notification">{message} ({type})</div>
  }
})

// Mock the database service
jest.mock('@/lib/db', () => ({
  dbService: {
    getAllRosters: jest.fn(),
    saveRoster: jest.fn(),
    updateRoster: jest.fn(),
    deleteRoster: jest.fn()
  }
}))

import { dbService } from '@/lib/db'

const mockGetAllRosters = dbService.getAllRosters as jest.MockedFunction<typeof dbService.getAllRosters>
const mockSaveRoster = dbService.saveRoster as jest.MockedFunction<typeof dbService.saveRoster>
const mockUpdateRoster = dbService.updateRoster as jest.MockedFunction<typeof dbService.updateRoster>
const mockDeleteRoster = dbService.deleteRoster as jest.MockedFunction<typeof dbService.deleteRoster>

// Mock window.confirm
Object.defineProperty(window, 'confirm', {
  writable: true,
  value: jest.fn()
})

const mockConfirm = window.confirm as jest.MockedFunction<typeof window.confirm>

describe('RostersPage', () => {
  const mockRosters = [
    {
      id: '1',
      name: 'Math Class',
      created_at: new Date('2023-01-01'),
      updated_at: new Date('2023-01-01')
    },
    {
      id: '2',
      name: 'Science Class', 
      created_at: new Date('2023-01-02'),
      updated_at: new Date('2023-01-02')
    }
  ]

  beforeEach(() => {
    jest.clearAllMocks()
    mockGetAllRosters.mockResolvedValue(mockRosters)
    mockSaveRoster.mockResolvedValue(mockRosters[0])
    mockUpdateRoster.mockResolvedValue(mockRosters[0])
    mockDeleteRoster.mockResolvedValue()
    mockConfirm.mockReturnValue(true)
  })

  it('should render page header and navigation', () => {
    render(<RostersPage />)
    
    expect(screen.getByText('Roster Management')).toBeInTheDocument()
    expect(screen.getByText('Create and manage your class rosters')).toBeInTheDocument()
    expect(screen.getByText('← Back to Home')).toBeInTheDocument()
    expect(screen.getByText('Layout Editor')).toBeInTheDocument()
  })

  it('should load rosters on mount', async () => {
    render(<RostersPage />)
    
    await waitFor(() => {
      expect(mockGetAllRosters).toHaveBeenCalledTimes(1)
    })
  })

  it('should show loading state initially', () => {
    mockGetAllRosters.mockImplementation(() => new Promise(() => {})) // Never resolves
    render(<RostersPage />)
    
    expect(screen.getByText('Loading rosters...')).toBeInTheDocument()
    expect(screen.getByText('Loading details...')).toBeInTheDocument()
  })

  it('should select first roster automatically when loaded', async () => {
    render(<RostersPage />)
    
    await waitFor(() => {
      expect(screen.getByText('Details for Math Class')).toBeInTheDocument()
    })
  })

  it('should handle roster selection', async () => {
    render(<RostersPage />)
    
    await waitFor(() => {
      expect(screen.getByTestId('roster-list')).toBeInTheDocument()
    })
    
    const scienceButton = screen.getByText('Science Class')
    fireEvent.click(scienceButton)
    
    expect(screen.getByText('Details for Science Class')).toBeInTheDocument()
  })

  it('should open create modal when create button is clicked', async () => {
    render(<RostersPage />)
    
    await waitFor(() => {
      const createButton = screen.getByText('Create Roster')
      fireEvent.click(createButton)
    })
    
    expect(screen.getByTestId('roster-modal')).toBeInTheDocument()
    expect(screen.getByText('Create Roster')).toBeInTheDocument()
  })

  it('should open edit modal when edit button is clicked', async () => {
    render(<RostersPage />)
    
    await waitFor(() => {
      const editButton = screen.getByText('Edit Math Class')
      fireEvent.click(editButton)
    })
    
    expect(screen.getByTestId('roster-modal')).toBeInTheDocument()
    expect(screen.getByText('Edit Roster')).toBeInTheDocument()
  })

  it('should create new roster successfully', async () => {
    const newRoster = { id: '3', name: 'Test Roster', created_at: new Date(), updated_at: new Date() }
    mockSaveRoster.mockResolvedValue(newRoster)
    
    render(<RostersPage />)
    
    await waitFor(() => {
      const createButton = screen.getByText('Create Roster')
      fireEvent.click(createButton)
    })
    
    const saveButton = screen.getByText('Save')
    fireEvent.click(saveButton)
    
    await waitFor(() => {
      expect(mockSaveRoster).toHaveBeenCalledWith({ name: 'Test Roster' })
      expect(screen.getByTestId('notification')).toBeInTheDocument()
      expect(screen.getByText(/Test Roster.*created successfully/)).toBeInTheDocument()
    })
  })

  it('should update existing roster successfully', async () => {
    const updatedRoster = { ...mockRosters[0], name: 'Test Roster' }
    mockUpdateRoster.mockResolvedValue(updatedRoster)
    
    render(<RostersPage />)
    
    await waitFor(() => {
      const editButton = screen.getByText('Edit Math Class')
      fireEvent.click(editButton)
    })
    
    const saveButton = screen.getByText('Save')
    fireEvent.click(saveButton)
    
    await waitFor(() => {
      expect(mockUpdateRoster).toHaveBeenCalledWith('1', { name: 'Test Roster' })
      expect(screen.getByTestId('notification')).toBeInTheDocument()
      expect(screen.getByText(/Test Roster.*updated successfully/)).toBeInTheDocument()
    })
  })

  it('should handle create roster error', async () => {
    mockSaveRoster.mockRejectedValue(new Error('Database error'))
    
    render(<RostersPage />)
    
    await waitFor(() => {
      const createButton = screen.getByText('Create Roster')
      fireEvent.click(createButton)
    })
    
    const saveButton = screen.getByText('Save')
    fireEvent.click(saveButton)
    
    await waitFor(() => {
      expect(screen.getByText(/Failed to create roster/)).toBeInTheDocument()
    })
  })

  it('should handle update roster error', async () => {
    mockUpdateRoster.mockRejectedValue(new Error('Database error'))
    
    render(<RostersPage />)
    
    await waitFor(() => {
      const editButton = screen.getByText('Edit Math Class')
      fireEvent.click(editButton)
    })
    
    const saveButton = screen.getByText('Save')
    fireEvent.click(saveButton)
    
    await waitFor(() => {
      expect(screen.getByText(/Failed to update roster/)).toBeInTheDocument()
    })
  })

  it('should delete roster with confirmation', async () => {
    mockConfirm.mockReturnValue(true)
    mockGetAllRosters.mockResolvedValueOnce(mockRosters).mockResolvedValueOnce([mockRosters[1]])
    
    render(<RostersPage />)
    
    await waitFor(() => {
      const deleteButton = screen.getByText('Delete Math Class')
      fireEvent.click(deleteButton)
    })
    
    expect(mockConfirm).toHaveBeenCalledWith(
      'Are you sure you want to delete "Math Class"? This action cannot be undone.'
    )
    
    await waitFor(() => {
      expect(mockDeleteRoster).toHaveBeenCalledWith('1')
      expect(screen.getByText(/Math Class.*deleted successfully/)).toBeInTheDocument()
    })
  })

  it('should not delete roster when confirmation is cancelled', async () => {
    mockConfirm.mockReturnValue(false)
    
    render(<RostersPage />)
    
    await waitFor(() => {
      const deleteButton = screen.getByText('Delete Math Class')
      fireEvent.click(deleteButton)
    })
    
    expect(mockDeleteRoster).not.toHaveBeenCalled()
  })

  it('should handle delete roster error', async () => {
    mockDeleteRoster.mockRejectedValue(new Error('Database error'))
    
    render(<RostersPage />)
    
    await waitFor(() => {
      const deleteButton = screen.getByText('Delete Math Class')
      fireEvent.click(deleteButton)
    })
    
    await waitFor(() => {
      expect(screen.getByText(/Failed to delete roster/)).toBeInTheDocument()
    })
  })

  it('should close modal when cancel is clicked', async () => {
    render(<RostersPage />)
    
    await waitFor(() => {
      const createButton = screen.getByText('Create Roster')
      fireEvent.click(createButton)
    })
    
    expect(screen.getByTestId('roster-modal')).toBeInTheDocument()
    
    const cancelButton = screen.getByText('Cancel')
    fireEvent.click(cancelButton)
    
    expect(screen.queryByTestId('roster-modal')).not.toBeInTheDocument()
  })

  it('should handle load rosters error', async () => {
    mockGetAllRosters.mockRejectedValue(new Error('Database error'))
    
    render(<RostersPage />)
    
    await waitFor(() => {
      expect(screen.getByText(/Failed to load rosters/)).toBeInTheDocument()
    })
  })

  it('should select another roster when selected roster is deleted', async () => {
    mockGetAllRosters.mockResolvedValueOnce(mockRosters).mockResolvedValueOnce([mockRosters[1]])
    
    render(<RostersPage />)
    
    // Wait for initial load and first roster to be selected
    await waitFor(() => {
      expect(screen.getByText('Math Class')).toBeInTheDocument()
    })
    
    // Delete the selected roster
    const deleteButton = screen.getByText('Delete Math Class')
    fireEvent.click(deleteButton)
    
    await waitFor(() => {
      expect(screen.getByText('Science Class')).toBeInTheDocument()
    })
  })

  it('should show CSV import button when roster is selected', async () => {
    mockGetAllRosters.mockResolvedValueOnce(mockRosters)
    
    render(<RostersPage />)
    
    await waitFor(() => {
      expect(screen.getByText('Math Class')).toBeInTheDocument()
    })
    
    // Check if CSV import button exists and is enabled
    const csvButton = screen.getByText('📁 Import CSV')
    expect(csvButton).toBeInTheDocument()
    expect(csvButton).not.toBeDisabled()
  })
})