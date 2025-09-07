'use client'

import { useState } from 'react'

interface SaveModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (name: string) => Promise<void>
  existingName?: string
}

export default function SaveModal({ isOpen, onClose, onSave, existingName }: SaveModalProps) {
  const [layoutName, setLayoutName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!layoutName.trim()) {
      setError('Please enter a layout name')
      return
    }

    setIsLoading(true)
    setError('')
    
    try {
      await onSave(layoutName.trim())
      setLayoutName('')
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save layout')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      setLayoutName('')
      setError('')
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Save Layout</h2>
          {!isLoading && (
            <button className="modal-close" onClick={handleClose} aria-label="Close">
              ×
            </button>
          )}
        </div>
        
        <form onSubmit={handleSubmit} className="modal-body" role="form">
          <div className="form-group">
            <label htmlFor="layout-name">Layout Name:</label>
            <input
              id="layout-name"
              type="text"
              value={layoutName}
              onChange={(e) => setLayoutName(e.target.value)}
              placeholder="Enter a name for this layout"
              disabled={isLoading}
              autoFocus
              maxLength={50}
            />
          </div>
          
          {error && (
            <div className="error-message" role="alert">
              {error}
            </div>
          )}
          
          {existingName && (
            <div className="warning-message">
              A layout named &quot;{existingName}&quot; already exists. Saving will overwrite it.
            </div>
          )}
          
          <div className="modal-actions">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="button-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !layoutName.trim()}
              className="button-primary"
            >
              {isLoading ? 'Saving...' : 'Save Layout'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}