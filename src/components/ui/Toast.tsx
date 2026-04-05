import React, { useEffect, useState } from 'react'
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react'
import { cn } from '../../lib/utils'
import type { ToastMessage } from '../../types'

interface ToastItemProps {
  toast: ToastMessage
  onDismiss: (id: string) => void
}

const icons = {
  success: <CheckCircle className="w-5 h-5 text-green-500" />,
  error: <XCircle className="w-5 h-5 text-red-500" />,
  warning: <AlertCircle className="w-5 h-5 text-yellow-500" />,
  info: <Info className="w-5 h-5 text-blue-500" />,
}

const bgClasses = {
  success: 'border-l-green-500',
  error: 'border-l-red-500',
  warning: 'border-l-yellow-500',
  info: 'border-l-blue-500',
}

export const ToastItem: React.FC<ToastItemProps> = ({ toast, onDismiss }) => {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Animate in
    requestAnimationFrame(() => setVisible(true))

    // Auto dismiss
    const timer = setTimeout(() => {
      setVisible(false)
      setTimeout(() => onDismiss(toast.id), 300)
    }, 4000)

    return () => clearTimeout(timer)
  }, [toast.id, onDismiss])

  return (
    <div
      className={cn(
        'flex items-start gap-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 border-l-4 rounded-xl shadow-lg px-4 py-3 min-w-72 max-w-sm transition-all duration-300',
        bgClasses[toast.type],
        visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
      )}
      role="alert"
    >
      <span className="shrink-0 mt-0.5">{icons[toast.type]}</span>
      <p className="flex-1 text-sm text-gray-800 dark:text-gray-200">{toast.message}</p>
      <button
        onClick={() => {
          setVisible(false)
          setTimeout(() => onDismiss(toast.id), 300)
        }}
        className="shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        aria-label="Închide notificarea"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}

interface ToastContainerProps {
  toasts: ToastMessage[]
  onDismiss: (id: string) => void
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  return (
    <div
      className="fixed bottom-20 left-4 sm:bottom-4 sm:left-4 z-[100] flex flex-col gap-2"
      aria-live="polite"
      aria-label="Notificări"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  )
}

export default ToastContainer
