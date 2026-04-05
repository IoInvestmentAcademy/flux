import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { Category } from '../types'

interface UseCategoriesResult {
  categories: Category[]
  loading: boolean
  error: string | null
  addCategory: (data: Omit<Category, 'id' | 'user_id' | 'created_at'>) => Promise<{ error: string | null; id?: string }>
  updateCategory: (id: string, data: Partial<Omit<Category, 'id' | 'user_id' | 'created_at'>>) => Promise<{ error: string | null }>
  deleteCategory: (id: string) => Promise<{ error: string | null }>
  getCategoryById: (id: string | null) => Category | undefined
}

export function useCategories(userId: string | null): UseCategoriesResult {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCategories = useCallback(async () => {
    if (!userId) {
      setCategories([])
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const { data, error: fetchError } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', userId)
        .order('name')

      if (fetchError) throw fetchError
      setCategories((data as Category[]) ?? [])
    } catch (err) {
      setError('Eroare la încărcarea categoriilor.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  const addCategory = useCallback(
    async (data: Omit<Category, 'id' | 'user_id' | 'created_at'>): Promise<{ error: string | null; id?: string }> => {
      if (!userId) return { error: 'Nu ești autentificat.' }

      const { data: inserted, error: insertError } = await supabase
        .from('categories')
        .insert({ ...data, user_id: userId })
        .select('id')
        .single()

      if (insertError) return { error: 'Eroare la salvarea categoriei.' }
      await fetchCategories()
      return { error: null, id: inserted?.id }
    },
    [userId, fetchCategories]
  )

  const updateCategory = useCallback(
    async (
      id: string,
      data: Partial<Omit<Category, 'id' | 'user_id' | 'created_at'>>
    ): Promise<{ error: string | null }> => {
      if (!userId) return { error: 'Nu ești autentificat.' }

      const { error: updateError } = await supabase
        .from('categories')
        .update(data)
        .eq('id', id)
        .eq('user_id', userId)

      if (updateError) return { error: 'Eroare la actualizarea categoriei.' }
      await fetchCategories()
      return { error: null }
    },
    [userId, fetchCategories]
  )

  const deleteCategory = useCallback(
    async (id: string): Promise<{ error: string | null }> => {
      if (!userId) return { error: 'Nu ești autentificat.' }

      const { error: deleteError } = await supabase
        .from('categories')
        .delete()
        .eq('id', id)
        .eq('user_id', userId)

      if (deleteError) return { error: 'Eroare la ștergerea categoriei.' }
      await fetchCategories()
      return { error: null }
    },
    [userId, fetchCategories]
  )

  const getCategoryById = useCallback(
    (id: string | null): Category | undefined => {
      if (!id) return undefined
      return categories.find((c) => c.id === id)
    },
    [categories]
  )

  return { categories, loading, error, addCategory, updateCategory, deleteCategory, getCategoryById }
}
