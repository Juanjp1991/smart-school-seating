import React from 'react'
import { Button } from './Button'

export interface EmptyStateProps {
  icon?: React.ReactNode | string
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  className?: string
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}) => {
  const renderIcon = () => {
    if (typeof icon === 'string') {
      return <div className="text-6xl mb-4">{icon}</div>
    }
    if (icon) {
      return <div className="mb-4">{icon}</div>
    }
    return (
      <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
    )
  }

  return (
    <div className={`text-center py-12 px-4 ${className}`}>
      {renderIcon()}
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <Button variant="primary" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  )
}

// Preset empty states for common scenarios
export const NoDataEmptyState: React.FC<{ 
  title?: string
  description?: string
  actionLabel?: string
  onAction?: () => void 
}> = ({
  title = "No data yet",
  description = "Get started by creating your first item.",
  actionLabel,
  onAction
}) => (
  <EmptyState
    icon="📊"
    title={title}
    description={description}
    actionLabel={actionLabel}
    onAction={onAction}
  />
)

export const NoRostersEmptyState: React.FC<{ onCreateRoster?: () => void }> = ({
  onCreateRoster
}) => (
  <EmptyState
    icon="👥"
    title="No rosters created yet"
    description="Create your first class roster to get started with seating arrangements."
    actionLabel="Create Roster"
    onAction={onCreateRoster}
  />
)

export const NoLayoutsEmptyState: React.FC<{ onCreateLayout?: () => void }> = ({
  onCreateLayout
}) => (
  <EmptyState
    icon="🏫"
    title="No classroom layouts"
    description="Design your classroom layout with desks, doors, and furniture."
    actionLabel="Create Layout"
    onAction={onCreateLayout}
  />
)