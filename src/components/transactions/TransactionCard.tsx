import React, { useState } from 'react'
import { Pencil, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import { cn, formatRON } from '../../lib/utils'
import type { Transaction, Category, CustomFieldDefinition } from '../../types'

interface TransactionCardProps {
  transaction: Transaction
  category?: Category
  customFields?: CustomFieldDefinition[]
  onEdit: (transaction: Transaction) => void
  onDelete: (id: string) => void
}

export const TransactionCard: React.FC<TransactionCardProps> = ({
  transaction,
  category,
  customFields = [],
  onEdit,
  onDelete,
}) => {
  const [expanded, setExpanded] = useState(false)

  const isExpense = transaction.type === 'expense'
  const hasNoteOrFields = transaction.note || (customFields.length > 0 && Object.keys(transaction.custom_fields ?? {}).length > 0)

  return (
    <div
      className={cn(
        'bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden transition-shadow',
        expanded && 'shadow-sm'
      )}
    >
      {/* Main row */}
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer select-none"
        onClick={() => setExpanded((e) => !e)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && setExpanded((prev) => !prev)}
      >
        {/* Category dot */}
        <div
          className="shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center text-white text-lg font-bold shadow-sm"
          style={{ backgroundColor: category?.color ?? '#94a3b8' }}
        >
          {category?.name?.charAt(0) ?? '?'}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
            {category?.name ?? 'Fără categorie'}
          </p>
          {transaction.detail && (
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{transaction.detail}</p>
          )}
        </div>

        {/* Amount */}
        <div className="flex items-center gap-2 shrink-0">
          <span
            className={cn(
              'text-sm font-semibold',
              isExpense ? 'text-red-500 dark:text-red-400' : 'text-green-500 dark:text-green-400'
            )}
          >
            {isExpense ? '−' : '+'}{formatRON(transaction.amount)}
          </span>
          <span className="text-gray-400">
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </span>
        </div>
      </div>

      {/* Expanded section */}
      {expanded && (
        <div className="px-4 pb-3 border-t border-gray-50 dark:border-gray-800 space-y-2">
          {transaction.note && (
            <p className="text-xs text-gray-500 dark:text-gray-400 pt-2">{transaction.note}</p>
          )}

          {/* Custom fields */}
          {customFields.map((field) => {
            const value = (transaction.custom_fields as Record<string, unknown>)?.[field.id]
            if (value === undefined || value === null || value === '') return null
            return (
              <div key={field.id} className="flex items-center justify-between text-xs">
                <span className="text-gray-400 dark:text-gray-500">{field.name}</span>
                <span className="text-gray-700 dark:text-gray-300">
                  {field.field_type === 'boolean' ? (value ? 'Da' : 'Nu') : String(value)}
                </span>
              </div>
            )
          })}

          {/* Actions — always shown when expanded */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(transaction) }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors"
            >
              <Pencil className="w-3 h-3" />
              Editează
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(transaction.id) }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
            >
              <Trash2 className="w-3 h-3" />
              Șterge
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default TransactionCard
