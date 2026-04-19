import type { ReactNode } from 'react'
import { Card } from '@/components/ui/Card'

interface KPICardProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: ReactNode
  trend?: { value: number; isUp: boolean }
}

export function KPICard({ title, value, subtitle, icon, trend }: KPICardProps) {
  return (
    <Card className="h-full">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{title}</p>
          <p className="mt-2 text-2xl font-semibold text-gray-900">{value}</p>
          {subtitle ? <p className="mt-1 text-xs text-gray-500">{subtitle}</p> : null}
          {trend ? (
            <p className={`mt-2 text-xs font-medium ${trend.isUp ? 'text-green-700' : 'text-red-700'}`}>
              {trend.isUp ? '▲' : '▼'} {Math.abs(trend.value)}%
            </p>
          ) : null}
        </div>
        {icon ? <div className="rounded-lg bg-gray-100 p-2 text-lg text-gray-700">{icon}</div> : null}
      </div>
    </Card>
  )
}
