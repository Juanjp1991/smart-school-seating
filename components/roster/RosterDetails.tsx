'use client'

import { useState, useEffect } from 'react'
import { Roster, Student } from '@/lib/db'
import { Rule } from '@/types/rule'
import { ruleService } from '@/lib/ruleService'
import StudentList from '../student/StudentList'
import CsvImportModal from './CsvImportModal'
import RuleList from '../rules/RuleList'

interface RosterDetailsProps {
  roster: Roster | null
  isLoading: boolean
  students: Student[]
  studentsLoading: boolean
  onAddStudent: () => void
  onEditStudent: (student: Student) => void
  onDeleteStudent: (student: Student) => void
  onStudentsImported: (students: Student[]) => void
}

export default function RosterDetails({
  roster,
  isLoading,
  students,
  studentsLoading,
  onAddStudent,
  onEditStudent,
  onDeleteStudent,
  onStudentsImported
}: RosterDetailsProps) {
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false)
  const [rules, setRules] = useState<Rule[]>([])
  const [rulesLoading, setRulesLoading] = useState(false)

  // Load rules when roster changes
  useEffect(() => {
    if (roster) {
      loadRules()
    } else {
      setRules([])
    }
  }, [roster])

  const loadRules = async () => {
    if (!roster) return
    
    setRulesLoading(true)
    try {
      const rosterRules = await ruleService.getRulesByRoster(roster.id)
      setRules(rosterRules)
    } catch (error) {
      console.error('Error loading rules:', error)
    } finally {
      setRulesLoading(false)
    }
  }

  const handleRuleCreated = (rule: Rule) => {
    setRules(prev => [...prev, rule])
  }

  const handleRuleUpdated = (rule: Rule) => {
    setRules(prev => prev.map(r => r.id === rule.id ? rule : r))
  }

  const handleRuleDeleted = (ruleId: string) => {
    setRules(prev => prev.filter(r => r.id !== ruleId))
  }
  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        height: '100%',
        color: '#666'
      }}>
        Loading...
      </div>
    )
  }

  if (!roster) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center',
        height: '100%',
        padding: '2rem',
        textAlign: 'center'
      }}>
        <div style={{ 
          fontSize: '3rem',
          marginBottom: '1rem',
          opacity: 0.3
        }}>
          📋
        </div>
        <h3 style={{ 
          margin: '0 0 0.5rem 0',
          color: '#666',
          fontWeight: '500'
        }}>
          No roster selected
        </h3>
        <p style={{ 
          margin: 0,
          color: '#999',
          fontSize: '0.9rem'
        }}>
          Select a roster from the list or create a new one
        </p>
      </div>
    )
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column',
      height: '100%'
    }}>
      {/* Header */}
      <div style={{ 
        padding: '1.5rem', 
        borderBottom: '1px solid #e0e0e0',
        backgroundColor: '#f8f9fa'
      }}>
        <h2 style={{ 
          margin: '0 0 0.5rem 0', 
          fontSize: '1.5rem', 
          fontWeight: '600',
          color: '#333',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}>
          {roster.name}
        </h2>
        <div style={{ 
          display: 'flex',
          flexDirection: 'column',
          gap: '0.25rem',
          fontSize: '0.9rem',
          color: '#666'
        }}>
          <div>
            Created: {formatDate(roster.created_at)}
          </div>
          {roster.updated_at.getTime() !== roster.created_at.getTime() && (
            <div>
              Modified: {formatDate(roster.updated_at)}
            </div>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div style={{ 
        flex: 1,
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Student Count */}
        <div style={{
          backgroundColor: '#e3f2fd',
          border: '1px solid #bbdefb',
          borderRadius: '8px',
          padding: '1rem',
          marginBottom: '1.5rem'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '0.5rem'
          }}>
            <span style={{ fontSize: '1.2rem' }}>👥</span>
            <h3 style={{ 
              margin: 0, 
              fontSize: '1rem', 
              fontWeight: '600',
              color: '#1976d2'
            }}>
              Students
            </h3>
          </div>
          <p style={{ 
            margin: 0, 
            fontSize: '2rem', 
            fontWeight: 'bold',
            color: '#1976d2'
          }}>
            {students.length}
          </p>
          <p style={{ 
            margin: '0.5rem 0 0 0', 
            fontSize: '0.9rem',
            color: '#666'
          }}>
            {students.length === 0 ? 'No students added yet' : `${students.length} student${students.length !== 1 ? 's' : ''} in roster`}
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          gap: '0.75rem',
          marginBottom: '1.5rem'
        }}>
          <button
            onClick={onAddStudent}
            style={{
              flex: 1,
              padding: '0.75rem 1rem',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '0.9rem',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#0056b3'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#007bff'
            }}
          >
            + Add Student
          </button>
          <button
            onClick={() => setIsCsvModalOpen(true)}
            disabled={!roster}
            style={{
              flex: 1,
              padding: '0.75rem 1rem',
              backgroundColor: !roster ? '#f5f5f5' : '#28a745',
              color: !roster ? '#999' : 'white',
              border: !roster ? '1px solid #e0e0e0' : 'none',
              borderRadius: '6px',
              fontSize: '0.9rem',
              fontWeight: '500',
              cursor: !roster ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              if (roster) {
                e.currentTarget.style.backgroundColor = '#218838'
              }
            }}
            onMouseLeave={(e) => {
              if (roster) {
                e.currentTarget.style.backgroundColor = '#28a745'
              }
            }}
          >
            📁 Import CSV
          </button>
        </div>

        {/* Rules Section */}
        <div style={{ marginBottom: '2rem' }}>
          <RuleList
            rules={rules}
            students={students}
            rosterId={roster.id}
            onRuleCreated={handleRuleCreated}
            onRuleUpdated={handleRuleUpdated}
            onRuleDeleted={handleRuleDeleted}
          />
        </div>

        {/* Student List */}
        <StudentList
          students={students}
          onEditStudent={onEditStudent}
          onDeleteStudent={onDeleteStudent}
          isLoading={studentsLoading}
        />
      </div>

      {/* CSV Import Modal */}
      {roster && (
        <CsvImportModal
          isOpen={isCsvModalOpen}
          onClose={() => setIsCsvModalOpen(false)}
          rosterId={roster.id}
          onImportComplete={(importedStudents) => {
            onStudentsImported(importedStudents)
            setIsCsvModalOpen(false)
          }}
        />
      )}
    </div>
  )
}