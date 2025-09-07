import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Rule, RuleFilters, RULE_TYPES } from '@/types/rule'
import { Student } from '@/lib/db'
import RuleFiltersComponent from '@/components/rules/RuleFilters'

// Mock the RULE_TYPES
jest.mock('@/types/rule', () => ({
  ...jest.requireActual('@/types/rule'),
  RULE_TYPES: {
    SEPARATE: { name: 'Must Not Sit Together', description: 'Selected students should not be seated adjacent to each other' },
    TOGETHER: { name: 'Must Sit Together', description: 'Selected students should be seated in adjacent seats' },
    FRONT_ROW: { name: 'Front Row Preference', description: 'Selected students should be seated in the front rows' },
    BACK_ROW: { name: 'Back Row Preference', description: 'Selected students should be seated in the back rows' },
    NEAR_TEACHER: { name: 'Near Teacher', description: 'Selected students should be seated near the teacher desk' },
    NEAR_DOOR: { name: 'Near Door', description: 'Selected students should be seated near the classroom door' }
  }
}))

describe('RuleFilters Component', () => {
  const mockOnFiltersChange = jest.fn()
  const defaultProps = {
    filters: {},
    onFiltersChange: mockOnFiltersChange,
    totalRules: 10,
    filteredRules: 10
  }

  beforeEach(() => {
    mockOnFiltersChange.mockClear()
  })

  it('renders with default props', () => {
    render(<RuleFiltersComponent {...defaultProps} />)
    
    expect(screen.getByText('Filter Rules (10 of 10)')).toBeInTheDocument()
    
    // Find selects by their display text or test attributes
    const statusSelect = screen.getByDisplayValue('All Rules')
    const typeSelect = screen.getByDisplayValue('All Types')
    const sortBySelect = screen.getByDisplayValue('Priority')
    const orderSelect = screen.getByDisplayValue('Ascending')
    
    expect(statusSelect).toBeInTheDocument()
    expect(typeSelect).toBeInTheDocument()
    expect(sortBySelect).toBeInTheDocument()
    expect(orderSelect).toBeInTheDocument()
  })

  it('handles status filter changes', () => {
    render(<RuleFiltersComponent {...defaultProps} />)
    
    const statusSelect = screen.getByDisplayValue('All Rules')
    fireEvent.change(statusSelect, { target: { value: 'active' } })
    
    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      ...defaultProps.filters,
      status: 'active'
    })
  })

  it('handles type filter changes', () => {
    render(<RuleFiltersComponent {...defaultProps} />)
    
    const typeSelect = screen.getByDisplayValue('All Types')
    fireEvent.change(typeSelect, { target: { value: 'SEPARATE' } })
    
    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      ...defaultProps.filters,
      type: 'SEPARATE'
    })
  })

  it('handles sort by changes', () => {
    render(<RuleFiltersComponent {...defaultProps} />)
    
    const sortBySelect = screen.getByDisplayValue('Priority')
    fireEvent.change(sortBySelect, { target: { value: 'created_at' } })
    
    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      ...defaultProps.filters,
      sortBy: 'created_at'
    })
  })

  it('handles sort order changes', () => {
    render(<RuleFiltersComponent {...defaultProps} />)
    
    const sortOrderSelect = screen.getByDisplayValue('Ascending')
    fireEvent.change(sortOrderSelect, { target: { value: 'desc' } })
    
    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      ...defaultProps.filters,
      sortOrder: 'desc'
    })
  })

  it('displays active filters correctly', () => {
    const filtersWithValues: RuleFilters = {
      status: 'active',
      type: 'SEPARATE',
      sortBy: 'priority',
      sortOrder: 'asc'
    }

    render(
      <RuleFiltersComponent
        filters={filtersWithValues}
        onFiltersChange={mockOnFiltersChange}
        totalRules={10}
        filteredRules={5}
      />
    )

    expect(screen.getByText('Status: active')).toBeInTheDocument()
    expect(screen.getByText('Type: Must Not Sit Together')).toBeInTheDocument()
    expect(screen.getByText('Sort: priority (asc)')).toBeInTheDocument()
    expect(screen.getByText('Clear Filters')).toBeInTheDocument()
  })

  it('allows clearing individual filters', () => {
    const filtersWithValues: RuleFilters = {
      status: 'active',
      type: 'SEPARATE'
    }

    render(
      <RuleFiltersComponent
        filters={filtersWithValues}
        onFiltersChange={mockOnFiltersChange}
        totalRules={10}
        filteredRules={5}
      />
    )

    const statusClearButton = screen.getByText('Status: active').querySelector('button')
    fireEvent.click(statusClearButton!)

    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      ...filtersWithValues,
      status: 'all'
    })
  })

  it('allows clearing all filters', () => {
    const filtersWithValues: RuleFilters = {
      status: 'active',
      type: 'SEPARATE',
      sortBy: 'priority'
    }

    render(
      <RuleFiltersComponent
        filters={filtersWithValues}
        onFiltersChange={mockOnFiltersChange}
        totalRules={10}
        filteredRules={5}
      />
    )

    const clearAllButton = screen.getByText('Clear Filters')
    fireEvent.click(clearAllButton)

    expect(mockOnFiltersChange).toHaveBeenCalledWith({})
  })

  it('displays all rule type options', () => {
    render(<RuleFiltersComponent {...defaultProps} />)

    const typeSelect = screen.getByDisplayValue('All Types')
    const options = Array.from(typeSelect.querySelectorAll('option'))

    expect(options).toHaveLength(7) // All types + 'All Types'
    expect(options[0].value).toBe('all')
    expect(options[1].value).toBe('SEPARATE')
    expect(options[2].value).toBe('TOGETHER')
    expect(options[3].value).toBe('FRONT_ROW')
    expect(options[4].value).toBe('BACK_ROW')
    expect(options[5].value).toBe('NEAR_TEACHER')
    expect(options[6].value).toBe('NEAR_DOOR')
  })

  it('displays all sort options', () => {
    render(<RuleFiltersComponent {...defaultProps} />)

    const sortBySelect = screen.getByDisplayValue('Priority')
    const options = Array.from(sortBySelect.querySelectorAll('option'))

    expect(options).toHaveLength(4)
    expect(options[0].value).toBe('priority')
    expect(options[1].value).toBe('created_at')
    expect(options[2].value).toBe('updated_at')
    expect(options[3].value).toBe('type')
  })

  it('handles filtered rule count correctly', () => {
    render(
      <RuleFiltersComponent
        filters={{}}
        onFiltersChange={mockOnFiltersChange}
        totalRules={10}
        filteredRules={3}
      />
    )

    expect(screen.getByText('Filter Rules (3 of 10)')).toBeInTheDocument()
  })
})