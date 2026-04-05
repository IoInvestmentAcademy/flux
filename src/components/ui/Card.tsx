import React from 'react'
import { cn } from '../../lib/utils'

interface CardProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  padding?: 'sm' | 'md' | 'lg' | 'none'
}

const paddingClasses = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
}

export const Card: React.FC<CardProps> = ({ children, className, onClick, padding = 'md' }) => {
  return (
    <div
      className={cn(
        'bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800',
        paddingClasses[padding],
        onClick && 'cursor-pointer hover:shadow-md transition-shadow duration-150',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  )
}

export const CardHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={cn('flex items-center justify-between mb-4', className)}>{children}</div>
)

export const CardTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <h3 className={cn('text-base font-semibold text-gray-900 dark:text-gray-100', className)}>{children}</h3>
)

export default Card
