import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, ArrowLeftRight, BarChart2, Settings, Plus } from 'lucide-react'
import { cn } from '../../lib/utils'

interface BottomNavProps {
  onAddTransaction: () => void
}

const leftItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/tranzactii', icon: ArrowLeftRight, label: 'Tranzacții' },
]

const rightItems = [
  { to: '/rapoarte', icon: BarChart2, label: 'Rapoarte' },
  { to: '/setari', icon: Settings, label: 'Setări' },
]

export const BottomNav: React.FC<BottomNavProps> = ({ onAddTransaction }) => {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 safe-area-pb">
      <div className="flex items-center justify-around h-16">
        {leftItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center gap-0.5 px-4 py-1 rounded-xl transition-colors min-w-0',
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
                'flex flex-col items-center gap-0.5 px-4 py-1 rounded-xl transition-colors min-w-0',
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
