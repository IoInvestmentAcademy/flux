import React from 'react'
import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Card, CardHeader, CardTitle, SkeletonList, EmptyState } from '../ui'
import { cn, formatRON, formatRelativeDateRO } from '../../lib/utils'
import type { Transaction, Category } from '../../types'

interface RecentActivityProps {
  transactions: Transaction[]
  categories: Category[]
  loading?: boolean
}

export const RecentActivity: React.FC<RecentActivityProps> = ({ transactions, categories, loading = false }) => {
  const catMap = new Map(categories.map((c) => [c.id, c]))
  const recent = transactions.slice(0, 5)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activitate recentă</CardTitle>
        <Link
          to="/tranzactii"
          className="flex items-center gap-1 text-xs text-indigo-500 hover:text-indigo-600 font-medium"
        >
          Vezi toate <ArrowRight className="w-3 h-3" />
        </Link>
      </CardHeader>

      {loading ? (
        <SkeletonList count={5} />
      ) : recent.length === 0 ? (
        <EmptyState title="Nicio tranzacție" description="Adaugă prima ta tranzacție." />
      ) : (
        <div className="space-y-1">
          {recent.map((t) => {
            const cat = catMap.get(t.category_id ?? '')
            const isExpense = t.type === 'expense'
            return (
              <div key={t.id} className="flex items-center gap-3 py-2">
                <div
                  className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold"
                  style={{ backgroundColor: cat?.color ?? '#94a3b8' }}
                >
                  {cat?.name?.charAt(0) ?? '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                    {cat?.name ?? 'Fără categorie'}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 truncate">
                    {t.detail ? `${t.detail} · ` : ''}{formatRelativeDateRO(t.date)}
                  </p>
                </div>
                <span
                  className={cn(
                    'text-sm font-semibold shrink-0 tabular-nums',
                    isExpense ? 'text-red-500' : 'text-green-500'
                  )}
                >
                  {isExpense ? '−' : '+'}{formatRON(t.amount)}
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
