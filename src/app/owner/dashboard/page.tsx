'use client'

import { useEffect, useMemo, useState } from 'react'
import { KPICard } from '@/components/dashboard/KPICard'
import { SimpleBarChart } from '@/components/dashboard/SimpleBarChart'
import { Card } from '@/components/ui/Card'
import { useAuth } from '@/hooks/useAuth'
import { apiFetch } from '@/lib/api'
import { formatDateTimeServerClock, formatRupiah } from '@/lib/utils'

type DashboardData = {
  stats: {
    bookingToday: number
    revenueToday: number
    bookingPending: number
    bookingCancelled: number
    activeStudios: number
    newCustomersThisMonth: number
  }
  charts: {
    revenueLast7Days: Array<{ label: string; value: number }>
    monthlyBookings: Array<{ label: string; value: number }>
    busiestStudios: Array<{ label: string; value: number }>
  }
  recentActivity: Array<{ id: string; action: string; adminName: string; createdAt: string }>
}

export default function OwnerDashboardPage() {
  const { user } = useAuth({ requireAuth: true, allowedRoles: ['owner'], unauthorizedRedirectTo: '/dashboard/overview' })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<DashboardData | null>(null)

  useEffect(() => {
    if (!user) return

    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await apiFetch<{ data: DashboardData }>('/api/reports/dashboard?period=monthly')
        setData(res.data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Gagal memuat owner dashboard')
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [user])

  const revenueChart = useMemo(() => (data?.charts.revenueLast7Days || []).map((item) => ({ label: item.label.slice(5), value: item.value })), [data])
  const bookingChart = useMemo(() => (data?.charts.monthlyBookings || []).slice(-6), [data])
  const studioChart = useMemo(() => data?.charts.busiestStudios || [], [data])

  if (!user) return null

  return (
    <div className="space-y-4">
      {error ? <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
      {loading ? <p className="text-sm text-gray-500">Memuat statistik owner...</p> : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        <KPICard title="Booking Hari Ini" value={data?.stats.bookingToday || 0} />
        <KPICard title="Pendapatan Hari Ini" value={formatRupiah(data?.stats.revenueToday || 0)} />
        <KPICard title="Booking Pending" value={data?.stats.bookingPending || 0} />
        <KPICard title="Cancel Booking" value={data?.stats.bookingCancelled || 0} />
        <KPICard title="Studio Aktif" value={data?.stats.activeStudios || 0} />
        <KPICard title="Customer Baru Bulan Ini" value={data?.stats.newCustomersThisMonth || 0} />
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <SimpleBarChart data={revenueChart} title="Revenue 7 Hari Terakhir" />
        <SimpleBarChart data={bookingChart} title="Booking Bulanan" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <SimpleBarChart data={studioChart} title="Studio Paling Ramai" />

        <Card title="Recent Activity" subtitle="Aktivitas terbaru operasional panel">
          <div className="space-y-2">
            {(data?.recentActivity || []).length === 0 ? <p className="text-sm text-gray-500">Belum ada activity log.</p> : null}
            {(data?.recentActivity || []).map((item) => (
              <div key={item.id} className="rounded-lg border border-gray-200 px-3 py-2 text-sm">
                <p className="font-medium text-gray-900">{item.action}</p>
                <p className="text-gray-500">
                  {item.adminName} • {formatDateTimeServerClock(item.createdAt)}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
