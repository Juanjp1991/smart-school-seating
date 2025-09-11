'use client'

import { useState } from 'react'
import { Modal, ModalBody, ModalFooter, Button, Input } from '@/components/ui'

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

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Save Layout"
      size="md"
      closeOnEscape={!isLoading}
      closeOnOverlayClick={!isLoading}
    >
      <form onSubmit={handleSubmit}>
        <ModalBody>
          <Input
            label="Layout Name"
            type="text"
            value={layoutName}
            onChange={(e) => setLayoutName(e.target.value)}
            placeholder="Enter a name for this layout"
            disabled={isLoading}
            autoFocus
            maxLength={50}
            error={error}
          />
          
          {existingName && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800">
                ⚠️ A layout named &quot;{existingName}&quot; already exists. Saving will overwrite it.
              </p>
            </div>
          )}
        </ModalBody>
        
        <ModalFooter>
          <Button
            type="button"
            onClick={handleClose}
            disabled={isLoading}
            variant="secondary"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading || !layoutName.trim()}
            variant="primary"
            isLoading={isLoading}
          >
            Save Layout
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  )
}