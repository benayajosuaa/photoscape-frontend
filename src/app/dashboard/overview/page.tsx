'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { MdCalendarToday, MdDoneAll, MdPendingActions, MdWarning } from 'react-icons/md'
import { BookingTable } from '@/components/dashboard/BookingTable'
import { KPICard } from '@/components/dashboard/KPICard'
import { SimpleBarChart } from '@/components/dashboard/SimpleBarChart'
import { StudioTimeline } from '@/components/dashboard/StudioTimeline'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { useAuth } from '@/hooks/useAuth'
import { buildStudioTimelineFromBookings, normalizeBookingList } from '@/lib/booking-adapter'
import { apiFetch, toQuery } from '@/lib/api'
import { formatRupiah } from '@/lib/utils'
import type { Booking, DashboardSummary, ScheduleSlot, Transaction } from '@/types'

interface SummaryResponse {
  success: boolean
  data?: DashboardSummary
}

function toUtcDateKey(iso?: string) {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`
}

export default function DashboardOverviewPage() {
  const { user } = useAuth({ requireAuth: true })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [summary, setSummary] = useState<DashboardSummary>({
    totalBookings: 0,
    pendingBookings: 0,
    activeWalkins: 0,
    needConfirmation: 0,
    bookingTrend: [],
  })
  const [bookings, setBookings] = useState<Booking[]>([])
  const [schedules, setSchedules] = useState<ScheduleSlot[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])

  useEffect(() => {
    if (!user) return

    const loadData = async () => {
      setLoading(true)
      setError(null)
      try {
        const today = new Date().toISOString().slice(0, 10)
        const adminBookingsRes = await apiFetch<{ data?: { bookings?: unknown[] } | unknown[] }>(
          `/api/admin/bookings?${toQuery({ page: 1, limit: 100 })}`,
        )
        const rawList = Array.isArray(adminBookingsRes.data)
          ? adminBookingsRes.data
          : Array.isArray((adminBookingsRes.data as { bookings?: unknown[] })?.bookings)
            ? (adminBookingsRes.data as { bookings?: unknown[] }).bookings || []
            : []
        const normalizedBookings = normalizeBookingList(rawList).sort((a, b) => {
          const aTime = new Date(a.createdAt || a.startTime).getTime()
          const bTime = new Date(b.createdAt || b.startTime).getTime()
          return bTime - aTime
        })
        const todayBookings = normalizedBookings.filter((item) => toUtcDateKey(item.startTime) === today)

        const transactionsPromise =
          user.role === 'owner'
            ? apiFetch<{ data: Transaction[] }>('/api/transactions?limit=10&page=1').catch(() =>
                Promise.resolve({ data: [] as Transaction[] }),
              )
            : Promise.resolve({ data: [] as Transaction[] })

        const summaryRes =
          user.role === 'staff'
            ? ({
                success: true,
                data: {
                  totalBookings: normalizedBookings.length,
                  pendingBookings: normalizedBookings.filter((item) => item.status === 'pending').length,
                  activeWalkins: normalizedBookings.filter((item) => item.isWalkIn).length,
                  needConfirmation: normalizedBookings.filter((item) => item.status === 'pending').length,
                  bookingTrend: [],
                },
              } as SummaryResponse)
            : await apiFetch<SummaryResponse>('/api/admin/dashboard/summary')

        const [transactionsRes] = await Promise.all([transactionsPromise])

        setSummary(
          summaryRes.data || {
            totalBookings: 0,
            pendingBookings: 0,
            activeWalkins: 0,
            needConfirmation: 0,
            bookingTrend: [],
          },
        )
        setBookings(normalizedBookings)
        setSchedules(buildStudioTimelineFromBookings(todayBookings, today))
        setTransactions(transactionsRes.data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Gagal memuat data dashboard')
      } finally {
        setLoading(false)
      }
    }

    void loadData()
  }, [user])

  const kpis = useMemo(() => {
    if (!user) return []

    if (user.role === 'staff') {
      return [
        { title: 'Total Booking Hari Ini', value: summary.totalBookings, icon: <MdCalendarToday /> },
        { title: 'Booking Pending', value: summary.pendingBookings, icon: <MdPendingActions /> },
        { title: 'Walk-in Aktif', value: summary.activeWalkins, icon: <MdDoneAll /> },
        { title: 'Perlu Konfirmasi', value: summary.needConfirmation, icon: <MdWarning /> },
      ]
    }

    const monthlyRevenue = summary.monthlyRevenue || 0
    const lastMonthRevenue = summary.lastMonthRevenue || 0
    const delta = lastMonthRevenue ? ((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 0

    return [
      { title: 'Total Booking Bulan Ini', value: summary.monthlyBookings || summary.totalBookings },
      { title: 'Revenue Bulan Ini', value: formatRupiah(monthlyRevenue) },
      { title: 'Utilization Rate', value: `${summary.utilizationRate || 0}%` },
      { title: 'Cancellation Rate', value: `${summary.cancellationRate || 0}%` },
      ...(user.role === 'owner'
        ? [{ title: 'Delta vs Bulan Lalu', value: `${delta.toFixed(1)}%`, trend: { value: delta, isUp: delta >= 0 } }]
        : []),
    ]
  }, [summary, user])

  if (!user) return null

  return (
    <div className="space-y-5">
      {error ? <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}

      <section className={`grid gap-4 ${user.role === 'owner' ? 'lg:grid-cols-5' : 'lg:grid-cols-4'}`}>
        {kpis.map((item) => (
          <KPICard key={item.title} {...item} />
        ))}
      </section>

      

      {user.role !== 'staff' ? (
        <SimpleBarChart data={summary.bookingTrend || []} title="Trend Booking 7 Hari Terakhir" />
      ) : null}

      {user.role === 'staff' ? <StudioTimeline schedules={schedules} /> : null}

      <Card title={user.role === 'staff' ? '10 Booking Terbaru' : 'Booking Terbaru'}>
        <BookingTable data={bookings.slice(0, user.role === 'staff' ? 10 : 5)} loading={loading} readonly={user.role !== 'staff'} />
      </Card>

      {user.role === 'owner' ? (
        <Card title="Transaksi Terbaru">
          <div className="space-y-2">
            {transactions.length === 0 ? <p className="text-sm text-gray-500">Belum ada transaksi terbaru.</p> : null}
            {transactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2 text-sm">
                <span>{tx.transactionCode}</span>
                <span className="font-medium text-gray-900">{formatRupiah(tx.amount)}</span>
              </div>
            ))}
          </div>
        </Card>
      ) : null}
    </div>
  )
}
