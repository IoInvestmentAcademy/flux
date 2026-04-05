import React from 'react'
import { Menu, Zap } from 'lucide-react'

interface HeaderProps {
  title: string
  onMenuToggle: () => void
}

export const Header: React.FC<HeaderProps> = ({ title, onMenuToggle }) => {
  return (
    <header className="md:hidden sticky top-0 z-30 flex items-center justify-between h-14 px-4 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
      <div className="flex items-center gap-2">
        <button
          onClick={onMenuToggle}
          className="p-2 -ml-2 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Deschide meniu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-1.5">
          <div className="w-7 h-7 bg-indigo-500 rounded-lg flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" fill="white" />
          </div>
          <span className="font-bold text-gray-900 dark:text-gray-100">Flux</span>
        </div>
      </div>
      <h1 className="text-sm font-semibold text-gray-700 dark:text-gray-300">{title}</h1>
      <div className="w-10" aria-hidden="true" />
    </header>
  )
}

export default Header
