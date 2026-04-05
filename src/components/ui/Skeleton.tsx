import React from 'react'
import { cn } from '../../lib/utils'

interface SkeletonProps {
  className?: string
}

export const Skeleton: React.FC<SkeletonProps> = ({ className }) => {
  return (
    <div
      className={cn(
        'animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg',
        className
      )}
      aria-hidden="true"
    />
  )
}

export const SkeletonCard: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={cn('bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4', className)}>
      <Skeleton className="h-4 w-1/3 mb-3" />
      <Skeleton className="h-8 w-1/2 mb-2" />
      <Skeleton className="h-3 w-2/3" />
    </div>
  )
}

export const SkeletonRow: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={cn('flex items-center gap-3 py-3', className)}>
      <Skeleton className="h-10 w-10 rounded-full shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-1/3" />
      </div>
      <Skeleton className="h-5 w-20 shrink-0" />
    </div>
  )
}

export const SkeletonList: React.FC<{ count?: number; className?: string }> = ({ count = 5, className }) => {
  return (
    <div className={className}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonRow key={i} />
      ))}
    </div>
  )
}

export default Skeleton
