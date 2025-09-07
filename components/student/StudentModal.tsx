'use client'

import { useState, useEffect } from 'react'
import { Student, dbService } from '@/lib/db'

interface StudentModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (student: Student) => Promise<void>
  existingStudent?: Student | null
  rosterId: string
  isEditing?: boolean
}

export default function StudentModal({
  isOpen,
  onClose,
  onSave,
  existingStudent = null,
  rosterId,
  isEditing = false
}: StudentModalProps) {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [studentId, setStudentId] = useState('')
  const [errors, setErrors] = useState<{
    firstName?: string
    lastName?: string
    studentId?: string
    general?: string
  }>({})
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      if (existingStudent) {
        setFirstName(existingStudent.first_name)
        setLastName(existingStudent.last_name)
        setStudentId(existingStudent.student_id || '')
      } else {
        setFirstName('')
        setLastName('')
        setStudentId('')
      }
      setErrors({})
    }
  }, [isOpen, existingStudent])

  const validateForm = async (): Promise<boolean> => {
    const newErrors: typeof errors = {}

    // Validate first name
    const trimmedFirstName = firstName.trim()
    if (!trimmedFirstName) {
      newErrors.firstName = 'First name is required'
    } else if (trimmedFirstName.length > 30) {
      newErrors.firstName = 'First name must be 30 characters or less'
    }

    // Validate last name
    const trimmedLastName = lastName.trim()
    if (!trimmedLastName) {
      newErrors.lastName = 'Last name is required'
    } else if (trimmedLastName.length > 30) {
      newErrors.lastName = 'Last name must be 30 characters or less'
    }

    // Validate student ID (optional but must be unique within roster if provided)
    const trimmedStudentId = studentId.trim()
    if (trimmedStudentId) {
      try {
        const isValid = await dbService.validateStudentId(
          trimmedStudentId, 
          rosterId, 
          existingStudent?.id
        )
        if (!isValid) {
          newErrors.studentId = 'Student ID already exists in this roster'
        }
      } catch (error) {
        newErrors.studentId = 'Error validating student ID'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const isValid = await validateForm()
    if (!isValid) return

    setIsLoading(true)
    
    try {
      const trimmedFirstName = firstName.trim()
      const trimmedLastName = lastName.trim()
      const trimmedStudentId = studentId.trim() || null

      if (existingStudent) {
        // Update existing student
        const updatedStudent = await dbService.updateStudent(existingStudent.id, {
          first_name: trimmedFirstName,
          last_name: trimmedLastName,
          student_id: trimmedStudentId
        })
        await onSave(updatedStudent)
      } else {
        // Create new student
        const newStudent = await dbService.saveStudent({
          first_name: trimmedFirstName,
          last_name: trimmedLastName,
          student_id: trimmedStudentId,
          roster_id: rosterId
        })
        await onSave(newStudent)
      }
      
      onClose()
    } catch (error) {
      setErrors({ general: `Failed to ${isEditing ? 'update' : 'add'} student. Please try again.` })
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      onClose()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && !isLoading) {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '1rem'
      }}
      onClick={handleClose}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div 
        style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          width: '100%',
          maxWidth: '400px',
          maxHeight: '90vh',
          overflow: 'auto',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '1.5rem 1.5rem 1rem 1.5rem',
          borderBottom: '1px solid #e0e0e0'
        }}>
          <h2 style={{
            margin: '0 0 0.5rem 0',
            fontSize: '1.25rem',
            fontWeight: '600',
            color: '#333'
          }}>
            {isEditing ? 'Edit Student' : 'Add Student'}
          </h2>
          <p style={{
            margin: 0,
            fontSize: '0.9rem',
            color: '#666'
          }}>
            {isEditing 
              ? 'Update the student information below'
              : 'Enter the student information below'
            }
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ padding: '1.5rem' }}>
            {errors.general && (
              <div style={{
                backgroundColor: '#fee',
                color: '#c33',
                padding: '0.75rem',
                borderRadius: '4px',
                fontSize: '0.9rem',
                marginBottom: '1rem',
                border: '1px solid #fcc'
              }}>
                {errors.general}
              </div>
            )}

            {/* First Name */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{
                display: 'block',
                fontSize: '0.9rem',
                fontWeight: '500',
                color: '#333',
                marginBottom: '0.5rem'
              }}>
                First Name *
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Enter first name"
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: `1px solid ${errors.firstName ? '#f56565' : '#e0e0e0'}`,
                  borderRadius: '4px',
                  fontSize: '0.9rem',
                  backgroundColor: isLoading ? '#f5f5f5' : 'white',
                  boxSizing: 'border-box'
                }}
                autoFocus
              />
              {errors.firstName && (
                <div style={{
                  color: '#f56565',
                  fontSize: '0.8rem',
                  marginTop: '0.25rem'
                }}>
                  {errors.firstName}
                </div>
              )}
            </div>

            {/* Last Name */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{
                display: 'block',
                fontSize: '0.9rem',
                fontWeight: '500',
                color: '#333',
                marginBottom: '0.5rem'
              }}>
                Last Name *
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Enter last name"
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: `1px solid ${errors.lastName ? '#f56565' : '#e0e0e0'}`,
                  borderRadius: '4px',
                  fontSize: '0.9rem',
                  backgroundColor: isLoading ? '#f5f5f5' : 'white',
                  boxSizing: 'border-box'
                }}
              />
              {errors.lastName && (
                <div style={{
                  color: '#f56565',
                  fontSize: '0.8rem',
                  marginTop: '0.25rem'
                }}>
                  {errors.lastName}
                </div>
              )}
            </div>

            {/* Student ID */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                fontSize: '0.9rem',
                fontWeight: '500',
                color: '#333',
                marginBottom: '0.5rem'
              }}>
                Student ID (optional)
              </label>
              <input
                type="text"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="Enter student ID"
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: `1px solid ${errors.studentId ? '#f56565' : '#e0e0e0'}`,
                  borderRadius: '4px',
                  fontSize: '0.9rem',
                  backgroundColor: isLoading ? '#f5f5f5' : 'white',
                  boxSizing: 'border-box'
                }}
              />
              {errors.studentId && (
                <div style={{
                  color: '#f56565',
                  fontSize: '0.8rem',
                  marginTop: '0.25rem'
                }}>
                  {errors.studentId}
                </div>
              )}
              <div style={{
                color: '#666',
                fontSize: '0.8rem',
                marginTop: '0.25rem'
              }}>
                Must be unique within this roster if provided
              </div>
            </div>
          </div>

          {/* Footer */}
          <div style={{
            padding: '1rem 1.5rem 1.5rem 1.5rem',
            borderTop: '1px solid #e0e0e0',
            display: 'flex',
            gap: '0.75rem',
            justifyContent: 'flex-end'
          }}>
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              style={{
                padding: '0.75rem 1.5rem',
                border: '1px solid #e0e0e0',
                borderRadius: '6px',
                backgroundColor: 'white',
                color: '#666',
                fontSize: '0.9rem',
                fontWeight: '500',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.6 : 1,
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.backgroundColor = '#f5f5f5'
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'white'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              style={{
                padding: '0.75rem 1.5rem',
                border: 'none',
                borderRadius: '6px',
                backgroundColor: isLoading ? '#ccc' : '#007bff',
                color: 'white',
                fontSize: '0.9rem',
                fontWeight: '500',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.backgroundColor = '#0056b3'
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.backgroundColor = '#007bff'
                }
              }}
            >
              {isLoading 
                ? `${isEditing ? 'Updating' : 'Adding'}...` 
                : isEditing ? 'Update Student' : 'Add Student'
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}