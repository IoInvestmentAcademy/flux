import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { CustomFieldDefinition } from '../types'

interface UseCustomFieldsResult {
  fields: CustomFieldDefinition[]
  loading: boolean
  error: string | null
  addField: (data: Omit<CustomFieldDefinition, 'id' | 'user_id' | 'created_at'>) => Promise<{ error: string | null }>
  updateField: (id: string, data: Partial<CustomFieldDefinition>) => Promise<{ error: string | null }>
  deleteField: (id: string) => Promise<{ error: string | null }>
}

export function useCustomFields(userId: string | null): UseCustomFieldsResult {
  const [fields, setFields] = useState<CustomFieldDefinition[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchFields = useCallback(async () => {
    if (!userId) {
      setFields([])
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const { data, error: fetchError } = await supabase
        .from('custom_field_definitions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at')

      if (fetchError) throw fetchError
      setFields((data as CustomFieldDefinition[]) ?? [])
    } catch (err) {
      setError('Eroare la încărcarea câmpurilor personalizate.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => { fetchFields() }, [fetchFields])

  const addField = useCallback(
    async (data: Omit<CustomFieldDefinition, 'id' | 'user_id' | 'created_at'>): Promise<{ error: string | null }> => {
      if (!userId) return { error: 'Nu ești autentificat.' }
      const { error: e } = await supabase.from('custom_field_definitions').insert({ ...data, user_id: userId })
      if (e) return { error: 'Eroare la salvare.' }
      await fetchFields()
      return { error: null }
    },
    [userId, fetchFields]
  )

  const updateField = useCallback(
    async (id: string, data: Partial<CustomFieldDefinition>): Promise<{ error: string | null }> => {
      if (!userId) return { error: 'Nu ești autentificat.' }
      const { error: e } = await supabase.from('custom_field_definitions').update(data).eq('id', id).eq('user_id', userId)
      if (e) return { error: 'Eroare la actualizare.' }
      await fetchFields()
      return { error: null }
    },
    [userId, fetchFields]
  )

  const deleteField = useCallback(
    async (id: string): Promise<{ error: string | null }> => {
      if (!userId) return { error: 'Nu ești autentificat.' }
      const { error: e } = await supabase.from('custom_field_definitions').delete().eq('id', id).eq('user_id', userId)
      if (e) return { error: 'Eroare la ștergere.' }
      await fetchFields()
      return { error: null }
    },
    [userId, fetchFields]
  )

  return { fields, loading, error, addField, updateField, deleteField }
}
