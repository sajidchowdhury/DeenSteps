'use client'

import * as React from 'react'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'

// DeenSteps chart palette (matches globals.css)
export const CHART_COLORS = {
  emerald: 'oklch(0.55 0.13 160)',
  amber: 'oklch(0.75 0.14 85)',
  sage: 'oklch(0.7 0.07 140)',
  gold: 'oklch(0.65 0.18 40)',
  plum: 'oklch(0.55 0.15 300)',
}

const TOOLTIP_STYLE = {
  background: 'var(--popover)',
  border: '1px solid var(--border)',
  borderRadius: 8,
  fontSize: 12,
  color: 'var(--popover-foreground)',
} as const

type DailyDatum = { name: string; completion: number; approved: number; total: number }

export function DailyCompletionChart({ data }: { data: DailyDatum[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
        <YAxis
          domain={[0, 100]}
          tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `${v}%`}
        />
        <Tooltip
          contentStyle={TOOLTIP_STYLE}
          cursor={{ fill: 'var(--accent)', opacity: 0.3 }}
          formatter={(v: number, _name: string, item: { payload: DailyDatum }) => [
            `${v}% (${item.payload.approved}/${item.payload.total})`,
            'Completion',
          ]}
        />
        <Bar dataKey="completion" radius={[6, 6, 0, 0]} maxBarSize={48}>
          {data.map((_, i) => (
            <Cell key={i} fill={CHART_COLORS.emerald} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

type WeeklyDatum = { day: string; points: number }

export function WeeklyPointsChart({ data }: { data: WeeklyDatum[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis dataKey="day" tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
        <YAxis
          tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />
        <Tooltip
          contentStyle={TOOLTIP_STYLE}
          formatter={(v: number) => [`${v} pts`, 'Earned']}
        />
        <Line
          type="monotone"
          dataKey="points"
          stroke={CHART_COLORS.amber}
          strokeWidth={2.5}
          dot={{ r: 4, fill: CHART_COLORS.amber, stroke: 'var(--popover)', strokeWidth: 2 }}
          activeDot={{ r: 6, fill: CHART_COLORS.gold }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

type MonthlyDatum = { category: string; points: number; color: string }

export function MonthlyCategoryChart({ data }: { data: MonthlyDatum[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis dataKey="category" tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} interval={0} />
        <YAxis
          tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />
        <Tooltip
          contentStyle={TOOLTIP_STYLE}
          cursor={{ fill: 'var(--accent)', opacity: 0.3 }}
          formatter={(v: number) => [`${v} pts`, 'Earned']}
        />
        <Bar dataKey="points" radius={[6, 6, 0, 0]} maxBarSize={64}>
          {data.map((d, i) => (
            <Cell key={i} fill={d.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

type PieDatum = { name: string; value: number; color: string }

export function CategoryDistributionPie({ data }: { data: PieDatum[] }) {
  if (!data.some((d) => d.value > 0)) {
    return (
      <div className="flex h-[260px] items-center justify-center text-sm text-muted-foreground">
        No points earned yet this month.
      </div>
    )
  }
  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={50}
          outerRadius={90}
          paddingAngle={2}
        >
          {data.map((d, i) => (
            <Cell key={i} fill={d.color} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={TOOLTIP_STYLE}
          formatter={(v: number, _n: string, item: { payload: PieDatum }) => [`${v} pts`, item.payload.name]}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
