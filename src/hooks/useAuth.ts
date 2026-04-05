import { useState, useEffect, useCallback } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { seedDefaultCategories } from '../lib/categories'

interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
}

interface AuthActions {
  login: (email: string, password: string) => Promise<{ error: string | null }>
  register: (email: string, password: string) => Promise<{ error: string | null }>
  logout: () => Promise<void>
}

export function useAuth(): AuthState & AuthActions {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
  })

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setState({ user: session?.user ?? null, session, loading: false })
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setState({ user: session?.user ?? null, session, loading: false })
    })

    return () => subscription.unsubscribe()
  }, [])

  const login = useCallback(async (email: string, password: string): Promise<{ error: string | null }> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      const msg = translateAuthError(error.message)
      return { error: msg }
    }
    return { error: null }
  }, [])

  const register = useCallback(async (email: string, password: string): Promise<{ error: string | null }> => {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) {
      const msg = translateAuthError(error.message)
      return { error: msg }
    }
    if (data.user) {
      await seedDefaultCategories(data.user.id)
    }
    return { error: null }
  }, [])

  const logout = useCallback(async (): Promise<void> => {
    await supabase.auth.signOut()
  }, [])

  return { ...state, login, register, logout }
}

function translateAuthError(message: string): string {
  if (message.includes('Invalid login credentials')) return 'Email sau parolă incorectă.'
  if (message.includes('User already registered')) return 'Există deja un cont cu acest email.'
  if (message.includes('Password should be at least')) return 'Parola trebuie să aibă cel puțin 6 caractere.'
  if (message.includes('Unable to validate email')) return 'Adresa de email nu este validă.'
  if (message.includes('Email not confirmed')) return 'Te rugăm să confirmi adresa de email înainte de a te autentifica.'
  if (message.includes('signup_disabled')) return 'Înregistrările sunt dezactivate momentan.'
  return 'A apărut o eroare. Te rugăm să încerci din nou.'
}
