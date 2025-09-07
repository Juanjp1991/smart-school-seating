'use client'

import { useState, useEffect, useRef } from 'react'
import type { RuleFilters } from '@/types/rule'

interface RuleSearchProps {
  filters: RuleFilters
  onFiltersChange: (filters: RuleFilters) => void
  placeholder?: string
}

export default function RuleSearch({ filters, onFiltersChange, placeholder = "Search rules..." }: RuleSearchProps) {
  const [searchQuery, setSearchQuery] = useState(filters.searchQuery || '')
  const [isFocused, setIsFocused] = useState(false)
  const filtersRef = useRef(filters)
  const onFiltersChangeRef = useRef(onFiltersChange)
  
  // Update refs when props change
  filtersRef.current = filters
  onFiltersChangeRef.current = onFiltersChange

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const newSearchQuery = searchQuery.trim() || undefined
      // Only update if search query actually changed
      if (filtersRef.current.searchQuery !== newSearchQuery) {
        onFiltersChangeRef.current({ ...filtersRef.current, searchQuery: newSearchQuery })
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchQuery])

  const handleClearSearch = () => {
    setSearchQuery('')
    onFiltersChangeRef.current({ ...filtersRef.current, searchQuery: undefined })
  }

  return (
    <div className="relative">
      <style jsx>{`
        .search-icon-container {
          width: 20px !important;
          height: 20px !important;
          min-width: 20px !important;
          min-height: 20px !important;
          max-width: 20px !important;
          max-height: 20px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
        }
        .search-icon-container svg {
          width: 20px !important;
          height: 20px !important;
          min-width: 20px !important;
          min-height: 20px !important;
          max-width: 20px !important;
          max-height: 20px !important;
          display: block !important;
        }
      `}</style>
      <div className={`relative flex items-center border rounded-lg transition-all duration-200 ${
        isFocused ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-300'
      }`}>
        {/* Search Icon */}
        <div className="absolute left-3 text-gray-400 flex-shrink-0 search-icon-container">
          <svg
            className="w-5 h-5 flex-shrink-0"
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            style={{ width: '20px', height: '20px', minWidth: '20px', minHeight: '20px', maxWidth: '20px', maxHeight: '20px' }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        {/* Search Input */}
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2 text-sm bg-transparent border-none focus:outline-none focus:ring-0"
        />

        {/* Clear Button */}
        {searchQuery && (
          <button
            onClick={handleClearSearch}
            className="absolute right-3 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0 search-icon-container"
            aria-label="Clear search"
          >
            <svg
              className="w-5 h-5 flex-shrink-0"
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              style={{ width: '20px', height: '20px', minWidth: '20px', minHeight: '20px', maxWidth: '20px', maxHeight: '20px' }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Search Help Text */}
      <div className="mt-2 text-xs text-gray-500">
        {searchQuery ? (
          <div className="flex items-center gap-2">
            <span>🔍 Searching for:</span>
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded font-medium">
              &quot;{searchQuery}&quot;
            </span>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-4">
            <span className="font-medium">Search by:</span>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="px-2 py-1 bg-green-100 text-green-700 rounded">Rule type</span>
              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">Student names</span>
              <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded">Description</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}