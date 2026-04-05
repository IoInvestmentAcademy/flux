import React, { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { BottomNav } from './BottomNav'
import { cn } from '../../lib/utils'

interface AppLayoutProps {
  children: React.ReactNode
  userEmail: string | null
  onLogout: () => void
  onAddTransaction: () => void
}

const PAGE_TITLES: Record<string, string> = {
  '/': 'Dashboard',
  '/tranzactii': 'Tranzacții',
  '/fisa-financiara': 'Fișă Financiară',
  '/rapoarte': 'Rapoarte',
  '/setari': 'Setări',
}

const SIDEBAR_COLLAPSED_KEY = 'flux-sidebar-collapsed'

export const AppLayout: React.FC<AppLayoutProps> = ({ children, userEmail, onLogout, onAddTransaction }) => {
  const location = useLocation()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try {
      return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === 'true'
    } catch {
      return false
    }
  })
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const pageTitle = PAGE_TITLES[location.pathname] ?? 'Flux'

  const handleToggleSidebar = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev
      try { localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(next)) } catch {}
      return next
    })
  }

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [location.pathname])

  return (
    <div className="flex h-full bg-gray-50 dark:bg-gray-950 overflow-hidden">
      {/* Desktop Sidebar */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={handleToggleSidebar}
        userEmail={userEmail}
        onLogout={onLogout}
      />

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <div
            className="fixed left-0 top-0 bottom-0 z-50 shadow-2xl"
            style={{ animation: 'slideInLeft 0.25s ease-out' }}
          >
            <Sidebar
              collapsed={false}
              mobile={true}
              onToggle={() => setMobileMenuOpen(false)}
              userEmail={userEmail}
              onLogout={onLogout}
            />
          </div>
        </>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <Header title={pageTitle} onMenuToggle={() => setMobileMenuOpen(true)} />

        {/* Page Content */}
        <main
          className="flex-1 scroll-area px-4 md:px-6 pt-4 md:pt-6 md:pb-6"
          style={{ paddingBottom: 'calc(5rem + env(safe-area-inset-bottom))' }}
        >
          <div key={location.pathname} className="page-enter h-full">
            {children}
          </div>
        </main>

        {/* Mobile Bottom Nav */}
        <BottomNav onAddTransaction={onAddTransaction} />
      </div>
    </div>
  )
}

export default AppLayout
