import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { AssetType, LiabilityType, Transaction } from '../types'

// ─── Class name helper ────────────────────────────────────────────────────────
// We bundle a minimal cn() without an extra package dependency
export function cn(...inputs: ClassValue[]): string {
  // Simple implementation that handles strings, arrays, and objects
  const classes: string[] = []
  for (const input of inputs) {
    if (!input) continue
    if (typeof input === 'string') {
      classes.push(input)
    } else if (Array.isArray(input)) {
      classes.push(cn(...input))
    } else if (typeof input === 'object') {
      for (const [key, value] of Object.entries(input)) {
        if (value) classes.push(key)
      }
    }
  }
  // Basic Tailwind merge: last duplicate wins
  return twMerge(clsx(classes))
}

// ─── Romanian currency formatter ──────────────────────────────────────────────
export function formatRON(amount: number): string {
  return new Intl.NumberFormat('ro-RO', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount) + ' lei'
}

// ─── Romanian date formatter ──────────────────────────────────────────────────
const RO_LOCALE = 'ro-RO'

export function formatDateRO(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString(RO_LOCALE, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

export function formatDateShortRO(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString(RO_LOCALE, { day: 'numeric', month: 'short', year: 'numeric' })
}

export function getMonthLabelRO(dateStr: string): string {
  const date = new Date(dateStr + '-01T00:00:00')
  return date.toLocaleDateString(RO_LOCALE, { month: 'short' })
}

export const MONTHS_RO = [
  'Ianuarie', 'Februarie', 'Martie', 'Aprilie', 'Mai', 'Iunie',
  'Iulie', 'August', 'Septembrie', 'Octombrie', 'Noiembrie', 'Decembrie',
]

export const MONTHS_SHORT_RO = [
  'Ian', 'Feb', 'Mar', 'Apr', 'Mai', 'Iun',
  'Iul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

// ─── Date range helpers ───────────────────────────────────────────────────────
export function getMonthRange(year: number, month: number): { from: string; to: string } {
  const from = `${year}-${String(month).padStart(2, '0')}-01`
  const lastDay = new Date(year, month, 0).getDate()
  const to = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`
  return { from, to }
}

export function getLast6MonthRanges(): Array<{ year: number; month: number; label: string }> {
  const result = []
  const now = new Date()
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    result.push({
      year: d.getFullYear(),
      month: d.getMonth() + 1,
      label: MONTHS_SHORT_RO[d.getMonth()],
    })
  }
  return result
}

export function getLast12MonthRanges(): Array<{ year: number; month: number; label: string }> {
  const result = []
  const now = new Date()
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    result.push({
      year: d.getFullYear(),
      month: d.getMonth() + 1,
      label: MONTHS_SHORT_RO[d.getMonth()],
    })
  }
  return result
}

// ─── Asset/Liability labels ───────────────────────────────────────────────────
export const ASSET_TYPE_LABELS: Record<AssetType, string> = {
  cash: 'Numerar',
  investment: 'Investiții',
  real_estate: 'Imobiliare',
  vehicle: 'Vehicul',
  other: 'Altele',
}

export const LIABILITY_TYPE_LABELS: Record<LiabilityType, string> = {
  mortgage: 'Credit ipotecar',
  car_loan: 'Credit auto',
  personal_loan: 'Credit personal',
  credit_card: 'Card de credit',
  other: 'Altele',
}

// ─── CSV export helper ────────────────────────────────────────────────────────
export function exportTransactionsToCSV(transactions: Transaction[], categoryName: (id: string | null) => string): void {
  const headers = ['Data', 'Tip', 'Categorie', 'Detaliu', 'Sumă (lei)', 'Notă']
  const rows = transactions.map((t) => [
    t.date,
    t.type === 'expense' ? 'Cheltuială' : 'Venit',
    categoryName(t.category_id),
    t.detail ?? '',
    t.amount.toFixed(2),
    t.note ?? '',
  ])

  const csvContent = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n')

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `flux-tranzactii-${new Date().toISOString().slice(0, 10)}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

// ─── Smart relative date label (Romanian) ────────────────────────────────────
// Today → "Azi", Yesterday → "Ieri", 2–5 days ago → day name, older → dd/mm/yyyy
export function formatRelativeDateRO(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diffMs = today.getTime() - date.getTime()
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Azi'
  if (diffDays === 1) return 'Ieri'
  if (diffDays >= 2 && diffDays <= 5) {
    return date.toLocaleDateString('ro-RO', { weekday: 'long' })
      .replace(/^\w/, (c) => c.toUpperCase())
  }
  return date.toLocaleDateString('ro-RO', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

// ─── Today as ISO string ──────────────────────────────────────────────────────
export function todayISO(): string {
  return new Date().toISOString().slice(0, 10)
}

// ─── Current month label ──────────────────────────────────────────────────────
export function currentMonthLabel(): string {
  const now = new Date()
  return `${MONTHS_RO[now.getMonth()]} ${now.getFullYear()}`
}
