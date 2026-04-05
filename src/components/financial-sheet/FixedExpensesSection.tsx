import React, { useState } from 'react'
import { Plus } from 'lucide-react'
import { Card, CardHeader, CardTitle, Button } from '../ui'
import { EditableRow } from './EditableRow'
import { formatRON } from '../../lib/utils'
import type { FinancialFixedExpense } from '../../types'

interface FixedExpensesSectionProps {
  expenses: FinancialFixedExpense[]
  total: number
  onAdd: (data: Omit<FinancialFixedExpense, 'id' | 'user_id' | 'created_at'>) => Promise<{ error: string | null }>
  onUpdate: (id: string, data: Partial<FinancialFixedExpense>) => Promise<{ error: string | null }>
  onDelete: (id: string) => Promise<{ error: string | null }>
}

export const FixedExpensesSection: React.FC<FixedExpensesSectionProps> = ({
  expenses, total, onAdd, onUpdate, onDelete,
}) => {
  const [adding, setAdding] = useState(false)
  const [newName, setNewName] = useState('')
  const [newAmount, setNewAmount] = useState('')

  const handleAdd = async () => {
    if (!newName || !newAmount) return
    const amount = parseFloat(newAmount.replace(',', '.'))
    if (isNaN(amount) || amount < 0) return
    await onAdd({ name: newName, amount, is_active: true, sort_order: expenses.length })
    setNewName('')
    setNewAmount('')
    setAdding(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cheltuieli fixe</CardTitle>
        <div className="flex items-center gap-3">
          <span className="text-base font-bold text-red-500 dark:text-red-400 tabular-nums">
            {formatRON(total)}
          </span>
          <Button size="sm" variant="ghost" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setAdding(true)}>
            Adaugă
          </Button>
        </div>
      </CardHeader>

      <div className="space-y-0.5">
        {expenses.map((expense) => (
          <EditableRow
            key={expense.id}
            label={expense.name}
            amount={expense.amount}
            isActive={expense.is_active}
            onUpdate={async (label, amount) => {
              await onUpdate(expense.id, { name: label, amount })
            }}
            onDelete={() => onDelete(expense.id)}
          />
        ))}

        {adding && (
          <div className="flex items-center gap-2 py-2 px-3 bg-red-50 dark:bg-red-900/20 rounded-xl">
            <input
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); if (e.key === 'Escape') setAdding(false) }}
              placeholder="Tip cheltuială fixă"
              className="flex-1 min-w-0 text-sm bg-transparent border-b border-red-300 dark:border-red-600 focus:outline-none text-gray-900 dark:text-gray-100"
            />
            <input
              value={newAmount}
              onChange={(e) => setNewAmount(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); if (e.key === 'Escape') setAdding(false) }}
              placeholder="Sumă"
              type="text"
              inputMode="decimal"
              className="w-24 text-sm bg-transparent border-b border-red-300 dark:border-red-600 focus:outline-none text-right text-gray-900 dark:text-gray-100"
            />
            <Button size="sm" variant="primary" onClick={handleAdd}>Adaugă</Button>
            <Button size="sm" variant="ghost" onClick={() => setAdding(false)}>Anulează</Button>
          </div>
        )}

        {expenses.length === 0 && !adding && (
          <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-4">
            Adaugă cheltuielile fixe lunare (chirie, abonamente etc.)
          </p>
        )}
      </div>
    </Card>
  )
}

export default FixedExpensesSection
