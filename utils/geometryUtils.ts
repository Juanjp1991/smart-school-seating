import { SeatPosition, SeatMap } from '@/types/placement'

/**
 * Calculate the distance between two seats
 */
export function calculateDistance(pos1: SeatPosition, pos2: SeatPosition): number {
  return Math.sqrt(Math.pow(pos1.row - pos2.row, 2) + Math.pow(pos1.col - pos2.col, 2))
}

/**
 * Calculate Manhattan distance (city block distance) between two seats
 */
export function calculateManhattanDistance(pos1: SeatPosition, pos2: SeatPosition): number {
  return Math.abs(pos1.row - pos2.row) + Math.abs(pos1.col - pos2.col)
}

/**
 * Check if two seats are adjacent (sharing an edge, not diagonal)
 */
export function areAdjacent(pos1: SeatPosition, pos2: SeatPosition): boolean {
  const distance = calculateManhattanDistance(pos1, pos2)
  return distance === 1
}

/**
 * Check if two seats are adjacent including diagonally
 */
export function areAdjacentIncludingDiagonal(pos1: SeatPosition, pos2: SeatPosition): boolean {
  const rowDiff = Math.abs(pos1.row - pos2.row)
  const colDiff = Math.abs(pos1.col - pos2.col)
  return rowDiff <= 1 && colDiff <= 1 && (rowDiff + colDiff > 0)
}

/**
 * Get all adjacent seats to a given position
 */
export function getAdjacentSeats(position: SeatPosition, seatMap: SeatMap): SeatPosition[] {
  const adjacent: SeatPosition[] = []
  const directions = [
    { row: -1, col: 0 },  // up
    { row: 1, col: 0 },   // down
    { row: 0, col: -1 },  // left
    { row: 0, col: 1 }    // right
  ]

  directions.forEach(dir => {
    const newRow = position.row + dir.row
    const newCol = position.col + dir.col

    if (isValidSeat({ row: newRow, col: newCol }, seatMap)) {
      adjacent.push({ row: newRow, col: newCol })
    }
  })

  return adjacent
}

/**
 * Get all seats within a certain distance of a position
 */
export function getSeatsWithinDistance(
  center: SeatPosition, 
  distance: number, 
  seatMap: SeatMap
): SeatPosition[] {
  const seats: SeatPosition[] = []

  for (let row = 0; row < seatMap.rows; row++) {
    for (let col = 0; col < seatMap.cols; col++) {
      const position = { row, col }
      if (isValidSeat(position, seatMap)) {
        if (calculateDistance(center, position) <= distance) {
          seats.push(position)
        }
      }
    }
  }

  return seats
}

/**
 * Check if a position is a valid seat
 */
export function isValidSeat(position: SeatPosition, seatMap: SeatMap): boolean {
  const { row, col } = position
  return (
    row >= 0 && row < seatMap.rows &&
    col >= 0 && col < seatMap.cols &&
    seatMap.seats[row] && seatMap.seats[row][col]
  )
}

/**
 * Get front row positions
 */
export function getFrontRowSeats(seatMap: SeatMap): SeatPosition[] {
  const frontSeats: SeatPosition[] = []
  
  // Find the first row that has seats
  for (let row = 0; row < seatMap.rows; row++) {
    let hasSeats = false
    for (let col = 0; col < seatMap.cols; col++) {
      if (seatMap.seats[row] && seatMap.seats[row][col]) {
        frontSeats.push({ row, col })
        hasSeats = true
      }
    }
    if (hasSeats) {
      break // Only return the first row with seats
    }
  }
  
  return frontSeats
}

/**
 * Get back row positions
 */
export function getBackRowSeats(seatMap: SeatMap): SeatPosition[] {
  const backSeats: SeatPosition[] = []
  
  // Find the last row that has seats
  for (let row = seatMap.rows - 1; row >= 0; row--) {
    let hasSeats = false
    for (let col = 0; col < seatMap.cols; col++) {
      if (seatMap.seats[row] && seatMap.seats[row][col]) {
        backSeats.push({ row, col })
        hasSeats = true
      }
    }
    if (hasSeats) {
      break // Only return the last row with seats
    }
  }
  
  return backSeats
}

/**
 * Get seats near teacher's desk
 */
export function getSeatsNearTeacher(seatMap: SeatMap, maxDistance: number = 2): SeatPosition[] {
  if (!seatMap.teacherDesk || seatMap.teacherDesk.length === 0) {
    // If no teacher desk, return front row seats as fallback
    return getFrontRowSeats(seatMap)
  }

  const nearTeacherSeats: SeatPosition[] = []
  
  seatMap.teacherDesk.forEach(deskPos => {
    const nearbySeats = getSeatsWithinDistance(deskPos, maxDistance, seatMap)
    nearbySeats.forEach(seat => {
      // Avoid duplicates
      if (!nearTeacherSeats.some(existing => 
        existing.row === seat.row && existing.col === seat.col
      )) {
        nearTeacherSeats.push(seat)
      }
    })
  })

  // Sort by distance to teacher desk
  if (seatMap.teacherDesk.length > 0) {
    const teacherCenter = seatMap.teacherDesk[0]
    nearTeacherSeats.sort((a, b) => 
      calculateDistance(a, teacherCenter) - calculateDistance(b, teacherCenter)
    )
  }

  return nearTeacherSeats
}

/**
 * Get seats near door
 */
export function getSeatsNearDoor(seatMap: SeatMap, maxDistance: number = 2): SeatPosition[] {
  if (!seatMap.door) {
    // If no door, return seats closest to the edge as fallback
    return getEdgeSeats(seatMap)
  }

  const nearDoorSeats = getSeatsWithinDistance(seatMap.door, maxDistance, seatMap)
  
  // Sort by distance to door
  nearDoorSeats.sort((a, b) => 
    calculateDistance(a, seatMap.door!) - calculateDistance(b, seatMap.door!)
  )

  return nearDoorSeats
}

/**
 * Get seats along the edges of the seating area
 */
export function getEdgeSeats(seatMap: SeatMap): SeatPosition[] {
  const edgeSeats: SeatPosition[] = []

  for (let row = 0; row < seatMap.rows; row++) {
    for (let col = 0; col < seatMap.cols; col++) {
      if (isValidSeat({ row, col }, seatMap)) {
        // Check if it's on the edge
        const isTopRow = row === 0
        const isBottomRow = row === seatMap.rows - 1
        const isLeftCol = col === 0
        const isRightCol = col === seatMap.cols - 1

        if (isTopRow || isBottomRow || isLeftCol || isRightCol) {
          edgeSeats.push({ row, col })
        }
      }
    }
  }

  return edgeSeats
}

/**
 * Find the best position for a group of students to sit together
 */
export function findGroupPosition(
  groupSize: number, 
  availableSeats: SeatPosition[], 
  seatMap: SeatMap
): SeatPosition[] | null {
  if (groupSize === 1) {
    return availableSeats.length > 0 ? [availableSeats[0]] : null
  }

  // Try to find adjacent seats for the group
  for (const seat of availableSeats) {
    const group = findAdjacentGroup(seat, groupSize, availableSeats, seatMap)
    if (group.length === groupSize) {
      return group
    }
  }

  // If no adjacent group found, try to find seats as close as possible
  return findCloseGroup(groupSize, availableSeats)
}

/**
 * Find adjacent seats starting from a position
 */
function findAdjacentGroup(
  startSeat: SeatPosition,
  targetSize: number,
  availableSeats: SeatPosition[],
  seatMap: SeatMap
): SeatPosition[] {
  const group: SeatPosition[] = [startSeat]
  const used = new Set([`${startSeat.row}-${startSeat.col}`])

  while (group.length < targetSize) {
    let found = false
    
    for (const seat of group) {
      const adjacent = getAdjacentSeats(seat, seatMap)
      
      for (const adjSeat of adjacent) {
        const key = `${adjSeat.row}-${adjSeat.col}`
        if (!used.has(key) && 
            availableSeats.some(s => s.row === adjSeat.row && s.col === adjSeat.col)) {
          group.push(adjSeat)
          used.add(key)
          found = true
          break
        }
      }
      
      if (found) break
    }
    
    if (!found) break
  }

  return group
}

/**
 * Find seats that are close to each other (fallback when adjacency isn't possible)
 */
function findCloseGroup(targetSize: number, availableSeats: SeatPosition[]): SeatPosition[] | null {
  if (availableSeats.length < targetSize) {
    return null
  }

  // Simple greedy approach: start with first seat, then find closest seats
  const group: SeatPosition[] = [availableSeats[0]]
  const remaining = availableSeats.slice(1)

  while (group.length < targetSize && remaining.length > 0) {
    let minDistance = Infinity
    let closestIndex = -1

    for (let i = 0; i < remaining.length; i++) {
      const seat = remaining[i]
      const avgDistance = group.reduce((sum, groupSeat) => 
        sum + calculateDistance(seat, groupSeat), 0
      ) / group.length

      if (avgDistance < minDistance) {
        minDistance = avgDistance
        closestIndex = i
      }
    }

    if (closestIndex >= 0) {
      group.push(remaining[closestIndex])
      remaining.splice(closestIndex, 1)
    } else {
      break
    }
  }

  return group.length === targetSize ? group : null
}

/**
 * Calculate a seat's preference score for different rule types
 */
export function calculateSeatScore(
  position: SeatPosition, 
  ruleType: string, 
  seatMap: SeatMap
): number {
  switch (ruleType) {
    case 'FRONT_ROW': {
      const frontSeats = getFrontRowSeats(seatMap)
      if (frontSeats.some(seat => seat.row === position.row && seat.col === position.col)) {
        return 100 // Perfect score for front row
      }
      // Score decreases with distance from front
      return Math.max(0, 100 - (position.row * 10))
    }

    case 'BACK_ROW': {
      const backSeats = getBackRowSeats(seatMap)
      if (backSeats.some(seat => seat.row === position.row && seat.col === position.col)) {
        return 100 // Perfect score for back row
      }
      // Score increases with distance from front
      return Math.max(0, (position.row * 10))
    }

    case 'NEAR_TEACHER': {
      const nearTeacherSeats = getSeatsNearTeacher(seatMap)
      const index = nearTeacherSeats.findIndex(seat => 
        seat.row === position.row && seat.col === position.col
      )
      if (index >= 0) {
        return Math.max(0, 100 - (index * 10)) // Closer seats get higher scores
      }
      return 0
    }

    case 'NEAR_DOOR': {
      const nearDoorSeats = getSeatsNearDoor(seatMap)
      const index = nearDoorSeats.findIndex(seat => 
        seat.row === position.row && seat.col === position.col
      )
      if (index >= 0) {
        return Math.max(0, 100 - (index * 10)) // Closer seats get higher scores
      }
      return 0
    }

    default:
      return 50 // Neutral score
  }
}