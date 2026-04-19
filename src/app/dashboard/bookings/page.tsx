'use client'

import { useMemo, useState } from 'react'
import { BookingDetailModal } from '@/components/dashboard/BookingDetailModal'
import { BookingTable } from '@/components/dashboard/BookingTable'
import { CancelModal } from '@/components/dashboard/CancelModal'
import { RescheduleModal } from '@/components/dashboard/RescheduleModal'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Toast } from '@/components/ui/Toast'
import { useAuth } from '@/hooks/useAuth'
import { useBookings } from '@/hooks/useBookings'
import { apiFetch } from '@/lib/api'
import { inferStudioTypeFromName, normalizeStudioType } from '@/lib/studio'
import type { Booking } from '@/types'

export default function BookingsPage() {
  const { user } = useAuth({ requireAuth: true })
  const { bookings, loading, refresh, params, setParams } = useBookings({ page: 1, limit: 20 })
  const [selected, setSelected] = useState<Booking | null>(null)
  const [rescheduleOpen, setRescheduleOpen] = useState(false)
  const [cancelOpen, setCancelOpen] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({
    show: false,
    message: '',
    type: 'success',
  })

  const availableSlots = useMemo(
    () => ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'],
    [],
  )
  const displayedBookings = useMemo(() => {
    if (!params.studioId) return bookings
    return bookings.filter((booking) => {
      const type = normalizeStudioType(booking.studio?.description) || inferStudioTypeFromName(booking.studio?.name)
      return type === params.studioId
    })
  }, [bookings, params.studioId])

  const doAction = async (action: () => Promise<void>, successMessage: string) => {
    setUpdating(true)
    try {
      await action()
      await refresh()
      setToast({ show: true, message: successMessage, type: 'success' })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Aksi gagal diproses'
      setToast({ show: true, message, type: 'error' })
    } finally {
      setUpdating(false)
    }
  }

  if (!user) return null

  return (
    <div className="space-y-4">
      <Toast show={toast.show} message={toast.message} type={toast.type} onClose={() => setToast((prev) => ({ ...prev, show: false }))} />
      <Card title="Daftar Booking" subtitle="Filter dan kelola booking studio">
        <div className="grid gap-3 md:grid-cols-5">
          <Input
            placeholder="Cari nama / kode booking"
            value={params.search || ''}
            onChange={(event) => setParams((prev) => ({ ...prev, search: event.target.value }))}
          />
          <Select
            options={[
              { label: 'Semua Status', value: '' },
              { label: 'Pending', value: 'pending' },
              { label: 'Confirmed', value: 'confirmed' },
              { label: 'Completed', value: 'completed' },
              { label: 'Cancelled', value: 'cancelled' },
            ]}
            value={params.status || ''}
            onChange={(event) => setParams((prev) => ({ ...prev, status: event.target.value }))}
          />
          <Select
            options={[
              { label: 'Semua Studio', value: '' },
              { label: 'Studio K1', value: 'K1' },
              { label: 'Studio K2', value: 'K2' },
              { label: 'Photo Box', value: 'PHOTO_BOX' },
              { label: 'Self-Photo Studio', value: 'SELF_PHOTO' },
            ]}
            value={params.studioId || ''}
            onChange={(event) => setParams((prev) => ({ ...prev, studioId: event.target.value }))}
          />
          <Input type="date" value={params.date || ''} onChange={(event) => setParams((prev) => ({ ...prev, date: event.target.value }))} />
          <Button
            variant="secondary"
            onClick={() => {
              setParams({ page: 1, limit: 20 })
              void refresh()
            }}
          >
            Reset
          </Button>
        </div>
      </Card>

      <Card>
        <BookingTable
          data={displayedBookings}
          loading={loading}
          onDetail={(booking) => {
            setSelected(booking)
          }}
          readonly={user.role !== 'staff'}
        />
      </Card>

      <BookingDetailModal
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        booking={selected}
        role={user.role}
        onConfirm={(booking) =>
          void doAction(
            async () => {
              await apiFetch(`/api/bookings/${booking.id}/confirm`, { method: 'PUT' }).catch(() =>
                apiFetch(`/api/admin/bookings/${booking.id}/status`, {
                  method: 'PATCH',
                  body: JSON.stringify({ status: 'confirmed' }),
                }),
              )
            },
            'Booking berhasil dikonfirmasi',
          )
        }
        onReschedule={() => setRescheduleOpen(true)}
        onCancel={() => setCancelOpen(true)}
      />

      <RescheduleModal
        isOpen={rescheduleOpen}
        onClose={() => setRescheduleOpen(false)}
        slots={availableSlots}
        loading={updating}
        onSubmit={async ({ date, time, reason }) => {
          if (!selected) return
          const bookingId = selected.id || (selected as unknown as { bookingId?: string }).bookingId
          if (!bookingId) {
            setToast({ show: true, message: 'ID booking tidak ditemukan.', type: 'error' })
            return
          }

          await doAction(
            async () => {
              await apiFetch(`/api/bookings/${bookingId}/reschedule`, {
                method: 'PUT',
                body: JSON.stringify({ startTime: `${date}T${time}:00+07:00`, reason }),
              }).catch(() =>
                apiFetch(`/api/admin/bookings/${bookingId}/reschedule`, {
                  method: 'PATCH',
                  body: JSON.stringify({ startTime: `${date}T${time}:00+07:00`, reason }),
                }),
              )
              setRescheduleOpen(false)
            },
            'Jadwal booking berhasil diubah',
          )
        }}
      />

      <CancelModal
        isOpen={cancelOpen}
        onClose={() => setCancelOpen(false)}
        loading={updating}
        onSubmit={async (reason) => {
          if (!selected) return
          await doAction(
            async () => {
              await apiFetch(`/api/bookings/${selected.id}/cancel`, {
                method: 'PUT',
                body: JSON.stringify({ reason }),
              }).catch(() =>
                apiFetch(`/api/admin/bookings/${selected.id}/cancel`, {
                  method: 'PATCH',
                  body: JSON.stringify({ reason }),
                }),
              )
              setCancelOpen(false)
              setSelected(null)
            },
            'Booking berhasil dibatalkan',
          )
        }}
      />
    </div>
  )
}
