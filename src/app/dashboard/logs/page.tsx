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
import type { ActivityLog, User } from '@/types'

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
  const [items, setItems] = useState<ActivityLog[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [userId, setUserId] = useState('')
  const [action, setAction] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  useEffect(() => {
    if (user && user.role === 'staff') router.replace('/dashboard/overview')
  }, [router, user])

  const load = async () => {
    const endpoint = tab === 'audit' ? '/api/logs/audit' : '/api/logs/activity'
    const query = new URLSearchParams({ page: '1', limit: '50', userId, action, dateFrom, dateTo })
    const res = await apiFetch<{ data: ActivityLog[] }>(`${endpoint}?${query.toString()}`).catch(() =>
      Promise.resolve({ data: [] as ActivityLog[] }),
    )
    setItems(res.data || [])

    const usersRes = await apiFetch<{ data: User[] }>('/api/users?role=staff').catch(() => Promise.resolve({ data: [] }))
    setUsers(usersRes.data || [])
  }

  useEffect(() => {
    if (!user || user.role === 'staff') return
    if (tab === 'audit' && user.role !== 'owner') return
    void load()
  }, [tab, user])

  if (!user || user.role === 'staff') return null

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
            options={[{ label: 'Semua staff', value: '' }, ...users.map((item) => ({ label: item.name, value: item.id }))]}
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
            { key: 'createdAt', label: 'Waktu', render: (item) => formatDateTime((item as unknown as ActivityLog).createdAt) },
            { key: 'staff', label: 'Staff', render: (item) => (item as unknown as ActivityLog).user?.name || '-' },
            {
              key: 'action',
              label: 'Aksi',
              render: (item) => {
                const log = item as unknown as ActivityLog
                return <Badge className={colorByAction(log.action)}>{log.action}</Badge>
              },
            },
            { key: 'detail', label: 'Detail', render: (item) => (item as unknown as ActivityLog).detail || '-' },
            { key: 'resourceId', label: 'Resource ID' },
          ]}
        />
      </Card>
    </div>
  )
}
