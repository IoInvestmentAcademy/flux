import React from 'react'
import { cn } from '../../lib/utils'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  leftElement?: React.ReactNode
  rightElement?: React.ReactNode
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, leftElement, rightElement, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftElement && (
            <span className="absolute left-3 text-gray-400 dark:text-gray-500 pointer-events-none">
              {leftElement}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            inputMode={props.type === 'number' ? 'decimal' : props.inputMode}
            className={cn(
              'w-full rounded-xl border bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 transition-colors duration-150',
              'px-3 py-2 text-sm',
              'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              error
                ? 'border-red-400 dark:border-red-500'
                : 'border-gray-300 dark:border-gray-600',
              leftElement && 'pl-9',
              rightElement && 'pr-9',
              className
            )}
            style={{ fontSize: '16px', ...props.style }}
            {...props}
          />
          {rightElement && (
            <span className="absolute right-3 text-gray-400 dark:text-gray-500">
              {rightElement}
            </span>
          )}
        </div>
        {error && <p className="text-xs text-red-500 dark:text-red-400">{error}</p>}
        {helperText && !error && <p className="text-xs text-gray-500 dark:text-gray-400">{helperText}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'

export default Input
