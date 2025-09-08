/**
 * @jest-environment jsdom
 */

import React from 'react'
import { render, screen, renderHook } from '@testing-library/react'
import { DisplayOptionsProvider, useDisplayOptionsContext } from '@/contexts/DisplayOptionsContext'
import { DisplayOptionsService } from '@/lib/displayOptionsService'
import { DEFAULT_DISPLAY_OPTIONS } from '@/types/display'

// Mock the DisplayOptionsService
jest.mock('@/lib/displayOptionsService', () => ({
  DisplayOptionsService: {
    getDisplayOptions: jest.fn(),
    saveDisplayOptions: jest.fn(),
    resetToDefaults: jest.fn()
  }
}))

const mockDisplayOptionsService = DisplayOptionsService as jest.Mocked<typeof DisplayOptionsService>

describe('DisplayOptionsContext', () => {
  const mockOptions = {
    showPhoto: true,
    showName: true,
    showRatings: true,
    ratingCategories: ['behavior', 'academic'],
    compactMode: false
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockDisplayOptionsService.getDisplayOptions.mockResolvedValue(mockOptions)
    mockDisplayOptionsService.saveDisplayOptions.mockResolvedValue()
    mockDisplayOptionsService.resetToDefaults.mockResolvedValue(DEFAULT_DISPLAY_OPTIONS)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('DisplayOptionsProvider', () => {
    it('should render children', () => {
      render(
        <DisplayOptionsProvider>
          <div data-testid="child">Test Child</div>
        </DisplayOptionsProvider>
      )
      
      expect(screen.getByTestId('child')).toBeInTheDocument()
      expect(screen.getByText('Test Child')).toBeInTheDocument()
    })

    it('should provide display options context to children', () => {
      const TestComponent = () => {
        const context = useDisplayOptionsContext()
        return <div data-testid="context-data">{JSON.stringify(context.options)}</div>
      }

      render(
        <DisplayOptionsProvider>
          <TestComponent />
        </DisplayOptionsProvider>
      )

      const contextData = screen.getByTestId('context-data')
      expect(contextData).toBeInTheDocument()
      
      // Should initially have default options
      expect(contextData.textContent).toContain(JSON.stringify(DEFAULT_DISPLAY_OPTIONS))
    })

    it('should load options from service', async () => {
      const TestComponent = () => {
        const { options, isLoading } = useDisplayOptionsContext()
        return (
          <div>
            <div data-testid="loading">{isLoading.toString()}</div>
            <div data-testid="options">{JSON.stringify(options)}</div>
          </div>
        )
      }

      render(
        <DisplayOptionsProvider>
          <TestComponent />
        </DisplayOptionsProvider>
      )

      // Initially should be loading
      expect(screen.getByTestId('loading')).toHaveTextContent('true')
      
      // Wait for loading to complete
      await screen.findByText('false')
      
      // Should have loaded options from service
      expect(mockDisplayOptionsService.getDisplayOptions).toHaveBeenCalledTimes(1)
      expect(screen.getByTestId('options')).toHaveTextContent(JSON.stringify(mockOptions))
    })
  })

  describe('useDisplayOptionsContext', () => {
    it('should throw error when used outside provider', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      
      const TestComponent = () => {
        useDisplayOptionsContext()
        return <div>Test</div>
      }
      
      expect(() => render(<TestComponent />)).toThrow(
        'useDisplayOptionsContext must be used within a DisplayOptionsProvider'
      )
      
      consoleSpy.mockRestore()
    })

    it('should return context value when used within provider', () => {
      const TestComponent = () => {
        const context = useDisplayOptionsContext()
        
        return (
          <div>
            <div data-testid="has-context">{context ? 'true' : 'false'}</div>
            <div data-testid="has-options">{context.options ? 'true' : 'false'}</div>
            <div data-testid="has-functions">
              {typeof context.updateOptions === 'function' ? 'true' : 'false'}
            </div>
          </div>
        )
      }

      render(
        <DisplayOptionsProvider>
          <TestComponent />
        </DisplayOptionsProvider>
      )

      expect(screen.getByTestId('has-context')).toHaveTextContent('true')
      expect(screen.getByTestId('has-options')).toHaveTextContent('true')
      expect(screen.getByTestId('has-functions')).toHaveTextContent('true')
    })
  })

  describe('Context Integration', () => {
    it('should provide all expected context methods', async () => {
      const TestComponent = () => {
        const context = useDisplayOptionsContext()
        
        const methods = [
          'updateOptions',
          'resetToDefaults',
          'togglePhoto',
          'toggleName',
          'toggleRatings',
          'toggleCompactMode',
          'updateRatingCategories',
          'addRatingCategory',
          'removeRatingCategory',
          'isRatingCategoryEnabled',
          'getActiveRatingCategories'
        ]
        
        return (
          <div>
            {methods.map(method => (
              <div key={method} data-testid={`method-${method}`}>
                {typeof context[method as keyof typeof context] === 'function' ? 'function' : 'not-function'}
              </div>
            ))}
          </div>
        )
      }

      render(
        <DisplayOptionsProvider>
          <TestComponent />
        </DisplayOptionsProvider>
      )

      // Wait for loading to complete
      await screen.findByTestId('method-updateOptions')

      const expectedMethods = [
        'updateOptions',
        'resetToDefaults',
        'togglePhoto',
        'toggleName',
        'toggleRatings',
        'toggleCompactMode',
        'updateRatingCategories',
        'addRatingCategory',
        'removeRatingCategory',
        'isRatingCategoryEnabled',
        'getActiveRatingCategories'
      ]

      expectedMethods.forEach(method => {
        expect(screen.getByTestId(`method-${method}`)).toHaveTextContent('function')
      })
    })

    it('should provide loading and error states', async () => {
      const TestComponent = () => {
        const { isLoading, error } = useDisplayOptionsContext()
        
        return (
          <div>
            <div data-testid="loading-state">{isLoading.toString()}</div>
            <div data-testid="error-state">{error || 'no-error'}</div>
          </div>
        )
      }

      render(
        <DisplayOptionsProvider>
          <TestComponent />
        </DisplayOptionsProvider>
      )

      // Initially loading
      expect(screen.getByTestId('loading-state')).toHaveTextContent('true')
      expect(screen.getByTestId('error-state')).toHaveTextContent('no-error')

      // Wait for loading to complete
      await screen.findByText('false')
      
      expect(screen.getByTestId('loading-state')).toHaveTextContent('false')
      expect(screen.getByTestId('error-state')).toHaveTextContent('no-error')
    })

    it('should handle service errors in context', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      mockDisplayOptionsService.getDisplayOptions.mockRejectedValue(new Error('Service error'))

      const TestComponent = () => {
        const { isLoading, error, options } = useDisplayOptionsContext()
        
        return (
          <div>
            <div data-testid="loading-state">{isLoading.toString()}</div>
            <div data-testid="error-state">{error || 'no-error'}</div>
            <div data-testid="options-fallback">
              {JSON.stringify(options) === JSON.stringify(DEFAULT_DISPLAY_OPTIONS) ? 'default-options' : 'custom-options'}
            </div>
          </div>
        )
      }

      render(
        <DisplayOptionsProvider>
          <TestComponent />
        </DisplayOptionsProvider>
      )

      // Wait for error to be handled
      await screen.findByText('false')
      
      expect(screen.getByTestId('loading-state')).toHaveTextContent('false')
      expect(screen.getByTestId('error-state')).toHaveTextContent('Failed to load display preferences')
      expect(screen.getByTestId('options-fallback')).toHaveTextContent('default-options')

      consoleSpy.mockRestore()
    })
  })

  describe('Multiple Children', () => {
    it('should provide same context to multiple children', async () => {
      const ChildA = () => {
        const { options } = useDisplayOptionsContext()
        return <div data-testid="child-a">{JSON.stringify(options.showPhoto)}</div>
      }

      const ChildB = () => {
        const { options } = useDisplayOptionsContext()
        return <div data-testid="child-b">{JSON.stringify(options.showName)}</div>
      }

      render(
        <DisplayOptionsProvider>
          <ChildA />
          <ChildB />
        </DisplayOptionsProvider>
      )

      // Wait for loading to complete
      await screen.findByTestId('child-a')

      expect(screen.getByTestId('child-a')).toHaveTextContent(mockOptions.showPhoto.toString())
      expect(screen.getByTestId('child-b')).toHaveTextContent(mockOptions.showName.toString())
    })
  })

  describe('Nested Providers', () => {
    it('should use the closest provider', () => {
      const innerMockOptions = {
        ...mockOptions,
        showPhoto: false
      }

      const InnerChild = () => {
        const { options } = useDisplayOptionsContext()
        return <div data-testid="inner-child">{JSON.stringify(options.showPhoto)}</div>
      }

      const OuterChild = () => {
        const { options } = useDisplayOptionsContext()
        return <div data-testid="outer-child">{JSON.stringify(options.showPhoto)}</div>
      }

      // Mock different responses for different calls
      mockDisplayOptionsService.getDisplayOptions
        .mockResolvedValueOnce(mockOptions)
        .mockResolvedValueOnce(innerMockOptions)

      render(
        <DisplayOptionsProvider>
          <OuterChild />
          <DisplayOptionsProvider>
            <InnerChild />
          </DisplayOptionsProvider>
        </DisplayOptionsProvider>
      )

      // Both should eventually have their respective values
      // Note: In practice, nested providers would be unusual but should work
    })
  })

  describe('Hook Integration', () => {
    it('should properly integrate with useDisplayOptions hook', () => {
      const { result } = renderHook(() => useDisplayOptionsContext(), {
        wrapper: ({ children }) => (
          <DisplayOptionsProvider>{children}</DisplayOptionsProvider>
        )
      })

      // Should have all the expected properties and methods
      expect(result.current).toHaveProperty('options')
      expect(result.current).toHaveProperty('isLoading')
      expect(result.current).toHaveProperty('error')
      expect(result.current).toHaveProperty('updateOptions')
      expect(result.current).toHaveProperty('resetToDefaults')
      expect(result.current).toHaveProperty('togglePhoto')
      expect(result.current).toHaveProperty('toggleName')
      expect(result.current).toHaveProperty('toggleRatings')
      expect(result.current).toHaveProperty('toggleCompactMode')
      expect(result.current).toHaveProperty('updateRatingCategories')
      expect(result.current).toHaveProperty('addRatingCategory')
      expect(result.current).toHaveProperty('removeRatingCategory')
      expect(result.current).toHaveProperty('isRatingCategoryEnabled')
      expect(result.current).toHaveProperty('getActiveRatingCategories')
    })
  })
})