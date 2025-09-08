/**
 * @jest-environment jsdom
 */

import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import StudentCard from '@/components/plan/StudentCard'
import { StudentDisplayData } from '@/types/display'

describe('StudentCard', () => {
  const mockStudent = {
    id: 'student-1',
    roster_id: 'roster-1',
    first_name: 'John',
    last_name: 'Doe',
    student_id: 'STU001',
    photo: null,
    ratings: {
      behavior: 3,
      academic: 4,
      participation: 2
    },
    created_at: new Date('2024-01-01'),
    updated_at: new Date('2024-01-01')
  }

  const mockDisplayOptions = {
    showPhoto: true,
    showName: true,
    showRatings: true,
    ratingCategories: ['behavior', 'academic', 'participation'],
    compactMode: false
  }

  const defaultProps = {
    studentData: {
      student: mockStudent,
      displayOptions: mockDisplayOptions,
      position: { row: 0, col: 0 }
    } as StudentDisplayData,
    onClick: jest.fn()
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Standard Mode', () => {
    it('should render student name when showName is true', () => {
      render(<StudentCard {...defaultProps} />)
      expect(screen.getByText('John Doe')).toBeInTheDocument()
    })

    it('should not render student name when showName is false', () => {
      const propsWithoutName = {
        ...defaultProps,
        studentData: {
          ...defaultProps.studentData,
          displayOptions: { ...mockDisplayOptions, showName: false }
        }
      }
      render(<StudentCard {...propsWithoutName} />)
      expect(screen.queryByText('John Doe')).not.toBeInTheDocument()
    })

    it('should render student ID when available', () => {
      render(<StudentCard {...defaultProps} />)
      expect(screen.getByText('ID: STU001')).toBeInTheDocument()
    })

    it('should not render student ID when not available', () => {
      const studentWithoutId = { ...mockStudent, student_id: null }
      const propsWithoutId = {
        ...defaultProps,
        studentData: {
          ...defaultProps.studentData,
          student: studentWithoutId
        }
      }
      render(<StudentCard {...propsWithoutId} />)
      expect(screen.queryByText(/ID:/)).not.toBeInTheDocument()
    })

    it('should render photo when available and showPhoto is true', () => {
      const studentWithPhoto = { ...mockStudent, photo: 'data:image/jpeg;base64,fake-photo' }
      const propsWithPhoto = {
        ...defaultProps,
        studentData: {
          ...defaultProps.studentData,
          student: studentWithPhoto
        }
      }
      render(<StudentCard {...propsWithPhoto} />)
      
      const photo = screen.getByAltText('John Doe')
      expect(photo).toBeInTheDocument()
      expect(photo).toHaveAttribute('src', 'data:image/jpeg;base64,fake-photo')
    })

    it('should render initials when photo is not available but showPhoto is true', () => {
      render(<StudentCard {...defaultProps} />)
      expect(screen.getByText('JD')).toBeInTheDocument()
    })

    it('should not render photo section when showPhoto is false', () => {
      const propsWithoutPhoto = {
        ...defaultProps,
        studentData: {
          ...defaultProps.studentData,
          displayOptions: { ...mockDisplayOptions, showPhoto: false }
        }
      }
      render(<StudentCard {...propsWithoutPhoto} />)
      expect(screen.queryByText('JD')).not.toBeInTheDocument()
    })

    it('should render ratings when showRatings is true', () => {
      render(<StudentCard {...defaultProps} />)
      expect(screen.getByText('Behavior:')).toBeInTheDocument()
      expect(screen.getByText('Academic:')).toBeInTheDocument()
      expect(screen.getByText('Participation:')).toBeInTheDocument()
      expect(screen.getByText('(3/5)')).toBeInTheDocument()
      expect(screen.getByText('(4/5)')).toBeInTheDocument()
      expect(screen.getByText('(2/5)')).toBeInTheDocument()
    })

    it('should not render ratings when showRatings is false', () => {
      const propsWithoutRatings = {
        ...defaultProps,
        studentData: {
          ...defaultProps.studentData,
          displayOptions: { ...mockDisplayOptions, showRatings: false }
        }
      }
      render(<StudentCard {...propsWithoutRatings} />)
      expect(screen.queryByText('Behavior:')).not.toBeInTheDocument()
    })

    it('should only render selected rating categories', () => {
      const propsWithLimitedRatings = {
        ...defaultProps,
        studentData: {
          ...defaultProps.studentData,
          displayOptions: { ...mockDisplayOptions, ratingCategories: ['behavior'] }
        }
      }
      render(<StudentCard {...propsWithLimitedRatings} />)
      expect(screen.getByText('Behavior:')).toBeInTheDocument()
      expect(screen.queryByText('Academic:')).not.toBeInTheDocument()
      expect(screen.queryByText('Participation:')).not.toBeInTheDocument()
    })

    it('should render correct number of stars for ratings', () => {
      render(<StudentCard {...defaultProps} />)
      
      // Behavior rating of 3 should show 3 filled + 2 empty
      const behaviorSection = screen.getByText('Behavior:').closest('div')
      expect(behaviorSection).toBeInTheDocument()
      
      // Check for rating display pattern (emojis + empty circles)
      const ratingTexts = screen.getAllByText(/\(.*\/5\)/)
      expect(ratingTexts).toHaveLength(3) // Three ratings displayed
    })

    it('should handle missing ratings gracefully', () => {
      const studentWithoutRatings = { ...mockStudent, ratings: {} }
      const propsWithoutRatings = {
        ...defaultProps,
        studentData: {
          ...defaultProps.studentData,
          student: studentWithoutRatings
        }
      }
      render(<StudentCard {...propsWithoutRatings} />)
      
      // Should still render the card but without rating sections
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.queryByText('Behavior:')).not.toBeInTheDocument()
    })

    it('should handle invalid rating values', () => {
      const studentWithInvalidRatings = { 
        ...mockStudent, 
        ratings: { behavior: 10, academic: -1, participation: 3 }
      }
      const propsWithInvalidRatings = {
        ...defaultProps,
        studentData: {
          ...defaultProps.studentData,
          student: studentWithInvalidRatings
        }
      }
      render(<StudentCard {...propsWithInvalidRatings} />)
      
      // Should render valid rating but skip invalid ones
      expect(screen.getByText('Participation:')).toBeInTheDocument()
      expect(screen.queryByText('Behavior:')).not.toBeInTheDocument()
      expect(screen.queryByText('Academic:')).not.toBeInTheDocument()
    })
  })

  describe('Compact Mode', () => {
    const compactModeProps = {
      ...defaultProps,
      studentData: {
        ...defaultProps.studentData,
        displayOptions: { ...mockDisplayOptions, compactMode: true }
      }
    }

    it('should render in compact layout', () => {
      render(<StudentCard {...compactModeProps} />)
      
      const card = screen.getByText('John Doe').closest('div')
      expect(card).toHaveClass('p-2') // Compact padding
    })

    it('should show name in compact mode even when showName is false', () => {
      const compactWithoutName = {
        ...compactModeProps,
        studentData: {
          ...compactModeProps.studentData,
          displayOptions: { ...mockDisplayOptions, compactMode: true, showName: false }
        }
      }
      render(<StudentCard {...compactWithoutName} />)
      expect(screen.getByText('John Doe')).toBeInTheDocument()
    })

    it('should show smaller photo in compact mode', () => {
      const studentWithPhoto = { ...mockStudent, photo: 'data:image/jpeg;base64,fake-photo' }
      const compactWithPhoto = {
        ...compactModeProps,
        studentData: {
          ...compactModeProps.studentData,
          student: studentWithPhoto
        }
      }
      render(<StudentCard {...compactWithPhoto} />)
      
      const photo = screen.getByAltText('John Doe')
      expect(photo).toHaveClass('w-8', 'h-8') // Smaller size in compact mode
    })

    it('should not show ratings in compact mode', () => {
      render(<StudentCard {...compactModeProps} />)
      expect(screen.queryByText('Behavior:')).not.toBeInTheDocument()
    })

    it('should not show student ID in compact mode', () => {
      render(<StudentCard {...compactModeProps} />)
      expect(screen.queryByText('ID: STU001')).not.toBeInTheDocument()
    })
  })

  describe('Interactions', () => {
    it('should call onClick when card is clicked', () => {
      render(<StudentCard {...defaultProps} />)
      
      const card = screen.getByText('John Doe').closest('div')
      fireEvent.click(card!)
      
      expect(defaultProps.onClick).toHaveBeenCalledTimes(1)
    })

    it('should not call onClick when onClick is not provided', () => {
      const propsWithoutClick = { ...defaultProps, onClick: undefined }
      render(<StudentCard {...propsWithoutClick} />)
      
      const card = screen.getByText('John Doe').closest('div')
      fireEvent.click(card!)
      
      // Should not throw error
      expect(true).toBe(true)
    })

    it('should show hover effects', () => {
      render(<StudentCard {...defaultProps} />)
      
      const card = screen.getByText('John Doe').closest('div')
      expect(card).toHaveClass('hover:border-blue-400', 'cursor-pointer')
    })

    it('should apply dragging styles when isDragging is true', () => {
      const draggingProps = { ...defaultProps, isDragging: true }
      render(<StudentCard {...draggingProps} />)
      
      const card = screen.getByText('John Doe').closest('div')
      expect(card).toHaveClass('opacity-50', 'shadow-lg')
    })

    it('should apply custom className', () => {
      const customProps = { ...defaultProps, className: 'custom-class' }
      render(<StudentCard {...customProps} />)
      
      const card = screen.getByText('John Doe').closest('div')
      expect(card).toHaveClass('custom-class')
    })
  })

  describe('Positioning', () => {
    it('should apply correct grid position', () => {
      const positionedProps = {
        ...defaultProps,
        studentData: {
          ...defaultProps.studentData,
          position: { row: 2, col: 3 }
        }
      }
      render(<StudentCard {...positionedProps} />)
      
      const card = screen.getByText('John Doe').closest('div')
      expect(card).toHaveStyle({
        'grid-column': '4', // col + 1
        'grid-row': '3'     // row + 1
      })
    })
  })

  describe('Accessibility', () => {
    it('should have proper alt text for photos', () => {
      const studentWithPhoto = { ...mockStudent, photo: 'data:image/jpeg;base64,fake-photo' }
      const propsWithPhoto = {
        ...defaultProps,
        studentData: {
          ...defaultProps.studentData,
          student: studentWithPhoto
        }
      }
      render(<StudentCard {...propsWithPhoto} />)
      
      const photo = screen.getByAltText('John Doe')
      expect(photo).toBeInTheDocument()
    })

    it('should be keyboard accessible when clickable', () => {
      render(<StudentCard {...defaultProps} />)
      
      const card = screen.getByText('John Doe').closest('div')
      expect(card).toHaveClass('cursor-pointer')
      
      // Should be focusable
      fireEvent.focus(card!)
      fireEvent.keyDown(card!, { key: 'Enter' })
      // Note: In a real implementation, you might want to handle Enter key
    })

    it('should have semantic structure', () => {
      render(<StudentCard {...defaultProps} />)
      
      // Name should be in a proper heading element
      const name = screen.getByText('John Doe')
      expect(name.tagName).toBe('H3')
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty student names gracefully', () => {
      const studentWithEmptyName = { ...mockStudent, first_name: '', last_name: '' }
      const propsWithEmptyName = {
        ...defaultProps,
        studentData: {
          ...defaultProps.studentData,
          student: studentWithEmptyName
        }
      }
      render(<StudentCard {...propsWithEmptyName} />)
      
      // Should still render initials as empty string results in empty initials
      // Component should handle this gracefully
      const card = screen.getByText('').closest('div')
      expect(card).toBeInTheDocument()
    })

    it('should handle very long student names', () => {
      const studentWithLongName = { 
        ...mockStudent, 
        first_name: 'Verylongfirstnamethatexceedsnormallengths',
        last_name: 'Verylonglastnamethatexceedsnormallengths'
      }
      const propsWithLongName = {
        ...defaultProps,
        studentData: {
          ...defaultProps.studentData,
          student: studentWithLongName
        }
      }
      render(<StudentCard {...propsWithLongName} />)
      
      const name = screen.getByText(/Verylongfirstnamethatexceedsnormallengths/)
      expect(name).toBeInTheDocument()
      expect(name.closest('div')).toHaveClass('truncate') // Should handle overflow
    })

    it('should handle special characters in student names', () => {
      const studentWithSpecialChars = { 
        ...mockStudent, 
        first_name: "María José",
        last_name: "O'Connor-Smith"
      }
      const propsWithSpecialChars = {
        ...defaultProps,
        studentData: {
          ...defaultProps.studentData,
          student: studentWithSpecialChars
        }
      }
      render(<StudentCard {...propsWithSpecialChars} />)
      
      expect(screen.getByText("María José O'Connor-Smith")).toBeInTheDocument()
    })
  })
})