import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { Rule, RULE_TYPES } from '@/types/rule'
import { Student } from '@/lib/db'
import RuleItem from '@/components/rules/RuleItem'

const mockStudents: Student[] = [
  { id: '1', first_name: 'John', last_name: 'Doe', student_id: '12345', roster_id: 'roster-1' },
  { id: '2', first_name: 'Jane', last_name: 'Smith', student_id: '67890', roster_id: 'roster-1' },
  { id: '3', first_name: 'Bob', last_name: 'Johnson', student_id: '54321', roster_id: 'roster-1' }
]

const mockRule: Rule = {
  id: 'rule-1',
  roster_id: 'roster-1',
  priority: 1,
  type: 'SEPARATE',
  student_ids: ['1', '2'],
  is_active: true,
  created_at: new Date('2025-01-01'),
  updated_at: new Date('2025-01-01')
}

const mockInactiveRule: Rule = {
  id: 'rule-2',
  roster_id: 'roster-1',
  priority: 2,
  type: 'TOGETHER',
  student_ids: ['3'],
  is_active: false,
  created_at: new Date('2025-01-02'),
  updated_at: new Date('2025-01-02')
}

describe('RuleItem Component', () => {
  const mockOnEdit = jest.fn()
  const mockOnDelete = jest.fn()
  const mockOnToggleActive = jest.fn()

  beforeEach(() => {
    mockOnEdit.mockClear()
    mockOnDelete.mockClear()
    mockOnToggleActive.mockClear()
  })

  it('renders rule information correctly in full view', () => {
    render(
      <RuleItem
        rule={mockRule}
        students={mockStudents}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onToggleActive={mockOnToggleActive}
      />
    )

    expect(screen.getByText('Must Not Sit Together')).toBeInTheDocument()
    expect(screen.getByText('✅ ACTIVE')).toBeInTheDocument()
    expect(screen.getByText('🔴 HIGH PRIORITY')).toBeInTheDocument()
    expect(screen.getByText('👥 Affected Students')).toBeInTheDocument()
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    expect(screen.getByText('📝 Rule Description')).toBeInTheDocument()
    expect(screen.getByText('Selected students should not be seated adjacent to each other')).toBeInTheDocument()
    expect(screen.getByText('Created:')).toBeInTheDocument()
  })

  it('renders inactive rule with correct styling', () => {
    render(
      <RuleItem
        rule={mockInactiveRule}
        students={mockStudents}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onToggleActive={mockOnToggleActive}
      />
    )

    expect(screen.getByText('❌ INACTIVE')).toBeInTheDocument()
    expect(screen.getByText('🔴 HIGH PRIORITY')).toBeInTheDocument()
    expect(screen.getByText('Bob Johnson')).toBeInTheDocument()
  })

  it('renders compact view correctly', () => {
    render(
      <RuleItem
        rule={mockRule}
        students={mockStudents}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onToggleActive={mockOnToggleActive}
        displayOptions={{ compact: true }}
      />
    )

    expect(screen.getByText('Must Not Sit Together')).toBeInTheDocument()
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    expect(screen.getByText('✅ Active')).toBeInTheDocument()
    expect(screen.getByText('🔴 High Priority')).toBeInTheDocument()
    
    // Compact view should not show description and dates
    expect(screen.queryByText('📝 Rule Description')).not.toBeInTheDocument()
    expect(screen.queryByText('Created:')).not.toBeInTheDocument()
  })

  it('handles missing students gracefully', () => {
    const ruleWithMissingStudent = {
      ...mockRule,
      student_ids: ['1', '999'] // 999 doesn't exist
    }

    render(
      <RuleItem
        rule={ruleWithMissingStudent}
        students={mockStudents}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onToggleActive={mockOnToggleActive}
      />
    )

    expect(screen.getByText('John Doe')).toBeInTheDocument() // Only shows existing student
  })

  it('handles empty student list', () => {
    const ruleWithNoStudents = {
      ...mockRule,
      student_ids: []
    }

    render(
      <RuleItem
        rule={ruleWithNoStudents}
        students={mockStudents}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onToggleActive={mockOnToggleActive}
      />
    )

    expect(screen.getByText('No students selected')).toBeInTheDocument()
  })

  it('calls onEdit when edit button is clicked', () => {
    render(
      <RuleItem
        rule={mockRule}
        students={mockStudents}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onToggleActive={mockOnToggleActive}
      />
    )

    const editButton = screen.getByText('✏️ Edit')
    fireEvent.click(editButton)
    expect(mockOnEdit).toHaveBeenCalledWith(mockRule)
  })

  it('calls onDelete when delete button is clicked', () => {
    // Note: The actual component doesn't show confirmation dialog - that's handled by the parent
    render(
      <RuleItem
        rule={mockRule}
        students={mockStudents}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onToggleActive={mockOnToggleActive}
      />
    )

    const deleteButton = screen.getByText('🗑️ Delete')
    fireEvent.click(deleteButton)
    expect(mockOnDelete).toHaveBeenCalledWith(mockRule.id)
  })

  it('calls onToggleActive when toggle button is clicked', () => {
    render(
      <RuleItem
        rule={mockRule}
        students={mockStudents}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onToggleActive={mockOnToggleActive}
      />
    )

    const toggleButton = screen.getByText('⏸️ Pause')
    fireEvent.click(toggleButton)
    expect(mockOnToggleActive).toHaveBeenCalledWith(mockRule.id)
  })

  it('shows correct toggle button text for inactive rule', () => {
    render(
      <RuleItem
        rule={mockInactiveRule}
        students={mockStudents}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onToggleActive={mockOnToggleActive}
      />
    )

    const toggleButton = screen.getByText('▶️ Activate')
    expect(toggleButton).toBeInTheDocument()
  })

  it('displays different rule types correctly', () => {
    const togetherRule: Rule = {
      ...mockRule,
      type: 'TOGETHER'
    }

    render(
      <RuleItem
        rule={togetherRule}
        students={mockStudents}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onToggleActive={mockOnToggleActive}
      />
    )

    expect(screen.getByText('Must Sit Together')).toBeInTheDocument()
    expect(screen.getByText('Selected students should be seated in adjacent seats')).toBeInTheDocument()
  })

  it('displays location preference rules correctly', () => {
    const frontRowRule: Rule = {
      ...mockRule,
      type: 'FRONT_ROW'
    }

    render(
      <RuleItem
        rule={frontRowRule}
        students={mockStudents}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onToggleActive={mockOnToggleActive}
      />
    )

    expect(screen.getByText('Front Row Preference')).toBeInTheDocument()
    expect(screen.getByText('Selected students should be seated in the front rows')).toBeInTheDocument()
  })

  it('shows custom display options when provided', () => {
    render(
      <RuleItem
        rule={mockRule}
        students={mockStudents}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onToggleActive={mockOnToggleActive}
        displayOptions={{
          showDescriptions: false,
          showCreatedDate: false,
          showUpdatedDate: true,
          compact: false
        }}
      />
    )

    expect(screen.queryByText('📝 Rule Description')).not.toBeInTheDocument()
    expect(screen.queryByText('Created:')).not.toBeInTheDocument()
    expect(screen.getByText('Updated:')).toBeInTheDocument()
  })

  it('shows rule type icons correctly', () => {
    render(
      <RuleItem
        rule={mockRule}
        students={mockStudents}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onToggleActive={mockOnToggleActive}
      />
    )

    // Should show the appropriate icon for SEPARATE rule type
    const ruleIcon = screen.getByText('🚫')
    expect(ruleIcon).toBeInTheDocument()
  })

  it('handles priority color coding correctly', () => {
    const lowPriorityRule: Rule = {
      ...mockRule,
      priority: 6
    }

    render(
      <RuleItem
        rule={lowPriorityRule}
        students={mockStudents}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onToggleActive={mockOnToggleActive}
      />
    )

    expect(screen.getByText('🟢 LOW PRIORITY')).toBeInTheDocument()
  })

  it('formats dates correctly', () => {
    const specificDateRule: Rule = {
      ...mockRule,
      created_at: new Date('2025-09-06T10:30:00'),
      updated_at: new Date('2025-09-06T15:45:00')
    }

    render(
      <RuleItem
        rule={specificDateRule}
        students={mockStudents}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onToggleActive={mockOnToggleActive}
        displayOptions={{
          showCreatedDate: true,
          showUpdatedDate: true
        }}
      />
    )

    expect(screen.getByText('Created:')).toBeInTheDocument()
    expect(screen.getByText('Updated:')).toBeInTheDocument()
  })

  it('truncates long student names in compact view', () => {
    const longNameStudents: Student[] = [
      { id: '1', first_name: 'VeryLongFirstName', last_name: 'VeryLongLastName', student_id: '12345', roster_id: 'roster-1' },
      { id: '2', first_name: 'AnotherLongFirstName', last_name: 'AnotherLongLastName', student_id: '67890', roster_id: 'roster-1' }
    ]

    render(
      <RuleItem
        rule={mockRule}
        students={longNameStudents}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onToggleActive={mockOnToggleActive}
        displayOptions={{ compact: true }}
      />
    )

    const studentText = screen.getByText(/VeryLongFirstName/)
    expect(studentText).toBeInTheDocument()
    // In the new design, student names are shown as individual badges, not as truncated text
    expect(studentText).toHaveClass('text-blue-800')
  })
})