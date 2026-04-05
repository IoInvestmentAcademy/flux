import React, { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Zap } from 'lucide-react'
import { Button, Input } from '../components/ui'
import { useAuth } from '../hooks/useAuth'

const loginSchema = z.object({
  email: z.string().email('Adresa de email nu este validă.'),
  password: z.string().min(1, 'Parola este obligatorie.'),
})

const registerSchema = z.object({
  email: z.string().email('Adresa de email nu este validă.'),
  password: z.string().min(6, 'Parola trebuie să aibă cel puțin 6 caractere.'),
  confirmPassword: z.string().min(1, 'Confirmarea parolei este obligatorie.'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Parolele nu coincid.',
  path: ['confirmPassword'],
})

type LoginForm = z.infer<typeof loginSchema>
type RegisterForm = z.infer<typeof registerSchema>

export const Auth: React.FC = () => {
  const { user, loading: authLoading, login, register } = useAuth()
  const [tab, setTab] = useState<'login' | 'register'>('login')
  const [authError, setAuthError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const loginForm = useForm<LoginForm>({ resolver: zodResolver(loginSchema) })
  const registerForm = useForm<RegisterForm>({ resolver: zodResolver(registerSchema) })

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (user) return <Navigate to="/" replace />

  const handleLogin = loginForm.handleSubmit(async (data) => {
    setAuthError(null)
    setIsSubmitting(true)
    const { error } = await login(data.email, data.password)
    setIsSubmitting(false)
    if (error) setAuthError(error)
  })

  const handleRegister = registerForm.handleSubmit(async (data) => {
    setAuthError(null)
    setIsSubmitting(true)
    const { error } = await register(data.email, data.password)
    setIsSubmitting(false)
    if (error) {
      setAuthError(error)
    } else {
      setSuccessMessage('Cont creat cu succes! Verifică-ți emailul pentru confirmare.')
    }
  })

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-500 rounded-3xl shadow-lg shadow-indigo-500/30 mb-4">
            <Zap className="w-8 h-8 text-white" fill="white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Flux</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Finanțele tale, simplu.</p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 p-6">
          {/* Tabs */}
          <div className="flex rounded-xl bg-gray-100 dark:bg-gray-800 p-1 mb-6">
            <button
              onClick={() => { setTab('login'); setAuthError(null); setSuccessMessage(null) }}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                tab === 'login'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Autentificare
            </button>
            <button
              onClick={() => { setTab('register'); setAuthError(null); setSuccessMessage(null) }}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                tab === 'register'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Înregistrare
            </button>
          </div>

          {/* Success message */}
          {successMessage && (
            <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl text-sm text-green-700 dark:text-green-400">
              {successMessage}
            </div>
          )}

          {/* Error */}
          {authError && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-600 dark:text-red-400">
              {authError}
            </div>
          )}

          {/* Login form */}
          {tab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                label="Email"
                type="email"
                placeholder="email@exemplu.ro"
                autoComplete="email"
                {...loginForm.register('email')}
                error={loginForm.formState.errors.email?.message}
              />
              <Input
                label="Parolă"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                {...loginForm.register('password')}
                error={loginForm.formState.errors.password?.message}
              />
              <Button type="submit" variant="primary" className="w-full" size="lg" loading={isSubmitting}>
                Autentifică-te
              </Button>
            </form>
          )}

          {/* Register form */}
          {tab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <Input
                label="Email"
                type="email"
                placeholder="email@exemplu.ro"
                autoComplete="email"
                {...registerForm.register('email')}
                error={registerForm.formState.errors.email?.message}
              />
              <Input
                label="Parolă"
                type="password"
                placeholder="Minim 6 caractere"
                autoComplete="new-password"
                {...registerForm.register('password')}
                error={registerForm.formState.errors.password?.message}
              />
              <Input
                label="Confirmă parola"
                type="password"
                placeholder="Repetă parola"
                autoComplete="new-password"
                {...registerForm.register('confirmPassword')}
                error={registerForm.formState.errors.confirmPassword?.message}
              />
              <Button type="submit" variant="primary" className="w-full" size="lg" loading={isSubmitting}>
                Creează cont
              </Button>
            </form>
          )}
        </div>

        <p className="text-center text-xs text-gray-400 dark:text-gray-600 mt-6">
          Flux · Finanțe personale simplificate
        </p>
      </div>
    </div>
  )
}

export default Auth
