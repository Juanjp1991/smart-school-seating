import {
  calculateDistance,
  calculateManhattanDistance,
  areAdjacent,
  areAdjacentIncludingDiagonal,
  getAdjacentSeats,
  getSeatsWithinDistance,
  isValidSeat,
  getFrontRowSeats,
  getBackRowSeats,
  getSeatsNearTeacher,
  getSeatsNearDoor,
  calculateSeatScore
} from '@/utils/geometryUtils'
import { SeatPosition, SeatMap } from '@/types/placement'

describe('GeometryUtils', () => {
  let mockSeatMap: SeatMap

  beforeEach(() => {
    // Create a 4x4 seat map with some seats
    mockSeatMap = {
      rows: 4,
      cols: 4,
      seats: [
        [false, true, true, false],  // Row 0: seats at (0,1), (0,2)
        [true, true, true, true],    // Row 1: all seats
        [true, true, true, true],    // Row 2: all seats  
        [false, true, true, false]   // Row 3: seats at (3,1), (3,2)
      ],
      teacherDesk: [{ row: 0, col: 0 }],
      door: { row: 3, col: 3 }
    }
  })

  describe('Distance Calculations', () => {
    it('should calculate Euclidean distance correctly', () => {
      const pos1: SeatPosition = { row: 0, col: 0 }
      const pos2: SeatPosition = { row: 3, col: 4 }
      
      const distance = calculateDistance(pos1, pos2)
      expect(distance).toBe(5) // 3-4-5 triangle
    })

    it('should calculate Manhattan distance correctly', () => {
      const pos1: SeatPosition = { row: 1, col: 1 }
      const pos2: SeatPosition = { row: 3, col: 4 }
      
      const distance = calculateManhattanDistance(pos1, pos2)
      expect(distance).toBe(5) // |3-1| + |4-1| = 2 + 3 = 5
    })
  })

  describe('Adjacency', () => {
    it('should detect adjacent seats (edge sharing)', () => {
      const pos1: SeatPosition = { row: 1, col: 1 }
      const pos2: SeatPosition = { row: 1, col: 2 }
      const pos3: SeatPosition = { row: 2, col: 1 }
      const pos4: SeatPosition = { row: 2, col: 2 }

      expect(areAdjacent(pos1, pos2)).toBe(true)  // horizontal
      expect(areAdjacent(pos1, pos3)).toBe(true)  // vertical
      expect(areAdjacent(pos1, pos4)).toBe(false) // diagonal
    })

    it('should detect adjacent seats including diagonals', () => {
      const pos1: SeatPosition = { row: 1, col: 1 }
      const pos2: SeatPosition = { row: 1, col: 2 }
      const pos3: SeatPosition = { row: 2, col: 2 }
      const pos4: SeatPosition = { row: 3, col: 3 }

      expect(areAdjacentIncludingDiagonal(pos1, pos2)).toBe(true)  // horizontal
      expect(areAdjacentIncludingDiagonal(pos1, pos3)).toBe(true)  // diagonal
      expect(areAdjacentIncludingDiagonal(pos1, pos4)).toBe(false) // too far
    })

    it('should get all adjacent seats', () => {
      const center: SeatPosition = { row: 1, col: 1 }
      const adjacent = getAdjacentSeats(center, mockSeatMap)

      // Should have 4 adjacent seats: up, down, left, right
      expect(adjacent).toHaveLength(4)
      expect(adjacent).toContainEqual({ row: 0, col: 1 })
      expect(adjacent).toContainEqual({ row: 2, col: 1 })
      expect(adjacent).toContainEqual({ row: 1, col: 0 })
      expect(adjacent).toContainEqual({ row: 1, col: 2 })
    })

    it('should handle edge cases for adjacent seats', () => {
      const corner: SeatPosition = { row: 0, col: 1 }
      const adjacent = getAdjacentSeats(corner, mockSeatMap)

      // Corner seat should have fewer adjacent seats
      expect(adjacent).toHaveLength(2) // down and right only
      expect(adjacent).toContainEqual({ row: 1, col: 1 })
      expect(adjacent).toContainEqual({ row: 0, col: 2 })
    })
  })

  describe('Seat Validation', () => {
    it('should validate seat positions correctly', () => {
      expect(isValidSeat({ row: 1, col: 1 }, mockSeatMap)).toBe(true)  // Valid seat
      expect(isValidSeat({ row: 0, col: 0 }, mockSeatMap)).toBe(false) // Not a seat
      expect(isValidSeat({ row: -1, col: 1 }, mockSeatMap)).toBe(false) // Out of bounds
      expect(isValidSeat({ row: 4, col: 1 }, mockSeatMap)).toBe(false)  // Out of bounds
    })
  })

  describe('Distance-based Selection', () => {
    it('should get seats within specified distance', () => {
      const center: SeatPosition = { row: 1, col: 1 }
      const nearbySeats = getSeatsWithinDistance(center, 1.5, mockSeatMap)

      // Should include seats within Manhattan distance 1.5
      expect(nearbySeats.length).toBeGreaterThan(0)
      expect(nearbySeats).toContainEqual({ row: 1, col: 1 }) // Center itself
      expect(nearbySeats).toContainEqual({ row: 1, col: 2 }) // Adjacent
    })
  })

  describe('Row-based Selection', () => {
    it('should get front row seats', () => {
      const frontSeats = getFrontRowSeats(mockSeatMap)
      
      // First row with seats is row 0
      expect(frontSeats).toHaveLength(2)
      expect(frontSeats).toContainEqual({ row: 0, col: 1 })
      expect(frontSeats).toContainEqual({ row: 0, col: 2 })
    })

    it('should get back row seats', () => {
      const backSeats = getBackRowSeats(mockSeatMap)
      
      // Last row with seats is row 3
      expect(backSeats).toHaveLength(2)
      expect(backSeats).toContainEqual({ row: 3, col: 1 })
      expect(backSeats).toContainEqual({ row: 3, col: 2 })
    })
  })

  describe('Teacher and Door Proximity', () => {
    it('should get seats near teacher desk', () => {
      const nearTeacherSeats = getSeatsNearTeacher(mockSeatMap, 2)
      
      expect(nearTeacherSeats.length).toBeGreaterThan(0)
      
      // Should be sorted by distance from teacher desk at (0,0)
      const distances = nearTeacherSeats.map(seat => 
        calculateDistance(seat, mockSeatMap.teacherDesk![0])
      )
      
      // Check if sorted in ascending order
      for (let i = 1; i < distances.length; i++) {
        expect(distances[i]).toBeGreaterThanOrEqual(distances[i - 1])
      }
    })

    it('should get seats near door', () => {
      const nearDoorSeats = getSeatsNearDoor(mockSeatMap, 2)
      
      expect(nearDoorSeats.length).toBeGreaterThan(0)
      
      // Should be sorted by distance from door at (3,3)
      const distances = nearDoorSeats.map(seat => 
        calculateDistance(seat, mockSeatMap.door!)
      )
      
      // Check if sorted in ascending order
      for (let i = 1; i < distances.length; i++) {
        expect(distances[i]).toBeGreaterThanOrEqual(distances[i - 1])
      }
    })

    it('should handle missing teacher desk gracefully', () => {
      const seatMapNoDesk = { ...mockSeatMap, teacherDesk: undefined }
      const nearTeacherSeats = getSeatsNearTeacher(seatMapNoDesk)
      
      // Should fallback to front row
      expect(nearTeacherSeats.length).toBeGreaterThan(0)
    })

    it('should handle missing door gracefully', () => {
      const seatMapNoDoor = { ...mockSeatMap, door: undefined }
      const nearDoorSeats = getSeatsNearDoor(seatMapNoDoor)
      
      // Should fallback to edge seats
      expect(nearDoorSeats.length).toBeGreaterThan(0)
    })
  })

  describe('Seat Scoring', () => {
    it('should score front row positions highly for FRONT_ROW rule', () => {
      const frontSeat: SeatPosition = { row: 0, col: 1 } // Front row
      const backSeat: SeatPosition = { row: 3, col: 1 }  // Back row
      
      const frontScore = calculateSeatScore(frontSeat, 'FRONT_ROW', mockSeatMap)
      const backScore = calculateSeatScore(backSeat, 'FRONT_ROW', mockSeatMap)
      
      expect(frontScore).toBeGreaterThan(backScore)
      expect(frontScore).toBe(100) // Perfect score for front row
    })

    it('should score back row positions highly for BACK_ROW rule', () => {
      const frontSeat: SeatPosition = { row: 0, col: 1 } // Front row
      const backSeat: SeatPosition = { row: 3, col: 1 }  // Back row
      
      const frontScore = calculateSeatScore(frontSeat, 'BACK_ROW', mockSeatMap)
      const backScore = calculateSeatScore(backSeat, 'BACK_ROW', mockSeatMap)
      
      expect(backScore).toBeGreaterThan(frontScore)
      expect(backScore).toBe(100) // Perfect score for back row
    })

    it('should score teacher proximity highly for NEAR_TEACHER rule', () => {
      const nearTeacher: SeatPosition = { row: 0, col: 1 } // Close to teacher at (0,0)
      const farFromTeacher: SeatPosition = { row: 3, col: 2 } // Far from teacher
      
      const nearScore = calculateSeatScore(nearTeacher, 'NEAR_TEACHER', mockSeatMap)
      const farScore = calculateSeatScore(farFromTeacher, 'NEAR_TEACHER', mockSeatMap)
      
      expect(nearScore).toBeGreaterThan(farScore)
    })

    it('should score door proximity highly for NEAR_DOOR rule', () => {
      const nearDoor: SeatPosition = { row: 3, col: 2 } // Close to door at (3,3)
      const farFromDoor: SeatPosition = { row: 0, col: 1 } // Far from door
      
      const nearScore = calculateSeatScore(nearDoor, 'NEAR_DOOR', mockSeatMap)
      const farScore = calculateSeatScore(farFromDoor, 'NEAR_DOOR', mockSeatMap)
      
      expect(nearScore).toBeGreaterThan(farScore)
    })

    it('should return neutral score for unknown rule types', () => {
      const seat: SeatPosition = { row: 1, col: 1 }
      const score = calculateSeatScore(seat, 'UNKNOWN_RULE', mockSeatMap)
      
      expect(score).toBe(50) // Neutral score
    })
  })
})