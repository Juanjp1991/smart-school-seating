'use client'

import { useState, useEffect } from 'react'
import { Rule, CreateRuleData, RULE_TYPES, RuleType } from '@/types/rule'
import { ruleService } from '@/lib/ruleService'
import { Student } from '@/lib/db'

interface RuleBuilderModalProps {
  isOpen: boolean
  onClose: () => void
  rosterId: string
  students: Student[]
  onRuleCreated: (rule: Rule) => void
  editingRule?: Rule | null
}

export default function RuleBuilderModal({ 
  isOpen, 
  onClose, 
  rosterId, 
  students, 
  onRuleCreated,
  editingRule = null
}: RuleBuilderModalProps) {
  const [selectedStudents, setSelectedStudents] = useState<string[]>([])
  const [ruleType, setRuleType] = useState<RuleType>('SEPARATE')
  const [priority, setPriority] = useState<number>(1)
  const [isActive, setIsActive] = useState<boolean>(true)
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      resetForm()
    }
  }, [isOpen])

  const resetForm = () => {
    setSelectedStudents([])
    setRuleType('SEPARATE')
    setPriority(1)
    setIsActive(true)
    setSearchTerm('')
    setError('')
    setIsSubmitting(false)
  }

  const filteredStudents = students.filter(student => {
    const searchLower = searchTerm.toLowerCase()
    const fullName = `${student.first_name} ${student.last_name}`.toLowerCase()
    return fullName.includes(searchLower) || 
           (student.student_id && student.student_id.toLowerCase().includes(searchLower))
  })

  const handleStudentToggle = (studentId: string) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    )
  }

  const handleSelectAll = () => {
    if (selectedStudents.length === filteredStudents.length) {
      setSelectedStudents([])
    } else {
      setSelectedStudents(filteredStudents.map(s => s.id))
    }
  }

  const validateForm = (): string | null => {
    if (selectedStudents.length === 0) {
      return 'Please select at least one student'
    }

    if ((ruleType === 'SEPARATE' || ruleType === 'TOGETHER') && selectedStudents.length < 2) {
      return `${RULE_TYPES[ruleType].name} requires at least 2 students`
    }

    if (priority < 1) {
      return 'Priority must be at least 1'
    }

    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      const ruleData: CreateRuleData = {
        priority,
        type: ruleType,
        student_ids: selectedStudents,
        is_active: isActive
      }

      const newRule = await ruleService.createRule(rosterId, ruleData)
      onRuleCreated(newRule)
      onClose()
    } catch (err) {
      console.error('Error creating rule:', err)
      setError(err instanceof Error ? err.message : 'Failed to create rule')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Create Placement Rule</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
            disabled={isSubmitting}
          >
            ×
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Select Students */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Step 1: Select Students</h3>
            
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
                disabled={isSubmitting}
              />
            </div>

            <div className="mb-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedStudents.length === filteredStudents.length && filteredStudents.length > 0}
                  onChange={handleSelectAll}
                  disabled={isSubmitting}
                  className="mr-2"
                />
                <span>Select all ({filteredStudents.length} students)</span>
              </label>
            </div>

            <div className="max-h-60 overflow-y-auto border border-gray-300 rounded">
              {filteredStudents.length === 0 ? (
                <div className="p-4 text-gray-500 text-center">
                  No students found
                </div>
              ) : (
                filteredStudents.map(student => (
                  <label key={student.id} className="flex items-center p-3 hover:bg-gray-50 border-b border-gray-200 last:border-b-0">
                    <input
                      type="checkbox"
                      checked={selectedStudents.includes(student.id)}
                      onChange={() => handleStudentToggle(student.id)}
                      disabled={isSubmitting}
                      className="mr-3"
                    />
                    <div className="flex-1">
                      <div className="font-medium">
                        {student.first_name} {student.last_name}
                      </div>
                      {student.student_id && (
                        <div className="text-sm text-gray-500">
                          ID: {student.student_id}
                        </div>
                      )}
                    </div>
                  </label>
                ))
              )}
            </div>
          </div>

          {/* Step 2: Choose Rule Type */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Step 2: Choose Rule Type</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Object.entries(RULE_TYPES).map(([key, rule]) => (
                <label key={key} className="flex items-start p-3 border border-gray-300 rounded hover:bg-gray-50 cursor-pointer">
                  <input
                    type="radio"
                    name="ruleType"
                    value={key}
                    checked={ruleType === key}
                    onChange={(e) => setRuleType(e.target.value as RuleType)}
                    disabled={isSubmitting}
                    className="mt-1 mr-3"
                  />
                  <div className="flex-1">
                    <div className="font-medium">{rule.name}</div>
                    <div className="text-sm text-gray-600">{rule.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Step 3: Set Priority */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Step 3: Set Priority</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Priority: {priority} (Higher numbers = higher priority)
                </label>
                <input
                  type="number"
                  min="1"
                  max="99"
                  value={priority}
                  onChange={(e) => setPriority(parseInt(e.target.value) || 1)}
                  className="w-24 p-2 border border-gray-300 rounded"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    disabled={isSubmitting}
                    className="mr-2"
                  />
                  <span>Rule is active</span>
                </label>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Create Rule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}