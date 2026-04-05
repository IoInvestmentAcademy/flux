import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { PreferencesProvider } from './lib/PreferencesContext.tsx'

// Apply saved theme before first render to avoid flash
;(function initTheme() {
  try {
    const theme = localStorage.getItem('flux-theme') ?? 'system'
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    if (theme === 'dark' || (theme === 'system' && prefersDark)) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  } catch {}
})()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PreferencesProvider>
      <App />
    </PreferencesProvider>
  </StrictMode>,
)
