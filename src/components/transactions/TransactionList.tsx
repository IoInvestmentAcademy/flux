import React, { useMemo } from 'react'
import { formatRelativeDateRO, formatRON } from '../../lib/utils'
import { TransactionCard } from './TransactionCard'
import { SkeletonList, EmptyState } from '../ui'
import type { Transaction, Category, CustomFieldDefinition } from '../../types'

interface TransactionListProps {
  transactions: Transaction[]
  categories: Category[]
  customFields: CustomFieldDefinition[]
  loading: boolean
  onEdit: (transaction: Transaction) => void
  onDelete: (id: string) => void
}

interface GroupedTransactions {
  date: string
  transactions: Transaction[]
  totalExpenses: number
  totalIncome: number
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  categories,
  customFields,
  loading,
  onEdit,
  onDelete,
}) => {
  const categoryMap = useMemo(() => {
    const map = new Map<string, Category>()
    categories.forEach((c) => map.set(c.id, c))
    return map
  }, [categories])

  const grouped = useMemo((): GroupedTransactions[] => {
    const map = new Map<string, Transaction[]>()
    transactions.forEach((t) => {
      const existing = map.get(t.date) ?? []
      existing.push(t)
      map.set(t.date, existing)
    })

    // Sort dates descending
    const sortedDates = Array.from(map.keys()).sort((a, b) => b.localeCompare(a))

    return sortedDates.map((date) => {
      const txs = map.get(date)!
      const totalExpenses = txs.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
      const totalIncome = txs.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0)
      return { date, transactions: txs, totalExpenses, totalIncome }
    })
  }, [transactions])

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2].map((i) => (
          <div key={i}>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-3 animate-pulse" />
            <SkeletonList count={3} />
          </div>
        ))}
      </div>
    )
  }

  if (transactions.length === 0) {
    return (
      <EmptyState
        title="Nicio tranzacție"
        description="Adaugă prima ta tranzacție apăsând butonul + de mai jos."
      />
    )
  }

  return (
    <div className="space-y-6">
      {grouped.map((group) => (
        <div key={group.date}>
          {/* Date header */}
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              {formatRelativeDateRO(group.date)}
            </span>
            <div className="flex items-center gap-3 text-xs">
              {group.totalIncome > 0 && (
                <span className="text-green-600 dark:text-green-400 font-medium">
                  +{formatRON(group.totalIncome)}
                </span>
              )}
              {group.totalExpenses > 0 && (
                <span className="text-red-500 dark:text-red-400 font-medium">
                  −{formatRON(group.totalExpenses)}
                </span>
              )}
            </div>
          </div>

          {/* Transactions */}
          <div className="space-y-2">
            {group.transactions.map((t) => (
              <TransactionCard
                key={t.id}
                transaction={t}
                category={categoryMap.get(t.category_id ?? '')}
                customFields={customFields}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default TransactionList
