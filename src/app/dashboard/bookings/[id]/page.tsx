'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { useAuth } from '@/hooks/useAuth'
import { apiFetch } from '@/lib/api'
import { bookingStatusColor, bookingStatusLabel, formatDateTime, formatRupiah } from '@/lib/utils'
import type { Booking } from '@/types'

export default function BookingDetailPage() {
  const { user } = useAuth({ requireAuth: true })
  const params = useParams<{ id: string }>()
  const [loading, setLoading] = useState(true)
  const [booking, setBooking] = useState<Booking | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await apiFetch<{ data: Booking }>(`/api/bookings/${params.id}`).catch(() =>
          apiFetch<{ data: Booking }>(`/api/admin/bookings/${params.id}`),
        )
        setBooking(res.data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Gagal memuat detail booking')
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [params.id])

  if (!user) return null
  if (loading) return <p className="text-sm text-gray-500">Memuat detail booking...</p>
  if (error || !booking) return <p className="text-sm text-red-700">{error || 'Booking tidak ditemukan'}</p>

  return (
    <div className="space-y-4">
      <Card title={`Booking ${booking.bookingCode}`} subtitle="Detail lengkap booking">
        <div className="grid gap-3 text-sm text-gray-700 md:grid-cols-2">
          <p>
            <span className="font-medium">Nama:</span> {booking.user?.name || booking.guestName || '-'}
          </p>
          <p>
            <span className="font-medium">Email:</span> {booking.user?.email || '-'}
          </p>
          <p>
            <span className="font-medium">Studio:</span> {booking.studio?.name || '-'}
          </p>
          <p>
            <span className="font-medium">Paket:</span> {booking.package?.name || '-'}
          </p>
          <p>
            <span className="font-medium">Waktu:</span> {formatDateTime(booking.startTime)}
          </p>
          <p>
            <span className="font-medium">Harga:</span> {formatRupiah(booking.package?.price || 0)}
          </p>
          <div>
            <span className="font-medium">Status:</span>{' '}
            <Badge className={bookingStatusColor[booking.status]}>{bookingStatusLabel[booking.status]}</Badge>
          </div>
        </div>

        {user.role === 'staff' ? (
          <div className="mt-4 flex gap-2">
            <Button variant="secondary">Konfirmasi</Button>
            <Button variant="secondary">Ubah Jadwal</Button>
            <Button variant="danger">Batalkan</Button>
          </div>
        ) : null}
      </Card>

      <Card title="Riwayat Perubahan">
        <div className="space-y-2">
          {(booking.changeLogs || []).length === 0 ? <p className="text-sm text-gray-500">Belum ada log perubahan.</p> : null}
          {booking.changeLogs?.map((log) => (
            <div key={log.id} className="rounded-lg border border-gray-200 p-3 text-sm">
              <p className="font-medium">{log.action}</p>
              <p className="text-xs text-gray-500">{formatDateTime(log.createdAt)}</p>
              {log.reason ? <p className="mt-1 text-gray-700">{log.reason}</p> : null}
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
