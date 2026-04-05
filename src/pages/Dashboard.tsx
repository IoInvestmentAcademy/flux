import React, { useState, useMemo } from 'react'
import { Plus } from 'lucide-react'
import { QuickStats } from '../components/dashboard/QuickStats'
import { CashFlowChart } from '../components/dashboard/CashFlowChart'
import { CategoryDonut } from '../components/dashboard/CategoryDonut'
import { RecentActivity } from '../components/dashboard/RecentActivity'
import { Modal } from '../components/ui'
import { TransactionForm } from '../components/transactions/TransactionForm'
import { useTransactions } from '../hooks/useTransactions'
import { useCategories } from '../hooks/useCategories'
import { useCustomFields } from '../hooks/useCustomFields'
import { useFinancialSheet } from '../hooks/useFinancialSheet'
import { useToast } from '../components/ui/ToastProvider'
import { getMonthRange } from '../lib/utils'
import { usePreferences } from '../lib/PreferencesContext'
import type { Transaction } from '../types'

interface DashboardProps {
  userId: string
}

export const Dashboard: React.FC<DashboardProps> = ({ userId }) => {
  const { t, language } = usePreferences()
  const [showAddModal, setShowAddModal] = useState(false)
  const [addLoading, setAddLoading] = useState(false)
  const { showSuccess, showError } = useToast()

  const now = new Date()
  const { from, to } = getMonthRange(now.getFullYear(), now.getMonth() + 1)

  const { transactions, loading: txLoading, addTransaction } = useTransactions({
    userId,
    filters: { dateFrom: from, dateTo: to },
  })

  const { categories } = useCategories(userId)
  const { fields: customFields } = useCustomFields(userId)
  const { netWorth } = useFinancialSheet(userId)

  const totalIncome = useMemo(
    () => transactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0),
    [transactions]
  )
  const totalExpenses = useMemo(
    () => transactions.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
    [transactions]
  )
  const netCashFlow = totalIncome - totalExpenses

  const handleAddTransaction = async (
    data: Omit<Transaction, 'id' | 'user_id' | 'created_at' | 'updated_at'>
  ) => {
    setAddLoading(true)
    const { error } = await addTransaction(data)
    setAddLoading(false)
    if (error) {
      showError(error)
    } else {
      showSuccess(t.transactionAdded)
      setShowAddModal(false)
    }
  }

  return (
    <div className="space-y-5 max-w-6xl mx-auto">
      {/* Page title */}
      <div className="hidden md:block">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t.dashboard}</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {new Date().toLocaleDateString(language === 'en' ? 'en-US' : 'ro-RO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Stats */}
      <QuickStats
        totalIncome={totalIncome}
        totalExpenses={totalExpenses}
        netCashFlow={netCashFlow}
        netWorth={netWorth}
        loading={txLoading}
      />

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <CashFlowChart userId={userId} />
        <CategoryDonut userId={userId} categories={categories} />
      </div>

      {/* Recent Activity */}
      <RecentActivity transactions={transactions} categories={categories} loading={txLoading} />

      {/* Desktop FAB */}
      <button
        onClick={() => setShowAddModal(true)}
        className="hidden md:flex fixed bottom-8 right-8 items-center justify-center w-14 h-14 bg-indigo-500 hover:bg-indigo-600 text-white rounded-2xl shadow-xl shadow-indigo-500/40 transition-all hover:scale-105 active:scale-95"
        aria-label="Adaugă tranzacție"
      >
        <Plus className="w-6 h-6" strokeWidth={2.5} />
      </button>

      {/* Add Transaction Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title={t.newTransaction}
      >
        <TransactionForm
          categories={categories}
          customFields={customFields}
          onSubmit={handleAddTransaction}
          onCancel={() => setShowAddModal(false)}
          loading={addLoading}
        />
      </Modal>
    </div>
  )
}

export default Dashboard
