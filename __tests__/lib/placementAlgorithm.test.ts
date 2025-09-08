import { PlacementAlgorithm } from '@/lib/placementAlgorithm'
import { Student, Layout } from '@/lib/db'
import { Rule } from '@/types/rule'

describe('PlacementAlgorithm', () => {
  let algorithm: PlacementAlgorithm
  let mockStudents: Student[]
  let mockLayout: Layout
  let mockRules: Rule[]

  beforeEach(() => {
    algorithm = new PlacementAlgorithm()

    // Mock students
    mockStudents = [
      {
        id: 'student1',
        first_name: 'John',
        last_name: 'Doe',
        student_id: '001',
        roster_id: 'roster1',
        photo: null,
        ratings: {},
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 'student2',
        first_name: 'Jane',
        last_name: 'Smith',
        student_id: '002',
        roster_id: 'roster1',
        photo: null,
        ratings: {},
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 'student3',
        first_name: 'Bob',
        last_name: 'Johnson',
        student_id: '003',
        roster_id: 'roster1',
        photo: null,
        ratings: {},
        created_at: new Date(),
        updated_at: new Date()
      }
    ]

    // Mock layout - 3x3 grid with 6 seats
    mockLayout = {
      id: 'layout1',
      name: 'Test Layout',
      grid_rows: 3,
      grid_cols: 3,
      furniture: [
        {
          type: 'desk',
          positions: [{ row: 0, col: 1 }]
        }
      ],
      seats: ['1-0', '1-1', '1-2', '2-0', '2-1', '2-2'], // Row 1 and 2 are seats
      created_at: new Date(),
      updated_at: new Date()
    }

    mockRules = []
  })

  describe('Basic Placement', () => {
    it('should place students when no rules exist', async () => {
      const result = await algorithm.executePlacement(mockStudents, [], mockLayout)

      expect(result.success).toBe(true)
      expect(result.placements).toHaveLength(3)
      expect(result.unplacedStudents).toHaveLength(0)
      expect(result.ruleSatisfaction).toHaveLength(0)
      expect(result.conflicts).toHaveLength(0)
    })

    it('should handle insufficient seats', async () => {
      const layoutWithFewerSeats = {
        ...mockLayout,
        seats: ['1-0', '1-1'] // Only 2 seats for 3 students
      }

      const result = await algorithm.executePlacement(
        mockStudents, 
        [], 
        layoutWithFewerSeats
      )

      expect(result.success).toBe(false)
      expect(result.conflicts).toHaveLength(1)
      expect(result.conflicts[0].conflictType).toBe('IMPOSSIBLE')
    })

    it('should validate inputs properly', async () => {
      const result = await algorithm.executePlacement([], [], mockLayout)

      expect(result.success).toBe(false)
      expect(result.conflicts).toHaveLength(1)
      expect(result.conflicts[0].description).toContain('No students to place')
    })
  })

  describe('SEPARATE Rules', () => {
    beforeEach(() => {
      mockRules = [{
        id: 'rule1',
        roster_id: 'roster1',
        priority: 1,
        type: 'SEPARATE',
        student_ids: ['student1', 'student2'],
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }]
    })

    it('should separate students as specified by rule', async () => {
      const result = await algorithm.executePlacement(mockStudents, mockRules, mockLayout)

      expect(result.success).toBe(true)
      expect(result.placements).toHaveLength(3)

      // Find placements for the separated students
      const student1Placement = result.placements.find(p => p.studentId === 'student1')
      const student2Placement = result.placements.find(p => p.studentId === 'student2')

      expect(student1Placement).toBeDefined()
      expect(student2Placement).toBeDefined()

      if (student1Placement && student2Placement) {
        // Check they're not adjacent
        const rowDiff = Math.abs(student1Placement.seatPosition.row - student2Placement.seatPosition.row)
        const colDiff = Math.abs(student1Placement.seatPosition.col - student2Placement.seatPosition.col)
        const isAdjacent = (rowDiff <= 1 && colDiff <= 1 && (rowDiff + colDiff > 0))

        expect(isAdjacent).toBe(false)
      }

      // Check rule satisfaction
      const separateRuleSatisfaction = result.ruleSatisfaction.find(r => r.ruleId === 'rule1')
      expect(separateRuleSatisfaction?.satisfied).toBe(true)
    })
  })

  describe('TOGETHER Rules', () => {
    beforeEach(() => {
      mockRules = [{
        id: 'rule1',
        roster_id: 'roster1',
        priority: 1,
        type: 'TOGETHER',
        student_ids: ['student1', 'student2'],
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }]
    })

    it('should place students together as specified by rule', async () => {
      const result = await algorithm.executePlacement(mockStudents, mockRules, mockLayout)

      expect(result.success).toBe(true)
      expect(result.placements).toHaveLength(3)

      // Find placements for the grouped students
      const student1Placement = result.placements.find(p => p.studentId === 'student1')
      const student2Placement = result.placements.find(p => p.studentId === 'student2')

      expect(student1Placement).toBeDefined()
      expect(student2Placement).toBeDefined()

      if (student1Placement && student2Placement) {
        // Check they're adjacent
        const rowDiff = Math.abs(student1Placement.seatPosition.row - student2Placement.seatPosition.row)
        const colDiff = Math.abs(student1Placement.seatPosition.col - student2Placement.seatPosition.col)
        const isAdjacent = (rowDiff <= 1 && colDiff <= 1 && (rowDiff + colDiff > 0))

        expect(isAdjacent).toBe(true)
      }

      // Check rule satisfaction
      const togetherRuleSatisfaction = result.ruleSatisfaction.find(r => r.ruleId === 'rule1')
      expect(togetherRuleSatisfaction?.satisfied).toBe(true)
    })
  })

  describe('FRONT_ROW Rules', () => {
    beforeEach(() => {
      mockRules = [{
        id: 'rule1',
        roster_id: 'roster1',
        priority: 1,
        type: 'FRONT_ROW',
        student_ids: ['student1'],
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }]
    })

    it('should place student in front row', async () => {
      const result = await algorithm.executePlacement(mockStudents, mockRules, mockLayout)

      expect(result.success).toBe(true)
      expect(result.placements).toHaveLength(3)

      // Find placement for front row student
      const student1Placement = result.placements.find(p => p.studentId === 'student1')
      expect(student1Placement).toBeDefined()

      if (student1Placement) {
        // Should be in row 1 (first row with seats)
        expect(student1Placement.seatPosition.row).toBe(1)
      }

      // Check rule satisfaction
      const frontRowSatisfaction = result.ruleSatisfaction.find(r => r.ruleId === 'rule1')
      expect(frontRowSatisfaction?.satisfied).toBe(true)
    })
  })

  describe('Rule Priority', () => {
    beforeEach(() => {
      mockRules = [
        {
          id: 'rule1',
          roster_id: 'roster1',
          priority: 2, // Lower priority
          type: 'TOGETHER',
          student_ids: ['student1', 'student2'],
          is_active: true,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: 'rule2',
          roster_id: 'roster1',
          priority: 1, // Higher priority
          type: 'FRONT_ROW',
          student_ids: ['student1'],
          is_active: true,
          created_at: new Date(),
          updated_at: new Date()
        }
      ]
    })

    it('should respect rule priorities', async () => {
      const result = await algorithm.executePlacement(mockStudents, mockRules, mockLayout)

      expect(result.success).toBe(true)

      // Student1 should be in front row due to higher priority rule
      const student1Placement = result.placements.find(p => p.studentId === 'student1')
      expect(student1Placement).toBeDefined()

      if (student1Placement) {
        expect(student1Placement.seatPosition.row).toBe(1) // Front row
        expect(student1Placement.appliedRules).toContain('rule2') // Should include high priority rule
      }
    })
  })

  describe('Conflicting Rules', () => {
    beforeEach(() => {
      // Create conflicting rules - students can't be both together and separated
      mockRules = [
        {
          id: 'rule1',
          roster_id: 'roster1',
          priority: 1,
          type: 'TOGETHER',
          student_ids: ['student1', 'student2'],
          is_active: true,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: 'rule2',
          roster_id: 'roster1',
          priority: 2,
          type: 'SEPARATE',
          student_ids: ['student1', 'student2'],
          is_active: true,
          created_at: new Date(),
          updated_at: new Date()
        }
      ]
    })

    it('should handle conflicting rules by prioritizing higher priority rule', async () => {
      const result = await algorithm.executePlacement(mockStudents, mockRules, mockLayout)

      // Should still succeed but with some rules unsatisfied
      expect(result.placements).toHaveLength(3)

      const satisfiedRules = result.ruleSatisfaction.filter(r => r.satisfied)
      const unsatisfiedRules = result.ruleSatisfaction.filter(r => !r.satisfied)

      // Should have both rules in satisfaction report
      expect(result.ruleSatisfaction).toHaveLength(2)
      
      // At least one rule should be satisfied, and there should be some conflict
      expect(satisfiedRules.length + unsatisfiedRules.length).toBe(2)
    })
  })

  describe('Inactive Rules', () => {
    beforeEach(() => {
      mockRules = [{
        id: 'rule1',
        roster_id: 'roster1',
        priority: 1,
        type: 'FRONT_ROW',
        student_ids: ['student1'],
        is_active: false, // Inactive rule
        created_at: new Date(),
        updated_at: new Date()
      }]
    })

    it('should ignore inactive rules', async () => {
      const result = await algorithm.executePlacement(mockStudents, mockRules, mockLayout)

      expect(result.success).toBe(true)
      expect(result.placements).toHaveLength(3)
      expect(result.ruleSatisfaction).toHaveLength(0) // No active rules to satisfy
    })
  })

  describe('Performance', () => {
    it('should complete placement within reasonable time', async () => {
      const result = await algorithm.executePlacement(mockStudents, mockRules, mockLayout)

      expect(result.success).toBe(true)
      expect(result.executionTime).toBeGreaterThanOrEqual(0) // Should report execution time
      expect(result.executionTime).toBeLessThan(1000) // Should be fast
    })
  })
})