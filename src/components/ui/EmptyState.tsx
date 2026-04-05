import React from 'react'
import { cn } from '../../lib/utils'

interface EmptyStateProps {
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
  icon?: React.ReactNode
}

const DefaultIllustration: React.FC = () => (
  <svg
    viewBox="0 0 200 160"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="w-40 h-32 text-gray-300 dark:text-gray-700"
  >
    <rect x="20" y="40" width="160" height="100" rx="12" fill="currentColor" opacity="0.3" />
    <rect x="35" y="55" width="130" height="14" rx="4" fill="currentColor" opacity="0.5" />
    <rect x="35" y="77" width="90" height="10" rx="3" fill="currentColor" opacity="0.4" />
    <rect x="35" y="95" width="110" height="10" rx="3" fill="currentColor" opacity="0.3" />
    <rect x="35" y="113" width="70" height="10" rx="3" fill="currentColor" opacity="0.2" />
    <circle cx="155" cy="35" r="20" fill="currentColor" opacity="0.2" />
    <path d="M147 35 L153 41 L163 29" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />
  </svg>
)

export const EmptyState: React.FC<EmptyStateProps> = ({ title, description, action, className, icon }) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center py-12 px-4',
        className
      )}
    >
      <div className="mb-4">{icon ?? <DefaultIllustration />}</div>
      <h3 className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-5 max-w-xs">{description}</p>
      )}
      {action && <div>{action}</div>}
    </div>
  )
}

export default EmptyState
