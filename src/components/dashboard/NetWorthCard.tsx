import React from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '../../lib/utils'
import { usePreferences } from '../../lib/PreferencesContext'
import { Card } from '../ui'

interface NetWorthCardProps {
  title: string
  value: number
  change?: number
  changeLabel?: string
  colorClass?: string
  icon?: React.ReactNode
  loading?: boolean
}

export const NetWorthCard: React.FC<NetWorthCardProps> = ({
  title,
  value,
  change,
  changeLabel,
  colorClass,
  icon,
  loading = false,
}) => {
  const { formatMoney } = usePreferences()
  const isPositive = (change ?? 0) > 0
  const isNeutral = change === undefined || change === 0
  const absChange = Math.abs(change ?? 0)

  if (loading) {
    return (
      <Card>
        <div className="animate-pulse space-y-2">
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
        </div>
      </Card>
    )
  }

  return (
    <Card>
      <div className="flex items-start justify-between mb-2">
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          {title}
        </p>
        {icon && (
          <div className={cn('p-2 rounded-xl', colorClass ?? 'bg-indigo-50 dark:bg-indigo-900/20')}>
            {icon}
          </div>
        )}
      </div>
      <p className={cn('text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1 tabular-nums')}>
        {formatMoney(value)}
      </p>
      {change !== undefined && (
        <div className="flex items-center gap-1">
          {isNeutral ? (
            <Minus className="w-3 h-3 text-gray-400" />
          ) : isPositive ? (
            <TrendingUp className="w-3 h-3 text-green-500" />
          ) : (
            <TrendingDown className="w-3 h-3 text-red-500" />
          )}
          <span
            className={cn(
              'text-xs font-medium',
              isNeutral ? 'text-gray-400' : isPositive ? 'text-green-500' : 'text-red-500'
            )}
          >
            {isNeutral ? '—' : `${isPositive ? '+' : '−'}${formatMoney(absChange)}`}
          </span>
          {changeLabel && (
            <span className="text-xs text-gray-400 dark:text-gray-500">{changeLabel}</span>
          )}
        </div>
      )}
    </Card>
  )
}

export default NetWorthCard
