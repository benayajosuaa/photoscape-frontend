'use client'

import { useEffect, useMemo, useState } from 'react'
import { ManagerSectionNav } from '@/components/dashboard/ManagerSectionNav'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Table } from '@/components/ui/Table'
import { useAuth } from '@/hooks/useAuth'
import { apiFetch } from '@/lib/api'
import { serviceTypeLabel, toServiceTypeSelectOptions, toStudioSelectOptions, type ManagerFilterOptions } from '@/lib/manager'
import { bookingStatusColor, bookingStatusLabel, formatDateTimeServerClock, paymentStatusColor, paymentStatusLabel } from '@/lib/utils'
import type { BookingStatus, PaymentStatus } from '@/types'

type ManagerBookingRow = {
  bookingId: string
  bookingCode: string
  customerName: string
  locationName: string
  packageName: string
  studioId: string
  studioName: string
  serviceType: string
  startTime: string
  status: BookingStatus
  paymentStatus: PaymentStatus
}

type ManagerBookingsResponse = {
  page: number
  limit: number
  total: number
  totalPages: number
  bookings: ManagerBookingRow[]
}

export default function ManagerBookingsPage() {
  const { user } = useAuth({ requireAuth: true, allowedRoles: ['manager'], unauthorizedRedirectTo: '/dashboard/overview' })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [rows, setRows] = useState<ManagerBookingRow[]>([])
  const [page, setPage] = useState(1)
  const [meta, setMeta] = useState({ total: 0, totalPages: 1, limit: 10 })
  const [filters, setFilters] = useState<ManagerFilterOptions | null>(null)
  const [date, setDate] = useState('')
  const [status, setStatus] = useState('')
  const [serviceType, setServiceType] = useState('')
  const [studioId, setStudioId] = useState('')
  const [locationId, setLocationId] = useState('')

  const load = async (nextPage = page) => {
    setLoading(true)
    setError(null)
    try {
      const query = new URLSearchParams({
        page: String(nextPage),
        limit: '10',
        ...(date ? { date } : {}),
        ...(status ? { status } : {}),
        ...(serviceType ? { serviceType } : {}),
        ...(studioId ? { studioId } : {}),
        ...(locationId ? { locationId } : {}),
      })

      const res = await apiFetch<{ data: ManagerBookingsResponse }>(`/api/manager/bookings?${query.toString()}`)
      setRows(res.data.bookings || [])
      setMeta({ total: res.data.total, totalPages: res.data.totalPages, limit: res.data.limit })
      setPage(res.data.page)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat daftar booking manager')
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
      await load(1)
    }

    void loadInitial()
  }, [user])

  const summaryLabel = useMemo(() => {
    if (meta.total === 0) return 'Belum ada data booking'
    const start = (page - 1) * meta.limit + 1
    const end = Math.min(page * meta.limit, meta.total)
    return `Menampilkan ${start}-${end} dari ${meta.total} booking`
  }, [meta.limit, meta.total, page])

  if (!user) return null

  return (
    <div className="space-y-4">
      <ManagerSectionNav />

      {error ? <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}

      <Card title="Daftar Booking" subtitle="Read-only keseluruhan data booking">
        <div className="grid gap-2 md:grid-cols-6">
          <Input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
          <Select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            options={[
              { label: 'Semua Status', value: '' },
              { label: 'Pending', value: 'pending' },
              { label: 'Confirmed', value: 'confirmed' },
              { label: 'Completed', value: 'completed' },
              { label: 'Cancelled', value: 'cancelled' },
              { label: 'Expired', value: 'expired' },
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
        </div>
      </Card>

      <Card title="Hasil Booking" subtitle={summaryLabel}>
        <Table
          loading={loading}
          data={rows as unknown as Record<string, unknown>[]}
          columns={[
            { key: 'bookingCode', label: 'Kode' },
            { key: 'customerName', label: 'Nama Customer' },
            { key: 'locationName', label: 'Lokasi' },
            { key: 'packageName', label: 'Paket' },
            { key: 'studioName', label: 'Studio' },
            {
              key: 'serviceType',
              label: 'Jenis Layanan',
              render: (item) => serviceTypeLabel((item as unknown as ManagerBookingRow).serviceType),
            },
            {
              key: 'time',
              label: 'Waktu',
              render: (item) => formatDateTimeServerClock((item as unknown as ManagerBookingRow).startTime),
            },
            {
              key: 'status',
              label: 'Status',
              render: (item) => {
                const bookingStatus = (item as unknown as ManagerBookingRow).status
                return <Badge className={bookingStatusColor[bookingStatus]}>{bookingStatusLabel[bookingStatus]}</Badge>
              },
            },
            {
              key: 'paymentStatus',
              label: 'Pembayaran',
              render: (item) => {
                const paymentStatus = (item as unknown as ManagerBookingRow).paymentStatus
                return <Badge className={paymentStatusColor[paymentStatus]}>{paymentStatusLabel[paymentStatus]}</Badge>
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
