'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Table } from '@/components/ui/Table'
import { useAuth } from '@/hooks/useAuth'
import { apiFetch } from '@/lib/api'
import { formatDateTime } from '@/lib/utils'
import type { User } from '@/types'

type LogRow = {
  id: string
  action: string
  entityId?: string | null
  bookingCode?: string | null
  createdAt: string
  adminName?: string | null
  adminRole?: string | null
  locationName?: string | null
}

const colorByAction = (action: string) => {
  if (action.startsWith('booking')) return 'bg-blue-100 text-blue-800'
  if (action.startsWith('transaction')) return 'bg-green-100 text-green-800'
  if (action.startsWith('auth')) return 'bg-gray-100 text-gray-700'
  return 'bg-red-100 text-red-700'
}

export default function LogsPage() {
  const router = useRouter()
  const { user } = useAuth({ requireAuth: true })
  const [tab, setTab] = useState<'activity' | 'audit'>('activity')
  const [items, setItems] = useState<LogRow[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [userId, setUserId] = useState('')
  const [action, setAction] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  useEffect(() => {
    if (user && user.role === 'staff') router.replace('/dashboard/overview')
  }, [router, user])

  const load = async () => {
    const query = new URLSearchParams({
      page: '1',
      limit: '50',
      ...(userId ? { userId } : {}),
      ...(action ? { action } : {}),
      ...(dateFrom ? { startDate: dateFrom } : {}),
      ...(dateTo ? { endDate: dateTo } : {}),
    })

    const res = await apiFetch<{ data?: { logs?: LogRow[] } | LogRow[] }>(`/api/logs?${query.toString()}`).catch(() =>
      Promise.resolve({ data: [] as LogRow[] }),
    )
    const logs = Array.isArray(res.data) ? res.data : Array.isArray(res.data?.logs) ? res.data.logs : []
    setItems(logs)

    const usersRes = await apiFetch<{ data?: User[] | { users?: User[] } }>('/api/users?page=1&limit=100').catch(() =>
      Promise.resolve({ data: [] as User[] }),
    )
    const normalizedUsers = Array.isArray(usersRes.data)
      ? usersRes.data
      : Array.isArray(usersRes.data?.users)
        ? usersRes.data.users
        : []
    setUsers(normalizedUsers)
  }

  useEffect(() => {
    if (!user || user.role === 'staff') return
    if (tab === 'audit' && user.role !== 'owner') return
    void load()
  }, [tab, user])

  if (!user || user.role === 'staff') return null

  const safeUsers = Array.isArray(users) ? users : []

  return (
    <div className="space-y-4">
      <Card title="Activity Log" subtitle="Riwayat aksi operasional staff">
        <div className="flex flex-wrap gap-2">
          <button className={`rounded-lg px-3 py-1 text-sm ${tab === 'activity' ? 'bg-gray-900 text-white' : 'bg-gray-100'}`} onClick={() => setTab('activity')}>
            Activity Log
          </button>
          {user.role === 'owner' ? (
            <button className={`rounded-lg px-3 py-1 text-sm ${tab === 'audit' ? 'bg-gray-900 text-white' : 'bg-gray-100'}`} onClick={() => setTab('audit')}>
              Audit Log
            </button>
          ) : null}
        </div>

        <div className="mt-3 grid gap-2 md:grid-cols-5">
          <Select
            value={userId}
            onChange={(event) => setUserId(event.target.value)}
            options={[{ label: 'Semua admin/staff', value: '' }, ...safeUsers.map((item) => ({ label: item.name, value: item.id }))]}
          />
          <Input placeholder="Aksi (booking.cancel)" value={action} onChange={(event) => setAction(event.target.value)} />
          <Input type="date" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} />
          <Input type="date" value={dateTo} onChange={(event) => setDateTo(event.target.value)} />
          <button className="rounded-lg border border-gray-200 px-3 py-2 text-sm" onClick={() => void load()}>
            Filter
          </button>
        </div>
      </Card>

      <Card>
        <Table
          data={items as unknown as Record<string, unknown>[]}
          columns={[
            { key: 'createdAt', label: 'Waktu', render: (item) => formatDateTime((item as unknown as LogRow).createdAt) },
            {
              key: 'staff',
              label: 'Admin/Staff',
              render: (item) => {
                const row = item as unknown as LogRow
                return `${row.adminName || '-'}${row.adminRole ? ` (${row.adminRole})` : ''}`
              },
            },
            { key: 'locationName', label: 'Cabang', render: (item) => (item as unknown as LogRow).locationName || '-' },
            {
              key: 'action',
              label: 'Aksi',
              render: (item) => {
                const log = item as unknown as LogRow
                return <Badge className={colorByAction(log.action)}>{log.action}</Badge>
              },
            },
            {
              key: 'detail',
              label: 'Detail',
              render: (item) => {
                const row = item as unknown as LogRow
                return row.bookingCode ? `Booking ${row.bookingCode}` : row.entityId || '-'
              },
            },
            { key: 'resourceId', label: 'Resource ID', render: (item) => (item as unknown as LogRow).entityId || '-' },
          ]}
        />
      </Card>
    </div>
  )
}
