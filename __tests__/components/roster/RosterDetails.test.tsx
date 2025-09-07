/**
 * @jest-environment jsdom
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import RosterDetails from '@/components/roster/RosterDetails'
import type { Roster } from '@/lib/db'

describe('RosterDetails', () => {
  const mockRoster: Roster = {
    id: '1',
    name: 'Math Class',
    created_at: new Date('2023-01-15T10:30:00Z'),
    updated_at: new Date('2023-01-20T14:45:00Z')
  }

  const defaultProps = {
    roster: mockRoster,
    isLoading: false
  }

  it('should show loading state', () => {
    render(<RosterDetails roster={null} isLoading={true} />)
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('should show empty state when no roster selected', () => {
    render(<RosterDetails roster={null} isLoading={false} />)
    
    expect(screen.getByText('No roster selected')).toBeInTheDocument()
    expect(screen.getByText('Select a roster from the list or create a new one')).toBeInTheDocument()
    expect(screen.getByText('📋')).toBeInTheDocument()
  })

  it('should display roster name', () => {
    render(<RosterDetails {...defaultProps} />)
    expect(screen.getByText('Math Class')).toBeInTheDocument()
  })

  it('should display creation date', () => {
    render(<RosterDetails {...defaultProps} />)
    expect(screen.getByText(/Created:/)).toBeInTheDocument()
    expect(screen.getByText(/Sunday, January 15, 2023/)).toBeInTheDocument()
  })

  it('should display modified date when different from creation', () => {
    render(<RosterDetails {...defaultProps} />)
    expect(screen.getByText(/Modified:/)).toBeInTheDocument()
    expect(screen.getByText(/Friday, January 20, 2023/)).toBeInTheDocument()
  })

  it('should not display modified date when same as creation', () => {
    const sameTimeRoster: Roster = {
      ...mockRoster,
      created_at: new Date('2023-01-15T10:30:00Z'),
      updated_at: new Date('2023-01-15T10:30:00Z')
    }
    
    render(<RosterDetails roster={sameTimeRoster} isLoading={false} />)
    
    expect(screen.getByText(/Created:/)).toBeInTheDocument()
    expect(screen.queryByText(/Modified:/)).not.toBeInTheDocument()
  })

  it('should display student count as 0', () => {
    render(<RosterDetails {...defaultProps} />)
    
    expect(screen.getByText('Students')).toBeInTheDocument()
    expect(screen.getByText('0')).toBeInTheDocument()
    expect(screen.getByText('No students added yet')).toBeInTheDocument()
  })

  it('should show disabled add student button', () => {
    render(<RosterDetails {...defaultProps} />)
    
    const addButton = screen.getByText('+ Add Student')
    expect(addButton).toBeDisabled()
    expect(addButton).toHaveAttribute('title', 'Coming in Story 2.2')
  })

  it('should show disabled import CSV button', () => {
    render(<RosterDetails {...defaultProps} />)
    
    const importButton = screen.getByText('📁 Import CSV')
    expect(importButton).toBeDisabled()
    expect(importButton).toHaveAttribute('title', 'Coming in Story 2.3')
  })

  it('should show empty state content', () => {
    render(<RosterDetails {...defaultProps} />)
    
    expect(screen.getByText('No students yet')).toBeInTheDocument()
    expect(screen.getByText(/Add students manually or import them from a CSV file/)).toBeInTheDocument()
    expect(screen.getByText('Student management features coming in Stories 2.2 & 2.3')).toBeInTheDocument()
    expect(screen.getByText('🎓')).toBeInTheDocument()
  })

  it('should handle roster with empty name', () => {
    const emptyNameRoster: Roster = {
      ...mockRoster,
      name: ''
    }
    
    render(<RosterDetails roster={emptyNameRoster} isLoading={false} />)
    // Just verify the component renders without crashing with empty name
    expect(screen.getByText('Students')).toBeInTheDocument()
  })

  it('should handle roster with very long name', () => {
    const longNameRoster: Roster = {
      ...mockRoster,
      name: 'This is a very long roster name that should be handled properly without breaking the layout'
    }
    
    render(<RosterDetails roster={longNameRoster} isLoading={false} />)
    expect(screen.getByText(longNameRoster.name)).toBeInTheDocument()
  })

  it('should format dates with proper locale', () => {
    render(<RosterDetails {...defaultProps} />)
    
    // Should show full date with time - the time format shows as "11:30 AM" and "3:45 PM" in output
    expect(screen.getByText(/11:30 AM/)).toBeInTheDocument()
    expect(screen.getByText(/3:45 PM/)).toBeInTheDocument()
  })

  it('should have proper accessibility structure', () => {
    render(<RosterDetails {...defaultProps} />)
    
    // Should have proper heading hierarchy
    const rosterName = screen.getByText('Math Class')
    expect(rosterName.tagName).toBe('H2')
    
    const studentsHeader = screen.getByText('Students')
    expect(studentsHeader.tagName).toBe('H3')
  })

  it('should handle state transitions properly', () => {
    const { rerender } = render(<RosterDetails roster={null} isLoading={true} />)
    
    // Should show loading
    expect(screen.getByText('Loading...')).toBeInTheDocument()
    
    // Transition to loaded with roster
    rerender(<RosterDetails roster={mockRoster} isLoading={false} />)
    expect(screen.getByText('Math Class')).toBeInTheDocument()
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
    
    // Transition to no roster selected
    rerender(<RosterDetails roster={null} isLoading={false} />)
    expect(screen.getByText('No roster selected')).toBeInTheDocument()
    expect(screen.queryByText('Math Class')).not.toBeInTheDocument()
  })

  it('should maintain proper styling structure', () => {
    render(<RosterDetails {...defaultProps} />)
    
    // Check that key elements have expected styling structure
    const rosterName = screen.getByText('Math Class')
    expect(rosterName).toHaveStyle('overflow: hidden')
    expect(rosterName).toHaveStyle('text-overflow: ellipsis')
    expect(rosterName).toHaveStyle('white-space: nowrap')
  })

  it('should show student count section with proper styling', () => {
    render(<RosterDetails {...defaultProps} />)
    
    // Get the parent div of the Students section (the blue-colored container)
    const studentsSection = screen.getByText('Students').parentElement!.parentElement!
    expect(studentsSection).toHaveStyle('background-color: rgb(227, 242, 253)')
    
    const studentCount = screen.getByText('0')
    expect(studentCount).toHaveStyle('font-size: 2rem')
    expect(studentCount).toHaveStyle('font-weight: bold')
  })
})