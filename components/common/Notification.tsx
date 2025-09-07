'use client'

import { useEffect } from 'react'

interface NotificationProps {
  message: string
  type: 'success' | 'error' | 'info'
  isVisible: boolean
  onClose: () => void
  duration?: number
}

export default function Notification({ 
  message, 
  type, 
  isVisible, 
  onClose, 
  duration = 3000 
}: NotificationProps) {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(onClose, duration)
      return () => clearTimeout(timer)
    }
  }, [isVisible, duration, onClose])

  if (!isVisible) return null

  const typeClasses = {
    success: 'notification-success',
    error: 'notification-error',
    info: 'notification-info'
  }

  const typeIcons = {
    success: '✓',
    error: '✕',
    info: 'ℹ'
  }

  return (
    <div className={`notification ${typeClasses[type]}`}>
      <span className="notification-icon">{typeIcons[type]}</span>
      <span className="notification-message">{message}</span>
      <button 
        className="notification-close" 
        onClick={onClose}
        aria-label="Close notification"
      >
        ×
      </button>
    </div>
  )
}