'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useDisplayOptionsContext } from '@/contexts/DisplayOptionsContext'
import DisplayOptionsMenu from '@/components/plan/DisplayOptionsMenu'
import StudentCard from '@/components/plan/StudentCard'
import { dbService } from '@/lib/db'
import { StudentDisplayData, Student } from '@/types/display'
import { Layout, Roster } from '@/lib/db'

interface SeatingPlanEditorProps {
  layout: Layout
  roster: Roster
  onBack: () => void
}

export default function SeatingPlanEditor({ layout, roster, onBack }: SeatingPlanEditorProps) {
  const { options } = useDisplayOptionsContext()
  const [students, setStudents] = useState<Student[]>([])
  const [showDisplayMenu, setShowDisplayMenu] = useState(false)
  const [seatAssignments, setSeatAssignments] = useState<Record<string, { row: number; col: number }>>({})
  const displayMenuButtonRef = useRef<HTMLButtonElement>(null)

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
              <button
                ref={displayMenuButtonRef}
                onClick={() => setShowDisplayMenu(!showDisplayMenu)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <span>Display Options</span>
                <span>▼</span>
              </button>

              <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                Auto-Place All
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
    </div>
  )
}