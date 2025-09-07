'use client'

import { ToolType, Rotation } from './types'

interface LayoutToolbarProps {
  rows: number
  cols: number
  onRowsChange: (rows: number) => void
  onColsChange: (cols: number) => void
  selectedTool: ToolType
  onToolSelect: (tool: ToolType) => void
  rotation: Rotation
  onRotationChange: (rotation: Rotation) => void
  onLoad: () => void
  onSave: () => void
}

export default function LayoutToolbar({
  rows,
  cols,
  onRowsChange,
  onColsChange,
  selectedTool,
  onToolSelect,
  rotation,
  onRotationChange,
  onLoad,
  onSave
}: LayoutToolbarProps) {
  const handleRowsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value)
    if (!isNaN(value) && value > 0 && value <= 20) {
      onRowsChange(value)
    }
  }

  const handleColsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value)
    if (!isNaN(value) && value > 0 && value <= 20) {
      onColsChange(value)
    }
  }

  const handleRotate = () => {
    onRotationChange(rotation === 'horizontal' ? 'vertical' : 'horizontal')
  }

  return (
    <div className="toolbar">
      <div className="toolbar-section">
        <label>Rows:</label>
        <input 
          type="number" 
          value={rows} 
          onChange={handleRowsChange}
          min="1"
          max="20"
        />
      </div>
      <div className="toolbar-section">
        <label>Cols:</label>
        <input 
          type="number" 
          value={cols} 
          onChange={handleColsChange}
          min="1"
          max="20"
        />
      </div>
      <div className="toolbar-section">
        <span>Tools:</span>
        <button 
          className={selectedTool === 'seat' ? 'tool-button active' : 'tool-button'}
          onClick={() => onToolSelect('seat')}
        >
          Seat
        </button>
        <button 
          className={selectedTool === 'desk' ? 'tool-button active' : 'tool-button'}
          onClick={() => onToolSelect('desk')}
        >
          Desk
        </button>
        <button 
          className={selectedTool === 'door' ? 'tool-button active' : 'tool-button'}
          onClick={() => onToolSelect('door')}
        >
          Door
        </button>
        {selectedTool === 'desk' && (
          <button 
            className="rotate-button"
            onClick={handleRotate}
            title={`Rotate to ${rotation === 'horizontal' ? 'vertical' : 'horizontal'}`}
          >
            Rotate ({rotation})
          </button>
        )}
        <button className="load-button" onClick={onLoad}>
          Load
        </button>
        <button className="save-button" onClick={onSave}>
          Save
        </button>
      </div>
    </div>
  )
}