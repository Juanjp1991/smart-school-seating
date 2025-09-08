'use client'

import React from 'react'
import { PlacementProgress } from '@/types/placement'

interface PlacementProgressProps {
  isOpen: boolean
  progress: PlacementProgress
  onCancel: () => void
}

export default function PlacementProgressModal({ isOpen, progress, onCancel }: PlacementProgressProps) {
  if (!isOpen) return null

  const overallProgress = progress.totalStudents > 0 
    ? (progress.studentsPlaced / progress.totalStudents) * 100 
    : 0

  const rulesProgress = progress.totalRules > 0 
    ? (progress.rulesProcessed / progress.totalRules) * 100 
    : 0

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
        <div className="text-center">
          <div className="text-2xl mb-4">🎯</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Auto Placement in Progress
          </h2>
          
          <div className="text-sm text-gray-600 mb-6">
            {progress.currentStep}
          </div>

          {/* Overall Progress */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Overall Progress</span>
              <span className="text-sm text-gray-500">{Math.round(overallProgress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${overallProgress}%` }}
              ></div>
            </div>
          </div>

          {/* Students Progress */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-gray-600">Students Placed</span>
              <span className="text-xs text-gray-500">
                {progress.studentsPlaced} of {progress.totalStudents}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${overallProgress}%` }}
              ></div>
            </div>
          </div>

          {/* Rules Progress */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-gray-600">Rules Processed</span>
              <span className="text-xs text-gray-500">
                {progress.rulesProcessed} of {progress.totalRules}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${rulesProgress}%` }}
              ></div>
            </div>
          </div>

          {/* Current Rule Details */}
          {progress.currentRule && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <div className="text-sm font-medium text-blue-900 mb-1">
                Processing: {progress.currentRule.type.replace('_', ' ')}
              </div>
              <div className="text-xs text-blue-700">
                {progress.currentRule.description}
              </div>
            </div>
          )}

          {/* Status List */}
          <div className="space-y-2 mb-6 text-left">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-green-600">✅</span>
              <span className="text-gray-700">Inputs validated</span>
            </div>
            
            {progress.rulesProcessed > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-green-600">✅</span>
                <span className="text-gray-700">{progress.rulesProcessed} rule(s) processed</span>
              </div>
            )}
            
            {progress.studentsPlaced > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-green-600">✅</span>
                <span className="text-gray-700">{progress.studentsPlaced} student(s) placed</span>
              </div>
            )}

            <div className="flex items-center gap-2 text-sm">
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
              <span className="text-gray-600">{progress.currentStep}</span>
            </div>
          </div>

          {/* Cancel Button */}
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
          >
            Cancel Placement
          </button>
        </div>
      </div>
    </div>
  )
}

// Export the modal component
export { PlacementProgressModal }