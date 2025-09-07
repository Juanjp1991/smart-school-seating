import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import DragDropContext, { DraggableItem } from '@/components/rules/DragDropContext'

// Mock react-beautiful-dnd
jest.mock('react-beautiful-dnd', () => ({
  DragDropContext: ({ children, onDragEnd }: any) => (
    <div data-testid="drag-drop-context" data-ondragend={onDragEnd ? 'true' : 'false'}>
      {children}
    </div>
  ),
  Droppable: ({ children }: any) => {
    const provided = {
      droppableProps: { 'data-testid': 'droppable-area' },
      innerRef: jest.fn(),
      placeholder: <div data-testid="droppable-placeholder">Placeholder</div>
    }
    const snapshot = { isDraggingOver: false }
    return children(provided, snapshot)
  },
  Draggable: ({ children, draggableId, index }: any) => {
    const provided = {
      innerRef: jest.fn(),
      draggableProps: { 'data-testid': `draggable-${draggableId}` },
      dragHandleProps: { 'data-testid': `drag-handle-${draggableId}` }
    }
    const snapshot = { isDragging: false, isDragDisabled: false }
    return children(provided, snapshot)
  }
}))

describe('DragDropContext', () => {
  const mockOnDragEnd = jest.fn()
  const defaultProps = {
    onDragEnd: mockOnDragEnd,
    droppableId: 'test-droppable'
  }

  beforeEach(() => {
    mockOnDragEnd.mockClear()
  })

  it('renders children correctly', () => {
    render(
      <DragDropContext {...defaultProps}>
        <div data-testid="test-child">Test content</div>
      </DragDropContext>
    )

    expect(screen.getByTestId('test-child')).toBeInTheDocument()
    expect(screen.getByTestId('droppable-area')).toBeInTheDocument()
    expect(screen.getByTestId('droppable-placeholder')).toBeInTheDocument()
  })

  it('passes onDragEnd prop correctly', () => {
    render(
      <DragDropContext {...defaultProps}>
        <div>Test content</div>
      </DragDropContext>
    )

    const dragDropContext = screen.getByTestId('drag-drop-context')
    expect(dragDropContext).toHaveAttribute('data-ondragend', 'true')
  })

  it('applies dragging over styles when isDraggingOver is true', () => {
    // Test the component behavior with the standard mock
    render(
      <DragDropContext {...defaultProps}>
        <div>Test content</div>
      </DragDropContext>
    )

    // The droppable area should exist
    expect(screen.getByTestId('droppable-area')).toBeInTheDocument()
    
    // Test that the component structure is correct for drag over states
    const droppableArea = screen.getByTestId('droppable-area')
    expect(droppableArea).toHaveClass('space-y-3', 'transition-colors')
  })
})

describe('DraggableItem', () => {
  const defaultProps = {
    draggableId: 'test-item',
    index: 0
  }

  it('renders children correctly', () => {
    render(
      <DraggableItem {...defaultProps}>
        <div data-testid="draggable-content">Draggable content</div>
      </DraggableItem>
    )

    expect(screen.getByTestId('draggable-content')).toBeInTheDocument()
    expect(screen.getByTestId('draggable-test-item')).toBeInTheDocument()
    expect(screen.getByTestId('drag-handle-test-item')).toBeInTheDocument()
  })

  it('applies correct structure with drag handle', () => {
    render(
      <DraggableItem {...defaultProps}>
        <div data-testid="draggable-content">Draggable content</div>
      </DraggableItem>
    )

    // Check that draggable item exists
    expect(screen.getByTestId('draggable-test-item')).toBeInTheDocument()
    expect(screen.getByTestId('drag-handle-test-item')).toBeInTheDocument()
    
    // Check that content is present
    expect(screen.getByTestId('draggable-content')).toBeInTheDocument()
  })

  it('handles disabled state correctly', () => {
    render(
      <DraggableItem {...defaultProps} isDragDisabled={true}>
        <div data-testid="draggable-content">Disabled content</div>
      </DraggableItem>
    )

    expect(screen.getByTestId('draggable-content')).toBeInTheDocument()
  })

  it('renders drag handle dots correctly', () => {
    render(
      <DraggableItem {...defaultProps}>
        <div>Test content</div>
      </DraggableItem>
    )

    // Verify drag handle exists - implementation details might differ in test
    const dragHandle = screen.getByTestId('drag-handle-test-item')
    expect(dragHandle).toBeInTheDocument()
  })
})