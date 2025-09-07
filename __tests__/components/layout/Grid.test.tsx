import { render, screen } from '@testing-library/react'
import Grid from '@/components/layout/Grid'
import { ToolType, Rotation } from '@/components/layout/types'

const defaultProps = {
  selectedTool: 'seat' as ToolType,
  rotation: 'horizontal' as Rotation,
  furniture: [],
  onFurnitureChange: () => {},
  seats: new Set<string>(),
  onSeatsChange: () => {}
}

describe('Grid Component', () => {
  test('renders grid with correct dimensions', () => {
    render(<Grid rows={3} cols={4} {...defaultProps} />)
    
    // Should render 3 * 4 = 12 grid cells
    const cells = document.querySelectorAll('.grid-cell')
    expect(cells).toHaveLength(12)
  })

  test('renders grid with different dimensions', () => {
    render(<Grid rows={5} cols={6} {...defaultProps} />)
    
    // Should render 5 * 6 = 30 grid cells  
    const cells = document.querySelectorAll('.grid-cell')
    expect(cells).toHaveLength(30)
  })

  test('applies correct CSS grid template properties', () => {
    render(<Grid rows={4} cols={3} {...defaultProps} />)
    
    const gridElement = document.querySelector('.classroom-grid')
    // Grid now uses calculated pixel values instead of fractional units
    const computedStyle = window.getComputedStyle(gridElement!)
    expect(computedStyle.display).toBe('grid')
    expect(computedStyle.gridTemplateRows).toMatch(/repeat\(4, \d+px\)/)
    expect(computedStyle.gridTemplateColumns).toMatch(/repeat\(3, \d+px\)/)
  })

  test('each cell has correct data attributes', () => {
    render(<Grid rows={2} cols={2} {...defaultProps} />)
    
    const cells = document.querySelectorAll('.grid-cell')
    
    // Check first cell
    expect(cells[0]).toHaveAttribute('data-row', '0')
    expect(cells[0]).toHaveAttribute('data-col', '0')
    
    // Check last cell
    expect(cells[3]).toHaveAttribute('data-row', '1') 
    expect(cells[3]).toHaveAttribute('data-col', '1')
  })

  test('renders minimum grid size', () => {
    render(<Grid rows={1} cols={1} {...defaultProps} />)
    
    const cells = document.querySelectorAll('.grid-cell')
    expect(cells).toHaveLength(1)
  })

  test('renders large grid size', () => {
    render(<Grid rows={10} cols={15} {...defaultProps} />)
    
    const cells = document.querySelectorAll('.grid-cell')
    expect(cells).toHaveLength(150)
  })

  test('renders furniture items correctly', () => {
    const furniture = [
      {
        id: 'desk-1',
        type: 'desk' as const,
        positions: [{ row: 0, col: 0 }, { row: 0, col: 1 }],
        rotation: 'horizontal' as Rotation
      },
      {
        id: 'door-1', 
        type: 'door' as const,
        positions: [{ row: 1, col: 1 }]
      }
    ]
    
    render(<Grid rows={3} cols={3} {...defaultProps} furniture={furniture} />)
    
    // Check desk cells
    const cells = document.querySelectorAll('.grid-cell')
    expect(cells[0]).toHaveClass('furniture-desk')
    expect(cells[1]).toHaveClass('furniture-desk')
    expect(cells[0]).toHaveTextContent('🪑')
    expect(cells[1]).toHaveTextContent('🪑')
    
    // Check door cell
    expect(cells[4]).toHaveClass('furniture-door') // row 1, col 1 = index 4
    expect(cells[4]).toHaveTextContent('🚪')
  })

  test('renders seats correctly', () => {
    const seats = new Set(['0-0', '1-1', '2-2'])
    
    render(<Grid rows={3} cols={3} {...defaultProps} seats={seats} />)
    
    const cells = document.querySelectorAll('.grid-cell')
    
    // Check seat cells
    expect(cells[0]).toHaveClass('seat') // row 0, col 0
    expect(cells[0]).toHaveTextContent('💺')
    
    expect(cells[4]).toHaveClass('seat') // row 1, col 1 = index 4
    expect(cells[4]).toHaveTextContent('💺')
    
    expect(cells[8]).toHaveClass('seat') // row 2, col 2 = index 8
    expect(cells[8]).toHaveTextContent('💺')
    
    // Check non-seat cells don't have seat class
    expect(cells[1]).not.toHaveClass('seat')
    expect(cells[2]).not.toHaveClass('seat')
  })

  test('renders furniture and seats together correctly', () => {
    const furniture = [
      {
        id: 'desk-1',
        type: 'desk' as const,
        positions: [{ row: 0, col: 0 }, { row: 0, col: 1 }],
        rotation: 'horizontal' as Rotation
      }
    ]
    const seats = new Set(['1-1', '2-2'])
    
    render(<Grid rows={3} cols={3} {...defaultProps} furniture={furniture} seats={seats} />)
    
    const cells = document.querySelectorAll('.grid-cell')
    
    // Check desk cells take precedence
    expect(cells[0]).toHaveClass('furniture-desk')
    expect(cells[0]).toHaveTextContent('🪑')
    expect(cells[1]).toHaveClass('furniture-desk')
    expect(cells[1]).toHaveTextContent('🪑')
    
    // Check seat cells
    expect(cells[4]).toHaveClass('seat') // row 1, col 1
    expect(cells[4]).toHaveTextContent('💺')
    expect(cells[8]).toHaveClass('seat') // row 2, col 2
    expect(cells[8]).toHaveTextContent('💺')
  })
})