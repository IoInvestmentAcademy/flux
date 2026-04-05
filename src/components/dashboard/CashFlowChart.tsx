import React, { useMemo, useEffect, useState } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts'
import { Card, CardHeader, CardTitle, Skeleton } from '../ui'
import { getLast6MonthRanges, getMonthRange } from '../../lib/utils'
import { usePreferences } from '../../lib/PreferencesContext'
import { supabase } from '../../lib/supabase'

interface ChartDataPoint {
  label: string
  venituri: number
  cheltuieli: number
}

interface CashFlowChartProps {
  userId: string
}

export const CashFlowChart: React.FC<CashFlowChartProps> = ({ userId }) => {
  const { t, formatMoney } = usePreferences()
  const [data, setData] = useState<ChartDataPoint[]>([])
  const [loading, setLoading] = useState(true)

  const months = useMemo(() => getLast6MonthRanges(), [])

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

            return { label, venituri, cheltuieli }
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
        <CardHeader>
          <CardTitle>{t.cashFlow6months}</CardTitle>
        </CardHeader>
        <Skeleton className="h-48" />
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.cashFlow6months}</CardTitle>
      </CardHeader>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="gradVenituri" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradCheltuieli" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
            </linearGradient>
          </defs>
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
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
            }}
          />
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }}
          />
          <Area
            type="monotone"
            dataKey="venituri"
            name={t.income}
            stroke="#22c55e"
            strokeWidth={2}
            fill="url(#gradVenituri)"
            dot={false}
            activeDot={{ r: 4 }}
          />
          <Area
            type="monotone"
            dataKey="cheltuieli"
            name={t.expenses}
            stroke="#ef4444"
            strokeWidth={2}
            fill="url(#gradCheltuieli)"
            dot={false}
            activeDot={{ r: 4 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  )
}

export default CashFlowChart
