import React from 'react'
import { NavLink } from 'react-router-dom'
import { LayoutDashboard, ArrowLeftRight, BarChart2, Settings, Plus } from 'lucide-react'
import { cn } from '../../lib/utils'
import { usePreferences } from '../../lib/PreferencesContext'

interface BottomNavProps {
  onAddTransaction: () => void
}

export const BottomNav: React.FC<BottomNavProps> = ({ onAddTransaction }) => {
  const { t } = usePreferences()

  const leftItems = [
    { to: '/', icon: LayoutDashboard, label: t.dashboard },
    { to: '/tranzactii', icon: ArrowLeftRight, label: t.transactions },
  ]

  const rightItems = [
    { to: '/rapoarte', icon: BarChart2, label: t.reports },
    { to: '/setari', icon: Settings, label: t.settings },
  ]

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex items-center justify-around h-16">
        {leftItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center gap-0.5 px-4 py-1 rounded-xl transition-colors min-w-0 min-h-[44px] justify-center',
                isActive
                  ? 'text-indigo-600 dark:text-indigo-400'
                  : 'text-gray-400 dark:text-gray-500'
              )
            }
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px] font-medium truncate">{label}</span>
          </NavLink>
        ))}

        {/* FAB Center */}
        <button
          onClick={onAddTransaction}
          className="flex items-center justify-center w-14 h-14 -mt-6 bg-indigo-500 hover:bg-indigo-600 active:bg-indigo-700 text-white rounded-2xl shadow-lg shadow-indigo-500/40 transition-colors"
          aria-label="Adaugă tranzacție"
        >
          <Plus className="w-6 h-6" strokeWidth={2.5} />
        </button>

        {rightItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center gap-0.5 px-4 py-1 rounded-xl transition-colors min-w-0 min-h-[44px] justify-center',
                isActive
                  ? 'text-indigo-600 dark:text-indigo-400'
                  : 'text-gray-400 dark:text-gray-500'
              )
            }
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px] font-medium truncate">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

export default BottomNav
