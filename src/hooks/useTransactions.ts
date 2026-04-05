import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'
import type { Transaction, FilterState } from '../types'

interface UseTransactionsOptions {
  userId: string | null
  filters?: Partial<FilterState>
}

interface UseTransactionsResult {
  transactions: Transaction[]
  loading: boolean
  error: string | null
  addTransaction: (data: Omit<Transaction, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<{ error: string | null }>
  updateTransaction: (id: string, data: Partial<Omit<Transaction, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) => Promise<{ error: string | null }>
  deleteTransaction: (id: string) => Promise<{ error: string | null }>
  refresh: () => void
}

export function useTransactions({ userId, filters }: UseTransactionsOptions): UseTransactionsResult {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const refreshTokenRef = useRef(0)
  const fetchTransactionsRef = useRef<() => void>(() => {})

  const fetchTransactions = useCallback(async () => {
    if (!userId) {
      setTransactions([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      let query = supabase
        .from('transactions')
        .select(`*, category:categories(*)`)
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .order('created_at', { ascending: false })

      if (filters?.dateFrom) query = query.gte('date', filters.dateFrom)
      if (filters?.dateTo) query = query.lte('date', filters.dateTo)
      if (filters?.type) query = query.eq('type', filters.type)
      if (filters?.categoryIds && filters.categoryIds.length > 0) {
        query = query.in('category_id', filters.categoryIds)
      }
      if (filters?.detailSearch) {
        query = query.ilike('detail', `%${filters.detailSearch}%`)
      }

      const { data, error: fetchError } = await query

      if (fetchError) throw fetchError
      setTransactions((data as Transaction[]) ?? [])
    } catch (err) {
      setError('Eroare la încărcarea tranzacțiilor.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [userId, filters?.dateFrom, filters?.dateTo, filters?.type, filters?.categoryIds?.join(','), filters?.detailSearch])

  useEffect(() => {
    fetchTransactionsRef.current = fetchTransactions
  }, [fetchTransactions])

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions, refreshTokenRef.current])

  const addTransaction = useCallback(
    async (data: Omit<Transaction, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<{ error: string | null }> => {
      if (!userId) return { error: 'Nu ești autentificat.' }

      // Optimistic update
      const optimisticId = `optimistic-${Date.now()}`
      const optimistic: Transaction = {
        ...data,
        id: optimisticId,
        user_id: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      setTransactions((prev) => [optimistic, ...prev])

      const { error: insertError } = await supabase
        .from('transactions')
        .insert({ ...data, user_id: userId })

      if (insertError) {
        setTransactions((prev) => prev.filter((t) => t.id !== optimisticId))
        return { error: 'Eroare la salvarea tranzacției.' }
      }

      fetchTransactionsRef.current()
      return { error: null }
    },
    [userId]
  )

  const updateTransaction = useCallback(
    async (
      id: string,
      data: Partial<Omit<Transaction, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
    ): Promise<{ error: string | null }> => {
      if (!userId) return { error: 'Nu ești autentificat.' }

      const { error: updateError } = await supabase
        .from('transactions')
        .update(data)
        .eq('id', id)
        .eq('user_id', userId)

      if (updateError) return { error: 'Eroare la actualizarea tranzacției.' }
      fetchTransactionsRef.current()
      return { error: null }
    },
    [userId]
  )

  const deleteTransaction = useCallback(
    async (id: string): Promise<{ error: string | null }> => {
      if (!userId) return { error: 'Nu ești autentificat.' }

      // Optimistic delete
      setTransactions((prev) => prev.filter((t) => t.id !== id))

      const { error: deleteError } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id)
        .eq('user_id', userId)

      if (deleteError) {
        fetchTransactions()
        return { error: 'Eroare la ștergerea tranzacției.' }
      }

      return { error: null }
    },
    [userId, fetchTransactions]
  )

  const refresh = useCallback(() => {
    refreshTokenRef.current += 1
    fetchTransactions()
  }, [fetchTransactions])

  return { transactions, loading, error, addTransaction, updateTransaction, deleteTransaction, refresh }
}
