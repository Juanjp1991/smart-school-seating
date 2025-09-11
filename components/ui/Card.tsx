'use client'

import React from 'react'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined'
  padding?: 'sm' | 'md' | 'lg' | 'none'
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(({
  children,
  variant = 'default',
  padding = 'md',
  className = '',
  ...props
}, ref) => {
  const baseClasses = 'rounded-lg'
  
  const variants = {
    default: 'bg-white border border-gray-200',
    elevated: 'bg-white shadow-md',
    outlined: 'bg-white border-2 border-gray-200',
  }
  
  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  }
  
  const classes = `${baseClasses} ${variants[variant]} ${paddings[padding]} ${className}`
  
  return (
    <div
      ref={ref}
      className={classes}
      {...props}
    >
      {children}
    </div>
  )
})

Card.displayName = 'Card'

// Card subcomponents
export const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({
  children,
  className = '',
  ...props
}, ref) => (
  <div
    ref={ref}
    className={`flex items-center justify-between mb-4 pb-2 border-b border-gray-200 ${className}`}
    {...props}
  >
    {children}
  </div>
))

CardHeader.displayName = 'CardHeader'

export const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(({
  children,
  className = '',
  ...props
}, ref) => (
  <h2
    ref={ref}
    className={`text-lg font-semibold text-gray-900 ${className}`}
    {...props}
  >
    {children}
  </h2>
))

CardTitle.displayName = 'CardTitle'

export const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({
  children,
  className = '',
  ...props
}, ref) => (
  <div
    ref={ref}
    className={className}
    {...props}
  >
    {children}
  </div>
))

CardContent.displayName = 'CardContent'

export const CardActions = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({
  children,
  className = '',
  ...props
}, ref) => (
  <div
    ref={ref}
    className={`flex gap-3 justify-end mt-6 pt-4 border-t border-gray-200 ${className}`}
    {...props}
  >
    {children}
  </div>
))

CardActions.displayName = 'CardActions'