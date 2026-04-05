import React from 'react'
import { cn, formatRON } from '../lib/utils'
import { Card, CardHeader, CardTitle, SkeletonCard } from '../components/ui'
import { IncomeSection } from '../components/financial-sheet/IncomeSection'
import { FixedExpensesSection } from '../components/financial-sheet/FixedExpensesSection'
import { AssetsSection } from '../components/financial-sheet/AssetsSection'
import { LiabilitiesSection } from '../components/financial-sheet/LiabilitiesSection'
import { useFinancialSheet } from '../hooks/useFinancialSheet'
import { useToast } from '../components/ui/ToastProvider'

interface FinancialSheetProps {
  userId: string
}

export const FinancialSheet: React.FC<FinancialSheetProps> = ({ userId }) => {
  const { showSuccess, showError } = useToast()

  const {
    incomes, fixedExpenses, assets, liabilities,
    loading, error,
    totalIncome, totalFixedExpenses,
    totalAssetIncome, totalLiabilityPayments,
    totalAssetValue, totalLiabilityBalance,
    netWorth, netCashFlow,
    addIncome, updateIncome, deleteIncome,
    addFixedExpense, updateFixedExpense, deleteFixedExpense,
    addAsset, updateAsset, deleteAsset,
    addLiability, updateLiability, deleteLiability,
  } = useFinancialSheet(userId)

  const withFeedback = (fn: () => Promise<{ error: string | null }>, successMsg: string) => async () => {
    const { error } = await fn()
    if (error) showError(error)
    else showSuccess(successMsg)
  }

  // Rat Race indicator: passive income vs expenses
  // "Out of Rat Race" = passive income >= monthly expenses
  const totalMonthlyExpenses = totalFixedExpenses + totalLiabilityPayments
  const ratRacePercent = totalMonthlyExpenses > 0
    ? Math.min((totalAssetIncome / totalMonthlyExpenses) * 100, 100)
    : 0
  const isOutOfRatRace = totalAssetIncome >= totalMonthlyExpenses && totalMonthlyExpenses > 0

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-5">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6 text-center">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      {/* Page header */}
      <div className="hidden md:block">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Fișă Financiară</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Tabloul de bord al sănătății tale financiare</p>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left column: Income & Expenses */}
        <div className="space-y-5">
          <IncomeSection
            incomes={incomes}
            total={totalIncome}
            onAdd={async (d) => { const r = await addIncome(d); if (r.error) showError(r.error); else showSuccess('Venit adăugat!'); return r }}
            onUpdate={async (id, d) => { const r = await updateIncome(id, d); if (r.error) showError(r.error); else showSuccess('Venit actualizat!'); return r }}
            onDelete={async (id) => { const r = await deleteIncome(id); if (r.error) showError(r.error); else showSuccess('Venit șters!'); return r }}
          />

          <FixedExpensesSection
            expenses={fixedExpenses}
            total={totalFixedExpenses}
            onAdd={async (d) => { const r = await addFixedExpense(d); if (r.error) showError(r.error); else showSuccess('Cheltuială adăugată!'); return r }}
            onUpdate={async (id, d) => { const r = await updateFixedExpense(id, d); if (r.error) showError(r.error); else showSuccess('Cheltuială actualizată!'); return r }}
            onDelete={async (id) => { const r = await deleteFixedExpense(id); if (r.error) showError(r.error); else showSuccess('Cheltuială ștearsă!'); return r }}
          />

          {/* Net Cash Flow summary */}
          <Card>
            <CardHeader>
              <CardTitle>Rezumat flux de numerar</CardTitle>
            </CardHeader>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                <span className="text-sm text-gray-600 dark:text-gray-400">Total venituri active</span>
                <span className="text-sm font-semibold text-green-600 dark:text-green-400">{formatRON(totalIncome)}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                <span className="text-sm text-gray-600 dark:text-gray-400">Venituri pasive (active)</span>
                <span className="text-sm font-semibold text-green-500 dark:text-green-400">{formatRON(totalAssetIncome)}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                <span className="text-sm text-gray-600 dark:text-gray-400">Cheltuieli fixe</span>
                <span className="text-sm font-semibold text-red-500">{formatRON(totalFixedExpenses)}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                <span className="text-sm text-gray-600 dark:text-gray-400">Plăți lunare (datorii)</span>
                <span className="text-sm font-semibold text-red-500">{formatRON(totalLiabilityPayments)}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">Flux net lunar</span>
                <span className={cn(
                  'text-base font-bold tabular-nums',
                  netCashFlow >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-500'
                )}>
                  {netCashFlow >= 0 ? '+' : ''}{formatRON(netCashFlow)}
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Right column: Assets & Liabilities */}
        <div className="space-y-5">
          <AssetsSection
            assets={assets}
            totalValue={totalAssetValue}
            totalIncome={totalAssetIncome}
            onAdd={async (d) => { const r = await addAsset(d); if (r.error) showError(r.error); else showSuccess('Activ adăugat!'); return r }}
            onUpdate={async (id, d) => { const r = await updateAsset(id, d); if (r.error) showError(r.error); else showSuccess('Activ actualizat!'); return r }}
            onDelete={async (id) => { const r = await deleteAsset(id); if (r.error) showError(r.error); else showSuccess('Activ șters!'); return r }}
          />

          <LiabilitiesSection
            liabilities={liabilities}
            totalBalance={totalLiabilityBalance}
            totalPayments={totalLiabilityPayments}
            onAdd={async (d) => { const r = await addLiability(d); if (r.error) showError(r.error); else showSuccess('Datorie adăugată!'); return r }}
            onUpdate={async (id, d) => { const r = await updateLiability(id, d); if (r.error) showError(r.error); else showSuccess('Datorie actualizată!'); return r }}
            onDelete={async (id) => { const r = await deleteLiability(id); if (r.error) showError(r.error); else showSuccess('Datorie ștearsă!'); return r }}
          />

          {/* Net Worth + Rat Race */}
          <Card>
            <CardHeader>
              <CardTitle>Avere netă</CardTitle>
            </CardHeader>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                <span className="text-sm text-gray-600 dark:text-gray-400">Total active</span>
                <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">{formatRON(totalAssetValue)}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                <span className="text-sm text-gray-600 dark:text-gray-400">Total pasive</span>
                <span className="text-sm font-semibold text-red-500">{formatRON(totalLiabilityBalance)}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-base font-bold text-gray-900 dark:text-gray-100">Avere netă</span>
                <span className={cn(
                  'text-xl font-bold tabular-nums',
                  netWorth >= 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-red-500'
                )}>
                  {formatRON(netWorth)}
                </span>
              </div>
            </div>

            {/* Rat Race Indicator */}
            <div className="mt-5 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Indicator Rat Race
                </span>
                <span className={cn(
                  'text-xs font-semibold px-2 py-0.5 rounded-full',
                  isOutOfRatRace
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                )}>
                  {isOutOfRatRace ? 'Ieșit din Rat Race! 🎉' : `${ratRacePercent.toFixed(0)}%`}
                </span>
              </div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-500',
                    isOutOfRatRace ? 'bg-green-500' : 'bg-orange-400'
                  )}
                  style={{ width: `${ratRacePercent}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Venituri pasive ({formatRON(totalAssetIncome)}) față de cheltuieli totale ({formatRON(totalMonthlyExpenses)})
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                {isOutOfRatRace
                  ? 'Veniturile tale pasive acoperă toate cheltuielile. Ești liber financiar!'
                  : 'Crește veniturile pasive pentru a-ți acoperi cheltuielile lunare.'}
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default FinancialSheet
