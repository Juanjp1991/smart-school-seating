'use client'

import { useState, useEffect } from 'react'
import { dbService, Layout } from '@/lib/db'

interface LoadModalProps {
  isOpen: boolean
  onClose: () => void
  onLoad: (layout: Layout) => Promise<void>
}

export default function LoadModal({ isOpen, onClose, onLoad }: LoadModalProps) {
  const [layouts, setLayouts] = useState<Layout[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingTemplate, setIsLoadingTemplate] = useState(false)
  const [error, setError] = useState('')
  const [selectedLayoutId, setSelectedLayoutId] = useState<string | null>(null)

  // Load templates when modal opens
  useEffect(() => {
    if (isOpen) {
      loadTemplates()
    }
  }, [isOpen])

  const loadTemplates = async () => {
    setIsLoading(true)
    setError('')
    
    try {
      const allLayouts = await dbService.getAllLayouts()
      // Sort by created_at descending (newest first)
      const sortedLayouts = allLayouts.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
      setLayouts(sortedLayouts)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load templates')
    } finally {
      setIsLoading(false)
    }
  }

  const handleTemplateLoad = async (layout: Layout) => {
    setIsLoadingTemplate(true)
    setError('')
    setSelectedLayoutId(layout.id)
    
    try {
      await onLoad(layout)
      handleClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load template')
      setSelectedLayoutId(null)
    } finally {
      setIsLoadingTemplate(false)
    }
  }

  const handleClose = () => {
    if (!isLoadingTemplate) {
      setError('')
      setSelectedLayoutId(null)
      onClose()
    }
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Load Layout Template</h2>
          {!isLoadingTemplate && (
            <button className="modal-close" onClick={handleClose} aria-label="Close">
              ×
            </button>
          )}
        </div>
        
        <div className="modal-body">
          {error && (
            <div className="error-message" role="alert">
              {error}
            </div>
          )}
          
          {isLoading ? (
            <div className="loading-state">
              <p>Loading templates...</p>
            </div>
          ) : layouts.length === 0 ? (
            <div className="empty-state">
              <p>No templates available</p>
              <p className="empty-state-subtitle">Save a layout first to see it here</p>
            </div>
          ) : (
            <div className="template-list">
              {layouts.map((layout) => (
                <div 
                  key={layout.id} 
                  className={`template-item ${selectedLayoutId === layout.id ? 'loading' : ''}`}
                >
                  <div className="template-info">
                    <h3 className="template-name">{layout.name}</h3>
                    <div className="template-details">
                      <span className="template-size">
                        {layout.grid_rows} × {layout.grid_cols} grid
                      </span>
                      <span className="template-date">
                        Created: {formatDate(layout.created_at)}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleTemplateLoad(layout)}
                    disabled={isLoadingTemplate}
                    className="button-primary template-load-button"
                  >
                    {selectedLayoutId === layout.id ? 'Loading...' : 'Load'}
                  </button>
                </div>
              ))}
            </div>
          )}
          
          <div className="modal-actions">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoadingTemplate}
              className="button-secondary"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}