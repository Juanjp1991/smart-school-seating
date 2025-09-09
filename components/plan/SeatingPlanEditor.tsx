'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useDisplayOptionsContext } from '@/contexts/DisplayOptionsContext'
import DisplayOptionsMenu from '@/components/plan/DisplayOptionsMenu'
import StudentCard from '@/components/plan/StudentCard'
import { SimpleViewToggle } from '@/components/plan/SimpleViewToggle'
import PlacementProgressModal from '@/components/plan/PlacementProgress'
import PlacementResultsModal from '@/components/plan/PlacementResults'
import { dbService } from '@/lib/db'
import { StudentDisplayData, Student } from '@/types/display'
import { Layout, Roster } from '@/lib/db'
import { usePlacement } from '@/hooks/usePlacement'
import { PlacementResult, StudentPlacement } from '@/types/placement'

interface SeatingPlanEditorProps {
  layout: Layout
  roster: Roster
  onBack: () => void
}

export default function SeatingPlanEditor({ layout, roster, onBack }: SeatingPlanEditorProps) {
  const { displayOptions: options } = useDisplayOptionsContext()
  const [students, setStudents] = useState<Student[]>([])
  const [showDisplayMenu, setShowDisplayMenu] = useState(false)
  const [seatAssignments, setSeatAssignments] = useState<Record<string, { row: number; col: number }>>({})
  const [showPlacementResults, setShowPlacementResults] = useState(false)
  const [lastPlacementResult, setLastPlacementResult] = useState<PlacementResult | null>(null)
  const displayMenuButtonRef = useRef<HTMLButtonElement>(null)
  
  // Use placement hook
  const {
    isPlacing,
    progress,
    lastResult,
    lastError,
    executePlacement,
    validateInputs,
    clearError,
    clearResults
  } = usePlacement()

  const loadStudents = useCallback(async () => {
    try {
      const studentList = await dbService.getAllStudentsForRoster(roster.id)
      setStudents(studentList)
    } catch (error) {
      console.error('Error loading students:', error)
    }
  }, [roster.id])

  useEffect(() => {
    loadStudents()
  }, [loadStudents])

  const handleStudentClick = (student: Student) => {
    // In a real implementation, this would handle student selection/editing
    console.log('Student clicked:', student)
  }

  const handleAutoPlace = async () => {
    // Clear any previous errors
    clearError()
    clearResults()

    // First validate inputs
    const validation = await validateInputs(roster.id, students, layout)
    if (!validation || !validation.valid) {
      alert(`Cannot start placement: ${validation?.errors.join(', ') || 'Validation failed'}`)
      return
    }

    // Show warnings if any
    if (validation.warnings.length > 0) {
      const proceed = confirm(
        `Placement will proceed with warnings:\n${validation.warnings.join('\n')}\n\nContinue?`
      )
      if (!proceed) return
    }

    // Clear existing placements option
    const clearExisting = confirm('Clear existing seat assignments before auto-placement?')

    try {
      const result = await executePlacement(roster.id, students, layout, {
        clearExisting,
        allowPartialPlacement: true
      })

      if (result) {
        setLastPlacementResult(result)
        
        // Auto-apply the placements immediately
        if (result.success && result.placements.length > 0) {
          const newAssignments: Record<string, { row: number; col: number }> = {}
          
          // If clearExisting was chosen, start fresh, otherwise preserve existing
          if (!clearExisting) {
            // Preserve existing assignments
            Object.assign(newAssignments, seatAssignments)
          }
          
          // Apply new placements
          result.placements.forEach(placement => {
            newAssignments[placement.studentId] = {
              row: placement.seatPosition.row,
              col: placement.seatPosition.col
            }
          })
          
          // Update the seat assignments state
          setSeatAssignments(newAssignments)
          
          console.log('Auto-applied placement results:', newAssignments)
        }
        
        // Still show the results for review
        setShowPlacementResults(true)
      }
    } catch (error) {
      console.error('Auto placement error:', error)
      alert('Failed to execute auto placement. Please try again.')
    }
  }

  const handleApplyPlacements = () => {
    if (!lastPlacementResult) return

    // Apply placements to seat assignments
    const newAssignments: Record<string, { row: number; col: number }> = {}
    
    lastPlacementResult.placements.forEach(placement => {
      newAssignments[placement.studentId] = {
        row: placement.seatPosition.row,
        col: placement.seatPosition.col
      }
    })

    setSeatAssignments(newAssignments)
    setShowPlacementResults(false)
    setLastPlacementResult(null)
    
    // Show success message
    const successMessage = lastPlacementResult.success
      ? `Successfully placed ${lastPlacementResult.placements.length} students!`
      : `Placed ${lastPlacementResult.placements.length} students. ${lastPlacementResult.unplacedStudents.length} could not be placed.`
    
    alert(successMessage)
  }

  const handleClearPlacements = () => {
    if (confirm('Clear all seat assignments?')) {
      setSeatAssignments({})
    }
  }

  const getSeatContent = (row: number, col: number) => {
    // Find if this seat is assigned to a student
    const assignedStudent = Object.entries(seatAssignments).find(([, pos]) => 
      pos.row === row && pos.col === col
    )

    if (assignedStudent) {
      const student = students.find(s => s.id === assignedStudent[0])
      if (student) {
        const studentData: StudentDisplayData = {
          student,
          displayOptions: options,
          position: { row, col }
        }
        return (
          <StudentCard
            studentData={studentData}
            onClick={() => handleStudentClick(student)}
          />
        )
      }
    }

    // Check if this position is a seat in the layout
    const isSeat = layout.seats?.includes(`${row}-${col}`)
    
    if (isSeat) {
      return (
        <div
          className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-4 flex items-center justify-center hover:border-gray-400 transition-colors cursor-pointer"
          onClick={() => {
            // Handle empty seat click - could open student selection
            console.log('Empty seat clicked:', { row, col })
          }}
        >
          <span className="text-gray-400 text-sm">Empty Seat</span>
        </div>
      )
    }

    // Check for furniture
    const furniture = layout.furniture?.find((f) => 
      f.positions.some(pos => pos.row === row && pos.col === col)
    )

    if (furniture) {
      return (
        <div className="bg-gray-200 border border-gray-400 rounded p-2 text-center text-xs font-medium text-gray-700">
          {furniture.type === 'desk' ? 'Desk' : 'Door'}
        </div>
      )
    }

    // Empty grid cell
    return null
  }

  const unassignedStudents = students.filter(student => 
    !seatAssignments[student.id]
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                ← Back
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {layout.name} - {roster.name}
                </h1>
                <p className="text-sm text-gray-500">
                  {layout.grid_rows} × {layout.grid_cols} layout
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <SimpleViewToggle />
              
              <button
                ref={displayMenuButtonRef}
                onClick={() => setShowDisplayMenu(!showDisplayMenu)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <span>Display Options</span>
                <span>▼</span>
              </button>

              <button 
                onClick={handleAutoPlace}
                disabled={isPlacing || students.length === 0}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                title={students.length === 0 ? 'No students in roster' : 'Automatically place students using rules'}
              >
                {isPlacing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Placing...</span>
                  </>
                ) : (
                  <>
                    <span>🎯</span>
                    <span>Auto Place</span>
                  </>
                )}
              </button>

              <button 
                onClick={handleClearPlacements}
                disabled={Object.keys(seatAssignments).length === 0}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                title="Clear all seat assignments"
              >
                Clear All
              </button>

              <button className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors">
                Export
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Unassigned Students Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Unassigned Students ({unassignedStudents.length})
              </h2>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {unassignedStudents.length === 0 ? (
                  <p className="text-gray-500 text-sm">All students assigned!</p>
                ) : (
                  unassignedStudents.map(student => (
                    <div
                      key={student.id}
                      className="p-3 border border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors cursor-pointer"
                      onClick={() => handleStudentClick(student)}
                    >
                      <div className="font-medium text-gray-900 text-sm">
                        {student.first_name} {student.last_name}
                      </div>
                      {student.student_id && (
                        <div className="text-xs text-gray-500">ID: {student.student_id}</div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Seating Grid */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Seating Arrangement</h2>
                <div className="text-sm text-gray-500">
                  Click on seats to assign students
                </div>
              </div>

              <div
                className="inline-block border border-gray-300 rounded-lg p-4 bg-gray-50"
                style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(${layout.grid_cols}, minmax(0, 1fr))`,
                  gridTemplateRows: `repeat(${layout.grid_rows}, minmax(0, 1fr))`,
                  gap: '8px',
                  width: 'fit-content'
                }}
              >
                {Array.from({ length: layout.grid_rows }, (_, row) =>
                  Array.from({ length: layout.grid_cols }, (_, col) => (
                    <div key={`${row}-${col}`}>
                      {getSeatContent(row, col)}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Display Options Menu */}
      <DisplayOptionsMenu
        isOpen={showDisplayMenu}
        onClose={() => setShowDisplayMenu(false)}
        onOptionsChange={() => {
          // Options are automatically saved via the context
        }}
        anchorElement={displayMenuButtonRef.current || undefined}
      />

      {/* Placement Progress Modal */}
      {isPlacing && progress && (
        <PlacementProgressModal
          isOpen={true}
          progress={progress}
          onCancel={() => {
            // In a real implementation, this would cancel the placement
            console.log('Placement cancelled by user')
          }}
        />
      )}

      {/* Placement Results Modal */}
      {showPlacementResults && lastPlacementResult && (
        <PlacementResultsModal
          isOpen={true}
          result={lastPlacementResult}
          students={students}
          onClose={() => {
            setShowPlacementResults(false)
            setLastPlacementResult(null)
          }}
          onApplyPlacements={handleApplyPlacements}
        />
      )}

      {/* Error Display */}
      {lastError && (
        <div className="fixed top-4 right-4 bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg z-40 max-w-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="text-red-600 mr-3">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-medium text-red-800">Placement Error</h3>
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
    </div>
  )
}