'use client'

import React from 'react'

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className = '',
}) => {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  }

  return (
    <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 ${sizes[size]} ${className}`}>
      <span className="sr-only">Loading...</span>
    </div>
  )
}

// Full page loading component
export const LoadingScreen: React.FC<{ message?: string }> = ({
  message = 'Loading...'
}) => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <LoadingSpinner size="lg" className="mx-auto mb-4" />
      <p className="text-gray-600 text-lg">{message}</p>
    </div>
  </div>
)

// Skeleton loading components
export const SkeletonCard: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
    <div className="animate-pulse">
      <div className="h-4 bg-gray-200 rounded mb-3 w-3/4"></div>
      <div className="h-3 bg-gray-200 rounded mb-2"></div>
      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
    </div>
  </div>
)

export const SkeletonList: React.FC<{ items?: number; className?: string }> = ({
  items = 3,
  className = ''
}) => (
  <div className={`space-y-3 ${className}`}>
    {Array.from({ length: items }).map((_, index) => (
      <SkeletonCard key={index} />
    ))}
  </div>
)