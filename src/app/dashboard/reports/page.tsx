'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { SimpleBarChart } from '@/components/dashboard/SimpleBarChart'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Table } from '@/components/ui/Table'
import { useAuth } from '@/hooks/useAuth'
import { apiFetch } from '@/lib/api'
import { formatRupiah } from '@/lib/utils'

export default function ReportsPage() {
  const router = useRouter()
  const { user } = useAuth({ requireAuth: true })
  const [tab, setTab] = useState<'booking' | 'finance' | 'usage'>('booking')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [method, setMethod] = useState('')
  const [rows, setRows] = useState<Record<string, unknown>[]>([])

  useEffect(() => {
    if (user && user.role === 'staff') router.replace('/dashboard/overview')
  }, [router, user])

  const load = async () => {
    if (tab === 'booking') {
      const res = await apiFetch<{ data: Record<string, unknown>[] }>(
        `/api/reports/bookings?dateFrom=${dateFrom}&dateTo=${dateTo}`,
      ).catch(() => apiFetch<{ data: Record<string, unknown>[] }>(`/api/admin/reports/bookings?dateFrom=${dateFrom}&dateTo=${dateTo}`))
      setRows(res.data || [])
    }

    if (tab === 'finance') {
      const res = await apiFetch<{ data: Record<string, unknown>[] }>(
        `/api/reports/revenue?dateFrom=${dateFrom}&dateTo=${dateTo}&method=${method}`,
      ).catch(() => apiFetch<{ data: Record<string, unknown>[] }>(`/api/admin/reports/payments?dateFrom=${dateFrom}&dateTo=${dateTo}`))
      setRows(res.data || [])
    }

    if (tab === 'usage') {
      const res = await apiFetch<{ data: Record<string, unknown>[] }>(
        `/api/reports/studio-usage?dateFrom=${dateFrom}&dateTo=${dateTo}`,
      ).catch(() => apiFetch<{ data: Record<string, unknown>[] }>(`/api/admin/reports/studio-usage?dateFrom=${dateFrom}&dateTo=${dateTo}`))
      setRows(res.data || [])
    }
  }

  useEffect(() => {
    if (!user || user.role === 'staff') return
    void load()
  }, [tab, user])

  if (!user || user.role === 'staff') return null

  return (
    <div className="space-y-4">
      <Card title="Laporan" subtitle="Monitoring booking, keuangan, dan penggunaan studio">
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant={tab === 'booking' ? 'primary' : 'secondary'} onClick={() => setTab('booking')}>
            Booking
          </Button>
          <Button size="sm" variant={tab === 'finance' ? 'primary' : 'secondary'} onClick={() => setTab('finance')}>
            Keuangan
          </Button>
          <Button size="sm" variant={tab === 'usage' ? 'primary' : 'secondary'} onClick={() => setTab('usage')}>
            Penggunaan Studio
          </Button>
        </div>

        <div className="mt-3 grid gap-2 md:grid-cols-5">
          <Input type="date" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} />
          <Input type="date" value={dateTo} onChange={(event) => setDateTo(event.target.value)} />
          <Select
            value={method}
            onChange={(event) => setMethod(event.target.value)}
            options={[
              { label: 'Semua metode', value: '' },
              { label: 'Cash', value: 'cash' },
              { label: 'QRIS', value: 'qris' },
              { label: 'Transfer', value: 'transfer' },
              { label: 'VA', value: 'va' },
            ]}
          />
          <Button variant="secondary" onClick={() => void load()}>
            Terapkan
          </Button>
          <Button variant="ghost">Export CSV</Button>
        </div>
      </Card>

      {tab === 'finance' ? (
        <SimpleBarChart
          title="Revenue Harian"
          data={rows.slice(0, 7).map((row, index) => ({ label: String(row.date || `D${index + 1}`), value: Number(row.total || 0) }))}
        />
      ) : null}

      <Card>
        <Table
          data={rows}
          columns={Object.keys(rows[0] || { message: 'no_data' }).map((key) => ({
            key,
            label: key,
            render: (item: Record<string, unknown>) => {
              const value = item[key]
              if (typeof value === 'number' && key.toLowerCase().includes('revenue')) return formatRupiah(value)
              return String(value ?? '-')
            },
          }))}
          emptyMessage="Belum ada data laporan pada filter ini"
        />
      </Card>
    </div>
  )
}
