import React, { useMemo, useEffect, useState } from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Card, CardHeader, CardTitle, Skeleton, EmptyState } from '../ui'
import { getMonthRange } from '../../lib/utils'
import { usePreferences } from '../../lib/PreferencesContext'
import { supabase } from '../../lib/supabase'
import type { Category } from '../../types'

interface CategoryDonutProps {
  userId: string
  categories: Category[]
}

interface DonutData {
  name: string
  value: number
  color: string
}

export const CategoryDonut: React.FC<CategoryDonutProps> = ({ userId, categories }) => {
  const { t, formatMoney } = usePreferences()
  const [data, setData] = useState<DonutData[]>([])
  const [loading, setLoading] = useState(true)

  const catMap = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories])

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      const now = new Date()
      const { from, to } = getMonthRange(now.getFullYear(), now.getMonth() + 1)

      try {
        const { data: txs } = await supabase
          .from('transactions')
          .select('category_id, amount')
          .eq('user_id', userId)
          .eq('type', 'expense')
          .gte('date', from)
          .lte('date', to)

        const totals = new Map<string, number>()
        ;(txs ?? []).forEach((t: { category_id: string | null; amount: number }) => {
          const key = t.category_id ?? 'unknown'
          totals.set(key, (totals.get(key) ?? 0) + t.amount)
        })

        const sorted = Array.from(totals.entries())
          .map(([catId, value]) => {
            const cat = catMap.get(catId)
            return { name: cat?.name ?? t.noCategory, value, color: cat?.color ?? '#94a3b8' }
          })
          .sort((a, b) => b.value - a.value)
          .slice(0, 6)

        setData(sorted)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [userId, catMap])

  if (loading) {
    return (
      <Card>
        <CardHeader><CardTitle>{t.categoryExpenses}</CardTitle></CardHeader>
        <Skeleton className="h-48 w-48 rounded-full mx-auto" />
      </Card>
    )
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader><CardTitle>{t.categoryExpenses}</CardTitle></CardHeader>
        <EmptyState title={t.noExpenses} description={t.noExpensesThisMonth} />
      </Card>
    )
  }

  const total = data.reduce((sum, d) => sum + d.value, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.categoryExpenses}</CardTitle>
      </CardHeader>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={3}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
            ))}
          </Pie>
          <Tooltip
            formatter={((value: unknown) => [formatMoney(Number(value ?? 0)), 'Total']) as never}
            contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: '12px' }}
          />
        </PieChart>
      </ResponsiveContainer>
      {/* Custom legend with percentages */}
      <div className="mt-2 space-y-1.5">
        {data.map((entry) => {
          const pct = total > 0 ? Math.round((entry.value / total) * 100) : 0
          return (
            <div key={entry.name} className="flex items-center gap-2">
              <span className="shrink-0 w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="flex-1 text-xs text-gray-600 dark:text-gray-400 truncate">{entry.name}</span>
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 tabular-nums">{pct}%</span>
            </div>
          )
        })}
      </div>
    </Card>
  )
}

export default CategoryDonut
