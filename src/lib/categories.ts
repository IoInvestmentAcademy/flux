import { supabase } from './supabase'
import type { Category } from '../types'

export interface DefaultCategory {
  name: string
  icon: string
  color: string
  type: 'expense' | 'income' | 'both'
}

export const DEFAULT_CATEGORIES: DefaultCategory[] = [
  // Expenses
  { name: 'Mâncare & Restaurant', icon: 'utensils', color: '#ef4444', type: 'expense' },
  { name: 'Transport', icon: 'car', color: '#f97316', type: 'expense' },
  { name: 'Cumpărături', icon: 'shopping-bag', color: '#eab308', type: 'expense' },
  { name: 'Locuință', icon: 'home', color: '#84cc16', type: 'expense' },
  { name: 'Sănătate', icon: 'heart-pulse', color: '#06b6d4', type: 'expense' },
  { name: 'Divertisment', icon: 'tv', color: '#8b5cf6', type: 'expense' },
  { name: 'Îmbrăcăminte', icon: 'shirt', color: '#ec4899', type: 'expense' },
  { name: 'Educație', icon: 'graduation-cap', color: '#14b8a6', type: 'expense' },
  { name: 'Abonamente', icon: 'credit-card', color: '#6366f1', type: 'expense' },
  { name: 'Cadouri', icon: 'gift', color: '#f43f5e', type: 'expense' },
  { name: 'Sport & Fitness', icon: 'dumbbell', color: '#22c55e', type: 'expense' },
  { name: 'Călătorii', icon: 'plane', color: '#0ea5e9', type: 'expense' },
  { name: 'Servicii & Reparații', icon: 'wrench', color: '#78716c', type: 'expense' },
  { name: 'Altele (cheltuieli)', icon: 'ellipsis', color: '#94a3b8', type: 'expense' },
  // Incomes
  { name: 'Salariu', icon: 'briefcase', color: '#22c55e', type: 'income' },
  { name: 'Freelance', icon: 'laptop', color: '#06b6d4', type: 'income' },
  { name: 'Investiții', icon: 'trending-up', color: '#6366f1', type: 'income' },
  { name: 'Chirie primită', icon: 'building', color: '#f97316', type: 'income' },
  { name: 'Bonus', icon: 'star', color: '#eab308', type: 'income' },
  { name: 'Cadouri primite', icon: 'gift', color: '#ec4899', type: 'income' },
  { name: 'Alte venituri', icon: 'plus-circle', color: '#84cc16', type: 'income' },
]

export async function seedDefaultCategories(userId: string): Promise<void> {
  const toInsert = DEFAULT_CATEGORIES.map((c) => ({
    user_id: userId,
    name: c.name,
    icon: c.icon,
    color: c.color,
    type: c.type,
    is_default: true,
  }))

  const { error } = await supabase.from('categories').insert(toInsert)
  if (error) {
    console.error('Error seeding categories:', error)
  }
}

export function categoryTypeLabel(type: Category['type']): string {
  switch (type) {
    case 'expense': return 'Cheltuieli'
    case 'income': return 'Venituri'
    case 'both': return 'Ambele'
  }
}
