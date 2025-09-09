'use client'

import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { useDisplayOptions } from '@/hooks/useDisplayOptions'

interface SimpleViewToggleProps {
  className?: string
}

export function SimpleViewToggle({ className = '' }: SimpleViewToggleProps) {
  const { displayOptions, toggleSimpleView, isSimpleViewActive } = useDisplayOptions()
  const [isLoading, setIsLoading] = useState(false)

  const handleToggle = async () => {
    setIsLoading(true)
    try {
      await toggleSimpleView()
    } catch (error) {
      console.error('Failed to toggle simple view:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className={`
        flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors
        ${isSimpleViewActive 
          ? 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100' 
          : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
        }
        ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      title={isSimpleViewActive ? 'Show full student data' : 'Show simple view (names only)'}
    >
      {isLoading ? (
        <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
      ) : isSimpleViewActive ? (
        <>
          <EyeOff className="w-4 h-4" />
          <span className="text-sm font-medium">Simple</span>
        </>
      ) : (
        <>
          <Eye className="w-4 h-4" />
          <span className="text-sm font-medium">Simple</span>
        </>
      )}
    </button>
  )
}