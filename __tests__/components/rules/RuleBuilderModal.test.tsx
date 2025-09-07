import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import RuleBuilderModal from '@/components/rules/RuleBuilderModal'
import { Student } from '@/lib/db'

// Mock the rule service
jest.mock('@/lib/ruleService', () => ({
  ruleService: {
    createRule: jest.fn()
  }
}))

const mockStudents: Student[] = [
  {
    id: '1',
    first_name: 'John',
    last_name: 'Doe',
    student_id: '12345',
    roster_id: 'roster-1',
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: '2',
    first_name: 'Jane',
    last_name: 'Smith',
    student_id: '67890',
    roster_id: 'roster-1',
    created_at: new Date(),
    updated_at: new Date()
  }
]

describe('RuleBuilderModal', () => {
  const mockOnClose = jest.fn()
  const mockOnRuleCreated = jest.fn()
  const mockRosterId = 'roster-1'

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders modal when open', () => {
    render(
      <RuleBuilderModal
        isOpen={true}
        onClose={mockOnClose}
        rosterId={mockRosterId}
        students={mockStudents}
        onRuleCreated={mockOnRuleCreated}
      />
    )

    expect(screen.getByText('Create Placement Rule')).toBeInTheDocument()
    expect(screen.getByText('Step 1: Select Students')).toBeInTheDocument()
    expect(screen.getByText('Step 2: Choose Rule Type')).toBeInTheDocument()
    expect(screen.getByText('Step 3: Set Priority')).toBeInTheDocument()
  })

  it('does not render when closed', () => {
    render(
      <RuleBuilderModal
        isOpen={false}
        onClose={mockOnClose}
        rosterId={mockRosterId}
        students={mockStudents}
        onRuleCreated={mockOnRuleCreated}
      />
    )

    expect(screen.queryByText('Create Placement Rule')).not.toBeInTheDocument()
  })

  it('allows student selection', () => {
    render(
      <RuleBuilderModal
        isOpen={true}
        onClose={mockOnClose}
        rosterId={mockRosterId}
        students={mockStudents}
        onRuleCreated={mockOnRuleCreated}
      />
    )

    const johnCheckbox = screen.getByText('John Doe').closest('label')?.querySelector('input') as HTMLInputElement
    const janeCheckbox = screen.getByText('Jane Smith').closest('label')?.querySelector('input') as HTMLInputElement

    expect(johnCheckbox).not.toBeChecked()
    expect(janeCheckbox).not.toBeChecked()

    fireEvent.click(johnCheckbox)
    expect(johnCheckbox).toBeChecked()

    fireEvent.click(janeCheckbox)
    expect(janeCheckbox).toBeChecked()
  })

  it('allows rule type selection', () => {
    render(
      <RuleBuilderModal
        isOpen={true}
        onClose={mockOnClose}
        rosterId={mockRosterId}
        students={mockStudents}
        onRuleCreated={mockOnRuleCreated}
      />
    )

    const separateRadio = screen.getByText('Must Not Sit Together').closest('label')?.querySelector('input') as HTMLInputElement
    const togetherRadio = screen.getByText('Must Sit Together').closest('label')?.querySelector('input') as HTMLInputElement

    expect(separateRadio).toBeChecked()
    expect(togetherRadio).not.toBeChecked()

    fireEvent.click(togetherRadio)
    expect(togetherRadio).toBeChecked()
    expect(separateRadio).not.toBeChecked()
  })

  it('allows priority adjustment', () => {
    render(
      <RuleBuilderModal
        isOpen={true}
        onClose={mockOnClose}
        rosterId={mockRosterId}
        students={mockStudents}
        onRuleCreated={mockOnRuleCreated}
      />
    )

    const priorityInput = screen.getByDisplayValue('1')
    
    fireEvent.change(priorityInput, { target: { value: '5' } })
    expect(priorityInput).toHaveValue(5)
  })

  it('validates form submission', async () => {
    const { ruleService } = require('@/lib/ruleService')
    ruleService.createRule.mockResolvedValue({
      id: 'rule-1',
      roster_id: mockRosterId,
      priority: 1,
      type: 'SEPARATE',
      student_ids: ['1', '2'],
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    })

    render(
      <RuleBuilderModal
        isOpen={true}
        onClose={mockOnClose}
        rosterId={mockRosterId}
        students={mockStudents}
        onRuleCreated={mockOnRuleCreated}
      />
    )

    // Try to submit without selecting students
    const submitButton = screen.getByText('Create Rule')
    fireEvent.click(submitButton)

    expect(await screen.findByText('Please select at least one student')).toBeInTheDocument()

    // Select students and submit successfully
    const johnCheckbox = screen.getByText('John Doe').closest('label')?.querySelector('input') as HTMLInputElement
    const janeCheckbox = screen.getByText('Jane Smith').closest('label')?.querySelector('input') as HTMLInputElement
    
    fireEvent.click(johnCheckbox)
    fireEvent.click(janeCheckbox)
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(ruleService.createRule).toHaveBeenCalledWith(mockRosterId, {
        priority: 1,
        type: 'SEPARATE',
        student_ids: ['1', '2'],
        is_active: true
      })
    })
  })

  it('filters students based on search', () => {
    render(
      <RuleBuilderModal
        isOpen={true}
        onClose={mockOnClose}
        rosterId={mockRosterId}
        students={mockStudents}
        onRuleCreated={mockOnRuleCreated}
      />
    )

    const searchInput = screen.getByPlaceholderText('Search students...')
    
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('Jane Smith')).toBeInTheDocument()

    fireEvent.change(searchInput, { target: { value: 'John' } })

    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument()
  })

  it('supports select all functionality', () => {
    render(
      <RuleBuilderModal
        isOpen={true}
        onClose={mockOnClose}
        rosterId={mockRosterId}
        students={mockStudents}
        onRuleCreated={mockOnRuleCreated}
      />
    )

    const selectAllCheckbox = screen.getByLabelText('Select all (2 students)')
    const johnCheckbox = screen.getByText('John Doe').closest('label')?.querySelector('input') as HTMLInputElement
    const janeCheckbox = screen.getByText('Jane Smith').closest('label')?.querySelector('input') as HTMLInputElement

    expect(selectAllCheckbox).not.toBeChecked()
    expect(johnCheckbox).not.toBeChecked()
    expect(janeCheckbox).not.toBeChecked()

    fireEvent.click(selectAllCheckbox)

    expect(selectAllCheckbox).toBeChecked()
    expect(johnCheckbox).toBeChecked()
    expect(janeCheckbox).toBeChecked()

    fireEvent.click(selectAllCheckbox)

    expect(selectAllCheckbox).not.toBeChecked()
    expect(johnCheckbox).not.toBeChecked()
    expect(janeCheckbox).not.toBeChecked()
  })
})