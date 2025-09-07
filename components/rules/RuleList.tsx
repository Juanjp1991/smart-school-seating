'use client'

import { useState, useEffect, useCallback } from 'react'
import type { RuleFilters as RuleFiltersType } from '@/types/rule'
import { Rule } from '@/types/rule'
import { Student } from '@/lib/db'
import { ruleService } from '@/lib/ruleService'
import RuleItem from './RuleItem'
import RuleFilters from './RuleFilters'
import RuleSearch from './RuleSearch'
import RuleBuilderModal from './RuleBuilderModal'
import DragDropContext, { DraggableItem } from './DragDropContext'
import { useDragAndDrop } from '@/hooks/useDragAndDrop'
import { sortRulesByPriority } from '@/utils/priorityHelpers'
import { DropResult } from 'react-beautiful-dnd'

interface RuleListProps {
  rules: Rule[]
  students: Student[]
  rosterId: string
  onRuleCreated: (rule: Rule) => void
  onRuleUpdated: (rule: Rule) => void
  onRuleDeleted: (ruleId: string) => void
  compact?: boolean
}

export default function RuleList({ 
  rules, 
  students, 
  rosterId, 
  onRuleCreated, 
  onRuleUpdated, 
  onRuleDeleted,
  compact = false
}: RuleListProps) {
  const [isBuilderOpen, setIsBuilderOpen] = useState(false)
  const [editingRule, setEditingRule] = useState<Rule | null>(null)
  const [filters, setFilters] = useState<RuleFiltersType>({})
  const [filteredRules, setFilteredRules] = useState<Rule[]>(rules)
  const [isLoading, setIsLoading] = useState(false)
  const [isDragMode, setIsDragMode] = useState(false)
  const { isReordering, reorderRules, lastError, clearError } = useDragAndDrop()

  // Apply filters when rules or filters change
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      setIsLoading(true)
      try {
        if (Object.keys(filters).length === 0) {
          setFilteredRules(rules)
        } else {
          const filtered = await ruleService.getFilteredRules(rosterId, filters)
          setFilteredRules(filtered)
        }
      } catch (error) {
        console.error('Error applying filters:', error)
        setFilteredRules(rules)
      } finally {
        setIsLoading(false)
      }
    }, 100) // Small debounce to prevent rapid successive calls

    return () => clearTimeout(timeoutId)
  }, [rules, rosterId, filters.status, filters.type, filters.sortBy, filters.sortOrder, filters.searchQuery])

  const handleCreateRule = () => {
    setEditingRule(null)
    setIsBuilderOpen(true)
  }

  const handleEditRule = (rule: Rule) => {
    setEditingRule(rule)
    setIsBuilderOpen(true)
  }

  const handleDeleteRule = async (ruleId: string) => {
    if (confirm('Are you sure you want to delete this rule?')) {
      try {
        await ruleService.deleteRule(ruleId)
        onRuleDeleted(ruleId)
      } catch (error) {
        console.error('Error deleting rule:', error)
        alert('Failed to delete rule. Please try again.')
      }
    }
  }

  const handleToggleActive = async (ruleId: string) => {
    try {
      const updatedRule = await ruleService.toggleRuleActive(ruleId)
      onRuleUpdated(updatedRule)
    } catch (error) {
      console.error('Error toggling rule:', error)
      alert('Failed to update rule. Please try again.')
    }
  }

  const handleRuleCreated = (rule: Rule) => {
    onRuleCreated(rule)
    setIsBuilderOpen(false)
  }

  const handleFiltersChange = useCallback((newFilters: RuleFiltersType) => {
    setFilters(prevFilters => {
      // Only update if filters actually changed
      if (JSON.stringify(prevFilters) !== JSON.stringify(newFilters)) {
        return newFilters
      }
      return prevFilters
    })
  }, [])

  const handleDragEnd = useCallback(async (result: DropResult) => {
    if (!result.destination) return

    // Clear any previous errors
    clearError()

    // Use the current filteredRules for drag operation, but make sure they're sorted by priority
    const sortedRules = sortRulesByPriority(filteredRules)
    const reorderedRules = await reorderRules(result, sortedRules, rosterId)
    
    if (reorderedRules) {
      // Update both parent component and local state
      reorderedRules.forEach(rule => onRuleUpdated(rule))
      setFilteredRules(reorderedRules)
    }
    // Note: Errors are now handled by the hook and stored in lastError
  }, [filteredRules, rosterId, reorderRules, onRuleUpdated, clearError])

  const toggleDragMode = useCallback(() => {
    setIsDragMode(!isDragMode)
    // When entering drag mode, ensure rules are sorted by priority
    if (!isDragMode) {
      const sortedRules = sortRulesByPriority(filteredRules)
      setFilteredRules(sortedRules)
    }
  }, [isDragMode, filteredRules])

  const getEmptyStateMessage = () => {
    if (rules.length === 0) {
      return {
        icon: "🎯",
        title: "No placement rules created yet",
        message: "Transform your classroom with intelligent seating! Create rules to automatically arrange students based on your teaching strategy.",
        subMessage: "Rules help you separate disruptive pairs, group collaborative students, place visual learners in front, and much more.",
        action: "Create Your First Rule",
        actionType: "create" as const,
        helpItems: [
          "🤝 Group students who work well together",
          "🚫 Separate students who distract each other", 
          "👀 Place visual learners near the front",
          "🚪 Position students with mobility needs near exits"
        ]
      }
    } else if (filteredRules.length === 0) {
      return {
        icon: "🔍",
        title: "No rules match your current filters",
        message: "Your search didn't return any results. Try adjusting your filters or search terms.",
        subMessage: `You have ${rules.length} total rule${rules.length === 1 ? '' : 's'} that ${rules.length === 1 ? 'doesn\'t' : 'don\'t'} match the current criteria.`,
        action: "Clear All Filters",
        actionType: "clear" as const,
        helpItems: [
          "🔄 Clear filters to see all rules",
          "📝 Try different search terms",
          "🏷️ Check different rule types",
          "📊 Toggle between active/inactive status"
        ]
      }
    }
    return null
  }

  const emptyState = getEmptyStateMessage()

  if (compact) {
    return (
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="text-lg">📋</div>
            <h3 className="text-md font-semibold text-gray-700">
              Rules
            </h3>
            <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
              {filteredRules.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleDragMode}
              className={`px-3 py-2 text-sm rounded-lg font-medium transition-colors ${
                isDragMode
                  ? 'bg-green-100 text-green-800 border border-green-300'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {isDragMode ? '✅ Reorder' : '⋮⋮ Reorder'}
            </button>
            <button
              onClick={handleCreateRule}
              className="px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
            >
              ✏️ Rule
            </button>
          </div>
        </div>

        {emptyState ? (
          <div className="text-center py-6 px-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
            <div className="text-3xl mb-3">{emptyState.icon}</div>
            <h4 className="text-md font-semibold text-gray-800 mb-2">{emptyState.title}</h4>
            <p className="text-xs text-gray-600 mb-3">{emptyState.message}</p>
            <button
              onClick={emptyState.actionType === "clear" ? () => setFilters({}) : handleCreateRule}
              className="px-4 py-2 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              {emptyState.action}
            </button>
          </div>
        ) : isDragMode ? (
          <div className="space-y-1">
            {/* Drag mode indicator */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
              <div className="flex items-center gap-2 text-blue-800">
                <div className="text-lg">⋮⋮</div>
                <div className="text-sm font-medium">Drag Mode Active</div>
                <div className="text-xs text-blue-600">Click and drag the dots to reorder rules</div>
              </div>
            </div>
            
            <DragDropContext onDragEnd={handleDragEnd} droppableId={`rules-compact-${rosterId}`}>
              {filteredRules.map((rule, index) => (
                <DraggableItem
                  key={rule.id}
                  draggableId={rule.id}
                  index={index}
                  isDragDisabled={isReordering}
                >
                  <RuleItem
                    rule={rule}
                    students={students}
                    onEdit={handleEditRule}
                    onDelete={handleDeleteRule}
                    onToggleActive={handleToggleActive}
                    displayOptions={{ compact: true }}
                    totalRules={filteredRules.length}
                  />
                </DraggableItem>
              ))}
            </DragDropContext>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredRules.map(rule => (
              <RuleItem
                key={rule.id}
                rule={rule}
                students={students}
                onEdit={handleEditRule}
                onDelete={handleDeleteRule}
                onToggleActive={handleToggleActive}
                displayOptions={{ compact: true }}
                totalRules={filteredRules.length}
              />
            ))}
          </div>
        )}

        <RuleBuilderModal
          isOpen={isBuilderOpen}
          onClose={() => setIsBuilderOpen(false)}
          rosterId={rosterId}
          students={students}
          onRuleCreated={handleRuleCreated}
          editingRule={editingRule}
        />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="text-2xl">📋</div>
            <h3 className="text-xl font-bold text-gray-900">
              Placement Rules
            </h3>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <p className="text-sm text-gray-600">
              Manage seating preferences and constraints for your classroom
            </p>
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                {filteredRules.length} shown
              </span>
              {filteredRules.length !== rules.length && (
                <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                  {rules.length} total
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={toggleDragMode}
            className={`px-4 py-3 rounded-lg font-medium transition-colors border ${
              isDragMode
                ? 'bg-green-100 text-green-800 border-green-300 shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border-gray-300'
            }`}
            title={isDragMode ? 'Exit reorder mode' : 'Enable drag to reorder rules by priority'}
          >
            {isDragMode ? '✅ Reordering Mode' : '⋮⋮ Reorder Rules'}
          </button>
          <button
            onClick={handleCreateRule}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm hover:shadow-md"
          >
            ✏️ Create Rule
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="p-4 space-y-4">
          <RuleSearch
            filters={filters}
            onFiltersChange={handleFiltersChange}
            placeholder="Search rules by type or description..."
          />
          
          <RuleFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            totalRules={rules.length}
            filteredRules={filteredRules.length}
          />
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Applying filters...</span>
        </div>
      )}

      {/* Loading/Reordering State */}
      {(isLoading || isReordering) && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">
            {isReordering ? 'Updating rule priorities...' : 'Applying filters...'}
          </span>
        </div>
      )}

      {/* Error Display */}
      {lastError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="text-red-600 mr-3">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-medium text-red-800">Rule Reordering Error</h3>
                <p className="text-sm text-red-700 mt-1">{lastError}</p>
              </div>
            </div>
            <button
              onClick={clearError}
              className="text-red-600 hover:text-red-800 transition-colors"
              title="Dismiss error"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Rules List */}
      {!isLoading && !isReordering && emptyState ? (
        <div className="py-16 px-8 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-xl border-2 border-dashed border-blue-300">
          <div className="max-w-md mx-auto text-center">
            <div className="text-6xl mb-6">{emptyState.icon}</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              {emptyState.title}
            </h3>
            <p className="text-gray-700 mb-2 leading-relaxed">
              {emptyState.message}
            </p>
            <p className="text-sm text-gray-600 mb-6">
              {emptyState.subMessage}
            </p>
            
            {emptyState.helpItems && (
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">💡 What you can do:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {emptyState.helpItems.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-gray-600 bg-white/60 rounded-lg px-3 py-2">
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <button
              onClick={emptyState.actionType === "clear" ? () => setFilters({}) : handleCreateRule}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
            >
              {emptyState.action}
            </button>
          </div>
        </div>
      ) : !isLoading && !isReordering && isDragMode ? (
        <div className="space-y-3">
          {/* Drag mode indicator */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-3 text-blue-800">
              <div className="text-xl">⋮⋮</div>
              <div className="text-base font-medium">Drag Mode Active</div>
              <div className="text-sm text-blue-600">Click and drag the dots on the left to reorder rules by priority</div>
            </div>
          </div>
          
          <DragDropContext onDragEnd={handleDragEnd} droppableId={`rules-full-${rosterId}`}>
            {filteredRules.map((rule, index) => (
              <DraggableItem
                key={rule.id}
                draggableId={rule.id}
                index={index}
                isDragDisabled={isReordering}
              >
                <div className="animate-fadeIn" style={{animationDelay: `${index * 50}ms`}}>
                  <RuleItem
                    rule={rule}
                    students={students}
                    onEdit={handleEditRule}
                    onDelete={handleDeleteRule}
                    onToggleActive={handleToggleActive}
                    displayOptions={{
                      showDescriptions: true,
                      showCreatedDate: true,
                      showUpdatedDate: false,
                      compact: false
                    }}
                    totalRules={filteredRules.length}
                  />
                </div>
              </DraggableItem>
            ))}
          </DragDropContext>
        </div>
      ) : (
        !isLoading && !isReordering && (
          <div className="space-y-3">
            {filteredRules.map((rule, index) => (
              <div key={rule.id} className="animate-fadeIn" style={{animationDelay: `${index * 50}ms`}}>
                <RuleItem
                  rule={rule}
                  students={students}
                  onEdit={handleEditRule}
                  onDelete={handleDeleteRule}
                  onToggleActive={handleToggleActive}
                  displayOptions={{
                    showDescriptions: true,
                    showCreatedDate: true,
                    showUpdatedDate: false,
                    compact: false
                  }}
                  totalRules={filteredRules.length}
                />
              </div>
            ))}
          </div>
        )
      )}

      {/* Rule Builder Modal */}
      <RuleBuilderModal
        isOpen={isBuilderOpen}
        onClose={() => setIsBuilderOpen(false)}
        rosterId={rosterId}
        students={students}
        onRuleCreated={handleRuleCreated}
        editingRule={editingRule}
      />
    </div>
  )
}