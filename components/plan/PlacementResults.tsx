'use client'

import React from 'react'
import { PlacementResult } from '@/types/placement'
import { Student } from '@/lib/db'
import { RULE_TYPES } from '@/types/rule'

interface PlacementResultsProps {
  isOpen: boolean
  result: PlacementResult
  students: Student[]
  onClose: () => void
  onApplyPlacements: () => void
}

export default function PlacementResultsModal({ 
  isOpen, 
  result, 
  students,
  onClose, 
  onApplyPlacements 
}: PlacementResultsProps) {
  if (!isOpen) return null

  const getStudentName = (studentId: string): string => {
    const student = students.find(s => s.id === studentId)
    return student ? `${student.first_name} ${student.last_name}` : studentId
  }

  const satisfiedRules = result.ruleSatisfaction.filter(r => r.satisfied)
  const unsatisfiedRules = result.ruleSatisfaction.filter(r => !r.satisfied)

  const successRate = result.ruleSatisfaction.length > 0 
    ? (satisfiedRules.length / result.ruleSatisfaction.length) * 100 
    : 100

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="text-3xl">
                {result.success ? '✅' : '⚠️'}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Placement Results
                </h2>
                <p className="text-sm text-gray-600">
                  Completed in {result.executionTime}ms
                </p>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-800">
                {result.placements.length}
              </div>
              <div className="text-sm text-green-600">Students Placed</div>
            </div>
            
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-red-800">
                {result.unplacedStudents.length}
              </div>
              <div className="text-sm text-red-600">Unplaced</div>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-800">
                {satisfiedRules.length}
              </div>
              <div className="text-sm text-blue-600">Rules Satisfied</div>
            </div>
            
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-purple-800">
                {Math.round(successRate)}%
              </div>
              <div className="text-sm text-purple-600">Success Rate</div>
            </div>
          </div>

          {/* Success/Failure Message */}
          {result.success ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2">
                <span className="text-green-600 text-lg">🎉</span>
                <span className="font-medium text-green-800">
                  Placement Successful!
                </span>
              </div>
              <p className="text-sm text-green-700 mt-1">
                All students have been placed according to your rules and preferences.
              </p>
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2">
                <span className="text-yellow-600 text-lg">⚠️</span>
                <span className="font-medium text-yellow-800">
                  Partial Placement
                </span>
              </div>
              <p className="text-sm text-yellow-700 mt-1">
                Some constraints could not be satisfied. See details below.
              </p>
            </div>
          )}

          <div className="space-y-6">
            {/* Satisfied Rules */}
            {satisfiedRules.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="text-green-600">✅</span>
                  Satisfied Rules ({satisfiedRules.length})
                </h3>
                <div className="space-y-2">
                  {satisfiedRules.map((rule) => (
                    <div key={rule.ruleId} className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-green-800">
                          {RULE_TYPES[rule.ruleType as keyof typeof RULE_TYPES]?.name || rule.ruleType}
                        </span>
                        <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded-full">
                          Priority {rule.priority}
                        </span>
                      </div>
                      <div className="text-sm text-green-700">
                        Students: {rule.affectedStudents.map(getStudentName).join(', ')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Unsatisfied Rules */}
            {unsatisfiedRules.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="text-red-600">❌</span>
                  Unsatisfied Rules ({unsatisfiedRules.length})
                </h3>
                <div className="space-y-2">
                  {unsatisfiedRules.map((rule) => (
                    <div key={rule.ruleId} className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-red-800">
                          {RULE_TYPES[rule.ruleType as keyof typeof RULE_TYPES]?.name || rule.ruleType}
                        </span>
                        <span className="text-xs bg-red-200 text-red-800 px-2 py-1 rounded-full">
                          Priority {rule.priority}
                        </span>
                      </div>
                      <div className="text-sm text-red-700 mb-1">
                        Students: {rule.affectedStudents.map(getStudentName).join(', ')}
                      </div>
                      {rule.reason && (
                        <div className="text-xs text-red-600 italic">
                          Reason: {rule.reason}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Conflicts */}
            {result.conflicts.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="text-orange-600">⚠️</span>
                  Conflicts ({result.conflicts.length})
                </h3>
                <div className="space-y-2">
                  {result.conflicts.map((conflict, index) => (
                    <div key={index} className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-orange-800">
                          {conflict.conflictType.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="text-sm text-orange-700 mb-1">
                        {conflict.description}
                      </div>
                      {conflict.affectedStudents.length > 0 && (
                        <div className="text-xs text-orange-600">
                          Affected: {conflict.affectedStudents.map(getStudentName).join(', ')}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Unplaced Students */}
            {result.unplacedStudents.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="text-gray-600">👤</span>
                  Unplaced Students ({result.unplacedStudents.length})
                </h3>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <div className="text-sm text-gray-700">
                    {result.unplacedStudents.map(getStudentName).join(', ')}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            
            <button
              onClick={onApplyPlacements}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              disabled={result.placements.length === 0}
            >
              Apply Placements
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}