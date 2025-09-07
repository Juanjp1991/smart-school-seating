'use client'

import { Student } from '@/lib/db'
import StudentItem from './StudentItem'

interface StudentListProps {
  students: Student[]
  onEditStudent: (student: Student) => void
  onDeleteStudent: (student: Student) => void
  isLoading: boolean
}

export default function StudentList({
  students,
  onEditStudent,
  onDeleteStudent,
  isLoading
}: StudentListProps) {
  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        color: '#666',
        fontSize: '0.9rem'
      }}>
        Loading students...
      </div>
    )
  }

  if (students.length === 0) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        textAlign: 'center',
        backgroundColor: '#fafafa',
        borderRadius: '8px',
        border: '2px dashed #e0e0e0'
      }}>
        <div style={{ 
          fontSize: '2.5rem',
          marginBottom: '1rem',
          opacity: 0.4
        }}>
          👥
        </div>
        <h4 style={{ 
          margin: '0 0 0.5rem 0',
          color: '#666',
          fontWeight: '500'
        }}>
          No students yet
        </h4>
        <p style={{ 
          margin: 0,
          color: '#999',
          fontSize: '0.9rem',
          maxWidth: '300px',
          lineHeight: 1.5
        }}>
          Click &quot;Add Student&quot; to start building your roster
        </p>
      </div>
    )
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem'
    }}>
      {/* Student count header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingBottom: '0.5rem',
        borderBottom: '1px solid #e0e0e0'
      }}>
        <h4 style={{
          margin: 0,
          fontSize: '0.9rem',
          fontWeight: '600',
          color: '#333'
        }}>
          Students ({students.length})
        </h4>
        <div style={{
          fontSize: '0.8rem',
          color: '#666'
        }}>
          Sorted by last name
        </div>
      </div>

      {/* Students list */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        maxHeight: '400px',
        overflowY: 'auto'
      }}>
        {students.map((student) => (
          <StudentItem
            key={student.id}
            student={student}
            onEdit={onEditStudent}
            onDelete={onDeleteStudent}
          />
        ))}
      </div>
    </div>
  )
}