import React from 'react'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helpText?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  variant?: 'default' | 'filled'
  inputSize?: 'sm' | 'md' | 'lg'
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  helpText,
  leftIcon,
  rightIcon,
  variant = 'default',
  inputSize = 'md',
  className = '',
  id,
  ...props
}, ref) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`
  
  const baseClasses = 'w-full rounded-md border font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed'
  
  const variants = {
    default: error 
      ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500',
    filled: error
      ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500'
      : 'border-gray-200 bg-gray-50 focus:border-blue-500 focus:ring-blue-500 focus:bg-white',
  }
  
  const sizes = {
    sm: 'h-8 px-3 text-sm',
    md: 'h-10 px-4 text-base',
    lg: 'h-12 px-5 text-lg',
  }
  
  const iconPadding = {
    sm: leftIcon ? 'pl-9' : rightIcon ? 'pr-9' : '',
    md: leftIcon ? 'pl-10' : rightIcon ? 'pr-10' : '',
    lg: leftIcon ? 'pl-12' : rightIcon ? 'pr-12' : '',
  }
  
  const classes = `${baseClasses} ${variants[variant]} ${sizes[inputSize]} ${iconPadding[inputSize]} ${className}`
  
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div className={`absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 ${
            inputSize === 'sm' ? 'w-4 h-4' : inputSize === 'lg' ? 'w-6 h-6' : 'w-5 h-5'
          }`}>
            {leftIcon}
          </div>
        )}
        
        <input
          ref={ref}
          id={inputId}
          className={classes}
          {...props}
        />
        
        {rightIcon && (
          <div className={`absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 ${
            inputSize === 'sm' ? 'w-4 h-4' : inputSize === 'lg' ? 'w-6 h-6' : 'w-5 h-5'
          }`}>
            {rightIcon}
          </div>
        )}
      </div>
      
      {error && (
        <p className="mt-1 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
      
      {helpText && !error && (
        <p className="mt-1 text-sm text-gray-500">
          {helpText}
        </p>
      )}
    </div>
  )
})

Input.displayName = 'Input'

// Textarea variant
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  helpText?: string
  variant?: 'default' | 'filled'
  resize?: 'none' | 'vertical' | 'horizontal' | 'both'
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({
  label,
  error,
  helpText,
  variant = 'default',
  resize = 'vertical',
  className = '',
  id,
  ...props
}, ref) => {
  const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`
  
  const baseClasses = 'w-full rounded-md border p-3 font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed'
  
  const variants = {
    default: error 
      ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500',
    filled: error
      ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500'
      : 'border-gray-200 bg-gray-50 focus:border-blue-500 focus:ring-blue-500 focus:bg-white',
  }
  
  const resizeClasses = {
    none: 'resize-none',
    vertical: 'resize-y',
    horizontal: 'resize-x',
    both: 'resize',
  }
  
  const classes = `${baseClasses} ${variants[variant]} ${resizeClasses[resize]} ${className}`
  
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={textareaId} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      
      <textarea
        ref={ref}
        id={textareaId}
        className={classes}
        {...props}
      />
      
      {error && (
        <p className="mt-1 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
      
      {helpText && !error && (
        <p className="mt-1 text-sm text-gray-500">
          {helpText}
        </p>
      )}
    </div>
  )
})

Textarea.displayName = 'Textarea'