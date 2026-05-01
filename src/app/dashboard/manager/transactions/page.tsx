'use client'

import { useEffect, useMemo, useState } from 'react'
import { ManagerSectionNav } from '@/components/dashboard/ManagerSectionNav'
import { SimpleBarChart } from '@/components/dashboard/SimpleBarChart'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Table } from '@/components/ui/Table'
import { useAuth } from '@/hooks/useAuth'
import { apiFetch } from '@/lib/api'
import {
  paymentMethodLabel,
  serviceTypeLabel,
  toServiceTypeSelectOptions,
  toStudioSelectOptions,
  type ManagerFilterOptions,
} from '@/lib/manager'
import { formatDateTimeServerClock, formatRupiah, paymentStatusColor, paymentStatusLabel } from '@/lib/utils'
import type { PaymentStatus } from '@/types'

type ManagerTransactionRow = {
  transactionId: string
  transactionCode: string
  bookingCode: string
  customerName: string
  locationName: string
  packageName: string
  studioId: string
  studioName: string
  serviceType: string
  method: string
  amount: number
  status: PaymentStatus
  createdAt: string
}

type AnalyticsTrendRow = {
  periodLabel: string
  totalTransactions: number
  paidTransactions: number
  totalAmount: number
  paidAmount: number
}

type AnalyticsLocationRow = {
  locationId: string
  locationName: string
  totalTransactions: number
  totalAmount: number
  paidTransactions: number
  paidAmount: number
}

type AnalyticsMethodRow = {
  method: string
  totalTransactions: number
  totalAmount: number
}

type AnalyticsStatusRow = {
  status: PaymentStatus
  totalTransactions: number
  totalAmount: number
}

type ManagerTransactionsResponse = {
  page: number
  limit: number
  total: number
  totalPages: number
  summary: {
    totalAmount: number
    totalTransactions: number
    paidAmount: number
    paidCount: number
    pendingCount: number
    failedCount: number
  }
  analytics: {
    period: 'daily' | 'weekly' | 'monthly'
    trend: AnalyticsTrendRow[]
    byLocation: AnalyticsLocationRow[]
    byMethod: AnalyticsMethodRow[]
    byStatus: AnalyticsStatusRow[]
  }
  transactions: ManagerTransactionRow[]
}

function escapeCsvValue(value: string | number) {
  const normalized = String(value ?? '').replace(/"/g, '""')
  return `"${normalized}"`
}

function buildTransactionQuery(params: {
  page: number
  limit: number
  period: 'daily' | 'weekly' | 'monthly'
  startDate: string
  endDate: string
  method: string
  serviceType: string
  studioId: string
  locationId: string
}) {
  return new URLSearchParams({
    page: String(params.page),
    limit: String(params.limit),
    period: params.period,
    ...(params.startDate ? { startDate: params.startDate } : {}),
    ...(params.endDate ? { endDate: params.endDate } : {}),
    ...(params.method ? { method: params.method } : {}),
    ...(params.serviceType ? { serviceType: params.serviceType } : {}),
    ...(params.studioId ? { studioId: params.studioId } : {}),
    ...(params.locationId ? { locationId: params.locationId } : {}),
  })
}

function downloadCsvFile(filename: string, rows: ManagerTransactionRow[]) {
  const headers = [
    'Tanggal',
    'Kode Transaksi',
    'Kode Booking',
    'Nama Customer',
    'Lokasi',
    'Paket',
    'Studio',
    'Layanan',
    'Metode',
    'Jumlah',
    'Status',
  ]

  const csvRows = rows.map((row) =>
    [
      formatDateTimeServerClock(row.createdAt),
      row.transactionCode,
      row.bookingCode,
      row.customerName,
      row.locationName,
      row.packageName,
      row.studioName,
      serviceTypeLabel(row.serviceType),
      paymentMethodLabel(row.method),
      row.amount,
      paymentStatusLabel[row.status],
    ]
      .map(escapeCsvValue)
      .join(','),
  )

  const blob = new Blob([`\uFEFF${headers.map(escapeCsvValue).join(',')}\n${csvRows.join('\n')}`], {
    type: 'text/csv;charset=utf-8;',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

function getPresetRange(period: 'daily' | 'weekly' | 'monthly') {
  const now = new Date()
  const end = now.toISOString().slice(0, 10)

  if (period === 'daily') {
    return { startDate: end, endDate: end }
  }

  if (period === 'weekly') {
    const day = now.getUTCDay()
    const diff = day === 0 ? -6 : 1 - day
    const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + diff))
    return { startDate: start.toISOString().slice(0, 10), endDate: end }
  }

  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
  return { startDate: start.toISOString().slice(0, 10), endDate: end }
}

export default function ManagerTransactionsPage() {
  const { user } = useAuth({ requireAuth: true, allowedRoles: ['manager'], unauthorizedRedirectTo: '/dashboard/overview' })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [rows, setRows] = useState<ManagerTransactionRow[]>([])
  const [page, setPage] = useState(1)
  const [meta, setMeta] = useState({ total: 0, totalPages: 1, limit: 10 })
  const [summary, setSummary] = useState<ManagerTransactionsResponse['summary'] | null>(null)
  const [analytics, setAnalytics] = useState<ManagerTransactionsResponse['analytics'] | null>(null)
  const [filters, setFilters] = useState<ManagerFilterOptions | null>(null)
  const [exporting, setExporting] = useState(false)
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('weekly')
  const [startDate, setStartDate] = useState(getPresetRange('weekly').startDate)
  const [endDate, setEndDate] = useState(getPresetRange('weekly').endDate)
  const [method, setMethod] = useState('')
  const [serviceType, setServiceType] = useState('')
  const [studioId, setStudioId] = useState('')
  const [locationId, setLocationId] = useState('')

  const load = async (nextPage = page) => {
    setLoading(true)
    setError(null)
    try {
      const query = buildTransactionQuery({
        page: nextPage,
        limit: 10,
        period,
        startDate,
        endDate,
        method,
        serviceType,
        studioId,
        locationId,
      })
      const res = await apiFetch<{ data: ManagerTransactionsResponse }>(`/api/manager/transactions?${query.toString()}`)
      setRows(res.data.transactions || [])
      setSummary(res.data.summary)
      setAnalytics(res.data.analytics)
      setMeta({ total: res.data.total, totalPages: res.data.totalPages, limit: res.data.limit })
      setPage(res.data.page)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat laporan transaksi manager')
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async () => {
    setExporting(true)
    setError(null)

    try {
      const firstQuery = buildTransactionQuery({
        page: 1,
        limit: 100,
        period,
        startDate,
        endDate,
        method,
        serviceType,
        studioId,
        locationId,
      })

      const firstRes = await apiFetch<{ data: ManagerTransactionsResponse }>(`/api/manager/transactions?${firstQuery.toString()}`)
      const allRows = [...(firstRes.data.transactions || [])]

      for (let nextPage = 2; nextPage <= firstRes.data.totalPages; nextPage += 1) {
        const nextQuery = buildTransactionQuery({
          page: nextPage,
          limit: 100,
          period,
          startDate,
          endDate,
          method,
          serviceType,
          studioId,
          locationId,
        })
        const nextRes = await apiFetch<{ data: ManagerTransactionsResponse }>(`/api/manager/transactions?${nextQuery.toString()}`)
        allRows.push(...(nextRes.data.transactions || []))
      }

      if (!allRows.length) {
        throw new Error('Tidak ada data transaksi untuk diexport')
      }

      const filename = `laporan-transaksi-manager-${period}-${startDate || 'awal'}_${endDate || 'akhir'}.csv`
      downloadCsvFile(filename, allRows)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal export laporan transaksi')
    } finally {
      setExporting(false)
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
      await load(1)
    }

    void loadInitial()
  }, [user])

  const totalAmount = useMemo(() => rows.reduce((sum, row) => sum + row.amount, 0), [rows])

  const txTrendChart = useMemo(
    () =>
      (analytics?.trend || []).map((item) => ({
        label: item.periodLabel.slice(5),
        value: item.totalTransactions,
      })),
    [analytics?.trend],
  )

  const revenueTrendChart = useMemo(
    () =>
      (analytics?.trend || []).map((item) => ({
        label: item.periodLabel.slice(5),
        value: Math.round(item.paidAmount / 1000),
      })),
    [analytics?.trend],
  )

  if (!user) return null

  return (
    <div className="space-y-4">
      <ManagerSectionNav />

      {error ? <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}

      <Card title="Laporan Transaksi" subtitle="Detail transaksi harian/mingguan/bulanan + evaluasi per cabang">
        <div className="grid gap-2 md:grid-cols-8 xl:grid-cols-9">
          <Select
            value={period}
            onChange={(event) => {
              const value = event.target.value as 'daily' | 'weekly' | 'monthly'
              setPeriod(value)
              const next = getPresetRange(value)
              setStartDate(next.startDate)
              setEndDate(next.endDate)
            }}
            options={[
              { label: 'Harian', value: 'daily' },
              { label: 'Mingguan', value: 'weekly' },
              { label: 'Bulanan', value: 'monthly' },
            ]}
          />
          <Input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
          <Input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} />
          <Select
            value={method}
            onChange={(event) => setMethod(event.target.value)}
            options={[
              { label: 'Semua Metode', value: '' },
              { label: 'Cash', value: 'cash' },
              { label: 'QRIS', value: 'qris' },
              { label: 'BCA VA', value: 'bca_va' },
              { label: 'Mandiri VA', value: 'mandiri_va' },
              { label: 'GoPay', value: 'gopay' },
              { label: 'OVO', value: 'ovo' },
            ]}
          />
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
          <Button variant="secondary" onClick={() => void load(1)}>
            Terapkan
          </Button>
          <Button variant="ghost" loading={exporting} disabled={loading} onClick={() => void handleExport()}>
            Export CSV
          </Button>
        </div>
      </Card>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card title="Total Transaksi" subtitle="Sesuai filter aktif">
          <p className="text-2xl font-semibold text-gray-900">{summary?.totalTransactions || 0}</p>
        </Card>
        <Card title="Total Nominal" subtitle="Semua status pembayaran">
          <p className="text-2xl font-semibold text-gray-900">{formatRupiah(summary?.totalAmount || 0)}</p>
        </Card>
        <Card title="Nominal Lunas" subtitle={`${summary?.paidCount || 0} transaksi paid`}>
          <p className="text-2xl font-semibold text-gray-900">{formatRupiah(summary?.paidAmount || 0)}</p>
        </Card>
        <Card title="Pending / Gagal" subtitle="Monitoring risiko pembayaran">
          <p className="text-2xl font-semibold text-gray-900">
            {(summary?.pendingCount || 0) + (summary?.failedCount || 0)}
          </p>
          <p className="mt-1 text-xs text-gray-500">Pending: {summary?.pendingCount || 0} • Gagal: {summary?.failedCount || 0}</p>
        </Card>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <SimpleBarChart data={txTrendChart} title="Grafik Jumlah Transaksi per Periode" />
        <SimpleBarChart data={revenueTrendChart} title="Grafik Revenue Lunas per Periode (x1000)" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card title="Breakdown Per Cabang" subtitle="Untuk banding performa lokasi">
          <Table
            loading={loading}
            data={(analytics?.byLocation || []) as unknown as Record<string, unknown>[]}
            columns={[
              { key: 'locationName', label: 'Cabang' },
              { key: 'totalTransactions', label: 'Trx' },
              {
                key: 'totalAmount',
                label: 'Nominal',
                render: (item) => formatRupiah((item as unknown as AnalyticsLocationRow).totalAmount),
              },
              {
                key: 'paidAmount',
                label: 'Lunas',
                render: (item) => formatRupiah((item as unknown as AnalyticsLocationRow).paidAmount),
              },
            ]}
          />
        </Card>

        <Card title="Breakdown Metode" subtitle="Distribusi channel pembayaran">
          <Table
            loading={loading}
            data={(analytics?.byMethod || []) as unknown as Record<string, unknown>[]}
            columns={[
              {
                key: 'method',
                label: 'Metode',
                render: (item) => paymentMethodLabel((item as unknown as AnalyticsMethodRow).method),
              },
              { key: 'totalTransactions', label: 'Trx' },
              {
                key: 'totalAmount',
                label: 'Nominal',
                render: (item) => formatRupiah((item as unknown as AnalyticsMethodRow).totalAmount),
              },
            ]}
          />
        </Card>

        <Card title="Breakdown Status" subtitle="Kontrol kualitas pembayaran">
          <Table
            loading={loading}
            data={(analytics?.byStatus || []) as unknown as Record<string, unknown>[]}
            columns={[
              {
                key: 'status',
                label: 'Status',
                render: (item) => {
                  const status = (item as unknown as AnalyticsStatusRow).status
                  return <Badge className={paymentStatusColor[status]}>{paymentStatusLabel[status]}</Badge>
                },
              },
              { key: 'totalTransactions', label: 'Trx' },
              {
                key: 'totalAmount',
                label: 'Nominal',
                render: (item) => formatRupiah((item as unknown as AnalyticsStatusRow).totalAmount),
              },
            ]}
          />
        </Card>
      </div>

      <Card
        title="Data Transaksi"
        subtitle={`Halaman ini: ${formatRupiah(totalAmount)} • Total filter: ${formatRupiah(summary?.totalAmount || 0)} • Paid: ${summary?.paidCount || 0} • Pending: ${summary?.pendingCount || 0}`}
      >
        <Table
          loading={loading}
          data={rows as unknown as Record<string, unknown>[]}
          columns={[
            {
              key: 'createdAt',
              label: 'Tanggal',
              render: (item) => formatDateTimeServerClock((item as unknown as ManagerTransactionRow).createdAt),
            },
            { key: 'transactionCode', label: 'Kode Transaksi' },
            { key: 'bookingCode', label: 'Kode Booking' },
            { key: 'customerName', label: 'Nama Customer' },
            { key: 'locationName', label: 'Lokasi' },
            { key: 'studioName', label: 'Studio' },
            {
              key: 'serviceType',
              label: 'Layanan',
              render: (item) => serviceTypeLabel((item as unknown as ManagerTransactionRow).serviceType),
            },
            {
              key: 'method',
              label: 'Metode',
              render: (item) => paymentMethodLabel((item as unknown as ManagerTransactionRow).method),
            },
            {
              key: 'amount',
              label: 'Jumlah',
              render: (item) => formatRupiah((item as unknown as ManagerTransactionRow).amount),
            },
            {
              key: 'status',
              label: 'Status',
              render: (item) => {
                const status = (item as unknown as ManagerTransactionRow).status
                return <Badge className={paymentStatusColor[status]}>{paymentStatusLabel[status]}</Badge>
              },
            },
          ]}
        />

        <div className="mt-3 flex items-center justify-end gap-2">
          <Button variant="ghost" disabled={page <= 1 || loading} onClick={() => void load(page - 1)}>
            Sebelumnya
          </Button>
          <span className="text-sm text-gray-600">
            Halaman {page} / {meta.totalPages}
          </span>
          <Button variant="ghost" disabled={page >= meta.totalPages || loading} onClick={() => void load(page + 1)}>
            Berikutnya
          </Button>
        </div>
      </Card>
    </div>
  )
}
