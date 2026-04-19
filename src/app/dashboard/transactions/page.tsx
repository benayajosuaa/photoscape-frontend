'use client'

import { useEffect, useMemo, useState } from 'react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Select } from '@/components/ui/Select'
import { Table } from '@/components/ui/Table'
import { Toast } from '@/components/ui/Toast'
import { TransactionForm } from '@/components/dashboard/TransactionForm'
import { useAuth } from '@/hooks/useAuth'
import { normalizeBookingList } from '@/lib/booking-adapter'
import { apiFetch } from '@/lib/api'
import { formatDateTimeServerClock, formatRupiah, paymentStatusColor, paymentStatusLabel } from '@/lib/utils'
import type { Booking, Transaction } from '@/types'

type DerivedTransaction = Transaction & { booking?: Booking }

function toDateKeyUtc(iso?: string) {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const year = d.getUTCFullYear()
  const month = String(d.getUTCMonth() + 1).padStart(2, '0')
  const day = String(d.getUTCDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export default function TransactionsPage() {
  const { user } = useAuth({ requireAuth: true })
  const [items, setItems] = useState<DerivedTransaction[]>([])
  const [unpaidBookings, setUnpaidBookings] = useState<Booking[]>([])
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [method, setMethod] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [openPayModal, setOpenPayModal] = useState(false)
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({ show: false, message: '', type: 'success' })

  const load = async () => {
    const bookingRes = await apiFetch<{ data?: { bookings?: unknown[] } | unknown[] }>(
      '/api/admin/bookings?page=1&limit=500',
    ).catch(() =>
      Promise.resolve({ data: [] as unknown[] }),
    )

    const raw = Array.isArray(bookingRes.data)
      ? bookingRes.data
      : Array.isArray((bookingRes.data as { bookings?: unknown[] })?.bookings)
        ? (bookingRes.data as { bookings?: unknown[] }).bookings || []
        : []

    const normalized = normalizeBookingList(raw)

    const transactions = normalized
      .filter((booking) => booking.transaction)
      .map((booking) => ({
        ...(booking.transaction as Transaction),
        booking,
      }))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    setItems(transactions)

    if (user?.role === 'staff') {
      const bookingRes = await apiFetch<{ data: Booking[] }>(
        '/api/bookings?paymentStatus=pending&status=confirmed',
      ).catch(() => Promise.resolve({ data: [] as Booking[] }))
      setUnpaidBookings(bookingRes.data || [])
    }
  }

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (status && item.status !== status) return false
      if (method && item.method !== method) return false

      const key = toDateKeyUtc(item.createdAt)
      if (dateFrom && key && key < dateFrom) return false
      if (dateTo && key && key > dateTo) return false

      if (!search.trim()) return true
      const q = search.trim().toLowerCase()
      const customerName = item.booking?.user?.name || item.booking?.guestName || ''
      return (
        item.transactionCode?.toLowerCase().includes(q) ||
        item.booking?.bookingCode?.toLowerCase().includes(q) ||
        customerName.toLowerCase().includes(q)
      )
    })
  }, [dateFrom, dateTo, items, method, search, status])

  const latestItems = useMemo(() => filteredItems.slice(0, 5), [filteredItems])

  const weeklyCashflow = useMemo(() => {
    const points: { key: string; label: string; total: number }[] = []
    const now = new Date()

    for (let i = 6; i >= 0; i -= 1) {
      const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - i))
      const key = d.toISOString().slice(0, 10)
      const label = d.toLocaleDateString('id-ID', { weekday: 'short', timeZone: 'UTC' })
      points.push({ key, label, total: 0 })
    }

    filteredItems.forEach((item) => {
      if (item.status !== 'paid') return
      const key = toDateKeyUtc(item.createdAt)
      const bucket = points.find((point) => point.key === key)
      if (bucket) bucket.total += item.amount
    })

    return points
  }, [filteredItems])

  const weeklyTotal = useMemo(() => weeklyCashflow.reduce((sum, point) => sum + point.total, 0), [weeklyCashflow])

  useEffect(() => {
    if (!user) return
    void load()
  }, [user])

  if (!user) return null

  return (
    <div className="space-y-4">
      <Toast show={toast.show} message={toast.message} type={toast.type} onClose={() => setToast((prev) => ({ ...prev, show: false }))} />
      <Card title="Transaksi" subtitle="Daftar dan pencatatan pembayaran">
        <div className="grid gap-2 md:grid-cols-6">
          <Input placeholder="Cari kode transaksi / nama" value={search} onChange={(event) => setSearch(event.target.value)} />
          <Select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            options={[
              { label: 'Semua Status', value: '' },
              { label: 'Pending', value: 'pending' },
              { label: 'Paid', value: 'paid' },
              { label: 'Failed', value: 'failed' },
              { label: 'Expired', value: 'expired' },
            ]}
          />
          <Select
            value={method}
            onChange={(event) => setMethod(event.target.value)}
            options={[
              { label: 'Semua Metode', value: '' },
              { label: 'Cash', value: 'cash' },
              { label: 'QRIS', value: 'qris' },
              { label: 'Transfer', value: 'transfer' },
              { label: 'VA', value: 'va' },
            ]}
          />
          <Input type="date" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} />
          <Input type="date" value={dateTo} onChange={(event) => setDateTo(event.target.value)} />
          <Button variant="secondary" onClick={() => void load()}>
            Terapkan
          </Button>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {user.role === 'staff' ? <Button onClick={() => setOpenPayModal(true)}>Catat Pembayaran</Button> : null}
          <Button
            variant="secondary"
            onClick={() => {
              const rows = [
                ['Kode', 'Booking', 'Nama', 'Metode', 'Jumlah', 'Status', 'Waktu'],
                ...filteredItems.map((item) => [
                  item.transactionCode,
                  item.booking?.bookingCode || '-',
                  item.booking?.user?.name || item.booking?.guestName || '-',
                  item.method,
                  String(item.amount),
                  item.status,
                  item.createdAt,
                ]),
              ]
              const csv = rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n')
              const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url
              a.download = `transactions-${dateFrom || 'all'}-${dateTo || 'all'}.csv`
              a.click()
              URL.revokeObjectURL(url)
            }}
          >
            Export CSV
          </Button>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Transaksi Terbaru" subtitle={`Menampilkan ${latestItems.length} transaksi paling akhir`}>
          <div className="space-y-2">
            {latestItems.length === 0 ? (
              <p className="text-sm text-gray-500">Belum ada data transaksi.</p>
            ) : (
              latestItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{item.transactionCode}</p>
                    <p className="text-xs text-gray-500">
                      {item.booking?.bookingCode || '-'} · {item.booking?.user?.name || item.booking?.guestName || '-'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">{formatRupiah(item.amount)}</p>
                    <p className="text-xs text-gray-500">{formatDateTimeServerClock(item.createdAt)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card title="Cashflow Mingguan" subtitle={`Total 7 hari terakhir: ${formatRupiah(weeklyTotal)}`}>
          <div className="space-y-3">
            {weeklyCashflow.map((point) => (
              <div key={point.key}>
                <div className="mb-1 flex items-center justify-between text-xs text-gray-600">
                  <span>{point.label}</span>
                  <span>{formatRupiah(point.total)}</span>
                </div>
                <div className="h-2 rounded-full bg-gray-100">
                  <div
                    className="h-2 rounded-full bg-gray-900"
                    style={{
                      width: `${Math.min(
                        100,
                        (point.total / Math.max(...weeklyCashflow.map((item) => item.total), 1)) * 100,
                      )}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <Table
          data={filteredItems as unknown as Record<string, unknown>[]}
          columns={[
            { key: 'transactionCode', label: 'Kode' },
            { key: 'booking', label: 'Booking', render: (item) => (item as unknown as Transaction).booking?.bookingCode || '-' },
            {
              key: 'name',
              label: 'Nama',
              render: (item) => (item as unknown as Transaction).booking?.user?.name || (item as unknown as Transaction).booking?.guestName || '-',
            },
            { key: 'method', label: 'Metode' },
            { key: 'amount', label: 'Jumlah', render: (item) => formatRupiah((item as unknown as Transaction).amount) },
            {
              key: 'status',
              label: 'Status',
              render: (item) => {
                const status = (item as unknown as Transaction).status
                return <Badge className={paymentStatusColor[status]}>{paymentStatusLabel[status]}</Badge>
              },
            },
            { key: 'time', label: 'Waktu', render: (item) => formatDateTimeServerClock((item as unknown as Transaction).createdAt) },
            {
              key: 'staff',
              label: 'Diproses Oleh',
              render: (item) => (item as unknown as Transaction).processedBy?.name || '-',
            },
          ]}
        />
      </Card>

      <Modal isOpen={openPayModal} onClose={() => setOpenPayModal(false)} title="Catat Pembayaran Manual">
        <TransactionForm
          bookings={unpaidBookings}
          onSubmit={async (payload) => {
            try {
              await apiFetch('/api/transactions', {
                method: 'POST',
                body: JSON.stringify(payload),
              })
              setOpenPayModal(false)
              await load()
              setToast({ show: true, message: 'Transaksi berhasil dicatat', type: 'success' })
            } catch {
              setToast({ show: true, message: 'Gagal mencatat transaksi', type: 'error' })
            }
          }}
        />
      </Modal>
    </div>
  )
}
