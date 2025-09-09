'use client'

import React from 'react'
import { Student, DisplayOptions, StudentDisplayData } from '@/types/display'
import { RATING_CATEGORIES } from '@/types/display'

interface StudentCardProps {
  studentData: StudentDisplayData
  onClick?: () => void
  className?: string
  isDragging?: boolean
}

export default function StudentCard({ 
  studentData, 
  onClick, 
  className = '', 
  isDragging = false 
}: StudentCardProps) {
  const { student, displayOptions, position } = studentData
  const { showPhoto, showName, showRatings, ratingCategories, compactMode, simpleView } = displayOptions

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0).toUpperCase()}${lastName.charAt(0).toUpperCase()}`
  }

  const getRatingDisplay = (category: string, value: number | undefined) => {
    if (value === undefined || value < 1 || value > 5) return null
    
    const config = RATING_CATEGORIES[category as keyof typeof RATING_CATEGORIES]
    if (!config) return null

    const filledStars = Math.min(value, 5)
    const emptyStars = 5 - filledStars
    
    return (
      <div className="flex items-center space-x-1 text-xs">
        <span className="text-gray-600">{config.label}:</span>
        <div className="flex">
          {Array.from({ length: filledStars }, (_, i) => (
            <span key={i}>{config.colorScale[i]}</span>
          ))}
          {Array.from({ length: emptyStars }, (_, i) => (
            <span key={i}>⚫</span>
          ))}
        </div>
        <span className="text-gray-500">({value}/5)</span>
      </div>
    )
  }

  const relevantRatings = ratingCategories.filter(category => 
    student.ratings && student.ratings[category] !== undefined
  )

  // Simple view - only show name, centered and clean
  if (simpleView) {
    return (
      <div
        onClick={onClick}
        className={`
          relative bg-white border-2 border-gray-200 rounded-lg p-4 
          hover:border-blue-400 transition-colors cursor-pointer
          ${isDragging ? 'opacity-50 shadow-lg' : 'shadow-sm'}
          ${className}
          flex items-center justify-center
          min-h-[60px]
        `}
        style={{
          gridColumn: position.col + 1,
          gridRow: position.row + 1
        }}
      >
        <div className="text-center">
          <h3 className="font-semibold text-gray-900 text-sm">
            {student.first_name} {student.last_name}
          </h3>
        </div>
      </div>
    )
  }

  if (compactMode) {
    return (
      <div
        onClick={onClick}
        className={`
          relative bg-white border-2 border-gray-200 rounded-lg p-2 
          hover:border-blue-400 transition-colors cursor-pointer
          ${isDragging ? 'opacity-50 shadow-lg' : 'shadow-sm'}
          ${className}
        `}
        style={{
          gridColumn: position.col + 1,
          gridRow: position.row + 1
        }}
      >
        <div className="flex items-center space-x-2">
          {showPhoto && student.photo ? (
            <img
              src={student.photo}
              alt={`${student.first_name} ${student.last_name}`}
              className="w-8 h-8 rounded-full object-cover border border-gray-300"
            />
          ) : showPhoto ? (
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600 border border-gray-300">
              {getInitials(student.first_name, student.last_name)}
            </div>
          ) : null}
          
          {showName && (
            <div className="text-sm font-medium text-gray-900 truncate">
              {student.first_name} {student.last_name}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div
      onClick={onClick}
      className={`
        relative bg-white border-2 border-gray-200 rounded-lg p-3 
        hover:border-blue-400 transition-all cursor-pointer
        ${isDragging ? 'opacity-50 shadow-lg' : 'shadow-sm hover:shadow-md'}
        ${className}
        min-w-[200px] max-w-[250px]
      `}
      style={{
        gridColumn: position.col + 1,
        gridRow: position.row + 1
      }}
    >
      {/* Photo Section */}
      {showPhoto && (
        <div className="flex justify-center mb-2">
          {student.photo ? (
            <img
              src={student.photo}
              alt={`${student.first_name} ${student.last_name}`}
              className="w-16 h-16 rounded-full object-cover border-2 border-gray-300 shadow-sm"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-xl border-2 border-white shadow-sm">
              {getInitials(student.first_name, student.last_name)}
            </div>
          )}
        </div>
      )}

      {/* Name Section */}
      {showName && (
        <div className="text-center mb-2">
          <h3 className="font-semibold text-gray-900 text-sm leading-tight">
            {student.first_name} {student.last_name}
          </h3>
          {student.student_id && (
            <p className="text-xs text-gray-500 mt-1">ID: {student.student_id}</p>
          )}
        </div>
      )}

      {/* Ratings Section */}
      {showRatings && relevantRatings.length > 0 && (
        <div className="space-y-1 border-t border-gray-100 pt-2">
          {relevantRatings.map(category => (
            <div key={category}>
              {getRatingDisplay(category, student.ratings?.[category])}
            </div>
          ))}
        </div>
      )}

      {/* Drag Handle */}
      <div className="absolute top-1 right-1 text-gray-400 hover:text-gray-600 cursor-move">
        ⋮⋮
      </div>
    </div>
  )
}