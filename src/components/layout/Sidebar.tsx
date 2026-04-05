import React from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, ArrowLeftRight, FileText, BarChart2, Settings,
  ChevronLeft, ChevronRight, Zap, LogOut,
} from 'lucide-react'
import { cn } from '../../lib/utils'

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
  userEmail: string | null
  onLogout: () => void
}

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/tranzactii', icon: ArrowLeftRight, label: 'Tranzacții' },
  { to: '/fisa-financiara', icon: FileText, label: 'Fișă Financiară' },
  { to: '/rapoarte', icon: BarChart2, label: 'Rapoarte' },
  { to: '/setari', icon: Settings, label: 'Setări' },
]

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle, userEmail, onLogout }) => {
  return (
    <aside
      className={cn(
        'hidden md:flex flex-col h-full bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 transition-all duration-300 shrink-0',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Logo */}
      <div className={cn('flex items-center h-16 px-4 border-b border-gray-100 dark:border-gray-800', collapsed && 'justify-center')}>
        <div className="flex items-center gap-2 min-w-0">
          <div className="shrink-0 w-8 h-8 bg-indigo-500 rounded-xl flex items-center justify-center shadow-sm">
            <Zap className="w-4.5 h-4.5 text-white" fill="white" />
          </div>
          {!collapsed && (
            <span className="text-xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
              Flux
            </span>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-0.5 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 group',
                isActive
                  ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-medium'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200',
                collapsed && 'justify-center'
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  className={cn(
                    'shrink-0 w-5 h-5 transition-colors',
                    isActive ? 'text-indigo-500' : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'
                  )}
                />
                {!collapsed && <span className="text-sm truncate">{label}</span>}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User info + collapse toggle */}
      <div className="border-t border-gray-100 dark:border-gray-800 p-3 space-y-1">
        {!collapsed && userEmail && (
          <div className="px-2 py-1 mb-1">
            <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{userEmail}</p>
          </div>
        )}
        <button
          onClick={onLogout}
          className={cn(
            'flex items-center gap-3 w-full px-3 py-2 rounded-xl text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-sm',
            collapsed && 'justify-center'
          )}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && <span>Deconectare</span>}
        </button>
        <button
          onClick={onToggle}
          className={cn(
            'flex items-center gap-3 w-full px-3 py-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors',
            collapsed && 'justify-center'
          )}
          aria-label={collapsed ? 'Extinde bara laterală' : 'Restrânge bara laterală'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          {!collapsed && <span className="text-sm text-gray-400">Restrânge</span>}
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
