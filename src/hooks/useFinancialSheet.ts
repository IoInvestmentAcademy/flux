import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { FinancialIncome, FinancialFixedExpense, FinancialAsset, FinancialLiability } from '../types'

interface FinancialSheetData {
  incomes: FinancialIncome[]
  fixedExpenses: FinancialFixedExpense[]
  assets: FinancialAsset[]
  liabilities: FinancialLiability[]
  loading: boolean
  error: string | null
  totalIncome: number
  totalFixedExpenses: number
  totalAssetIncome: number
  totalLiabilityPayments: number
  totalAssetValue: number
  totalLiabilityBalance: number
  netWorth: number
  netCashFlow: number
  // CRUD for incomes
  addIncome: (data: Omit<FinancialIncome, 'id' | 'user_id' | 'created_at'>) => Promise<{ error: string | null }>
  updateIncome: (id: string, data: Partial<FinancialIncome>) => Promise<{ error: string | null }>
  deleteIncome: (id: string) => Promise<{ error: string | null }>
  // CRUD for fixed expenses
  addFixedExpense: (data: Omit<FinancialFixedExpense, 'id' | 'user_id' | 'created_at'>) => Promise<{ error: string | null }>
  updateFixedExpense: (id: string, data: Partial<FinancialFixedExpense>) => Promise<{ error: string | null }>
  deleteFixedExpense: (id: string) => Promise<{ error: string | null }>
  // CRUD for assets
  addAsset: (data: Omit<FinancialAsset, 'id' | 'user_id' | 'created_at'>) => Promise<{ error: string | null }>
  updateAsset: (id: string, data: Partial<FinancialAsset>) => Promise<{ error: string | null }>
  deleteAsset: (id: string) => Promise<{ error: string | null }>
  // CRUD for liabilities
  addLiability: (data: Omit<FinancialLiability, 'id' | 'user_id' | 'created_at'>) => Promise<{ error: string | null }>
  updateLiability: (id: string, data: Partial<FinancialLiability>) => Promise<{ error: string | null }>
  deleteLiability: (id: string) => Promise<{ error: string | null }>
}

export function useFinancialSheet(userId: string | null): FinancialSheetData {
  const [incomes, setIncomes] = useState<FinancialIncome[]>([])
  const [fixedExpenses, setFixedExpenses] = useState<FinancialFixedExpense[]>([])
  const [assets, setAssets] = useState<FinancialAsset[]>([])
  const [liabilities, setLiabilities] = useState<FinancialLiability[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAll = useCallback(async () => {
    if (!userId) {
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const [incRes, expRes, assRes, liabRes] = await Promise.all([
        supabase.from('financial_incomes').select('*').eq('user_id', userId).order('sort_order'),
        supabase.from('financial_fixed_expenses').select('*').eq('user_id', userId).order('sort_order'),
        supabase.from('financial_assets').select('*').eq('user_id', userId).order('sort_order'),
        supabase.from('financial_liabilities').select('*').eq('user_id', userId).order('sort_order'),
      ])
      if (incRes.error) throw incRes.error
      if (expRes.error) throw expRes.error
      if (assRes.error) throw assRes.error
      if (liabRes.error) throw liabRes.error

      setIncomes((incRes.data as FinancialIncome[]) ?? [])
      setFixedExpenses((expRes.data as FinancialFixedExpense[]) ?? [])
      setAssets((assRes.data as FinancialAsset[]) ?? [])
      setLiabilities((liabRes.data as FinancialLiability[]) ?? [])
    } catch (err) {
      setError('Eroare la încărcarea fișei financiare.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => { fetchAll() }, [fetchAll])

  // Computed totals
  const activeIncomes = incomes.filter((i) => i.is_active)
  const activeExpenses = fixedExpenses.filter((e) => e.is_active)

  const totalIncome = activeIncomes.reduce((sum, i) => sum + i.amount, 0)
  const totalFixedExpenses = activeExpenses.reduce((sum, e) => sum + e.amount, 0)
  const totalAssetIncome = assets.reduce((sum, a) => sum + a.monthly_income, 0)
  const totalLiabilityPayments = liabilities.reduce((sum, l) => sum + l.monthly_payment, 0)
  const totalAssetValue = assets.reduce((sum, a) => sum + a.value, 0)
  const totalLiabilityBalance = liabilities.reduce((sum, l) => sum + l.balance, 0)
  const netWorth = totalAssetValue - totalLiabilityBalance
  const netCashFlow = totalIncome + totalAssetIncome - totalFixedExpenses - totalLiabilityPayments

  // Generic CRUD factory
  function makeCRUD<T extends { id: string }>(
    table: string,
    setter: React.Dispatch<React.SetStateAction<T[]>>
  ) {
    const add = async (data: Record<string, unknown>): Promise<{ error: string | null }> => {
      if (!userId) return { error: 'Nu ești autentificat.' }
      const { data: inserted, error: e } = await supabase.from(table).insert({ ...data, user_id: userId }).select().single()
      if (e) return { error: 'Eroare la salvare.' }
      setter((prev) => [...prev, inserted as T].sort((a: unknown, b: unknown) => ((a as { sort_order: number }).sort_order ?? 0) - ((b as { sort_order: number }).sort_order ?? 0)))
      return { error: null }
    }
    const update = async (id: string, data: Partial<T>): Promise<{ error: string | null }> => {
      if (!userId) return { error: 'Nu ești autentificat.' }
      const { data: updated, error: e } = await supabase.from(table).update(data).eq('id', id).eq('user_id', userId).select().single()
      if (e) return { error: 'Eroare la actualizare.' }
      setter((prev) => prev.map((item) => (item.id === id ? (updated as T) : item)))
      return { error: null }
    }
    const remove = async (id: string): Promise<{ error: string | null }> => {
      if (!userId) return { error: 'Nu ești autentificat.' }
      const { error: e } = await supabase.from(table).delete().eq('id', id).eq('user_id', userId)
      if (e) return { error: 'Eroare la ștergere.' }
      setter((prev) => prev.filter((item) => item.id !== id))
      return { error: null }
    }
    return { add, update, remove }
  }

  const incomeCRUD = makeCRUD<FinancialIncome>('financial_incomes', setIncomes)
  const expenseCRUD = makeCRUD<FinancialFixedExpense>('financial_fixed_expenses', setFixedExpenses)
  const assetCRUD = makeCRUD<FinancialAsset>('financial_assets', setAssets)
  const liabilityCRUD = makeCRUD<FinancialLiability>('financial_liabilities', setLiabilities)

  return {
    incomes, fixedExpenses, assets, liabilities,
    loading, error,
    totalIncome, totalFixedExpenses,
    totalAssetIncome, totalLiabilityPayments,
    totalAssetValue, totalLiabilityBalance,
    netWorth, netCashFlow,
    addIncome: (d) => incomeCRUD.add(d as Record<string, unknown>),
    updateIncome: (id, d) => incomeCRUD.update(id, d),
    deleteIncome: incomeCRUD.remove,
    addFixedExpense: (d) => expenseCRUD.add(d as Record<string, unknown>),
    updateFixedExpense: (id, d) => expenseCRUD.update(id, d),
    deleteFixedExpense: expenseCRUD.remove,
    addAsset: (d) => assetCRUD.add(d as Record<string, unknown>),
    updateAsset: (id, d) => assetCRUD.update(id, d),
    deleteAsset: assetCRUD.remove,
    addLiability: (d) => liabilityCRUD.add(d as Record<string, unknown>),
    updateLiability: (id, d) => liabilityCRUD.update(id, d),
    deleteLiability: liabilityCRUD.remove,
  }
}
