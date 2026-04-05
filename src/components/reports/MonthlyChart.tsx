import React, { useMemo, useEffect, useState } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts'
import { Card, CardHeader, CardTitle, Skeleton } from '../ui'
import { getLast12MonthRanges, getMonthRange } from '../../lib/utils'
import { usePreferences } from '../../lib/PreferencesContext'
import { supabase } from '../../lib/supabase'

interface MonthlyChartProps {
  userId: string
}

interface MonthlyData {
  label: string
  venituri: number
  cheltuieli: number
  economii: number
}

export const MonthlyChart: React.FC<MonthlyChartProps> = ({ userId }) => {
  const { t, formatMoney } = usePreferences()
  const [data, setData] = useState<MonthlyData[]>([])
  const [loading, setLoading] = useState(true)

  const months = useMemo(() => getLast12MonthRanges(), [])

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const results = await Promise.all(
          months.map(async ({ year, month, label }) => {
            const { from, to } = getMonthRange(year, month)
            const { data: txs } = await supabase
              .from('transactions')
              .select('type, amount')
              .eq('user_id', userId)
              .gte('date', from)
              .lte('date', to)

            const venituri = (txs ?? [])
              .filter((t) => t.type === 'income')
              .reduce((s: number, t: { amount: number }) => s + t.amount, 0)
            const cheltuieli = (txs ?? [])
              .filter((t) => t.type === 'expense')
              .reduce((s: number, t: { amount: number }) => s + t.amount, 0)

            return { label, venituri, cheltuieli, economii: venituri - cheltuieli }
          })
        )
        setData(results)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [userId, months])

  if (loading) {
    return (
      <Card>
        <CardHeader><CardTitle>{t.monthlyEvolution}</CardTitle></CardHeader>
        <Skeleton className="h-56" />
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.monthlyEvolution}</CardTitle>
      </CardHeader>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.5} />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
          <YAxis
            tick={{ fontSize: 11, fill: '#9ca3af' }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
            width={35}
          />
          <Tooltip
            formatter={((value: unknown, name: string) => [formatMoney(Number(value ?? 0)), name]) as never}
            contentStyle={{
              borderRadius: '12px',
              border: '1px solid #e5e7eb',
              fontSize: '12px',
            }}
          />
          <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
          <Line
            type="monotone"
            dataKey="venituri"
            name={t.income}
            stroke="#22c55e"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="cheltuieli"
            name={t.expenses}
            stroke="#ef4444"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="economii"
            name={t.savings}
            stroke="#6366f1"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  )
}

export default MonthlyChart
