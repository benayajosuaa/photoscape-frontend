'use client'

import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Table } from '@/components/ui/Table'
import { useAuth } from '@/hooks/useAuth'
import { apiFetch } from '@/lib/api'
import { formatDateServerClock } from '@/lib/utils'

type CustomerRow = {
  id: string
  name: string
  email: string
  phone: string | null
  totalBookings: number
  lastBookingAt: string | null
  blacklisted: boolean
}

type CustomerDetail = {
  id: string
  name: string
  email: string
  history: Array<{
    bookingId: string
    bookingCode: string
    date: string
    studioName: string
    packageName: string
    status: string
    paymentStatus: string
  }>
}

export default function OwnerCustomersPage() {
  const { user } = useAuth({ requireAuth: true, allowedRoles: ['owner'], unauthorizedRedirectTo: '/dashboard/overview' })
  const [loading, setLoading] = useState(true)
  const [rows, setRows] = useState<CustomerRow[]>([])
  const [search, setSearch] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [openHistory, setOpenHistory] = useState(false)
  const [selected, setSelected] = useState<CustomerDetail | null>(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const query = new URLSearchParams({
        page: '1',
        limit: '50',
        ...(search ? { search } : {}),
      })
      const res = await apiFetch<{ data: { customers: CustomerRow[] } }>(`/api/customers?${query.toString()}`)
      setRows(res.data.customers || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat customers')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!user) return
    void load()
  }, [user])

  if (!user) return null

  return (
    <div className="space-y-4">
      {error ? <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}

      <Card title="Customers" subtitle="Kelola data customer, histori booking, dan blacklist">
        <div className="grid gap-2 md:grid-cols-3">
          <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari nama / email" />
          <Button variant="secondary" onClick={() => void load()}>
            Search
          </Button>
        </div>
      </Card>

      <Card title="Customer List">
        <Table
          loading={loading}
          data={rows as unknown as Record<string, unknown>[]}
          columns={[
            { key: 'name', label: 'Nama' },
            { key: 'email', label: 'Email' },
            { key: 'phone', label: 'No HP', render: (item) => (item as unknown as CustomerRow).phone || '-' },
            { key: 'totalBookings', label: 'Total Booking' },
            {
              key: 'lastBookingAt',
              label: 'Terakhir Booking',
              render: (item) => {
                const value = (item as unknown as CustomerRow).lastBookingAt
                return value ? formatDateServerClock(value) : '-'
              },
            },
            {
              key: 'blacklisted',
              label: 'Status',
              render: (item) => {
                const row = item as unknown as CustomerRow
                return <Badge className={row.blacklisted ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}>{row.blacklisted ? 'Blacklist' : 'Aktif'}</Badge>
              },
            },
            {
              key: 'action',
              label: 'Action',
              render: (item) => {
                const row = item as unknown as CustomerRow
                return (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={async () => {
                        const res = await apiFetch<{ data: CustomerDetail }>(`/api/customers/${row.id}`)
                        setSelected(res.data)
                        setOpenHistory(true)
                      }}
                    >
                      History
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={async () => {
                        await apiFetch(`/api/customers/${row.id}/blacklist`, {
                          method: 'PATCH',
                          body: JSON.stringify({ blacklisted: !row.blacklisted }),
                        })
                        await load()
                      }}
                    >
                      {row.blacklisted ? 'Unblacklist' : 'Blacklist'}
                    </Button>
                  </div>
                )
              },
            },
          ]}
        />
      </Card>

      <Modal
        isOpen={openHistory}
        onClose={() => setOpenHistory(false)}
        title={`History Booking - ${selected?.name || '-'}`}
        footer={
          <div className="flex justify-end">
            <Button variant="ghost" onClick={() => setOpenHistory(false)}>
              Tutup
            </Button>
          </div>
        }
      >
        <Table
          data={(selected?.history || []) as unknown as Record<string, unknown>[]}
          columns={[
            { key: 'bookingCode', label: 'Kode' },
            { key: 'date', label: 'Tanggal', render: (item) => formatDateServerClock((item as any).date) },
            { key: 'studioName', label: 'Studio' },
            { key: 'packageName', label: 'Paket' },
            { key: 'status', label: 'Status' },
            { key: 'paymentStatus', label: 'Payment' },
          ]}
          emptyMessage="Belum ada histori"
        />
      </Modal>
    </div>
  )
}
