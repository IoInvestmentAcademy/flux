import React, { useMemo } from 'react'
import { Card, CardHeader, CardTitle } from '../ui'
import { formatRON } from '../../lib/utils'
import type { Transaction, Category } from '../../types'

interface CategoryBreakdownProps {
  transactions: Transaction[]
  categories: Category[]
  type?: 'expense' | 'income'
}

interface CategoryTotal {
  category: Category | null
  total: number
  count: number
  percentage: number
}

export const CategoryBreakdown: React.FC<CategoryBreakdownProps> = ({
  transactions,
  categories,
  type = 'expense',
}) => {
  const catMap = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories])

  const breakdown = useMemo((): CategoryTotal[] => {
    const filtered = transactions.filter((t) => t.type === type)
    const grandTotal = filtered.reduce((s, t) => s + t.amount, 0)

    const totals = new Map<string, { total: number; count: number }>()
    filtered.forEach((t) => {
      const key = t.category_id ?? '__none__'
      const existing = totals.get(key) ?? { total: 0, count: 0 }
      totals.set(key, { total: existing.total + t.amount, count: existing.count + 1 })
    })

    return Array.from(totals.entries())
      .map(([catId, { total, count }]) => ({
        category: catId === '__none__' ? null : (catMap.get(catId) ?? null),
        total,
        count,
        percentage: grandTotal > 0 ? (total / grandTotal) * 100 : 0,
      }))
      .sort((a, b) => b.total - a.total)
  }, [transactions, type, catMap])

  const grandTotal = breakdown.reduce((s, b) => s + b.total, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {type === 'expense' ? 'Cheltuieli' : 'Venituri'} pe categorii
        </CardTitle>
        <span className="text-sm font-bold text-gray-500 dark:text-gray-400">
          Total: {formatRON(grandTotal)}
        </span>
      </CardHeader>

      {breakdown.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-4">
          Nicio {type === 'expense' ? 'cheltuială' : 'venit'} în perioada selectată.
        </p>
      ) : (
        <div className="space-y-3">
          {breakdown.map((item, idx) => (
            <div key={idx}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: item.category?.color ?? '#94a3b8' }}
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {item.category?.name ?? 'Fără categorie'}
                  </span>
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    ({item.count} tranzacții)
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 tabular-nums">
                    {formatRON(item.total)}
                  </span>
                  <span className="text-xs text-gray-400 ml-1">
                    {item.percentage.toFixed(1)}%
                  </span>
                </div>
              </div>
              {/* Horizontal bar */}
              <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${item.percentage}%`,
                    backgroundColor: item.category?.color ?? '#94a3b8',
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}

export default CategoryBreakdown
