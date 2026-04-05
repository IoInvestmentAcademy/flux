import React, { useState } from 'react'
import { Plus } from 'lucide-react'
import { Card, CardHeader, CardTitle, Button } from '../ui'
import { EditableRow } from './EditableRow'
import { usePreferences } from '../../lib/PreferencesContext'
import type { FinancialIncome } from '../../types'

interface IncomeSectionProps {
  incomes: FinancialIncome[]
  total: number
  onAdd: (data: Omit<FinancialIncome, 'id' | 'user_id' | 'created_at'>) => Promise<{ error: string | null }>
  onUpdate: (id: string, data: Partial<FinancialIncome>) => Promise<{ error: string | null }>
  onDelete: (id: string) => Promise<{ error: string | null }>
}

export const IncomeSection: React.FC<IncomeSectionProps> = ({ incomes, total, onAdd, onUpdate, onDelete }) => {
  const { t, formatMoney } = usePreferences()
  const [adding, setAdding] = useState(false)
  const [newName, setNewName] = useState('')
  const [newAmount, setNewAmount] = useState('')

  const handleAdd = async () => {
    if (!newName || !newAmount) return
    const amount = parseFloat(newAmount.replace(',', '.'))
    if (isNaN(amount) || amount < 0) return
    await onAdd({ name: newName, amount, is_active: true, sort_order: incomes.length })
    setNewName('')
    setNewAmount('')
    setAdding(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.monthlyIncomeSection}</CardTitle>
        <div className="flex items-center gap-3">
          <span className="text-base font-bold text-green-600 dark:text-green-400 tabular-nums">
            {formatMoney(total)}
          </span>
          <Button
            size="sm"
            variant="ghost"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setAdding(true)}
          >
            {t.addCategory}
          </Button>
        </div>
      </CardHeader>

      <div className="space-y-0.5">
        {incomes.map((income) => (
          <EditableRow
            key={income.id}
            label={income.name}
            amount={income.amount}
            isActive={income.is_active}
            onUpdate={async (label, amount) => {
              await onUpdate(income.id, { name: label, amount })
            }}
            onDelete={() => onDelete(income.id)}
          />
        ))}

        {adding && (
          <div className="flex items-center gap-2 py-2 px-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
            <input
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); if (e.key === 'Escape') setAdding(false) }}
              placeholder={t.sourceName}
              className="flex-1 min-w-0 text-sm bg-transparent border-b border-green-300 dark:border-green-600 focus:outline-none text-gray-900 dark:text-gray-100"
            />
            <input
              value={newAmount}
              onChange={(e) => setNewAmount(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); if (e.key === 'Escape') setAdding(false) }}
              placeholder={t.amount}
              type="text"
              inputMode="decimal"
              className="w-24 text-sm bg-transparent border-b border-green-300 dark:border-green-600 focus:outline-none text-right text-gray-900 dark:text-gray-100"
            />
            <Button size="sm" variant="primary" onClick={handleAdd}>{t.addCategory}</Button>
            <Button size="sm" variant="ghost" onClick={() => setAdding(false)}>{t.cancel}</Button>
          </div>
        )}

        {incomes.length === 0 && !adding && (
          <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-4">
            {t.noIncomes}
          </p>
        )}
      </div>
    </Card>
  )
}

export default IncomeSection
