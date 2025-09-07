import { render, screen, fireEvent } from '@testing-library/react'
import LayoutToolbar from '@/components/layout/LayoutToolbar'
import { ToolType, Rotation } from '@/components/layout/types'

describe('LayoutToolbar Component', () => {
  const defaultProps = {
    rows: 8,
    cols: 6,
    onRowsChange: jest.fn(),
    onColsChange: jest.fn(),
    selectedTool: 'seat' as ToolType,
    onToolSelect: jest.fn(),
    rotation: 'horizontal' as Rotation,
    onRotationChange: jest.fn(),
    onSave: jest.fn()
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('renders all tool buttons', () => {
    render(<LayoutToolbar {...defaultProps} />)
    
    expect(screen.getByText('Seat')).toBeInTheDocument()
    expect(screen.getByText('Desk')).toBeInTheDocument()
    expect(screen.getByText('Door')).toBeInTheDocument()
    expect(screen.getByText('Save')).toBeInTheDocument()
  })

  test('shows selected tool as active', () => {
    render(<LayoutToolbar {...defaultProps} selectedTool="desk" />)
    
    const deskButton = screen.getByText('Desk')
    expect(deskButton).toHaveClass('active')
  })

  test('shows rotate button only when desk is selected', () => {
    const { rerender } = render(<LayoutToolbar {...defaultProps} selectedTool="seat" />)
    
    expect(screen.queryByText(/Rotate/)).not.toBeInTheDocument()
    
    rerender(<LayoutToolbar {...defaultProps} selectedTool="desk" />)
    expect(screen.getByText('Rotate (horizontal)')).toBeInTheDocument()
  })

  test('calls onToolSelect when tool button is clicked', () => {
    render(<LayoutToolbar {...defaultProps} />)
    
    fireEvent.click(screen.getByText('Desk'))
    expect(defaultProps.onToolSelect).toHaveBeenCalledWith('desk')
  })

  test('calls onRotationChange when rotate button is clicked', () => {
    render(<LayoutToolbar {...defaultProps} selectedTool="desk" />)
    
    fireEvent.click(screen.getByText('Rotate (horizontal)'))
    expect(defaultProps.onRotationChange).toHaveBeenCalledWith('vertical')
  })

  test('calls onSave when save button is clicked', () => {
    render(<LayoutToolbar {...defaultProps} />)
    
    fireEvent.click(screen.getByText('Save'))
    expect(defaultProps.onSave).toHaveBeenCalled()
  })

  test('updates rows and cols inputs', () => {
    render(<LayoutToolbar {...defaultProps} />)
    
    const rowsInput = screen.getByDisplayValue('8')
    const colsInput = screen.getByDisplayValue('6')
    
    fireEvent.change(rowsInput, { target: { value: '10' } })
    fireEvent.change(colsInput, { target: { value: '8' } })
    
    expect(defaultProps.onRowsChange).toHaveBeenCalledWith(10)
    expect(defaultProps.onColsChange).toHaveBeenCalledWith(8)
  })
})