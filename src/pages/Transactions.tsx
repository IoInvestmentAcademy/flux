import React, { useState } from 'react'
import { Plus, SlidersHorizontal, X } from 'lucide-react'
import { Button, Modal } from '../components/ui'
import { TransactionForm } from '../components/transactions/TransactionForm'
import { TransactionList } from '../components/transactions/TransactionList'
import { Filters } from '../components/transactions/Filters'
import { useTransactions } from '../hooks/useTransactions'
import { useCategories } from '../hooks/useCategories'
import { useCustomFields } from '../hooks/useCustomFields'
import { useToast } from '../components/ui/ToastProvider'
import type { Transaction, FilterState } from '../types'

interface TransactionsProps {
  userId: string
}

const EMPTY_FILTERS: FilterState = {
  dateFrom: '',
  dateTo: '',
  type: '',
  categoryIds: [],
  detailSearch: '',
}

export const Transactions: React.FC<TransactionsProps> = ({ userId }) => {
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS)
  const [addLoading, setAddLoading] = useState(false)
  const { showSuccess, showError } = useToast()

  const hasActiveFilters = filters.dateFrom || filters.dateTo || filters.type || filters.categoryIds.length > 0 || filters.detailSearch

  const { transactions, loading, addTransaction, updateTransaction, deleteTransaction } = useTransactions({
    userId,
    filters,
  })
  const { categories } = useCategories(userId)
  const { fields: customFields } = useCustomFields(userId)

  const handleAdd = async (data: Omit<Transaction, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    setAddLoading(true)
    const { error } = await addTransaction(data)
    setAddLoading(false)
    if (error) {
      showError(error)
    } else {
      showSuccess('Tranzacție adăugată!')
      setShowAddModal(false)
    }
  }

  const handleUpdate = async (data: Omit<Transaction, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!editingTransaction) return
    setAddLoading(true)
    const { error } = await updateTransaction(editingTransaction.id, data)
    setAddLoading(false)
    if (error) {
      showError(error)
    } else {
      showSuccess('Tranzacție actualizată!')
      setEditingTransaction(null)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Ești sigur că vrei să ștergi această tranzacție?')) return
    const { error } = await deleteTransaction(id)
    if (error) {
      showError(error)
    } else {
      showSuccess('Tranzacție ștearsă!')
    }
  }

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="hidden md:block">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Tranzacții</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {transactions.length} tranzacții găsite
          </p>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end">
          <Button
            variant={showFilters ? 'primary' : 'secondary'}
            size="sm"
            leftIcon={showFilters ? <X className="w-4 h-4" /> : <SlidersHorizontal className="w-4 h-4" />}
            onClick={() => setShowFilters((v) => !v)}
          >
            {showFilters ? 'Ascunde filtrele' : 'Filtre'}
            {hasActiveFilters && !showFilters && (
              <span className="ml-1 bg-indigo-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                !
              </span>
            )}
          </Button>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setShowAddModal(true)}
            className="hidden md:flex"
          >
            Adaugă tranzacție
          </Button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <Filters
          filters={filters}
          onChange={setFilters}
          categories={categories}
        />
      )}

      {/* Transaction list */}
      <TransactionList
        transactions={transactions}
        categories={categories}
        customFields={customFields}
        loading={loading}
        onEdit={setEditingTransaction}
        onDelete={handleDelete}
      />

      {/* Desktop FAB */}
      <button
        onClick={() => setShowAddModal(true)}
        className="hidden md:flex fixed bottom-8 right-8 items-center justify-center w-14 h-14 bg-indigo-500 hover:bg-indigo-600 text-white rounded-2xl shadow-xl shadow-indigo-500/40 transition-all hover:scale-105 active:scale-95"
        aria-label="Adaugă tranzacție"
      >
        <Plus className="w-6 h-6" strokeWidth={2.5} />
      </button>

      {/* Add Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Tranzacție nouă"
      >
        <TransactionForm
          categories={categories}
          customFields={customFields}
          onSubmit={handleAdd}
          onCancel={() => setShowAddModal(false)}
          loading={addLoading}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={!!editingTransaction}
        onClose={() => setEditingTransaction(null)}
        title="Editează tranzacție"
      >
        {editingTransaction && (
          <TransactionForm
            categories={categories}
            customFields={customFields}
            initialData={editingTransaction}
            onSubmit={handleUpdate}
            onCancel={() => setEditingTransaction(null)}
            loading={addLoading}
          />
        )}
      </Modal>
    </div>
  )
}

export default Transactions
