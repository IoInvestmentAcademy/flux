import React, { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ToastProvider } from './components/ui/ToastProvider'
import { AppLayout } from './components/layout/AppLayout'
import { Auth } from './pages/Auth'
import { Dashboard } from './pages/Dashboard'
import { Transactions } from './pages/Transactions'
import { FinancialSheet } from './pages/FinancialSheet'
import { Reports } from './pages/Reports'
import { Settings } from './pages/Settings'
import { useAuth } from './hooks/useAuth'
import { Modal } from './components/ui'
import { TransactionForm } from './components/transactions/TransactionForm'
import { useTransactions } from './hooks/useTransactions'
import { useCategories } from './hooks/useCategories'
import { useCustomFields } from './hooks/useCustomFields'
import type { Transaction } from './types'

// Error boundary component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="flex items-center justify-center h-full min-h-64 p-6">
            <div className="text-center bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6 max-w-sm">
              <p className="text-red-600 dark:text-red-400 font-semibold mb-2">A apărut o eroare</p>
              <p className="text-sm text-red-500 dark:text-red-400">
                {this.state.error?.message ?? 'Ceva nu a funcționat corect.'}
              </p>
              <button
                onClick={() => this.setState({ hasError: false })}
                className="mt-4 px-4 py-2 bg-red-500 text-white rounded-xl text-sm font-medium hover:bg-red-600 transition-colors"
              >
                Încearcă din nou
              </button>
            </div>
          </div>
        )
      )
    }
    return this.props.children
  }
}

// Protected routes wrapper with shared add-transaction FAB modal
const ProtectedApp: React.FC<{ userId: string; userEmail: string; onLogout: () => void }> = ({
  userId,
  userEmail,
  onLogout,
}) => {
  const [showGlobalAdd, setShowGlobalAdd] = useState(false)
  const [addLoading, setAddLoading] = useState(false)

  const { addTransaction } = useTransactions({ userId })
  const { categories, addCategory } = useCategories(userId)
  const { fields: customFields } = useCustomFields(userId)

  const handleGlobalAdd = async (data: Omit<Transaction, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    setAddLoading(true)
    await addTransaction(data)
    setAddLoading(false)
    setShowGlobalAdd(false)
  }

  return (
    <AppLayout
      userEmail={userEmail}
      onLogout={onLogout}
      onAddTransaction={() => setShowGlobalAdd(true)}
    >
      <Routes>
        <Route
          path="/"
          element={
            <ErrorBoundary>
              <Dashboard userId={userId} />
            </ErrorBoundary>
          }
        />
        <Route
          path="/tranzactii"
          element={
            <ErrorBoundary>
              <Transactions userId={userId} />
            </ErrorBoundary>
          }
        />
        <Route
          path="/fisa-financiara"
          element={
            <ErrorBoundary>
              <FinancialSheet userId={userId} />
            </ErrorBoundary>
          }
        />
        <Route
          path="/rapoarte"
          element={
            <ErrorBoundary>
              <Reports userId={userId} />
            </ErrorBoundary>
          }
        />
        <Route
          path="/setari"
          element={
            <ErrorBoundary>
              <Settings userId={userId} />
            </ErrorBoundary>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Global Add Transaction Modal (triggered from BottomNav FAB) */}
      <Modal
        isOpen={showGlobalAdd}
        onClose={() => setShowGlobalAdd(false)}
        title="Tranzacție nouă"
      >
        <TransactionForm
          categories={categories}
          customFields={customFields}
          onSubmit={handleGlobalAdd}
          onCancel={() => setShowGlobalAdd(false)}
          loading={addLoading}
          onAddCategory={addCategory}
        />
      </Modal>
    </AppLayout>
  )
}

const AppContent: React.FC = () => {
  const { user, loading, logout } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 bg-indigo-500 rounded-2xl flex items-center justify-center animate-pulse">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M11 21h-1l1-7H7.5c-.58 0-.57-.32-.38-.66.19-.34.05-.08.07-.12C8.48 10.94 10.42 7.54 13 3h1l-1 7h3.5c.49 0 .56.33.47.51l-.07.15C12.96 17.55 11 21 11 21z" />
            </svg>
          </div>
          <p className="text-sm text-gray-400 dark:text-gray-500">Se încarcă...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route path="*" element={<Navigate to="/auth" replace />} />
      </Routes>
    )
  }

  return (
    <ProtectedApp
      userId={user.id}
      userEmail={user.email ?? ''}
      onLogout={logout}
    />
  )
}

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </BrowserRouter>
  )
}

export default App
