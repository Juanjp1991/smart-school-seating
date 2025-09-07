/**
 * @jest-environment jsdom
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import Notification from '@/components/common/Notification'

// Mock timers
beforeEach(() => {
  jest.useFakeTimers()
})

afterEach(() => {
  jest.runOnlyPendingTimers()
  jest.useRealTimers()
})

describe('Notification', () => {
  const defaultProps = {
    message: 'Test notification',
    type: 'info' as const,
    isVisible: true,
    onClose: jest.fn()
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should not render when isVisible is false', () => {
    render(<Notification {...defaultProps} isVisible={false} />)
    expect(screen.queryByText('Test notification')).not.toBeInTheDocument()
  })

  it('should render when isVisible is true', () => {
    render(<Notification {...defaultProps} />)
    expect(screen.getByText('Test notification')).toBeInTheDocument()
  })

  it('should display the correct message', () => {
    render(<Notification {...defaultProps} message="Custom message" />)
    expect(screen.getByText('Custom message')).toBeInTheDocument()
  })

  it('should apply correct CSS class for success type', () => {
    render(<Notification {...defaultProps} type="success" />)
    const notification = screen.getByText('Test notification').closest('.notification')
    expect(notification).toHaveClass('notification-success')
  })

  it('should apply correct CSS class for error type', () => {
    render(<Notification {...defaultProps} type="error" />)
    const notification = screen.getByText('Test notification').closest('.notification')
    expect(notification).toHaveClass('notification-error')
  })

  it('should apply correct CSS class for info type', () => {
    render(<Notification {...defaultProps} type="info" />)
    const notification = screen.getByText('Test notification').closest('.notification')
    expect(notification).toHaveClass('notification-info')
  })

  it('should show correct icon for success type', () => {
    render(<Notification {...defaultProps} type="success" />)
    expect(screen.getByText('✓')).toBeInTheDocument()
  })

  it('should show correct icon for error type', () => {
    render(<Notification {...defaultProps} type="error" />)
    expect(screen.getByText('✕')).toBeInTheDocument()
  })

  it('should show correct icon for info type', () => {
    render(<Notification {...defaultProps} type="info" />)
    expect(screen.getByText('ℹ')).toBeInTheDocument()
  })

  it('should call onClose when close button is clicked', () => {
    render(<Notification {...defaultProps} />)
    const closeButton = screen.getByLabelText('Close notification')
    fireEvent.click(closeButton)
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1)
  })

  it('should auto-close after default duration', () => {
    const onClose = jest.fn()
    render(<Notification {...defaultProps} onClose={onClose} />)
    
    // Fast-forward time by default duration (3000ms)
    jest.advanceTimersByTime(3000)
    
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('should auto-close after custom duration', () => {
    const onClose = jest.fn()
    render(<Notification {...defaultProps} onClose={onClose} duration={1500} />)
    
    // Fast-forward time by custom duration
    jest.advanceTimersByTime(1500)
    
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('should not auto-close when duration is 0', () => {
    const onClose = jest.fn()
    render(<Notification {...defaultProps} onClose={onClose} duration={0} />)
    
    // Fast-forward time significantly
    jest.advanceTimersByTime(10000)
    
    expect(onClose).not.toHaveBeenCalled()
  })

  it('should clear timer when component unmounts', () => {
    const onClose = jest.fn()
    const { unmount } = render(<Notification {...defaultProps} onClose={onClose} />)
    
    // Unmount before duration completes
    jest.advanceTimersByTime(1000)
    unmount()
    
    // Complete the original duration
    jest.advanceTimersByTime(2000)
    
    expect(onClose).not.toHaveBeenCalled()
  })

  it('should reset timer when isVisible changes from false to true', () => {
    const onClose = jest.fn()
    const { rerender } = render(
      <Notification {...defaultProps} onClose={onClose} isVisible={false} />
    )
    
    // Advance time while invisible
    jest.advanceTimersByTime(2000)
    
    // Show notification
    rerender(<Notification {...defaultProps} onClose={onClose} isVisible={true} />)
    
    // Advance time by full duration from when it became visible
    jest.advanceTimersByTime(3000)
    
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('should reset timer when duration changes', () => {
    const onClose = jest.fn()
    const { rerender } = render(
      <Notification {...defaultProps} onClose={onClose} duration={5000} />
    )
    
    // Advance time partially
    jest.advanceTimersByTime(2000)
    
    // Change duration
    rerender(
      <Notification {...defaultProps} onClose={onClose} duration={1000} />
    )
    
    // Advance by new duration
    jest.advanceTimersByTime(1000)
    
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('should have accessible close button', () => {
    render(<Notification {...defaultProps} />)
    const closeButton = screen.getByLabelText('Close notification')
    expect(closeButton).toBeInTheDocument()
    expect(closeButton).toHaveAttribute('aria-label', 'Close notification')
  })

  it('should maintain proper component structure', () => {
    render(<Notification {...defaultProps} message="Test message" type="success" />)
    
    const notification = screen.getByText('Test message').closest('.notification')
    expect(notification).toHaveClass('notification', 'notification-success')
    
    const icon = screen.getByText('✓')
    expect(icon).toHaveClass('notification-icon')
    
    const message = screen.getByText('Test message')
    expect(message).toHaveClass('notification-message')
    
    const closeButton = screen.getByLabelText('Close notification')
    expect(closeButton).toHaveClass('notification-close')
  })

  it('should handle rapid state changes gracefully', () => {
    const onClose = jest.fn()
    const { rerender } = render(
      <Notification {...defaultProps} onClose={onClose} isVisible={false} />
    )
    
    // Rapid visibility changes
    rerender(<Notification {...defaultProps} onClose={onClose} isVisible={true} />)
    rerender(<Notification {...defaultProps} onClose={onClose} isVisible={false} />)
    rerender(<Notification {...defaultProps} onClose={onClose} isVisible={true} />)
    
    // Should not have auto-closed during the changes
    jest.advanceTimersByTime(1000)
    expect(onClose).not.toHaveBeenCalled()
    
    // Should auto-close after full duration from last visibility change
    jest.advanceTimersByTime(2000)
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})