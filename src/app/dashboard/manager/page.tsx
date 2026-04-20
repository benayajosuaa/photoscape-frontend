'use client'

import { useEffect, useMemo, useState } from 'react'
import { KPICard } from '@/components/dashboard/KPICard'
import { ManagerSectionNav } from '@/components/dashboard/ManagerSectionNav'
import { SimpleBarChart } from '@/components/dashboard/SimpleBarChart'
import { Card } from '@/components/ui/Card'
import { useAuth } from '@/hooks/useAuth'
import { apiFetch } from '@/lib/api'
import { formatRupiah } from '@/lib/utils'

type DailySummary = {
  date: string
  totalBookings: number
  pending: number
  confirmed: number
  completed: number
  cancelled: number
  totalRevenuePaid: number
  totalTransactionsDaily: number
  totalPaidTransactionsDaily: number
  paidAmountDaily: number
  totalSchedules: number
  utilizedSchedules: number
  studioUtilizationRate: number
}

type PerformanceStats = {
  summary: {
    totalBookings: number
    cancelledCount: number
    cancellationRate: number
    totalSchedules: number
    utilizedSchedules: number
    studioUtilizationRate: number
  }
  bookingPerDay: Array<{ date: string; total: number }>
  topStudios: Array<{ studioId: string; studioName: string; total: number }>
  topPackages: Array<{ packageId: string; packageName: string; total: number }>
}

export default function ManagerDashboardPage() {
  const { user } = useAuth({ requireAuth: true, allowedRoles: ['manager'], unauthorizedRedirectTo: '/dashboard/overview' })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [summary, setSummary] = useState<DailySummary | null>(null)
  const [performance, setPerformance] = useState<PerformanceStats | null>(null)

  useEffect(() => {
    if (!user) return

    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const [summaryRes, performanceRes] = await Promise.all([
          apiFetch<{ data: DailySummary }>('/api/manager/summary/daily'),
          apiFetch<{ data: PerformanceStats }>('/api/manager/performance?period=monthly'),
        ])

        setSummary(summaryRes.data)
        setPerformance(performanceRes.data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Gagal memuat dashboard manager')
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [user])

  const chartData = useMemo(() => {
    return (performance?.bookingPerDay || []).slice(-7).map((item) => ({
      label: item.date.slice(5),
      value: item.total,
    }))
  }, [performance?.bookingPerDay])

  if (!user) return null

  return (
    <div className="space-y-4">
      <ManagerSectionNav />

      {error ? <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
      {loading ? <p className="text-sm text-gray-500">Memuat dashboard manager...</p> : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <KPICard title="Booking Hari Ini" value={summary?.totalBookings || 0} />
        <KPICard title="Transaksi Hari Ini" value={summary?.totalTransactionsDaily || 0} subtitle={`${summary?.totalPaidTransactionsDaily || 0} transaksi lunas`} />
        <KPICard title="Utilisasi Studio" value={`${(summary?.studioUtilizationRate || 0).toFixed(2)}%`} subtitle={`${summary?.utilizedSchedules || 0}/${summary?.totalSchedules || 0} slot terpakai`} />
        <KPICard title="Pembatalan Hari Ini" value={summary?.cancelled || 0} subtitle={`${summary?.pending || 0} pending • ${summary?.completed || 0} selesai`} />
        <KPICard title="Revenue Hari Ini" value={formatRupiah(summary?.paidAmountDaily || 0)} />
      </section>

      <SimpleBarChart data={chartData} title="Booking per Hari (7 Hari Terakhir)" />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card
          title="Statistik Operasional"
          subtitle={`30 hari: Utilisasi ${((performance?.summary.studioUtilizationRate || 0)).toFixed(2)}% • Cancellation ${((performance?.summary.cancellationRate || 0)).toFixed(2)}%`}
        >
          <div className="space-y-2 text-sm text-gray-700">
            <p>Total booking: {performance?.summary.totalBookings || 0}</p>
            <p>Jumlah pembatalan: {performance?.summary.cancelledCount || 0}</p>
            <p>
              Slot studio terpakai: {performance?.summary.utilizedSchedules || 0} / {performance?.summary.totalSchedules || 0}
            </p>
            <p>Total revenue paid hari ini: {formatRupiah(summary?.totalRevenuePaid || 0)}</p>
          </div>
        </Card>

        <Card title="Studio Paling Sering Dipakai" subtitle="Berdasarkan periode evaluasi saat ini">
          <div className="space-y-2">
            {(performance?.topStudios || []).length === 0 ? <p className="text-sm text-gray-500">Belum ada data studio.</p> : null}
            {(performance?.topStudios || []).map((item) => (
              <div key={item.studioId} className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2 text-sm">
                <span>{item.studioName}</span>
                <span className="font-semibold text-gray-900">{item.total} booking</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
