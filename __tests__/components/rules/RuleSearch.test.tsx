import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { RuleFilters } from '@/types/rule'
import RuleSearch from '@/components/rules/RuleSearch'

describe('RuleSearch Component', () => {
  const mockOnFiltersChange = jest.fn()
  const defaultProps = {
    filters: {},
    onFiltersChange: mockOnFiltersChange,
    placeholder: 'Search rules...'
  }

  beforeEach(() => {
    mockOnFiltersChange.mockClear()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('renders with default props', () => {
    render(<RuleSearch {...defaultProps} />)
    
    const searchInput = screen.getByPlaceholderText('Search rules...')
    expect(searchInput).toBeInTheDocument()
    expect(searchInput).toHaveValue('')
    expect(screen.getByText('Search by rule type or description')).toBeInTheDocument()
  })

  it('handles search input changes with debouncing', async () => {
    render(<RuleSearch {...defaultProps} />)
    
    const searchInput = screen.getByPlaceholderText('Search rules...')
    
    // Type search query
    fireEvent.change(searchInput, { target: { value: 'separate' } })
    
    // Should not have called onFiltersChange yet due to debouncing
    expect(mockOnFiltersChange).not.toHaveBeenCalled()
    
    // Fast-forward time
    jest.advanceTimersByTime(300)
    
    // Now it should have been called
    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      ...defaultProps.filters,
      searchQuery: 'separate'
    })
  })

  it('updates search help text during typing', async () => {
    render(<RuleSearch {...defaultProps} />)
    
    const searchInput = screen.getByPlaceholderText('Search rules...')
    
    expect(screen.getByText('Search by rule type or description')).toBeInTheDocument()
    
    fireEvent.change(searchInput, { target: { value: 'front row' } })
    
    expect(screen.getByText('Searching for: "front row"')).toBeInTheDocument()
  })

  it('shows clear button when search has content', async () => {
    render(<RuleSearch {...defaultProps} />)
    
    const searchInput = screen.getByPlaceholderText('Search rules...')
    
    // Initially no clear button
    expect(screen.queryByRole('button', { name: /clear/i })).not.toBeInTheDocument()
    
    // Type search query
    fireEvent.change(searchInput, { target: { value: 'test' } })
    
    // Clear button should now be visible
    expect(screen.getByRole('button', { name: /clear/i })).toBeInTheDocument()
  })

  it('clears search when clear button is clicked', async () => {
    render(<RuleSearch {...defaultProps} />)
    
    const searchInput = screen.getByPlaceholderText('Search rules...')
    
    // Type search query
    fireEvent.change(searchInput, { target: { value: 'test' } })
    jest.advanceTimersByTime(300)
    
    // Clear button should be visible
    const clearButton = screen.getByRole('button', { name: /clear/i })
    fireEvent.click(clearButton)
    
    // Input should be cleared
    expect(searchInput).toHaveValue('')
    
    // Should have called onFiltersChange with undefined searchQuery
    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      ...defaultProps.filters,
      searchQuery: undefined
    })
  })

  it('applies focus styles correctly', async () => {
    render(<RuleSearch {...defaultProps} />)
    
    const searchContainer = screen.getByPlaceholderText('Search rules...').parentElement
    
    expect(searchContainer).toHaveClass('border-gray-300')
    
    // Focus the input
    fireEvent.focus(screen.getByPlaceholderText('Search rules...'))
    
    // Should have focus styles
    expect(searchContainer).toHaveClass('border-blue-500')
    expect(searchContainer).toHaveClass('ring-2')
    expect(searchContainer).toHaveClass('ring-blue-200')
  })

  it('handles empty search query correctly', async () => {
    render(<RuleSearch {...defaultProps} />)
    
    const searchInput = screen.getByPlaceholderText('Search rules...')
    
    // Type and then clear
    fireEvent.change(searchInput, { target: { value: 'test' } })
    fireEvent.change(searchInput, { target: { value: '' } })
    
    jest.advanceTimersByTime(300)
    
    // Should have called with undefined for empty search
    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      ...defaultProps.filters,
      searchQuery: undefined
    })
  })

  it('trims search query before applying', async () => {
    render(<RuleSearch {...defaultProps} />)
    
    const searchInput = screen.getByPlaceholderText('Search rules...')
    
    // Type search with leading/trailing spaces
    fireEvent.change(searchInput, { target: { value: '  front row  ' } })
    
    jest.advanceTimersByTime(300)
    
    // Should have trimmed the search query
    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      ...defaultProps.filters,
      searchQuery: 'front row'
    })
  })

  it('maintains other filters when updating search', () => {
    const filtersWithOtherValues: RuleFilters = {
      status: 'active',
      type: 'SEPARATE',
      sortBy: 'priority'
    }

    render(
      <RuleSearch
        filters={filtersWithOtherValues}
        onFiltersChange={mockOnFiltersChange}
        placeholder="Search rules..."
      />
    )
    
    const searchInput = screen.getByPlaceholderText('Search rules...')
    fireEvent.change(searchInput, { target: { value: 'test' } })
    
    jest.advanceTimersByTime(300)
    
    // Should preserve other filters
    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      status: 'active',
      type: 'SEPARATE',
      sortBy: 'priority',
      searchQuery: 'test'
    })
  })

  it('uses custom placeholder when provided', () => {
    render(
      <RuleSearch
        filters={{}}
        onFiltersChange={mockOnFiltersChange}
        placeholder="Custom search placeholder"
      />
    )
    
    expect(screen.getByPlaceholderText('Custom search placeholder')).toBeInTheDocument()
  })

  it('displays search icon correctly', () => {
    render(<RuleSearch {...defaultProps} />)
    
    const searchIcon = screen.getByPlaceholderText('Search rules...').parentElement?.querySelector('svg')
    expect(searchIcon).toBeInTheDocument()
  })

  it('has proper accessibility attributes', () => {
    render(<RuleSearch {...defaultProps} />)
    
    const searchInput = screen.getByPlaceholderText('Search rules...')
    expect(searchInput).toHaveAttribute('type', 'text')
    expect(searchInput).toHaveAttribute('placeholder', 'Search rules...')
    
    const clearButton = screen.queryByRole('button', { name: /clear/i })
    if (clearButton) {
      expect(clearButton).toHaveAttribute('aria-label', 'Clear search')
    }
  })
})