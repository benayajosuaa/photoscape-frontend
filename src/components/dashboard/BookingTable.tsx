'use client'

import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Table } from '@/components/ui/Table'
import {
  bookingStatusColor,
  bookingStatusLabel,
  formatDateTimeServerClock,
  formatTimeServerClock,
  paymentStatusColor,
  paymentStatusLabel,
} from '@/lib/utils'
import type { Booking } from '@/types'

interface BookingTableProps {
  data: Booking[]
  loading?: boolean
  onDetail?: (booking: Booking) => void
  readonly?: boolean
}

export function BookingTable({ data, loading = false, onDetail, readonly = false }: BookingTableProps) {
  return (
    <Table
      loading={loading}
      data={data as unknown as Record<string, unknown>[]}
      columns={[
        { key: 'bookingCode', label: 'Kode' },
        {
          key: 'name',
          label: 'Nama',
          render: (item) => {
            const booking = item as unknown as Booking
            return booking.isWalkIn ? `Walk-in: ${booking.guestName || '-'}` : booking.user?.name || booking.guestName || '-'
          },
        },
        { key: 'package', label: 'Paket', render: (item) => (item as unknown as Booking).package?.name || '-' },
        { key: 'studio', label: 'Studio', render: (item) => (item as unknown as Booking).studio?.name || '-' },
        {
          key: 'time',
          label: 'Waktu',
          render: (item) => {
            const booking = item as unknown as Booking
            return `${formatDateTimeServerClock(booking.startTime)} - ${formatTimeServerClock(booking.endTime)}`
          },
        },
        {
          key: 'status',
          label: 'Status',
          render: (item) => {
            const booking = item as unknown as Booking
            return <Badge className={bookingStatusColor[booking.status]}>{bookingStatusLabel[booking.status]}</Badge>
          },
        },
        {
          key: 'payment',
          label: 'Pembayaran',
          render: (item) => {
            const payment = (item as unknown as Booking).transaction?.status || 'pending'
            return <Badge className={paymentStatusColor[payment]}>{paymentStatusLabel[payment]}</Badge>
          },
        },
        {
          key: 'action',
          label: 'Aksi',
          render: (item) => (
            <Button size="sm" variant="secondary" onClick={() => onDetail?.(item as unknown as Booking)}>
              {readonly ? 'Lihat' : 'Detail'}
            </Button>
          ),
        },
      ]}
    />
  )
}
