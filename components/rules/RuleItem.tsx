'use client'

import { Rule, RULE_TYPES, RuleDisplayOptions } from '@/types/rule'
import { Student } from '@/lib/db'

interface RuleItemProps {
  rule: Rule
  students: Student[]
  onEdit: (rule: Rule) => void
  onDelete: (ruleId: string) => void
  onToggleActive: (ruleId: string) => void
  displayOptions?: RuleDisplayOptions
  totalRules?: number
}

export default function RuleItem({ 
  rule, 
  students, 
  onEdit, 
  onDelete, 
  onToggleActive,
  displayOptions = {
    showDescriptions: true,
    showCreatedDate: true,
    showUpdatedDate: false,
    compact: false
  },
  totalRules = 10
}: RuleItemProps) {
  const getStudentNames = () => {
    const studentObjects = rule.student_ids
      .map(id => students.find(s => s.id === id))
      .filter(student => student !== undefined)
    
    return studentObjects.map(student => `${student!.first_name} ${student!.last_name}`)
  }

  const getStudentNamesString = () => {
    return getStudentNames().join(', ')
  }


  const getPriorityColor = (priority: number) => {
    if (priority <= 2) return 'text-green-700 bg-green-100 border-green-200'
    if (priority <= 5) return 'text-amber-700 bg-amber-100 border-amber-200'
    return 'text-red-700 bg-red-100 border-red-200'
  }

  const getPriorityLabel = (priority: number, totalRules: number = 10) => {
    const percentage = (totalRules - priority + 1) / totalRules
    
    if (percentage >= 0.8) return { label: 'Highest Priority', icon: '🔥' }
    if (percentage >= 0.6) return { label: 'High Priority', icon: '⚡' }
    if (percentage >= 0.4) return { label: 'Medium Priority', icon: '📍' }
    if (percentage >= 0.2) return { label: 'Low Priority', icon: '📝' }
    return { label: 'Lowest Priority', icon: '💤' }
  }

  const getPriorityNumber = (priority: number) => {
    // Format priority ordinals (1st, 2nd, 3rd, etc.)
    if (priority % 10 === 1 && priority % 100 !== 11) return `${priority}st`
    if (priority % 10 === 2 && priority % 100 !== 12) return `${priority}nd`
    if (priority % 10 === 3 && priority % 100 !== 13) return `${priority}rd`
    return `${priority}th`
  }

  const getRuleTypeColor = (type: string) => {
    const colorMap = {
      'SEPARATE': 'bg-red-50 border-red-200',
      'TOGETHER': 'bg-green-50 border-green-200',
      'FRONT_ROW': 'bg-blue-50 border-blue-200',
      'BACK_ROW': 'bg-indigo-50 border-indigo-200',
      'NEAR_TEACHER': 'bg-purple-50 border-purple-200',
      'NEAR_DOOR': 'bg-orange-50 border-orange-200'
    }
    return colorMap[type as keyof typeof colorMap] || 'bg-gray-50 border-gray-200'
  }

  const getRuleTypeIcon = (type: string) => {
    const icons = {
      'SEPARATE': '🚫',
      'TOGETHER': '🤝',
      'FRONT_ROW': '📍',
      'BACK_ROW': '📍',
      'NEAR_TEACHER': '👨‍🏫',
      'NEAR_DOOR': '🚪'
    }
    return icons[type as keyof typeof icons] || '📋'
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  if (displayOptions.compact) {
    const priorityInfo = getPriorityLabel(rule.priority, totalRules)
    return (
      <div className={`p-4 border-2 rounded-xl transition-all duration-200 hover:shadow-md ${
        rule.is_active 
          ? `bg-white ${getRuleTypeColor(rule.type)} border-l-4 border-l-blue-400` 
          : 'bg-gray-50 border-gray-300 opacity-75'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1">
            <div className="text-2xl">{getRuleTypeIcon(rule.type)}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-2">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${
                  rule.is_active 
                    ? 'bg-green-100 text-green-800 border-green-300' 
                    : 'bg-gray-100 text-gray-600 border-gray-300'
                }`}>
                  {rule.is_active ? '✅ Active' : '❌ Inactive'}
                </span>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${getPriorityColor(rule.priority)}`}>
                  {priorityInfo.icon} #{getPriorityNumber(rule.priority)}
                </span>
              </div>
              <h4 className="font-bold text-sm text-gray-900 truncate mb-1">
                {RULE_TYPES[rule.type].name}
              </h4>
              <div className="flex items-center gap-1 text-xs text-gray-600">
                <span className="font-medium">Students:</span>
                <div className="flex flex-wrap gap-1">
                  {getStudentNames().slice(0, 3).map((name, idx) => (
                    <span key={idx} className="px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded text-xs">
                      {name}
                    </span>
                  ))}
                  {getStudentNames().length > 3 && (
                    <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                      +{getStudentNames().length - 3} more
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="flex space-x-1 ml-2">
            <button
              onClick={() => onToggleActive(rule.id)}
              className={`p-1.5 rounded text-sm ${
                rule.is_active 
                  ? 'text-yellow-600 hover:bg-yellow-50' 
                  : 'text-green-600 hover:bg-green-50'
              }`}
              title={rule.is_active ? 'Deactivate rule' : 'Activate rule'}
            >
              {rule.is_active ? '⏸️' : '▶️'}
            </button>
            <button
              onClick={() => onEdit(rule)}
              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded text-sm"
              title="Edit rule"
            >
              ✏️
            </button>
            <button
              onClick={() => onDelete(rule.id)}
              className="p-1.5 text-red-600 hover:bg-red-50 rounded text-sm"
              title="Delete rule"
            >
              🗑️
            </button>
          </div>
        </div>
      </div>
    )
  }

  const priorityInfo = getPriorityLabel(rule.priority, totalRules)
  
  return (
    <div className={`p-6 border-2 rounded-xl transition-all duration-200 hover:shadow-lg ${
      rule.is_active 
        ? `bg-white ${getRuleTypeColor(rule.type)} border-l-4 border-l-blue-500 shadow-sm` 
        : 'bg-gray-50 border-gray-300 opacity-80'
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* Header with Icon and Status */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="text-4xl p-2 rounded-lg bg-white/50">{getRuleTypeIcon(rule.type)}</div>
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <span className={`px-3 py-1 text-xs font-bold rounded-full border ${
                    rule.is_active 
                      ? 'bg-green-100 text-green-800 border-green-300' 
                      : 'bg-gray-100 text-gray-600 border-gray-300'
                  }`}>
                    {rule.is_active ? '✅ ACTIVE' : '❌ INACTIVE'}
                  </span>
                  <span className={`px-3 py-1 text-xs font-bold rounded-full border ${getPriorityColor(rule.priority)}`}>
                    {priorityInfo.icon} PRIORITY #{getPriorityNumber(rule.priority)}
                  </span>
                </div>
                <h4 className="font-bold text-xl text-gray-900">
                  {RULE_TYPES[rule.type].name}
                </h4>
              </div>
            </div>
          </div>

          {/* Students Affected */}
          <div className="mb-4">
            <div className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <span>👥 Affected Students</span>
              <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                {getStudentNames().length}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {getStudentNames().map((name, idx) => (
                <span key={idx} className="px-3 py-2 bg-blue-50 text-blue-900 rounded-lg border border-blue-200 text-sm font-medium">
                  {name}
                </span>
              ))}
              {getStudentNames().length === 0 && (
                <span className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg border border-gray-200 text-sm italic">
                  No students selected
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          {displayOptions.showDescriptions && (
            <div className="mb-4">
              <div className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <span>📝 Rule Description</span>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-900 font-medium leading-relaxed">
                  {RULE_TYPES[rule.type].description}
                </p>
              </div>
            </div>
          )}

          {/* Dates */}
          <div className="flex flex-wrap gap-4 text-xs text-gray-500">
            {displayOptions.showCreatedDate && (
              <div>
                <span className="font-medium">Created:</span> {formatDate(rule.created_at)}
              </div>
            )}
            {displayOptions.showUpdatedDate && (
              <div>
                <span className="font-medium">Updated:</span> {formatDate(rule.updated_at)}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col space-y-3 ml-6 min-w-[120px]">
          <button
            onClick={() => onToggleActive(rule.id)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 border-2 shadow-sm hover:shadow-md ${
              rule.is_active 
                ? 'bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200 hover:border-amber-400' 
                : 'bg-green-100 text-green-800 border-green-300 hover:bg-green-200 hover:border-green-400'
            }`}
            title={rule.is_active ? 'Deactivate rule' : 'Activate rule'}
          >
            {rule.is_active ? '⏸️ Pause' : '▶️ Activate'}
          </button>
          
          <button
            onClick={() => onEdit(rule)}
            className="px-4 py-2 bg-blue-100 text-blue-800 border-2 border-blue-300 hover:bg-blue-200 hover:border-blue-400 rounded-xl text-sm font-semibold transition-all duration-200 shadow-sm hover:shadow-md"
            title="Edit rule"
          >
            ✏️ Edit
          </button>
          
          <button
            onClick={() => onDelete(rule.id)}
            className="px-4 py-2 bg-red-100 text-red-800 border-2 border-red-300 hover:bg-red-200 hover:border-red-400 rounded-xl text-sm font-semibold transition-all duration-200 shadow-sm hover:shadow-md"
            title="Delete rule"
          >
            🗑️ Delete
          </button>
        </div>
      </div>
    </div>
  )
}