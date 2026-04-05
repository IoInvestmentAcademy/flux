import React from 'react'
import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Card, CardHeader, CardTitle, SkeletonList, EmptyState } from '../ui'
import { cn, formatRelativeDate } from '../../lib/utils'
import { usePreferences } from '../../lib/PreferencesContext'
import type { Transaction, Category } from '../../types'

interface RecentActivityProps {
  transactions: Transaction[]
  categories: Category[]
  loading?: boolean
}

export const RecentActivity: React.FC<RecentActivityProps> = ({ transactions, categories, loading = false }) => {
  const { t, formatMoney, language } = usePreferences()
  const catMap = new Map(categories.map((c) => [c.id, c]))
  const recent = transactions.slice(0, 5)

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.recentActivity}</CardTitle>
        <Link
          to="/tranzactii"
          className="flex items-center gap-1 text-xs text-indigo-500 hover:text-indigo-600 font-medium"
        >
          {t.seeAll} <ArrowRight className="w-3 h-3" />
        </Link>
      </CardHeader>

      {loading ? (
        <SkeletonList count={5} />
      ) : recent.length === 0 ? (
        <EmptyState title={t.noTransactions} description={t.addFirstTransaction} />
      ) : (
        <div className="space-y-1">
          {recent.map((tx) => {
            const cat = catMap.get(tx.category_id ?? '')
            const isExpense = tx.type === 'expense'
            return (
              <div key={tx.id} className="flex items-center gap-3 py-2">
                <div
                  className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold"
                  style={{ backgroundColor: cat?.color ?? '#94a3b8' }}
                >
                  {cat?.name?.charAt(0) ?? '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                    {cat?.name ?? t.noCategory}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 truncate">
                    {tx.detail ? `${tx.detail} · ` : ''}{formatRelativeDate(tx.date, language)}
                  </p>
                </div>
                <span
                  className={cn(
                    'text-sm font-semibold shrink-0 tabular-nums',
                    isExpense ? 'text-red-500' : 'text-green-500'
                  )}
                >
                  {isExpense ? '−' : '+'}{formatMoney(tx.amount)}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </Card>
  )
}

export default RecentActivity
