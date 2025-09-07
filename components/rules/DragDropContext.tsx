'use client'

import { ReactNode } from 'react'
import { DragDropContext as RbdDragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd'

interface DragDropContextProps {
  children: ReactNode
  onDragEnd: (result: DropResult) => void
  droppableId: string
}

export default function DragDropContext({ children, onDragEnd, droppableId }: DragDropContextProps) {
  return (
    <RbdDragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId={droppableId}>
        {(provided, snapshot) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className={`space-y-3 transition-colors ${
              snapshot.isDraggingOver ? 'bg-blue-50 ring-2 ring-blue-200 ring-opacity-50' : ''
            }`}
          >
            {children}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </RbdDragDropContext>
  )
}

interface DraggableItemProps {
  children: ReactNode
  draggableId: string
  index: number
  isDragDisabled?: boolean
}

export function DraggableItem({ children, draggableId, index, isDragDisabled = false }: DraggableItemProps) {
  return (
    <Draggable draggableId={draggableId} index={index} isDragDisabled={isDragDisabled}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`transition-all duration-200 ${
            snapshot.isDragging 
              ? 'shadow-lg rotate-1 ring-2 ring-blue-300 z-50' 
              : isDragDisabled 
              ? 'cursor-not-allowed opacity-50' 
              : 'cursor-move hover:shadow-md'
          }`}
          style={{
            ...provided.draggableProps.style,
            transform: snapshot.isDragging 
              ? `${provided.draggableProps.style?.transform} rotate(1deg)` 
              : provided.draggableProps.style?.transform
          }}
        >
          <div className="relative group">
            {/* Enhanced drag handle - more visible and accessible */}
            <div 
              {...provided.dragHandleProps}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 z-10 cursor-grab active:cursor-grabbing p-2 rounded hover:bg-gray-100 transition-colors"
            >
              <div className="flex flex-col space-y-1 text-gray-400 group-hover:text-gray-600 group-hover:opacity-100 opacity-60 transition-all">
                <div className="w-1.5 h-1.5 bg-current rounded-full"></div>
                <div className="w-1.5 h-1.5 bg-current rounded-full"></div>
                <div className="w-1.5 h-1.5 bg-current rounded-full"></div>
                <div className="w-1.5 h-1.5 bg-current rounded-full"></div>
                <div className="w-1.5 h-1.5 bg-current rounded-full"></div>
                <div className="w-1.5 h-1.5 bg-current rounded-full"></div>
              </div>
            </div>
            <div className="pl-8 pr-2">
              {children}
            </div>
          </div>
        </div>
      )}
    </Draggable>
  )
}