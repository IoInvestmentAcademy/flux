import React, { useState, useMemo } from 'react'
import { Download } from 'lucide-react'
import { Button, Card, CardHeader, CardTitle } from '../components/ui'
import { CategoryBreakdown } from '../components/reports/CategoryBreakdown'
import { MonthlyChart } from '../components/reports/MonthlyChart'
import { SpendingTrends } from '../components/reports/SpendingTrends'
import { useTransactions } from '../hooks/useTransactions'
import { useCategories } from '../hooks/useCategories'
import { useToast } from '../components/ui/ToastProvider'
import { getMonthRange, MONTHS_RO, exportTransactionsToCSV } from '../lib/utils'

interface ReportsProps {
  userId: string
}

type PeriodType = 'this_month' | 'last_month' | 'last_3_months' | 'last_6_months' | 'this_year' | 'custom'

interface Period {
  label: string
  value: PeriodType
}

const PERIODS: Period[] = [
  { label: 'Luna aceasta', value: 'this_month' },
  { label: 'Luna trecută', value: 'last_month' },
  { label: 'Ultimele 3 luni', value: 'last_3_months' },
  { label: 'Ultimele 6 luni', value: 'last_6_months' },
  { label: 'Anul acesta', value: 'this_year' },
  { label: 'Personalizat', value: 'custom' },
]

function getPeriodDates(period: PeriodType, customFrom: string, customTo: string): { from: string; to: string } {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1

  switch (period) {
    case 'this_month':
      return getMonthRange(year, month)
    case 'last_month': {
      const d = new Date(year, month - 2, 1)
      return getMonthRange(d.getFullYear(), d.getMonth() + 1)
    }
    case 'last_3_months': {
      const d = new Date(year, month - 3, 1)
      const { from } = getMonthRange(d.getFullYear(), d.getMonth() + 1)
      const { to } = getMonthRange(year, month)
      return { from, to }
    }
    case 'last_6_months': {
      const d = new Date(year, month - 6, 1)
      const { from } = getMonthRange(d.getFullYear(), d.getMonth() + 1)
      const { to } = getMonthRange(year, month)
      return { from, to }
    }
    case 'this_year':
      return { from: `${year}-01-01`, to: `${year}-12-31` }
    case 'custom':
      return { from: customFrom, to: customTo }
  }
}

export const Reports: React.FC<ReportsProps> = ({ userId }) => {
  const [period, setPeriod] = useState<PeriodType>('this_month')
  const [customFrom, setCustomFrom] = useState('')
  const [customTo, setCustomTo] = useState('')
  const { showSuccess, showError } = useToast()

  const { from, to } = getPeriodDates(period, customFrom, customTo)

  const { transactions, loading } = useTransactions({
    userId,
    filters: { dateFrom: from, dateTo: to },
  })
  const { categories } = useCategories(userId)

  const totalIncome = useMemo(
    () => transactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0),
    [transactions]
  )
  const totalExpenses = useMemo(
    () => transactions.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
    [transactions]
  )

  const catMap = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories])

  const handleExport = () => {
    if (transactions.length === 0) {
      showError('Nu există tranzacții de exportat în perioada selectată.')
      return
    }
    exportTransactionsToCSV(transactions, (id) => catMap.get(id ?? '')?.name ?? 'Fără categorie')
    showSuccess('Fișierul CSV a fost descărcat!')
  }

  return (
    <div className="space-y-5 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="hidden md:block">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Rapoarte</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Analizează-ți obiceiurile financiare</p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          leftIcon={<Download className="w-4 h-4" />}
          onClick={handleExport}
        >
          Export CSV
        </Button>
      </div>

      {/* Period selector */}
      <Card padding="sm">
        <div className="flex flex-wrap gap-2 p-1">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                period === p.value
                  ? 'bg-indigo-500 text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Custom date range */}
        {period === 'custom' && (
          <div className="flex gap-3 mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 px-1">
            <div className="flex-1">
              <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">De la</label>
              <input
                type="date"
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
                className="w-full text-sm border border-gray-300 dark:border-gray-600 rounded-xl px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="flex-1">
              <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Până la</label>
              <input
                type="date"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
                className="w-full text-sm border border-gray-300 dark:border-gray-600 rounded-xl px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        )}
      </Card>

      {/* Summary row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Venituri', value: totalIncome, color: 'text-green-600 dark:text-green-400' },
          { label: 'Cheltuieli', value: totalExpenses, color: 'text-red-500' },
          { label: 'Net', value: totalIncome - totalExpenses, color: totalIncome - totalExpenses >= 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-red-500' },
        ].map((item) => (
          <Card key={item.label} padding="sm">
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">{item.label}</p>
            <p className={`text-base font-bold tabular-nums ${item.color}`}>
              {new Intl.NumberFormat('ro-RO', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(item.value)} lei
            </p>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <MonthlyChart userId={userId} />

      {/* Category breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <CategoryBreakdown transactions={transactions} categories={categories} type="expense" />
        <CategoryBreakdown transactions={transactions} categories={categories} type="income" />
      </div>

      {/* Spending trends search */}
      <SpendingTrends transactions={transactions} categories={categories} />
    </div>
  )
}

export default Reports
