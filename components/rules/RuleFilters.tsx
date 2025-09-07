'use client'

import type { RuleFilters } from '@/types/rule'
import { RuleType, RULE_TYPES } from '@/types/rule'

interface RuleFiltersProps {
  filters: RuleFilters
  onFiltersChange: (filters: RuleFilters) => void
  totalRules: number
  filteredRules: number
}

export default function RuleFilters({ filters, onFiltersChange, totalRules, filteredRules }: RuleFiltersProps) {
  const handleStatusFilterChange = (status: 'active' | 'inactive' | 'all') => {
    if (filters.status !== status) {
      onFiltersChange({ ...filters, status })
    }
  }

  const handleTypeFilterChange = (type: RuleType | 'all') => {
    if (filters.type !== type) {
      onFiltersChange({ ...filters, type })
    }
  }

  const handleSortByChange = (sortBy: 'priority' | 'created_at' | 'updated_at' | 'type') => {
    if (filters.sortBy !== sortBy) {
      onFiltersChange({ ...filters, sortBy })
    }
  }

  const handleSortOrderChange = (sortOrder: 'asc' | 'desc') => {
    if (filters.sortOrder !== sortOrder) {
      onFiltersChange({ ...filters, sortOrder })
    }
  }

  const clearFilters = () => {
    onFiltersChange({})
  }

  const hasActiveFilters = filters.status || filters.type || filters.sortBy || filters.searchQuery

  return (
    <div className="space-y-4">
      {/* Filter Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-bold text-gray-700">🔧 Filter Options</h4>
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
              {filteredRules} shown
            </span>
            {filteredRules !== totalRules && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-medium">
                {totalRules} total
              </span>
            )}
          </div>
        </div>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="px-3 py-1 text-xs bg-red-100 text-red-700 hover:bg-red-200 rounded-lg font-medium transition-colors"
          >
            ✕ Clear All
          </button>
        )}
      </div>

      {/* Filter Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Status Filter */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
            <span>📊 Status</span>
          </label>
          <select
            value={filters.status || 'all'}
            onChange={(e) => handleStatusFilterChange(e.target.value as 'active' | 'inactive' | 'all')}
            className="w-full px-3 py-2 text-sm border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-colors"
          >
            <option value="all">🔄 All Rules</option>
            <option value="active">✅ Active Only</option>
            <option value="inactive">❌ Inactive Only</option>
          </select>
        </div>

        {/* Type Filter */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
            <span>🏷️ Type</span>
          </label>
          <select
            value={filters.type || 'all'}
            onChange={(e) => handleTypeFilterChange(e.target.value as RuleType | 'all')}
            className="w-full px-3 py-2 text-sm border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-colors"
          >
            <option value="all">🔄 All Types</option>
            <option value="SEPARATE">🚫 Must Not Sit Together</option>
            <option value="TOGETHER">🤝 Must Sit Together</option>
            <option value="FRONT_ROW">📍 Front Row Preference</option>
            <option value="BACK_ROW">📍 Back Row Preference</option>
            <option value="NEAR_TEACHER">👨‍🏫 Near Teacher</option>
            <option value="NEAR_DOOR">🚪 Near Door</option>
          </select>
        </div>

        {/* Sort By */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
            <span>🔢 Sort By</span>
          </label>
          <select
            value={filters.sortBy || 'priority'}
            onChange={(e) => handleSortByChange(e.target.value as 'priority' | 'created_at' | 'updated_at' | 'type')}
            className="w-full px-3 py-2 text-sm border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-colors"
          >
            <option value="priority">🎯 Priority</option>
            <option value="created_at">📅 Created Date</option>
            <option value="updated_at">🔄 Updated Date</option>
            <option value="type">🏷️ Rule Type</option>
          </select>
        </div>

        {/* Sort Order */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
            <span>⬆️⬇️ Order</span>
          </label>
          <select
            value={filters.sortOrder || 'asc'}
            onChange={(e) => handleSortOrderChange(e.target.value as 'asc' | 'desc')}
            className="w-full px-3 py-2 text-sm border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-colors"
          >
            <option value="asc">⬆️ Ascending</option>
            <option value="desc">⬇️ Descending</option>
          </select>
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200">
          {filters.status && (
            <span className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
              Status: {filters.status}
              <button
                onClick={() => handleStatusFilterChange('all')}
                className="ml-1 text-blue-600 hover:text-blue-800"
              >
                ×
              </button>
            </span>
          )}
          {filters.type && filters.type !== 'all' && (
            <span className="inline-flex items-center px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
              Type: {RULE_TYPES[filters.type].name}
              <button
                onClick={() => handleTypeFilterChange('all')}
                className="ml-1 text-green-600 hover:text-green-800"
              >
                ×
              </button>
            </span>
          )}
          {filters.sortBy && (
            <span className="inline-flex items-center px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
              Sort: {filters.sortBy} ({filters.sortOrder || 'asc'})
              <button
                onClick={() => handleSortByChange('priority')}
                className="ml-1 text-purple-600 hover:text-purple-800"
              >
                ×
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  )
}