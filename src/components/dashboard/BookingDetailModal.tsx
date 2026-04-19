'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import {
  bookingStatusColor,
  bookingStatusLabel,
  formatDateTime,
  formatDateTimeServerClock,
  formatRupiah,
  paymentStatusColor,
  paymentStatusLabel,
} from '@/lib/utils'
import type { Booking, Role } from '@/types'

interface BookingDetailModalProps {
  isOpen: boolean
  onClose: () => void
  booking: Booking | null
  role: Role
  onConfirm?: (booking: Booking) => void
  onReschedule?: (booking: Booking) => void
  onCancel?: (booking: Booking) => void
}

export function BookingDetailModal({
  isOpen,
  onClose,
  booking,
  role,
  onConfirm,
  onReschedule,
  onCancel,
}: BookingDetailModalProps) {
  const [tab, setTab] = useState<'detail' | 'logs'>('detail')
  const isStaff = role === 'staff'

  if (!booking) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Detail Booking ${booking.bookingCode}`}
      footer={
        isStaff ? (
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => onConfirm?.(booking)}>
              Konfirmasi
            </Button>
            <Button variant="secondary" onClick={() => onReschedule?.(booking)}>
              Ubah Jadwal
            </Button>
            <Button variant="danger" onClick={() => onCancel?.(booking)}>
              Batalkan
            </Button>
          </div>
        ) : null
      }
    >
      <div className="mb-4 flex gap-2">
        <Button size="sm" variant={tab === 'detail' ? 'primary' : 'ghost'} onClick={() => setTab('detail')}>
          Detail
        </Button>
        <Button size="sm" variant={tab === 'logs' ? 'primary' : 'ghost'} onClick={() => setTab('logs')}>
          Riwayat Perubahan
        </Button>
      </div>

      {tab === 'detail' ? (
        <div className="grid gap-3 text-sm text-gray-700 sm:grid-cols-2">
          <p>
            <span className="font-medium">Pelanggan:</span> {booking.user?.name || booking.guestName || '-'}
          </p>
          <p>
            <span className="font-medium">Studio:</span> {booking.studio?.name}
          </p>
          <p>
            <span className="font-medium">Paket:</span> {booking.package?.name}
          </p>
          <p>
            <span className="font-medium">Waktu:</span> {formatDateTimeServerClock(booking.startTime)}
          </p>
          <p>
            <span className="font-medium">Pax:</span> {booking.paxCount}
          </p>
          <p>
            <span className="font-medium">Total:</span> {formatRupiah(booking.package?.price || 0)}
          </p>
          <div>
            <span className="font-medium">Status Booking:</span>{' '}
            <Badge className={bookingStatusColor[booking.status]}>{bookingStatusLabel[booking.status]}</Badge>
          </div>
          <div>
            <span className="font-medium">Status Payment:</span>{' '}
            <Badge className={paymentStatusColor[booking.transaction?.status || 'pending']}>
              {paymentStatusLabel[booking.transaction?.status || 'pending']}
            </Badge>
          </div>
          <p className="sm:col-span-2">
            <span className="font-medium">Catatan:</span> {booking.notes || '-'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {(booking.changeLogs || []).length === 0 ? (
            <p className="text-sm text-gray-500">Belum ada riwayat perubahan.</p>
          ) : (
            booking.changeLogs?.map((log) => (
              <div key={log.id} className="rounded-lg border border-gray-200 p-3 text-sm">
                <p className="font-medium text-gray-800">{log.action}</p>
                <p className="text-xs text-gray-500">{formatDateTime(log.createdAt)}</p>
                {log.reason ? <p className="mt-1 text-gray-700">Alasan: {log.reason}</p> : null}
              </div>
            ))
          )}
        </div>
      )}
    </Modal>
  )
}
