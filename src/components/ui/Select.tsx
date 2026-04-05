import React from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '../../lib/utils'

interface SelectOption {
  value: string
  label: string
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  helperText?: string
  options: SelectOption[]
  placeholder?: string
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, helperText, options, placeholder, className, id, ...props }, ref) => {
    const selectId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={selectId} className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={cn(
              'w-full appearance-none rounded-xl border bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-colors duration-150',
              'px-3 py-2 pr-9 text-sm',
              'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              error
                ? 'border-red-400 dark:border-red-500'
                : 'border-gray-300 dark:border-gray-600',
              className
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
        {error && <p className="text-xs text-red-500 dark:text-red-400">{error}</p>}
        {helperText && !error && <p className="text-xs text-gray-500 dark:text-gray-400">{helperText}</p>}
      </div>
    )
  }
)

Select.displayName = 'Select'

export default Select
