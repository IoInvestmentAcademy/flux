import React, { useState } from 'react'
import { Plus } from 'lucide-react'
import { Card, CardHeader, CardTitle, Button, Badge, Select } from '../ui'
import { EditableRow } from './EditableRow'
import { formatRON, ASSET_TYPE_LABELS } from '../../lib/utils'
import type { FinancialAsset, AssetType } from '../../types'

interface AssetsSectionProps {
  assets: FinancialAsset[]
  totalValue: number
  totalIncome: number
  onAdd: (data: Omit<FinancialAsset, 'id' | 'user_id' | 'created_at'>) => Promise<{ error: string | null }>
  onUpdate: (id: string, data: Partial<FinancialAsset>) => Promise<{ error: string | null }>
  onDelete: (id: string) => Promise<{ error: string | null }>
}

const ASSET_BADGE_COLORS: Record<AssetType, 'success' | 'info' | 'warning' | 'purple' | 'default'> = {
  cash: 'success',
  investment: 'purple',
  real_estate: 'warning',
  vehicle: 'info',
  other: 'default',
}

const ASSET_TYPE_OPTIONS = Object.entries(ASSET_TYPE_LABELS).map(([value, label]) => ({ value, label }))

export const AssetsSection: React.FC<AssetsSectionProps> = ({
  assets, totalValue, totalIncome, onAdd, onUpdate, onDelete,
}) => {
  const [adding, setAdding] = useState(false)
  const [newName, setNewName] = useState('')
  const [newValue, setNewValue] = useState('')
  const [newIncome, setNewIncome] = useState('')
  const [newType, setNewType] = useState<AssetType>('cash')

  const handleAdd = async () => {
    if (!newName || !newValue) return
    const value = parseFloat(newValue.replace(',', '.')) || 0
    const monthly_income = parseFloat(newIncome.replace(',', '.')) || 0
    await onAdd({ name: newName, asset_type: newType, value, monthly_income, sort_order: assets.length })
    setNewName(''); setNewValue(''); setNewIncome(''); setNewType('cash'); setAdding(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Active</CardTitle>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-xs text-gray-400 dark:text-gray-500">Valoare totală</p>
            <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400 tabular-nums">{formatRON(totalValue)}</p>
          </div>
          <Button size="sm" variant="ghost" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setAdding(true)}>
            Adaugă
          </Button>
        </div>
      </CardHeader>

      {totalIncome > 0 && (
        <div className="mb-3 px-3 py-2 bg-green-50 dark:bg-green-900/20 rounded-xl text-sm">
          <span className="text-gray-500 dark:text-gray-400">Venit lunar din active: </span>
          <span className="font-semibold text-green-600 dark:text-green-400">{formatRON(totalIncome)}</span>
        </div>
      )}

      <div className="space-y-0.5">
        {assets.map((asset) => (
          <EditableRow
            key={asset.id}
            label={asset.name}
            amount={asset.value}
            amountLabel="Valoare"
            secondaryAmount={asset.monthly_income}
            secondaryLabel="Venit/lună"
            showSecondary={true}
            badgeContent={
              <Badge variant={ASSET_BADGE_COLORS[asset.asset_type]}>
                {ASSET_TYPE_LABELS[asset.asset_type]}
              </Badge>
            }
            onUpdate={async (label, value, monthlyIncome) => {
              await onUpdate(asset.id, { name: label, value, monthly_income: monthlyIncome ?? 0 })
            }}
            onDelete={() => onDelete(asset.id)}
          />
        ))}

        {adding && (
          <div className="space-y-2 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl">
            <div className="flex gap-2">
              <input
                autoFocus
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Denumire activ"
                className="flex-1 text-sm bg-transparent border-b border-indigo-300 dark:border-indigo-600 focus:outline-none text-gray-900 dark:text-gray-100"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value as AssetType)}
                className="text-sm bg-white dark:bg-gray-800 border border-indigo-200 dark:border-indigo-700 rounded-lg px-2 py-1"
              >
                {ASSET_TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <input
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                placeholder="Valoare"
                type="text"
                inputMode="decimal"
                className="w-24 text-sm bg-transparent border-b border-indigo-300 dark:border-indigo-600 focus:outline-none text-right text-gray-900 dark:text-gray-100"
              />
              <input
                value={newIncome}
                onChange={(e) => setNewIncome(e.target.value)}
                placeholder="Venit/lună"
                type="text"
                inputMode="decimal"
                className="w-24 text-sm bg-transparent border-b border-indigo-300 dark:border-indigo-600 focus:outline-none text-right text-gray-900 dark:text-gray-100"
              />
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="primary" onClick={handleAdd}>Adaugă</Button>
              <Button size="sm" variant="ghost" onClick={() => setAdding(false)}>Anulează</Button>
            </div>
          </div>
        )}

        {assets.length === 0 && !adding && (
          <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-4">
            Adaugă activele tale (economii, investiții, imobiliare etc.)
          </p>
        )}
      </div>
    </Card>
  )
}

export default AssetsSection
