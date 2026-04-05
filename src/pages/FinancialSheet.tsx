import React from 'react'
import { cn } from '../lib/utils'
import { Card, CardHeader, CardTitle, SkeletonCard } from '../components/ui'
import { IncomeSection } from '../components/financial-sheet/IncomeSection'
import { FixedExpensesSection } from '../components/financial-sheet/FixedExpensesSection'
import { AssetsSection } from '../components/financial-sheet/AssetsSection'
import { LiabilitiesSection } from '../components/financial-sheet/LiabilitiesSection'
import { useFinancialSheet } from '../hooks/useFinancialSheet'
import { useToast } from '../components/ui/ToastProvider'
import { usePreferences } from '../lib/PreferencesContext'

interface FinancialSheetProps {
  userId: string
}

export const FinancialSheet: React.FC<FinancialSheetProps> = ({ userId }) => {
  const { t, formatMoney } = usePreferences()
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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t.financialSheet}</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">{t.financialSheetTitle}</p>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left column: Income & Expenses */}
        <div className="space-y-5">
          <IncomeSection
            incomes={incomes}
            total={totalIncome}
            onAdd={async (d) => { const r = await addIncome(d); if (r.error) showError(r.error); else showSuccess(t.fieldAdded); return r }}
            onUpdate={async (id, d) => { const r = await updateIncome(id, d); if (r.error) showError(r.error); else showSuccess(t.fieldUpdated); return r }}
            onDelete={async (id) => { const r = await deleteIncome(id); if (r.error) showError(r.error); else showSuccess(t.fieldDeleted); return r }}
          />

          <FixedExpensesSection
            expenses={fixedExpenses}
            total={totalFixedExpenses}
            onAdd={async (d) => { const r = await addFixedExpense(d); if (r.error) showError(r.error); else showSuccess(t.fieldAdded); return r }}
            onUpdate={async (id, d) => { const r = await updateFixedExpense(id, d); if (r.error) showError(r.error); else showSuccess(t.fieldUpdated); return r }}
            onDelete={async (id) => { const r = await deleteFixedExpense(id); if (r.error) showError(r.error); else showSuccess(t.fieldDeleted); return r }}
          />

          {/* Net Cash Flow summary */}
          <Card>
            <CardHeader>
              <CardTitle>{t.netCashFlow}</CardTitle>
            </CardHeader>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                <span className="text-sm text-gray-600 dark:text-gray-400">{t.totalIncome}</span>
                <span className="text-sm font-semibold text-green-600 dark:text-green-400">{formatMoney(totalIncome)}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                <span className="text-sm text-gray-600 dark:text-gray-400">{t.income} ({t.assets.toLowerCase()})</span>
                <span className="text-sm font-semibold text-green-500 dark:text-green-400">{formatMoney(totalAssetIncome)}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                <span className="text-sm text-gray-600 dark:text-gray-400">{t.fixedExpensesSection}</span>
                <span className="text-sm font-semibold text-red-500">{formatMoney(totalFixedExpenses)}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                <span className="text-sm text-gray-600 dark:text-gray-400">{t.monthlyPayment} ({t.liabilities.toLowerCase()})</span>
                <span className="text-sm font-semibold text-red-500">{formatMoney(totalLiabilityPayments)}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{t.netCashFlow}</span>
                <span className={cn(
                  'text-base font-bold tabular-nums',
                  netCashFlow >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-500'
                )}>
                  {netCashFlow >= 0 ? '+' : ''}{formatMoney(netCashFlow)}
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
            onAdd={async (d) => { const r = await addAsset(d); if (r.error) showError(r.error); else showSuccess(t.fieldAdded); return r }}
            onUpdate={async (id, d) => { const r = await updateAsset(id, d); if (r.error) showError(r.error); else showSuccess(t.fieldUpdated); return r }}
            onDelete={async (id) => { const r = await deleteAsset(id); if (r.error) showError(r.error); else showSuccess(t.fieldDeleted); return r }}
          />

          <LiabilitiesSection
            liabilities={liabilities}
            totalBalance={totalLiabilityBalance}
            totalPayments={totalLiabilityPayments}
            onAdd={async (d) => { const r = await addLiability(d); if (r.error) showError(r.error); else showSuccess(t.fieldAdded); return r }}
            onUpdate={async (id, d) => { const r = await updateLiability(id, d); if (r.error) showError(r.error); else showSuccess(t.fieldUpdated); return r }}
            onDelete={async (id) => { const r = await deleteLiability(id); if (r.error) showError(r.error); else showSuccess(t.fieldDeleted); return r }}
          />

          {/* Net Worth + Rat Race */}
          <Card>
            <CardHeader>
              <CardTitle>{t.netWorthLabel}</CardTitle>
            </CardHeader>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                <span className="text-sm text-gray-600 dark:text-gray-400">{t.totalAssets}</span>
                <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">{formatMoney(totalAssetValue)}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                <span className="text-sm text-gray-600 dark:text-gray-400">{t.totalLiabilities}</span>
                <span className="text-sm font-semibold text-red-500">{formatMoney(totalLiabilityBalance)}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-base font-bold text-gray-900 dark:text-gray-100">{t.netWorthLabel}</span>
                <span className={cn(
                  'text-xl font-bold tabular-nums',
                  netWorth >= 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-red-500'
                )}>
                  {formatMoney(netWorth)}
                </span>
              </div>
            </div>

            {/* Rat Race Indicator */}
            <div className="mt-5 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {t.ratRaceIndicator}
                </span>
                <span className={cn(
                  'text-xs font-semibold px-2 py-0.5 rounded-full',
                  isOutOfRatRace
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                )}>
                  {isOutOfRatRace ? `${t.financialFreedom}!` : `${ratRacePercent.toFixed(0)}%`}
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
                {t.income} ({formatMoney(totalAssetIncome)}) / {t.expenses.toLowerCase()} ({formatMoney(totalMonthlyExpenses)})
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                {t.financialFreedomPct}
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default FinancialSheet
