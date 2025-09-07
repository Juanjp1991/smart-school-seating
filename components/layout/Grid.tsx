'use client'

import { useState, useEffect } from 'react'
import { ToolType, Rotation, FurnitureItem } from './types'

interface GridProps {
  rows: number
  cols: number
  selectedTool: ToolType
  rotation: Rotation
  furniture: FurnitureItem[]
  onFurnitureChange: (furniture: FurnitureItem[]) => void
  seats: Set<string>
  onSeatsChange: (seats: Set<string>) => void
}

export default function Grid({ rows, cols, selectedTool, rotation, furniture, onFurnitureChange, seats, onSeatsChange }: GridProps) {
  const [dimensions, setDimensions] = useState({ width: 1200, height: 600 })
  const [hoveredCell, setHoveredCell] = useState<{ row: number, col: number } | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const updateDimensions = () => {
        setDimensions({
          width: window.innerWidth,
          height: window.innerHeight
        })
      }
      
      updateDimensions()
      window.addEventListener('resize', updateDimensions)
      return () => window.removeEventListener('resize', updateDimensions)
    }
  }, [])

  // Helper functions for furniture placement
  const getDeskPositions = (row: number, col: number, rotation: Rotation): Array<{ row: number, col: number }> => {
    if (rotation === 'horizontal') {
      return [{ row, col }, { row, col: col + 1 }]
    } else {
      return [{ row, col }, { row: row + 1, col }]
    }
  }

  const isValidPosition = (positions: Array<{ row: number, col: number }>): boolean => {
    return positions.every(pos => 
      pos.row >= 0 && pos.row < rows && pos.col >= 0 && pos.col < cols &&
      !furniture.some(item => 
        item.positions.some(itemPos => itemPos.row === pos.row && itemPos.col === pos.col)
      )
    )
  }

  const getFurnitureAt = (row: number, col: number): FurnitureItem | null => {
    return furniture.find(item => 
      item.positions.some(pos => pos.row === row && pos.col === col)
    ) || null
  }

  const getSeatKey = (row: number, col: number): string => `${row}-${col}`

  const hasSeat = (row: number, col: number): boolean => {
    return seats.has(getSeatKey(row, col))
  }

  const handleCellClick = (row: number, col: number) => {
    const existingFurniture = getFurnitureAt(row, col)
    const existingSeat = hasSeat(row, col)
    
    // Handle seat tool
    if (selectedTool === 'seat') {
      const seatKey = getSeatKey(row, col)
      
      // Can't place seat on furniture
      if (existingFurniture) return
      
      if (existingSeat) {
        // Remove existing seat
        const newSeats = new Set(seats)
        newSeats.delete(seatKey)
        onSeatsChange(newSeats)
      } else {
        // Add new seat
        const newSeats = new Set(seats)
        newSeats.add(seatKey)
        onSeatsChange(newSeats)
      }
      return
    }

    // For furniture tools, remove any existing furniture or seat first
    if (existingFurniture) {
      onFurnitureChange(furniture.filter(item => item.id !== existingFurniture.id))
      return
    }
    
    if (existingSeat) {
      // Remove seat when placing furniture
      const seatKey = getSeatKey(row, col)
      const newSeats = new Set(seats)
      newSeats.delete(seatKey)
      onSeatsChange(newSeats)
    }

    if (selectedTool === 'desk') {
      const positions = getDeskPositions(row, col, rotation)
      // Check for seats in desk positions
      const hasSeatsInPositions = positions.some(pos => hasSeat(pos.row, pos.col))
      if (isValidPosition(positions) && !hasSeatsInPositions) {
        // Remove any seats that would be under the desk
        const newSeats = new Set(seats)
        positions.forEach(pos => newSeats.delete(getSeatKey(pos.row, pos.col)))
        onSeatsChange(newSeats)
        
        const newDesk: FurnitureItem = {
          id: `desk-${Date.now()}`,
          type: 'desk',
          positions,
          rotation
        }
        onFurnitureChange([...furniture, newDesk])
      }
    } else if (selectedTool === 'door') {
      const positions = [{ row, col }]
      if (isValidPosition(positions)) {
        const newDoor: FurnitureItem = {
          id: `door-${Date.now()}`,
          type: 'door',
          positions
        }
        onFurnitureChange([...furniture, newDoor])
      }
    }
  }

  const getPreviewPositions = (): Array<{ row: number, col: number }> => {
    if (!hoveredCell || selectedTool === 'seat') return []
    
    if (selectedTool === 'desk') {
      const positions = getDeskPositions(hoveredCell.row, hoveredCell.col, rotation)
      return isValidPosition(positions) ? positions : []
    } else if (selectedTool === 'door') {
      const positions = [hoveredCell]
      return isValidPosition(positions) ? positions : []
    }
    
    return []
  }
  // Create grid cells
  const previewPositions = getPreviewPositions()
  const cells = []
  
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const furnitureItem = getFurnitureAt(row, col)
      const isPreview = previewPositions.some(pos => pos.row === row && pos.col === col)
      const seatExists = hasSeat(row, col)
      
      let cellClass = 'grid-cell'
      let cellContent = ''
      
      if (furnitureItem) {
        cellClass += ` furniture-${furnitureItem.type}`
        cellContent = furnitureItem.type === 'desk' ? '🪑' : '🚪'
      } else if (seatExists) {
        cellClass += ' seat'
        cellContent = '💺'
      } else if (isPreview && selectedTool !== 'seat') {
        cellClass += ' furniture-preview'
        cellContent = selectedTool === 'desk' ? '🪑' : '🚪'
      }
      
      cells.push(
        <div 
          key={`${row}-${col}`}
          className={cellClass}
          data-row={row}
          data-col={col}
          style={{
            gridRow: row + 1,
            gridColumn: col + 1,
          }}
          onClick={() => handleCellClick(row, col)}
          onMouseEnter={() => selectedTool !== 'seat' ? setHoveredCell({ row, col }) : undefined}
          onMouseLeave={() => setHoveredCell(null)}
        >
          {cellContent}
        </div>
      )
    }
  }

  // Calculate dimensions to ensure grid fits properly - use more available space
  const containerPadding = 30 // 15px on each side
  const gap = 3
  // Use much more of the available space - remove restrictive max limits
  const maxWidth = dimensions.width * 0.85 // Use 85% of width
  const maxHeight = (dimensions.height - 200) * 0.9 // Account for toolbar, use 90% of remaining height
  
  // Calculate cell size based on available space
  const availableWidth = maxWidth - containerPadding - (gap * (cols - 1))
  const availableHeight = maxHeight - containerPadding - (gap * (rows - 1))
  
  const cellWidth = Math.floor(availableWidth / cols)
  const cellHeight = Math.floor(availableHeight / rows)
  
  // Use the smaller dimension to maintain square cells and ensure they fit
  const cellSize = Math.max(30, Math.min(cellWidth, cellHeight))

  return (
    <div 
      className="classroom-grid"
      style={{
        display: 'grid',
        gridTemplateRows: `repeat(${rows}, ${cellSize}px)`,
        gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
        gap: '3px',
        border: '2px solid #333',
        padding: '15px',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
        justifyContent: 'center',
        alignContent: 'center'
      }}
    >
      {cells}
    </div>
  )
}