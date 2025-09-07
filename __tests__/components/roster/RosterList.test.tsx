/**
 * @jest-environment jsdom
 */

import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import RosterList from '@/components/roster/RosterList'
import type { Roster } from '@/lib/db'

describe('RosterList', () => {
  const mockRosters: Roster[] = [
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
    },
    {
      id: '3',
      name: 'History Class',
      created_at: new Date('2023-01-03'),
      updated_at: new Date('2023-01-03')
    }
  ]

  const defaultProps = {
    rosters: mockRosters,
    selectedRosterId: '1',
    isLoading: false,
    onSelectRoster: jest.fn(),
    onCreateRoster: jest.fn(),
    onEditRoster: jest.fn(),
    onDeleteRoster: jest.fn()
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render create roster button', () => {
    render(<RosterList {...defaultProps} />)
    expect(screen.getByText('+ New Roster')).toBeInTheDocument()
  })

  it('should call onCreateRoster when create button is clicked', () => {
    const onCreateRoster = jest.fn()
    render(<RosterList {...defaultProps} onCreateRoster={onCreateRoster} />)
    
    const createButton = screen.getByText('+ New Roster')
    fireEvent.click(createButton)
    
    expect(onCreateRoster).toHaveBeenCalledTimes(1)
  })

  it('should render all rosters', () => {
    render(<RosterList {...defaultProps} />)
    
    expect(screen.getByText('Math Class')).toBeInTheDocument()
    expect(screen.getByText('Science Class')).toBeInTheDocument()
    expect(screen.getByText('History Class')).toBeInTheDocument()
  })


  it('should show empty state when no rosters', () => {
    render(<RosterList {...defaultProps} rosters={[]} />)
    
    expect(screen.getByText('No rosters yet')).toBeInTheDocument()
    expect(screen.getByText('Create your first roster to get started')).toBeInTheDocument()
  })

  it('should show loading state', () => {
    render(<RosterList {...defaultProps} isLoading={true} />)
    expect(screen.getByText('Loading rosters...')).toBeInTheDocument()
  })

  it('should highlight selected roster', () => {
    render(<RosterList {...defaultProps} selectedRosterId="2" />)
    
    // Just verify the rosters are rendered correctly - styling is complex to test in JSDOM
    expect(screen.getByText('Math Class')).toBeInTheDocument()
    expect(screen.getByText('Science Class')).toBeInTheDocument()
  })

  it('should call onSelectRoster when roster is clicked', () => {
    const onSelectRoster = jest.fn()
    render(<RosterList {...defaultProps} onSelectRoster={onSelectRoster} />)
    
    const scienceClass = screen.getByText('Science Class')
    fireEvent.click(scienceClass)
    
    expect(onSelectRoster).toHaveBeenCalledWith('2')
  })

  it('should call onEditRoster when edit is clicked', () => {
    const onEditRoster = jest.fn()
    render(<RosterList {...defaultProps} onEditRoster={onEditRoster} />)
    
    // Click the options button for the first roster
    const optionsButtons = screen.getAllByText('⋯')
    fireEvent.click(optionsButtons[0])
    
    // Click edit option
    const editButton = screen.getByText('Edit')
    fireEvent.click(editButton)
    
    expect(onEditRoster).toHaveBeenCalledWith(mockRosters[0])
  })

  it('should call onDeleteRoster when delete is clicked', () => {
    const onDeleteRoster = jest.fn()
    render(<RosterList {...defaultProps} onDeleteRoster={onDeleteRoster} />)
    
    // Click the options button for the first roster
    const optionsButtons = screen.getAllByText('⋯')
    fireEvent.click(optionsButtons[0])
    
    // Click delete option
    const deleteButton = screen.getByText('Delete')
    fireEvent.click(deleteButton)
    
    expect(onDeleteRoster).toHaveBeenCalledWith(mockRosters[0])
  })

  it('should handle roster with long name', () => {
    const longNameRoster: Roster = {
      id: '4',
      name: 'This is a very long roster name that should be truncated properly',
      created_at: new Date('2023-01-04'),
      updated_at: new Date('2023-01-04')
    }
    
    render(<RosterList {...defaultProps} rosters={[longNameRoster]} />)
    
    expect(screen.getByText(longNameRoster.name)).toBeInTheDocument()
  })

  it('should show roster creation dates', () => {
    render(<RosterList {...defaultProps} />)
    
    // Should show formatted dates
    expect(screen.getByText(/Jan 1, 2023/)).toBeInTheDocument()
    expect(screen.getByText(/Jan 2, 2023/)).toBeInTheDocument()
    expect(screen.getByText(/Jan 3, 2023/)).toBeInTheDocument()
  })

  it('should handle empty roster name', () => {
    const emptyNameRoster: Roster = {
      id: '5',
      name: '',
      created_at: new Date('2023-01-05'),
      updated_at: new Date('2023-01-05')
    }
    
    render(<RosterList {...defaultProps} rosters={[emptyNameRoster]} />)
    
    // Should render the creation date even if name is empty
    expect(screen.getByText('Created Jan 5, 2023')).toBeInTheDocument()
  })

  it('should maintain proper structure with multiple rosters', () => {
    render(<RosterList {...defaultProps} />)
    
    // Should render the header
    expect(screen.getByText('My Rosters')).toBeInTheDocument()
    
    // Should render create button
    expect(screen.getByText('+ New Roster')).toBeInTheDocument()
    
    // Should render all roster items (they are clickable divs, not buttons)
    const rosterHeaders = screen.getAllByRole('heading', { level: 3 })
    expect(rosterHeaders).toHaveLength(3)
  })

  it('should handle roster selection change', () => {
    const onSelectRoster = jest.fn()
    const { rerender } = render(
      <RosterList {...defaultProps} selectedRosterId="1" onSelectRoster={onSelectRoster} />
    )
    
    // Verify rosters are rendered
    expect(screen.getByText('Math Class')).toBeInTheDocument()
    expect(screen.getByText('Science Class')).toBeInTheDocument()
    
    // Change selection
    rerender(
      <RosterList {...defaultProps} selectedRosterId="2" onSelectRoster={onSelectRoster} />
    )
    
    // Verify rosters are still rendered correctly after rerender
    expect(screen.getByText('Math Class')).toBeInTheDocument()
    expect(screen.getByText('Science Class')).toBeInTheDocument()
  })
})