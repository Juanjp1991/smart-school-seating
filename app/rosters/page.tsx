'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import RosterList from '@/components/roster/RosterList'
import RosterDetails from '@/components/roster/RosterDetails'
import RosterModal from '@/components/roster/RosterModal'
import StudentModal from '@/components/student/StudentModal'
import Notification from '@/components/common/Notification'
import { dbService, Roster, Student } from '@/lib/db'

export default function RostersPage() {
  const [rosters, setRosters] = useState<Roster[]>([])
  const [selectedRosterId, setSelectedRosterId] = useState<string | null>(null)
  const [showRosterModal, setShowRosterModal] = useState(false)
  const [editingRoster, setEditingRoster] = useState<Roster | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [notification, setNotification] = useState<{
    message: string
    type: 'success' | 'error' | 'info'
  } | null>(null)
  
  // Student management state
  const [students, setStudents] = useState<Student[]>([])
  const [studentsLoading, setStudentsLoading] = useState(false)
  const [showStudentModal, setShowStudentModal] = useState(false)
  const [editingStudent, setEditingStudent] = useState<Student | null>(null)

  const showNotification = useCallback((message: string, type: 'success' | 'error' | 'info') => {
    setNotification({ message, type })
  }, [])

  const loadRosters = useCallback(async () => {
    try {
      setIsLoading(true)
      const allRosters = await dbService.getAllRosters()
      setRosters(allRosters)
      
      // If no roster is selected and we have rosters, select the first one
      if (!selectedRosterId && allRosters.length > 0) {
        setSelectedRosterId(allRosters[0].id)
      }
      
      // If selected roster no longer exists, clear selection
      if (selectedRosterId && !allRosters.find(r => r.id === selectedRosterId)) {
        setSelectedRosterId(allRosters.length > 0 ? allRosters[0].id : null)
      }
    } catch (error) {
      showNotification('Failed to load rosters. Please try again.', 'error')
    } finally {
      setIsLoading(false)
    }
  }, [selectedRosterId, showNotification])

  const loadStudents = useCallback(async (rosterId: string) => {
    try {
      setStudentsLoading(true)
      const rosterStudents = await dbService.getAllStudentsForRoster(rosterId)
      setStudents(rosterStudents)
    } catch (error) {
      showNotification('Failed to load students. Please try again.', 'error')
    } finally {
      setStudentsLoading(false)
    }
  }, [showNotification])

  useEffect(() => {
    loadRosters()
  }, [loadRosters])

  useEffect(() => {
    if (selectedRosterId) {
      loadStudents(selectedRosterId)
    } else {
      setStudents([])
    }
  }, [selectedRosterId, loadStudents])

  const handleCreateRoster = () => {
    setEditingRoster(null)
    setShowRosterModal(true)
  }

  const handleEditRoster = (roster: Roster) => {
    setEditingRoster(roster)
    setShowRosterModal(true)
  }

  const handleSaveRoster = async (name: string) => {
    try {
      if (editingRoster) {
        // Update existing roster
        const updatedRoster = await dbService.updateRoster(editingRoster.id, { name })
        setRosters(prev => prev.map(r => r.id === updatedRoster.id ? updatedRoster : r))
        showNotification(`Roster "${name}" updated successfully!`, 'success')
      } else {
        // Create new roster
        const newRoster = await dbService.saveRoster({ name })
        setRosters(prev => [newRoster, ...prev])
        setSelectedRosterId(newRoster.id)
        showNotification(`Roster "${name}" created successfully!`, 'success')
      }
      
      setShowRosterModal(false)
      setEditingRoster(null)
    } catch (error) {
      const action = editingRoster ? 'update' : 'create'
      showNotification(`Failed to ${action} roster. Please try again.`, 'error')
      throw error // Re-throw to prevent modal from closing
    }
  }

  const handleDeleteRoster = async (roster: Roster) => {
    if (!window.confirm(`Are you sure you want to delete "${roster.name}"? This action cannot be undone.`)) {
      return
    }

    try {
      await dbService.deleteRoster(roster.id)
      setRosters(prev => prev.filter(r => r.id !== roster.id))
      
      // If we deleted the selected roster, select another one
      if (selectedRosterId === roster.id) {
        const remainingRosters = rosters.filter(r => r.id !== roster.id)
        setSelectedRosterId(remainingRosters.length > 0 ? remainingRosters[0].id : null)
      }
      
      showNotification(`Roster "${roster.name}" deleted successfully!`, 'success')
    } catch (error) {
      showNotification('Failed to delete roster. Please try again.', 'error')
    }
  }

  // Student management functions
  const handleAddStudent = () => {
    if (!selectedRosterId) return
    setEditingStudent(null)
    setShowStudentModal(true)
  }

  const handleEditStudent = (student: Student) => {
    setEditingStudent(student)
    setShowStudentModal(true)
  }

  const handleSaveStudent = async (student: Student) => {
    try {
      if (editingStudent) {
        // Update existing student
        setStudents(prev => prev.map(s => s.id === student.id ? student : s))
        showNotification(`Student "${student.first_name} ${student.last_name}" updated successfully!`, 'success')
      } else {
        // Add new student
        setStudents(prev => [...prev, student])
        showNotification(`Student "${student.first_name} ${student.last_name}" added successfully!`, 'success')
      }
    } catch (error) {
      const action = editingStudent ? 'update' : 'add'
      showNotification(`Failed to ${action} student. Please try again.`, 'error')
      throw error // Re-throw to prevent modal from closing
    }
  }

  const handleDeleteStudent = async (student: Student) => {
    try {
      await dbService.deleteStudent(student.id)
      setStudents(prev => prev.filter(s => s.id !== student.id))
      showNotification(`Student "${student.first_name} ${student.last_name}" removed successfully!`, 'success')
    } catch (error) {
      showNotification('Failed to remove student. Please try again.', 'error')
    }
  }

  const handleStudentsImported = (importedStudents: Student[]) => {
    setStudents(prev => [...prev, ...importedStudents])
    showNotification(`${importedStudents.length} student${importedStudents.length !== 1 ? 's' : ''} imported successfully!`, 'success')
  }

  const selectedRoster = selectedRosterId ? rosters.find(r => r.id === selectedRosterId) || null : null

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ 
        padding: '1rem', 
        borderBottom: '1px solid #e0e0e0', 
        backgroundColor: 'white',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.75rem',
          marginBottom: '0.5rem'
        }}>
          <Link
            href="/"
            style={{
              color: '#007bff',
              textDecoration: 'none',
              fontSize: '0.9rem',
              fontWeight: '500',
              padding: '0.25rem 0.5rem',
              borderRadius: '4px',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f0f8ff'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
          >
            ← Back to Home
          </Link>
          <span style={{ color: '#ccc' }}>|</span>
          <Link
            href="/layout-editor"
            style={{
              color: '#007bff',
              textDecoration: 'none',
              fontSize: '0.9rem',
              fontWeight: '500',
              padding: '0.25rem 0.5rem',
              borderRadius: '4px',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f0f8ff'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
          >
            Layout Editor
          </Link>
        </div>
        <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '600' }}>
          Roster Management
        </h1>
        <p style={{ margin: '0.5rem 0 0 0', color: '#666', fontSize: '0.9rem' }}>
          Create and manage your class rosters
        </p>
      </div>

      {/* Main Content */}
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        minHeight: 0, 
        backgroundColor: '#f8f9fa' 
      }}>
        {/* Left Panel - Roster List */}
        <div style={{ 
          width: '300px', 
          minWidth: '300px', 
          backgroundColor: 'white', 
          borderRight: '1px solid #e0e0e0',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <RosterList
            rosters={rosters}
            selectedRosterId={selectedRosterId}
            isLoading={isLoading}
            onSelectRoster={setSelectedRosterId}
            onCreateRoster={handleCreateRoster}
            onEditRoster={handleEditRoster}
            onDeleteRoster={handleDeleteRoster}
          />
        </div>

        {/* Right Panel - Roster Details */}
        <div style={{ 
          flex: 1, 
          backgroundColor: 'white', 
          display: 'flex',
          flexDirection: 'column'
        }}>
          <RosterDetails
            roster={selectedRoster}
            isLoading={isLoading}
            students={students}
            studentsLoading={studentsLoading}
            onAddStudent={handleAddStudent}
            onEditStudent={handleEditStudent}
            onDeleteStudent={handleDeleteStudent}
            onStudentsImported={handleStudentsImported}
          />
        </div>
      </div>

      {/* Roster Modal */}
      <RosterModal
        isOpen={showRosterModal}
        onClose={() => {
          setShowRosterModal(false)
          setEditingRoster(null)
        }}
        onSave={handleSaveRoster}
        existingName={editingRoster?.name}
        isEditing={!!editingRoster}
      />

      {/* Student Modal */}
      <StudentModal
        isOpen={showStudentModal}
        onClose={() => {
          setShowStudentModal(false)
          setEditingStudent(null)
        }}
        onSave={handleSaveStudent}
        existingStudent={editingStudent}
        rosterId={selectedRosterId || ''}
        isEditing={!!editingStudent}
      />

      {/* Notification */}
      <Notification
        message={notification?.message || ''}
        type={notification?.type || 'info'}
        isVisible={!!notification}
        onClose={() => setNotification(null)}
      />
    </div>
  )
}