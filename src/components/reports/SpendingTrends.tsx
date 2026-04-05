import React, { useState } from 'react'
import { Search } from 'lucide-react'
import { Card, CardHeader, CardTitle, Input, EmptyState } from '../ui'
import { formatRON, formatDateShortRO } from '../../lib/utils'
import type { Transaction, Category } from '../../types'

interface SpendingTrendsProps {
  transactions: Transaction[]
  categories: Category[]
}

export const SpendingTrends: React.FC<SpendingTrendsProps> = ({ transactions, categories }) => {
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
        <CardTitle>Caută cheltuieli specifice</CardTitle>
      </CardHeader>
      <div className="space-y-4">
        <Input
          placeholder="ex. shaorma, Kaufland, restaurant..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          leftElement={<Search className="w-4 h-4" />}
          helperText='Caută prin detaliu, notă sau categorie'
        />

        {searchQuery.trim() && (
          <>
            {searchResults.length === 0 ? (
              <EmptyState
                title="Niciun rezultat"
                description={`Nu am găsit tranzacții pentru "${searchQuery}".`}
              />
            ) : (
              <>
                {/* Summary */}
                <div className="flex gap-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <div>
                    <p className="text-xs text-gray-400 dark:text-gray-500">Tranzacții găsite</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{searchResults.length}</p>
                  </div>
                  {totalExpenses > 0 && (
                    <div>
                      <p className="text-xs text-gray-400 dark:text-gray-500">Total cheltuieli</p>
                      <p className="text-lg font-bold text-red-500">{formatRON(totalExpenses)}</p>
                    </div>
                  )}
                  {totalIncome > 0 && (
                    <div>
                      <p className="text-xs text-gray-400 dark:text-gray-500">Total venituri</p>
                      <p className="text-lg font-bold text-green-500">{formatRON(totalIncome)}</p>
                    </div>
                  )}
                </div>

                {/* Results list */}
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {searchResults.map((t) => {
                    const cat = catMap.get(t.category_id ?? '')
                    return (
                      <div
                        key={t.id}
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
                            {t.detail ?? cat?.name ?? 'Fără detaliu'}
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500">
                            {formatDateShortRO(t.date)} · {cat?.name ?? 'Fără categorie'}
                          </p>
                        </div>
                        <span
                          className={`text-sm font-semibold shrink-0 tabular-nums ${
                            t.type === 'expense' ? 'text-red-500' : 'text-green-500'
                          }`}
                        >
                          {t.type === 'expense' ? '−' : '+'}{formatRON(t.amount)}
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
            Tastează un termen de căutare pentru a vedea istoricul cheltuielilor.
          </p>
        )}
      </div>
    </Card>
  )
}

export default SpendingTrends
