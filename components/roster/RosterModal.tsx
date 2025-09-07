'use client'

import { useState, useEffect } from 'react'
import { dbService } from '@/lib/db'

interface RosterModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (name: string) => Promise<void>
  existingName?: string
  isEditing: boolean
}

export default function RosterModal({
  isOpen,
  onClose,
  onSave,
  existingName,
  isEditing
}: RosterModalProps) {
  const [rosterName, setRosterName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [warningName, setWarningName] = useState<string>()

  useEffect(() => {
    if (isOpen) {
      setRosterName(existingName || '')
      setError('')
      setWarningName(undefined)
      
      // Focus the input field when modal opens
      setTimeout(() => {
        const input = document.getElementById('roster-name')
        if (input) {
          input.focus()
        }
      }, 100)
    }
  }, [isOpen, existingName])

  // Check for existing roster name (for create mode only)
  useEffect(() => {
    const checkExistingName = async () => {
      if (!isEditing && rosterName.trim() && rosterName.trim() !== existingName) {
        try {
          const existing = await dbService.getRosterByName(rosterName.trim())
          if (existing) {
            setWarningName(rosterName.trim())
          } else {
            setWarningName(undefined)
          }
        } catch (error) {
          // Ignore errors during name checking
          setWarningName(undefined)
        }
      } else {
        setWarningName(undefined)
      }
    }

    const timeoutId = setTimeout(checkExistingName, 300)
    return () => clearTimeout(timeoutId)
  }, [rosterName, isEditing, existingName])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!rosterName.trim()) {
      setError('Please enter a roster name')
      return
    }

    if (rosterName.trim().length > 50) {
      setError('Roster name must be 50 characters or less')
      return
    }

    setIsLoading(true)
    setError('')
    
    try {
      await onSave(rosterName.trim())
      setRosterName('')
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save roster')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      setError('')
      setRosterName('')
      setWarningName(undefined)
      onClose()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleClose()
    }
  }

  if (!isOpen) return null

  return (
    <div 
      className="modal-overlay" 
      onClick={handleClose}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}
    >
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          width: '90%',
          maxWidth: '500px',
          maxHeight: '90vh',
          overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
        }}
      >
        <div 
          className="modal-header"
          style={{
            padding: '1.5rem',
            borderBottom: '1px solid #e0e0e0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <h2 style={{ 
            margin: 0, 
            fontSize: '1.25rem', 
            fontWeight: '600' 
          }}>
            {isEditing ? 'Edit Roster' : 'Create New Roster'}
          </h2>
          {!isLoading && (
            <button 
              className="modal-close" 
              onClick={handleClose}
              aria-label="Close"
              style={{
                background: 'none',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer',
                color: '#666',
                padding: '0.25rem',
                borderRadius: '4px',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f5f5f5'
                e.currentTarget.style.color = '#333'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
                e.currentTarget.style.color = '#666'
              }}
            >
              ×
            </button>
          )}
        </div>
        
        <form 
          className="modal-body" 
          onSubmit={handleSubmit}
          role="form"
          style={{
            padding: '1.5rem'
          }}
        >
          <div style={{ marginBottom: '1.5rem' }}>
            <label 
              htmlFor="roster-name"
              style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontSize: '0.95rem',
                fontWeight: '500',
                color: '#333'
              }}
            >
              Roster Name:
            </label>
            <input
              id="roster-name"
              type="text"
              value={rosterName}
              onChange={(e) => setRosterName(e.target.value)}
              placeholder="Enter a name for this roster"
              disabled={isLoading}
              maxLength={50}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '0.95rem',
                transition: 'border-color 0.2s ease',
                backgroundColor: isLoading ? '#f5f5f5' : 'white'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#007bff'
                e.currentTarget.style.outline = 'none'
                e.currentTarget.style.boxShadow = '0 0 0 2px rgba(0, 123, 255, 0.25)'
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#ddd'
                e.currentTarget.style.boxShadow = 'none'
              }}
            />
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '0.25rem',
              minHeight: '1.2rem'
            }}>
              <div style={{ fontSize: '0.8rem', color: '#999' }}>
                {rosterName.length}/50 characters
              </div>
            </div>
          </div>
          
          {error && (
            <div 
              className="error-message" 
              role="alert"
              style={{
                padding: '0.75rem',
                backgroundColor: '#ffe6e6',
                border: '1px solid #ffb3b3',
                borderRadius: '4px',
                color: '#d00',
                fontSize: '0.9rem',
                marginBottom: '1rem'
              }}
            >
              {error}
            </div>
          )}
          
          {warningName && (
            <div 
              className="warning-message"
              style={{
                padding: '0.75rem',
                backgroundColor: '#fff3cd',
                border: '1px solid #ffeaa7',
                borderRadius: '4px',
                color: '#856404',
                fontSize: '0.9rem',
                marginBottom: '1rem'
              }}
            >
              A roster named &quot;{warningName}&quot; already exists. Creating will overwrite it.
            </div>
          )}
          
          <div 
            className="modal-actions"
            style={{
              display: 'flex',
              gap: '0.75rem',
              justifyContent: 'flex-end'
            }}
          >
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              style={{
                padding: '0.75rem 1.5rem',
                border: '1px solid #ddd',
                backgroundColor: 'white',
                color: '#333',
                borderRadius: '4px',
                fontSize: '0.9rem',
                fontWeight: '500',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.6 : 1,
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.backgroundColor = '#f8f9fa'
                  e.currentTarget.style.borderColor = '#adb5bd'
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.backgroundColor = 'white'
                  e.currentTarget.style.borderColor = '#ddd'
                }
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !rosterName.trim()}
              style={{
                padding: '0.75rem 1.5rem',
                border: 'none',
                backgroundColor: isLoading || !rosterName.trim() ? '#ccc' : '#007bff',
                color: 'white',
                borderRadius: '4px',
                fontSize: '0.9rem',
                fontWeight: '500',
                cursor: isLoading || !rosterName.trim() ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (!isLoading && rosterName.trim()) {
                  e.currentTarget.style.backgroundColor = '#0056b3'
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoading && rosterName.trim()) {
                  e.currentTarget.style.backgroundColor = '#007bff'
                }
              }}
            >
              {isLoading ? 'Saving...' : (isEditing ? 'Update Roster' : 'Create Roster')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}