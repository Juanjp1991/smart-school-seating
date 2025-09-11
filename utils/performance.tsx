import React, { lazy, Suspense, ComponentType } from 'react'
import { LoadingSpinner } from '@/components/ui'

/**
 * Higher-order component for lazy loading with custom loading fallback
 */
export function withLazyLoading<P extends Record<string, any>>(
  ComponentLoader: () => Promise<{ default: ComponentType<P> }>,
  LoadingFallback?: React.ComponentType
) {
  const LazyComponent = lazy(ComponentLoader)
  
  const WrappedComponent: React.FC<P> = (props) => (
    <Suspense 
      fallback={
        LoadingFallback ? (
          <LoadingFallback />
        ) : (
          <div className="flex items-center justify-center p-8">
            <LoadingSpinner size="md" />
          </div>
        )
      }
    >
      <LazyComponent {...props} />
    </Suspense>
  )
  
  WrappedComponent.displayName = `withLazyLoading(${LazyComponent.displayName || 'Component'})`
  
  return WrappedComponent
}

/**
 * Custom hook for intersection observer (for lazy loading on scroll)
 */
export function useIntersectionObserver(
  elementRef: React.RefObject<Element>,
  options: IntersectionObserverInit = {}
) {
  const [isIntersecting, setIsIntersecting] = React.useState(false)
  
  React.useEffect(() => {
    const element = elementRef.current
    if (!element) return
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting)
      },
      {
        threshold: 0.1,
        ...options
      }
    )
    
    observer.observe(element)
    
    return () => {
      observer.unobserve(element)
    }
  }, [elementRef, options])
  
  return isIntersecting
}

/**
 * Performance monitoring utilities
 */
export const performance = {
  /**
   * Measure component render time
   */
  measureRender: (componentName: string, fn: () => void) => {
    const start = Date.now()
    fn()
    const end = Date.now()
    console.log(`[Performance] ${componentName} render time: ${end - start}ms`)
  },
  
  /**
   * Debounce function calls
   */
  debounce: <T extends (...args: any[]) => any>(
    func: T,
    delay: number
  ): ((...args: Parameters<T>) => void) => {
    let timeoutId: NodeJS.Timeout
    return (...args: Parameters<T>) => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => func(...args), delay)
    }
  },
  
  /**
   * Throttle function calls
   */
  throttle: <T extends (...args: any[]) => any>(
    func: T,
    delay: number
  ): ((...args: Parameters<T>) => void) => {
    let lastCall = 0
    return (...args: Parameters<T>) => {
      const now = Date.now()
      if (now - lastCall >= delay) {
        lastCall = now
        func(...args)
      }
    }
  }
}

/**
 * React performance hooks
 */
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value)

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

export const useThrottle = <T>(value: T, delay: number): T => {
  const [throttledValue, setThrottledValue] = React.useState<T>(value)
  const lastRan = React.useRef(Date.now())

  React.useEffect(() => {
    const handler = setTimeout(() => {
      if (Date.now() - lastRan.current >= delay) {
        setThrottledValue(value)
        lastRan.current = Date.now()
      }
    }, delay - (Date.now() - lastRan.current))

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return throttledValue
}