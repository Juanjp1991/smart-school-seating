'use client'

import { Student } from '@/lib/db'

interface StudentItemProps {
  student: Student
  onEdit: (student: Student) => void
  onDelete: (student: Student) => void
}

export default function StudentItem({
  student,
  onEdit,
  onDelete
}: StudentItemProps) {
  const handleEdit = () => {
    onEdit(student)
  }

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to remove ${student.first_name} ${student.last_name} from this roster? This action cannot be undone.`)) {
      onDelete(student)
    }
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0.75rem',
      border: '1px solid #e0e0e0',
      borderRadius: '6px',
      backgroundColor: 'white',
      transition: 'all 0.2s ease'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)'
      e.currentTarget.style.borderColor = '#d0d0d0'
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.boxShadow = 'none'
      e.currentTarget.style.borderColor = '#e0e0e0'
    }}>
      {/* Student Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontWeight: '500',
          color: '#333',
          fontSize: '0.95rem',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}>
          {student.last_name}, {student.first_name}
        </div>
        {student.student_id && (
          <div style={{
            color: '#666',
            fontSize: '0.8rem',
            marginTop: '0.25rem',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            ID: {student.student_id}
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        marginLeft: '0.75rem'
      }}>
        <button
          onClick={handleEdit}
          title="Edit student"
          style={{
            padding: '0.4rem 0.6rem',
            border: '1px solid #e0e0e0',
            borderRadius: '4px',
            backgroundColor: 'white',
            color: '#666',
            fontSize: '0.8rem',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            minWidth: '50px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f0f8ff'
            e.currentTarget.style.borderColor = '#007bff'
            e.currentTarget.style.color = '#007bff'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'white'
            e.currentTarget.style.borderColor = '#e0e0e0'
            e.currentTarget.style.color = '#666'
          }}
        >
          Edit
        </button>
        <button
          onClick={handleDelete}
          title="Remove student"
          style={{
            padding: '0.4rem 0.6rem',
            border: '1px solid #e0e0e0',
            borderRadius: '4px',
            backgroundColor: 'white',
            color: '#666',
            fontSize: '0.8rem',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            minWidth: '60px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#fff5f5'
            e.currentTarget.style.borderColor = '#f56565'
            e.currentTarget.style.color = '#f56565'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'white'
            e.currentTarget.style.borderColor = '#e0e0e0'
            e.currentTarget.style.color = '#666'
          }}
        >
          Remove
        </button>
      </div>
    </div>
  )
}