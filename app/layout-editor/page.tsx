'use client'

import { useState, useCallback } from 'react'
import Grid from '@/components/layout/Grid'
import LayoutToolbar from '@/components/layout/LayoutToolbar'
import SaveModal from '@/components/common/SaveModal'
import LoadModal from '@/components/common/LoadModal'
import Notification from '@/components/common/Notification'
import { FurnitureItem, ToolType, Rotation } from '@/components/layout/types'
import { dbService, Layout } from '@/lib/db'

export default function LayoutEditor() {
  const [rows, setRows] = useState(8)
  const [cols, setCols] = useState(6)
  const [selectedTool, setSelectedTool] = useState<ToolType>('seat')
  const [rotation, setRotation] = useState<Rotation>('horizontal')
  const [furniture, setFurniture] = useState<FurnitureItem[]>([])
  const [seats, setSeats] = useState<Set<string>>(new Set())
  
  // Save functionality state
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [existingLayoutName, setExistingLayoutName] = useState<string>()
  
  // Load functionality state
  const [showLoadModal, setShowLoadModal] = useState(false)
  
  // Notifications
  const [notification, setNotification] = useState<{
    message: string
    type: 'success' | 'error' | 'info'
    isVisible: boolean
  }>({ message: '', type: 'info', isVisible: false })

  const showNotification = useCallback((message: string, type: 'success' | 'error' | 'info') => {
    setNotification({ message, type, isVisible: true })
  }, [])

  const hideNotification = useCallback(() => {
    setNotification(prev => ({ ...prev, isVisible: false }))
  }, [])

  const handleLoad = useCallback(() => {
    setShowLoadModal(true)
  }, [])

  const handleSave = useCallback(() => {
    setShowSaveModal(true)
  }, [])

  const handleSaveLayout = useCallback(async (layoutName: string) => {
    try {
      // Check if a layout with this name already exists
      const existingLayout = await dbService.getLayoutByName(layoutName)
      
      if (existingLayout && existingLayoutName !== layoutName) {
        // Show confirmation for overwrite
        setExistingLayoutName(layoutName)
        throw new Error(`A layout named "${layoutName}" already exists. Continue to overwrite it.`)
      }

      // Prepare layout data
      const layoutData = {
        name: layoutName,
        grid_rows: rows,
        grid_cols: cols,
        furniture,
        seats: Array.from(seats)
      }

      if (existingLayout) {
        // Update existing layout
        await dbService.updateLayout(existingLayout.id, layoutData)
        showNotification(`Layout "${layoutName}" updated successfully!`, 'success')
      } else {
        // Create new layout
        await dbService.saveLayout(layoutData)
        showNotification(`Layout "${layoutName}" saved successfully!`, 'success')
      }
      
      // Reset confirmation state
      setExistingLayoutName(undefined)
    } catch (error) {
      if (error instanceof Error && error.message.includes('already exists')) {
        // This is the confirmation scenario - don't show error
        throw error
      } else {
        console.error('Failed to save layout:', error)
        showNotification(
          error instanceof Error ? error.message : 'Failed to save layout. Please try again.',
          'error'
        )
      }
    }
  }, [rows, cols, furniture, seats, existingLayoutName, showNotification])

  const handleLoadLayout = useCallback(async (layout: Layout) => {
    try {
      // Apply loaded layout data to current state
      setRows(layout.grid_rows)
      setCols(layout.grid_cols)
      setFurniture(layout.furniture)
      setSeats(new Set(layout.seats))
      
      showNotification(`Layout "${layout.name}" loaded successfully!`, 'success')
    } catch (error) {
      console.error('Failed to load layout:', error)
      showNotification(
        error instanceof Error ? error.message : 'Failed to load layout. Please try again.',
        'error'
      )
    }
  }, [showNotification])

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Toolbar */}
      <LayoutToolbar
        rows={rows}
        cols={cols}
        onRowsChange={setRows}
        onColsChange={setCols}
        selectedTool={selectedTool}
        onToolSelect={setSelectedTool}
        rotation={rotation}
        onRotationChange={setRotation}
        onLoad={handleLoad}
        onSave={handleSave}
      />

      {/* Main Grid Canvas */}
      <div style={{ 
        flex: 1, 
        padding: '1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fafafa',
        minHeight: 0,
        overflow: 'hidden'
      }}>
        <Grid 
          rows={rows} 
          cols={cols} 
          selectedTool={selectedTool}
          rotation={rotation}
          furniture={furniture}
          onFurnitureChange={setFurniture}
          seats={seats}
          onSeatsChange={setSeats}
        />
      </div>

      {/* Save Modal */}
      <SaveModal
        isOpen={showSaveModal}
        onClose={() => {
          setShowSaveModal(false)
          setExistingLayoutName(undefined)
        }}
        onSave={handleSaveLayout}
        existingName={existingLayoutName}
      />

      {/* Load Modal */}
      <LoadModal
        isOpen={showLoadModal}
        onClose={() => setShowLoadModal(false)}
        onLoad={handleLoadLayout}
      />

      {/* Notifications */}
      <Notification
        message={notification.message}
        type={notification.type}
        isVisible={notification.isVisible}
        onClose={hideNotification}
      />
    </div>
  )
}