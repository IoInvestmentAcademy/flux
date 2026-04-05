import React, { useState, useRef, useEffect } from 'react'
import { Pencil, Trash2, Check, X } from 'lucide-react'
import { cn } from '../../lib/utils'
import { usePreferences } from '../../lib/PreferencesContext'

interface EditableRowProps {
  label: string
  amount: number
  secondaryAmount?: number
  secondaryLabel?: string
  badgeContent?: React.ReactNode
  isActive?: boolean
  onUpdate: (label: string, amount: number, secondaryAmount?: number) => void
  onDelete: () => void
  showSecondary?: boolean
  primaryLabel?: string
  amountLabel?: string
}

export const EditableRow: React.FC<EditableRowProps> = ({
  label,
  amount,
  secondaryAmount,
  secondaryLabel,
  badgeContent,
  isActive = true,
  onUpdate,
  onDelete,
  showSecondary = false,
  primaryLabel,
  amountLabel,
}) => {
  const { t, formatMoney } = usePreferences()
  const resolvedPrimaryLabel = primaryLabel ?? t.expenseName
  const resolvedAmountLabel = amountLabel ?? t.amount
  const [editing, setEditing] = useState(false)
  const [editLabel, setEditLabel] = useState(label)
  const [editAmount, setEditAmount] = useState(String(amount))
  const [editSecondary, setEditSecondary] = useState(String(secondaryAmount ?? 0))
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing) inputRef.current?.focus()
  }, [editing])

  const handleSave = () => {
    const parsedAmount = parseFloat(editAmount.replace(',', '.')) || 0
    const parsedSecondary = parseFloat(editSecondary.replace(',', '.')) || 0
    onUpdate(editLabel, parsedAmount, showSecondary ? parsedSecondary : undefined)
    setEditing(false)
  }

  const handleCancel = () => {
    setEditLabel(label)
    setEditAmount(String(amount))
    setEditSecondary(String(secondaryAmount ?? 0))
    setEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSave()
    if (e.key === 'Escape') handleCancel()
  }

  if (editing) {
    return (
      <div className="flex items-center gap-2 py-2 px-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl">
        <input
          ref={inputRef}
          value={editLabel}
          onChange={(e) => setEditLabel(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={resolvedPrimaryLabel}
          className="flex-1 min-w-0 text-sm bg-transparent border-b border-indigo-300 dark:border-indigo-600 focus:outline-none text-gray-900 dark:text-gray-100"
        />
        <input
          value={editAmount}
          onChange={(e) => setEditAmount(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={resolvedAmountLabel}
          type="text"
          inputMode="decimal"
          className="w-24 text-sm bg-transparent border-b border-indigo-300 dark:border-indigo-600 focus:outline-none text-right text-gray-900 dark:text-gray-100"
        />
        {showSecondary && (
          <input
            value={editSecondary}
            onChange={(e) => setEditSecondary(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={secondaryLabel ?? ''}
            type="text"
            inputMode="decimal"
            className="w-24 text-sm bg-transparent border-b border-indigo-300 dark:border-indigo-600 focus:outline-none text-right text-gray-900 dark:text-gray-100"
          />
        )}
        <button
          onClick={handleSave}
          className="p-1 text-green-600 hover:text-green-700 dark:text-green-400"
          aria-label="Salvează"
        >
          <Check className="w-4 h-4" />
        </button>
        <button
          onClick={handleCancel}
          className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          aria-label="Anulează"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'group flex items-center gap-3 py-2.5 px-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors',
        !isActive && 'opacity-50'
      )}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-800 dark:text-gray-200 truncate">{label}</span>
          {badgeContent}
        </div>
        {showSecondary && secondaryAmount !== undefined && secondaryAmount > 0 && (
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
            {secondaryLabel}: {formatMoney(secondaryAmount)}
          </p>
        )}
      </div>
      <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 tabular-nums shrink-0">
        {formatMoney(amount)}
      </span>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        <button
          onClick={() => setEditing(true)}
          className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
          aria-label="Editează"
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={onDelete}
          className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          aria-label="Șterge"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}

export default EditableRow
