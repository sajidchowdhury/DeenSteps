'use client'

import * as React from 'react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts'
import { format, parseISO } from 'date-fns'

export type TrendByChild = {
  childId: string
  childName: string
  avatarColor: string
  days: { date: string; points: number }[]
}

const COLOR_BY_AVATAR: Record<string, string> = {
  emerald: 'oklch(0.55 0.13 160)',
  amber: 'oklch(0.75 0.14 85)',
  sage: 'oklch(0.7 0.07 140)',
  rose: 'oklch(0.65 0.18 15)',
  violet: 'oklch(0.55 0.15 300)',
  sky: 'oklch(0.6 0.1 220)',
}

export function WeeklyTrendChart({ data }: { data: TrendByChild[] }) {
  if (data.length === 0) {
    return <p className="text-sm text-muted-foreground">এখনো কোনো ডেটা নেই।</p>
  }

  // Build chart data: [{ date: '2024-01-01', 'জাইদ': 3, 'মরিয়ম': 2 }, ...]
  const chartData = data[0].days.map((day, i) => {
    const row: Record<string, string | number> = { date: day.date }
    for (const child of data) {
      row[child.childName] = child.days[i].points
    }
    return row
  })

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.9 0.01 140)" vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={(d) => format(parseISO(d as string), 'EEE')}
          tick={{ fontSize: 11, fill: 'oklch(0.5 0.02 160)' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: 'oklch(0.5 0.02 160)' }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />
        <Tooltip
          contentStyle={{
            borderRadius: '12px',
            border: '1px solid oklch(0.9 0.01 140)',
            fontSize: '12px',
          }}
          labelFormatter={(d) => format(parseISO(d as string), 'EEEE, MMM d')}
        />
        {data.map((child) => (
          <Line
            key={child.childId}
            type="monotone"
            dataKey={child.childName}
            stroke={COLOR_BY_AVATAR[child.avatarColor] || COLOR_BY_AVATAR.emerald}
            strokeWidth={2.5}
            dot={{ r: 3, fill: COLOR_BY_AVATAR[child.avatarColor] || COLOR_BY_AVATAR.emerald }}
            activeDot={{ r: 5 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}

const CATEGORY_COLORS: Record<string, string> = {
  'Islamic Practices': 'oklch(0.55 0.13 160)',
  'Character & Manners': 'oklch(0.75 0.14 85)',
  'Personal Responsibility': 'oklch(0.7 0.07 140)',
  'Learning & Development': 'oklch(0.6 0.1 220)',
}

const CATEGORY_LABELS: Record<string, string> = {
  'Islamic Practices': 'ইসলামি অভ্যাস',
  'Character & Manners': 'চরিত্র ও আদব',
  'Personal Responsibility': 'ব্যক্তিগত দায়িত্ব',
  'Learning & Development': 'শেখা ও বিকাশ',
}

export function CategoryDonutChart({ counts }: { counts: Record<string, number> }) {
  const entries = Object.entries(counts).filter(([, v]) => v > 0)
  if (entries.length === 0) {
    return <p className="text-sm text-muted-foreground">এখনো কোনো ডেটা নেই।</p>
  }

  const data = entries.map(([key, value]) => ({
    name: CATEGORY_LABELS[key] || key,
    value,
    color: CATEGORY_COLORS[key] || 'oklch(0.6 0.1 200)',
  }))

  const total = data.reduce((sum, d) => sum + d.value, 0)

  return (
    <div className="flex flex-col items-center gap-3 sm:flex-row">
      <div className="relative h-[160px] w-[160px] flex-shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={48}
              outerRadius={72}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                borderRadius: '12px',
                border: '1px solid oklch(0.9 0.01 140)',
                fontSize: '12px',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-2xl font-extrabold text-foreground">{total}</span>
          <span className="text-[10px] text-muted-foreground">মোট কাজ</span>
        </div>
      </div>
      <div className="flex-1 space-y-1.5">
        {data.map((d) => (
          <div key={d.name} className="flex items-center gap-2 text-xs">
            <span className="h-2.5 w-2.5 flex-shrink-0 rounded-full" style={{ backgroundColor: d.color }} />
            <span className="flex-1 text-foreground">{d.name}</span>
            <span className="font-semibold text-foreground">{d.value}</span>
            <span className="text-muted-foreground">({Math.round((d.value / total) * 100)}%)</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function ChildProgressBars({ childStats }: {
  childStats: { child: { id: string; displayName: string; avatarColor: string }; todayCompletion: number; balance: number; weekPoints: number }[]
}) {
  if (childStats.length === 0) {
    return <p className="text-sm text-muted-foreground">এখনো কোনো সন্তান নেই।</p>
  }

  const data = childStats.map((c) => ({
    name: c.child.displayName,
    completion: c.todayCompletion,
    color: COLOR_BY_AVATAR[c.child.avatarColor] || COLOR_BY_AVATAR.emerald,
  }))

  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.9 0.01 140)" horizontal={false} />
        <XAxis
          type="number"
          domain={[0, 100]}
          tick={{ fontSize: 11, fill: 'oklch(0.5 0.02 160)' }}
          axisLine={false}
          tickLine={false}
          unit="%"
        />
        <YAxis
          type="category"
          dataKey="name"
          tick={{ fontSize: 12, fill: 'oklch(0.3 0.02 160)', fontWeight: 600 }}
          axisLine={false}
          tickLine={false}
          width={70}
        />
        <Tooltip
          contentStyle={{
            borderRadius: '12px',
            border: '1px solid oklch(0.9 0.01 140)',
            fontSize: '12px',
          }}
          formatter={(v) => [`${v}%`, 'আজকের সম্পন্ন']}
        />
        <Bar dataKey="completion" radius={[0, 6, 6, 0]} barSize={28}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
