'use client'

import { useEffect, useState } from 'react'
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
import { formatDateTimeServerClock } from '@/lib/utils'

type ManagerLogRow = {
  id: string
  action: string
  entityType: string
  entityId: string
  bookingCode: string | null
  adminId: string | null
  adminName: string
  locationName: string | null
  studioName: string | null
  serviceType: string | null
  createdAt: string
}

type ManagerLogsResponse = {
  page: number
  limit: number
  total: number
  totalPages: number
  logs: ManagerLogRow[]
}

function actionColor(action: string) {
  if (action.startsWith('booking')) return 'bg-blue-100 text-blue-800'
  if (action.startsWith('payment')) return 'bg-green-100 text-green-800'
  return 'bg-gray-100 text-gray-700'
}

export default function ManagerLogsPage() {
  const { user } = useAuth({ requireAuth: true, allowedRoles: ['manager'], unauthorizedRedirectTo: '/dashboard/overview' })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [rows, setRows] = useState<ManagerLogRow[]>([])
  const [filters, setFilters] = useState<ManagerFilterOptions | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [action, setAction] = useState('')
  const [serviceType, setServiceType] = useState('')
  const [studioId, setStudioId] = useState('')
  const [locationId, setLocationId] = useState('')

  const load = async (nextPage = page) => {
    setLoading(true)
    setError(null)
    try {
      const query = new URLSearchParams({
        page: String(nextPage),
        limit: '20',
        ...(startDate ? { startDate } : {}),
        ...(endDate ? { endDate } : {}),
        ...(action ? { action } : {}),
        ...(serviceType ? { serviceType } : {}),
        ...(studioId ? { studioId } : {}),
        ...(locationId ? { locationId } : {}),
      })

      const res = await apiFetch<{ data: ManagerLogsResponse }>(`/api/manager/activity-logs?${query.toString()}`)
      setRows(res.data.logs || [])
      setPage(res.data.page)
      setTotalPages(res.data.totalPages)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat activity log manager')
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

  if (!user) return null

  return (
    <div className="space-y-4">
      <ManagerSectionNav />

      {error ? <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}

      <Card title="Activity Log Admin" subtitle="Pemantauan aktivitas admin via log sistem (read-only)">
        <div className="grid gap-2 md:grid-cols-7">
          <Input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
          <Input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} />
          <Input placeholder="Aksi (booking/payment)" value={action} onChange={(event) => setAction(event.target.value)} />
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

      <Card title="Data Log">
        <Table
          loading={loading}
          data={rows as unknown as Record<string, unknown>[]}
          columns={[
            {
              key: 'createdAt',
              label: 'Waktu',
              render: (item) => formatDateTimeServerClock((item as unknown as ManagerLogRow).createdAt),
            },
            { key: 'adminName', label: 'Admin' },
            {
              key: 'action',
              label: 'Aksi',
              render: (item) => {
                const row = item as unknown as ManagerLogRow
                return <Badge className={actionColor(row.action)}>{row.action}</Badge>
              },
            },
            { key: 'entityType', label: 'Entity' },
            {
              key: 'locationName',
              label: 'Lokasi',
              render: (item) => (item as unknown as ManagerLogRow).locationName || '-',
            },
            {
              key: 'studioName',
              label: 'Studio',
              render: (item) => (item as unknown as ManagerLogRow).studioName || '-',
            },
            {
              key: 'serviceType',
              label: 'Layanan',
              render: (item) => {
                const value = (item as unknown as ManagerLogRow).serviceType
                return value ? serviceTypeLabel(value) : '-'
              },
            },
            {
              key: 'bookingCode',
              label: 'Kode Booking',
              render: (item) => (item as unknown as ManagerLogRow).bookingCode || '-',
            },
          ]}
        />

        <div className="mt-3 flex items-center justify-end gap-2">
          <Button variant="ghost" disabled={page <= 1 || loading} onClick={() => void load(page - 1)}>
            Sebelumnya
          </Button>
          <span className="text-sm text-gray-600">
            Halaman {page} / {totalPages}
          </span>
          <Button variant="ghost" disabled={page >= totalPages || loading} onClick={() => void load(page + 1)}>
            Berikutnya
          </Button>
        </div>
      </Card>
    </div>
  )
}
