import React from 'react'
import { TrendingDown, TrendingUp, Wallet, PiggyBank } from 'lucide-react'
import { NetWorthCard } from './NetWorthCard'
import { formatRON } from '../../lib/utils'

interface QuickStatsProps {
  totalIncome: number
  totalExpenses: number
  netCashFlow: number
  netWorth: number
  loading?: boolean
}

export const QuickStats: React.FC<QuickStatsProps> = ({
  totalIncome,
  totalExpenses,
  netCashFlow,
  netWorth,
  loading = false,
}) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <NetWorthCard
        title="Venituri luna aceasta"
        value={totalIncome}
        icon={<TrendingUp className="w-4 h-4 text-green-500" />}
        colorClass="bg-green-50 dark:bg-green-900/20"
        loading={loading}
      />
      <NetWorthCard
        title="Cheltuieli luna aceasta"
        value={totalExpenses}
        icon={<TrendingDown className="w-4 h-4 text-red-500" />}
        colorClass="bg-red-50 dark:bg-red-900/20"
        loading={loading}
      />
      <NetWorthCard
        title="Flux net luna aceasta"
        value={netCashFlow}
        icon={<Wallet className="w-4 h-4 text-indigo-500" />}
        colorClass="bg-indigo-50 dark:bg-indigo-900/20"
        loading={loading}
      />
      <NetWorthCard
        title="Avere netă"
        value={netWorth}
        icon={<PiggyBank className="w-4 h-4 text-purple-500" />}
        colorClass="bg-purple-50 dark:bg-purple-900/20"
        loading={loading}
      />
    </div>
  )
}

export default QuickStats
