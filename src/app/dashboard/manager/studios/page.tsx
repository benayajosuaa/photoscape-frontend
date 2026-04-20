'use client'

import { useEffect, useMemo, useState } from 'react'
import { ManagerSectionNav } from '@/components/dashboard/ManagerSectionNav'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Table } from '@/components/ui/Table'
import { useAuth } from '@/hooks/useAuth'
import { apiFetch } from '@/lib/api'
import { serviceTypeLabel, toServiceTypeSelectOptions, toStudioSelectOptions, type ManagerFilterOptions } from '@/lib/manager'
import { formatRupiah } from '@/lib/utils'

type StudioUsageRow = {
  studioId: string
  studioName: string
  serviceType: string
  locationName: string
  totalSchedules: number
  utilizedSchedules: number
  utilizationRate: number
  totalSessions: number
  totalHours: number
  totalRevenue: number
  totalCancelled: number
}

type StudioUsageTrend = {
  periodLabel: string
  totalSchedules: number
  utilizedSchedules: number
  utilizationRate: number
  cancelledBookings: number
}

type StudioUsageResponse = {
  period: 'daily' | 'weekly' | 'monthly'
  startDate: string
  endDate: string
  summary: {
    totalStudios: number
    totalSchedules: number
    utilizedSchedules: number
    utilizationRate: number
    cancelledBookings: number
  }
  studios: StudioUsageRow[]
  trend: StudioUsageTrend[]
}

function getPresetRange(preset: string) {
  const now = new Date()
  const end = now.toISOString().slice(0, 10)

  if (preset === 'daily') {
    return { startDate: end, endDate: end }
  }

  if (preset === 'weekly') {
    const day = now.getUTCDay()
    const diff = day === 0 ? -6 : 1 - day
    const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + diff))
    return { startDate: start.toISOString().slice(0, 10), endDate: end }
  }

  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
  return { startDate: start.toISOString().slice(0, 10), endDate: end }
}

export default function ManagerStudioUsagePage() {
  const { user } = useAuth({ requireAuth: true, allowedRoles: ['manager'], unauthorizedRedirectTo: '/dashboard/overview' })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [rows, setRows] = useState<StudioUsageRow[]>([])
  const [trendRows, setTrendRows] = useState<StudioUsageTrend[]>([])
  const [summary, setSummary] = useState<StudioUsageResponse['summary'] | null>(null)
  const [filters, setFilters] = useState<ManagerFilterOptions | null>(null)
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'custom'>('daily')
  const [startDate, setStartDate] = useState(getPresetRange('daily').startDate)
  const [endDate, setEndDate] = useState(getPresetRange('daily').endDate)
  const [serviceType, setServiceType] = useState('')
  const [studioId, setStudioId] = useState('')
  const [locationId, setLocationId] = useState('')

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const query = new URLSearchParams({
        ...(period !== 'custom' ? { period } : {}),
        startDate,
        endDate,
        ...(serviceType ? { serviceType } : {}),
        ...(studioId ? { studioId } : {}),
        ...(locationId ? { locationId } : {}),
      })
      const res = await apiFetch<{ data: StudioUsageResponse }>(`/api/manager/studio-usage?${query.toString()}`)
      setRows(res.data.studios || [])
      setTrendRows(res.data.trend || [])
      setSummary(res.data.summary)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat laporan studio')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!user) return

    const loadInitial = async () => {
      try {
        const optionRes = await apiFetch<{ data: ManagerFilterOptions }>('/api/manager/filters/options')
        setFilters(optionRes.data)
      } catch {
        setFilters(null)
      }
      await load()
    }

    void loadInitial()
  }, [user])

  const totals = useMemo(() => {
    return rows.reduce(
      (acc, row) => {
        acc.sessions += row.totalSessions
        acc.hours += row.totalHours
        acc.revenue += row.totalRevenue
        return acc
      },
      { sessions: 0, hours: 0, revenue: 0 },
    )
  }, [rows])

  if (!user) return null

  return (
    <div className="space-y-4">
      <ManagerSectionNav />

      {error ? <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}

      <Card title="Laporan Penggunaan Studio" subtitle="Read-only monitoring berdasarkan periode harian/mingguan/bulanan">
        <div className="grid gap-2 md:grid-cols-7">
          <Select
            value={period}
            onChange={(event) => {
              const value = event.target.value as 'daily' | 'weekly' | 'monthly' | 'custom'
              setPeriod(value)
              if (value !== 'custom') {
                const next = getPresetRange(value)
                setStartDate(next.startDate)
                setEndDate(next.endDate)
              }
            }}
            options={[
              { label: 'Harian', value: 'daily' },
              { label: 'Mingguan', value: 'weekly' },
              { label: 'Bulanan', value: 'monthly' },
              { label: 'Custom', value: 'custom' },
            ]}
          />
          <Input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
          <Input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} />
          <Select value={serviceType} onChange={(event) => setServiceType(event.target.value)} options={toServiceTypeSelectOptions()} />
          <Select value={studioId} onChange={(event) => setStudioId(event.target.value)} options={toStudioSelectOptions(filters?.studios || [])} />
          <Select
            value={locationId}
            onChange={(event) => setLocationId(event.target.value)}
            options={[{ label: 'Semua Lokasi', value: '' }].concat(
              (filters?.locations || []).map((location) => ({
                label: location.name,
                value: location.id,
              })),
            )}
          />
          <Button variant="secondary" onClick={() => void load()}>
            Terapkan
          </Button>
        </div>
      </Card>

      <Card
        title="Ringkasan"
        subtitle={`Sesi: ${totals.sessions} • Jam: ${totals.hours.toFixed(2)} • Revenue: ${formatRupiah(totals.revenue)} • Utilisasi: ${(summary?.utilizationRate || 0).toFixed(2)}% • Pembatalan: ${summary?.cancelledBookings || 0}`}
      >
        <Table
          loading={loading}
          data={rows as unknown as Record<string, unknown>[]}
          columns={[
            { key: 'studioName', label: 'Nama Studio' },
            { key: 'locationName', label: 'Lokasi' },
            {
              key: 'serviceType',
              label: 'Jenis Layanan',
              render: (item) => serviceTypeLabel((item as unknown as StudioUsageRow).serviceType),
            },
            { key: 'totalSessions', label: 'Jumlah Sesi' },
            {
              key: 'totalHours',
              label: 'Total Jam',
              render: (item) => `${(item as unknown as StudioUsageRow).totalHours.toFixed(2)} jam`,
            },
            {
              key: 'utilizationRate',
              label: 'Utilisasi',
              render: (item) => `${(item as unknown as StudioUsageRow).utilizationRate.toFixed(2)}%`,
            },
            {
              key: 'totalRevenue',
              label: 'Revenue',
              render: (item) => formatRupiah((item as unknown as StudioUsageRow).totalRevenue),
            },
          ]}
          emptyMessage="Belum ada data penggunaan studio"
        />
      </Card>

      <Card title="Tren Penggunaan" subtitle="Digunakan sebagai bahan evaluasi operasional">
        <Table
          loading={loading}
          data={trendRows as unknown as Record<string, unknown>[]}
          columns={[
            { key: 'periodLabel', label: 'Periode' },
            { key: 'totalSchedules', label: 'Total Slot' },
            { key: 'utilizedSchedules', label: 'Slot Terpakai' },
            {
              key: 'utilizationRate',
              label: 'Tingkat Utilisasi',
              render: (item) => `${(item as unknown as StudioUsageTrend).utilizationRate.toFixed(2)}%`,
            },
            { key: 'cancelledBookings', label: 'Pembatalan' },
          ]}
          emptyMessage="Belum ada tren periode"
        />
      </Card>
    </div>
  )
}
