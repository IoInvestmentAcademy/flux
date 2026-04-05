import React, { useState } from 'react'
import { Plus } from 'lucide-react'
import { Card, CardHeader, CardTitle, Button, Badge } from '../ui'
import { EditableRow } from './EditableRow'
import { usePreferences } from '../../lib/PreferencesContext'
import type { FinancialLiability, LiabilityType } from '../../types'

interface LiabilitiesSectionProps {
  liabilities: FinancialLiability[]
  totalBalance: number
  totalPayments: number
  onAdd: (data: Omit<FinancialLiability, 'id' | 'user_id' | 'created_at'>) => Promise<{ error: string | null }>
  onUpdate: (id: string, data: Partial<FinancialLiability>) => Promise<{ error: string | null }>
  onDelete: (id: string) => Promise<{ error: string | null }>
}

export const LiabilitiesSection: React.FC<LiabilitiesSectionProps> = ({
  liabilities, totalBalance, totalPayments, onAdd, onUpdate, onDelete,
}) => {
  const { t, formatMoney } = usePreferences()

  const LIABILITY_TYPE_LABELS_I18N: Record<LiabilityType, string> = {
    mortgage: t.mortgageLiability,
    car_loan: t.carLoanLiability,
    personal_loan: t.personalLoanLiability,
    credit_card: t.creditCardLiability,
    other: t.otherLiability,
  }

  const LIABILITY_TYPE_OPTIONS = Object.entries(LIABILITY_TYPE_LABELS_I18N).map(([value, label]) => ({ value, label }))

  const [adding, setAdding] = useState(false)
  const [newName, setNewName] = useState('')
  const [newBalance, setNewBalance] = useState('')
  const [newPayment, setNewPayment] = useState('')
  const [newType, setNewType] = useState<LiabilityType>('personal_loan')

  const handleAdd = async () => {
    if (!newName || !newBalance) return
    const balance = parseFloat(newBalance.replace(',', '.')) || 0
    const monthly_payment = parseFloat(newPayment.replace(',', '.')) || 0
    await onAdd({ name: newName, liability_type: newType, balance, monthly_payment, sort_order: liabilities.length })
    setNewName(''); setNewBalance(''); setNewPayment(''); setNewType('personal_loan'); setAdding(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.liabilities}</CardTitle>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-xs text-gray-400 dark:text-gray-500">{t.totalLiabilities}</p>
            <p className="text-sm font-bold text-red-500 dark:text-red-400 tabular-nums">{formatMoney(totalBalance)}</p>
          </div>
          <Button size="sm" variant="ghost" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setAdding(true)}>
            {t.addCategory}
          </Button>
        </div>
      </CardHeader>

      {totalPayments > 0 && (
        <div className="mb-3 px-3 py-2 bg-red-50 dark:bg-red-900/20 rounded-xl text-sm">
          <span className="text-gray-500 dark:text-gray-400">{t.monthlyPayment}: </span>
          <span className="font-semibold text-red-500 dark:text-red-400">{formatMoney(totalPayments)}</span>
        </div>
      )}

      <div className="space-y-0.5">
        {liabilities.map((liability) => (
          <EditableRow
            key={liability.id}
            label={liability.name}
            amount={liability.balance}
            amountLabel={t.totalLiabilities}
            secondaryAmount={liability.monthly_payment}
            secondaryLabel={t.monthlyPayment}
            showSecondary={true}
            badgeContent={
              <Badge variant="danger">
                {LIABILITY_TYPE_LABELS_I18N[liability.liability_type]}
              </Badge>
            }
            onUpdate={async (label, balance, monthlyPayment) => {
              await onUpdate(liability.id, { name: label, balance, monthly_payment: monthlyPayment ?? 0 })
            }}
            onDelete={() => onDelete(liability.id)}
          />
        ))}

        {adding && (
          <div className="space-y-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-xl">
            <input
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder={t.liabilityName}
              className="w-full text-sm bg-transparent border-b border-red-300 dark:border-red-600 focus:outline-none text-gray-900 dark:text-gray-100"
            />
            <div className="flex gap-2">
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value as LiabilityType)}
                className="text-sm bg-white dark:bg-gray-800 border border-red-200 dark:border-red-700 rounded-lg px-2 py-1"
              >
                {LIABILITY_TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <input
                value={newBalance}
                onChange={(e) => setNewBalance(e.target.value)}
                placeholder={t.amount}
                type="text"
                inputMode="decimal"
                className="w-24 text-sm bg-transparent border-b border-red-300 dark:border-red-600 focus:outline-none text-right text-gray-900 dark:text-gray-100"
              />
              <input
                value={newPayment}
                onChange={(e) => setNewPayment(e.target.value)}
                placeholder={t.monthlyPayment}
                type="text"
                inputMode="decimal"
                className="w-24 text-sm bg-transparent border-b border-red-300 dark:border-red-600 focus:outline-none text-right text-gray-900 dark:text-gray-100"
              />
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="primary" onClick={handleAdd}>{t.addCategory}</Button>
              <Button size="sm" variant="ghost" onClick={() => setAdding(false)}>{t.cancel}</Button>
            </div>
          </div>
        )}

        {liabilities.length === 0 && !adding && (
          <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-4">
            {t.noLiabilities}
          </p>
        )}
      </div>
    </Card>
  )
}

export default LiabilitiesSection
