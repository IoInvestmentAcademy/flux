import React, { useState } from 'react'
import { Search } from 'lucide-react'
import { Card, CardHeader, CardTitle, Input, EmptyState } from '../ui'
import { usePreferences } from '../../lib/PreferencesContext'
import type { Transaction, Category } from '../../types'

interface SpendingTrendsProps {
  transactions: Transaction[]
  categories: Category[]
}

export const SpendingTrends: React.FC<SpendingTrendsProps> = ({ transactions, categories }) => {
  const { t, formatMoney, language } = usePreferences()
  const [searchQuery, setSearchQuery] = useState('')

  const catMap = new Map(categories.map((c) => [c.id, c]))

  const searchResults = searchQuery.trim()
    ? transactions.filter(
        (t) =>
          t.detail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.note?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          catMap.get(t.category_id ?? '')?.name?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : []

  const totalFound = searchResults.reduce((s, t) => s + (t.type === 'expense' ? t.amount : -t.amount), 0)
  const totalExpenses = searchResults.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  const totalIncome = searchResults.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.detailSearch}</CardTitle>
      </CardHeader>
      <div className="space-y-4">
        <Input
          placeholder={t.detailSearchPlaceholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          leftElement={<Search className="w-4 h-4" />}
        />

        {searchQuery.trim() && (
          <>
            {searchResults.length === 0 ? (
              <EmptyState
                title={t.noTransactions}
                description={t.noDataForPeriod}
              />
            ) : (
              <>
                {/* Summary */}
                <div className="flex gap-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <div>
                    <p className="text-xs text-gray-400 dark:text-gray-500">{t.transactionsFound}</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{searchResults.length}</p>
                  </div>
                  {totalExpenses > 0 && (
                    <div>
                      <p className="text-xs text-gray-400 dark:text-gray-500">{t.totalSpent}</p>
                      <p className="text-lg font-bold text-red-500">{formatMoney(totalExpenses)}</p>
                    </div>
                  )}
                  {totalIncome > 0 && (
                    <div>
                      <p className="text-xs text-gray-400 dark:text-gray-500">{t.income}</p>
                      <p className="text-lg font-bold text-green-500">{formatMoney(totalIncome)}</p>
                    </div>
                  )}
                </div>

                {/* Results list */}
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {searchResults.map((tx) => {
                    const cat = catMap.get(tx.category_id ?? '')
                    const dateFormatted = new Date(tx.date + 'T00:00:00').toLocaleDateString(
                      language === 'en' ? 'en-US' : 'ro-RO',
                      { day: 'numeric', month: 'short', year: 'numeric' }
                    )
                    return (
                      <div
                        key={tx.id}
                        className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <div
                          className="shrink-0 w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold"
                          style={{ backgroundColor: cat?.color ?? '#94a3b8' }}
                        >
                          {cat?.name?.charAt(0) ?? '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                            {tx.detail ?? cat?.name ?? t.detail}
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500">
                            {dateFormatted} · {cat?.name ?? t.noCategory}
                          </p>
                        </div>
                        <span
                          className={`text-sm font-semibold shrink-0 tabular-nums ${
                            tx.type === 'expense' ? 'text-red-500' : 'text-green-500'
                          }`}
                        >
                          {tx.type === 'expense' ? '−' : '+'}{formatMoney(tx.amount)}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </>
        )}

        {!searchQuery.trim() && (
          <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-4">
            {t.detailSearchPlaceholder}
          </p>
        )}
      </div>
    </Card>
  )
}

export default SpendingTrends
