import type { BookingStatus, PaymentStatus } from '@/types'

const LOCALE = 'id-ID'
const TIME_ZONE = 'Asia/Jakarta'
const SERVER_CLOCK_TIME_ZONE = 'UTC'

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat(LOCALE, {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '-'
  return d.toLocaleDateString(LOCALE, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: TIME_ZONE,
  })
}

export function formatTime(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '-'
  return d.toLocaleTimeString(LOCALE, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: TIME_ZONE,
  })
}

export function formatDateTime(iso: string): string {
  return `${formatDate(iso)}, ${formatTime(iso)}`
}

// Admin dashboard stores schedule/payment timestamps in UTC clock values.
// Render with UTC timezone so displayed hour matches ticket/invoice clock.
export function formatDateServerClock(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '-'
  return d.toLocaleDateString(LOCALE, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: SERVER_CLOCK_TIME_ZONE,
  })
}

export function formatTimeServerClock(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '-'
  return d.toLocaleTimeString(LOCALE, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: SERVER_CLOCK_TIME_ZONE,
  })
}

export function formatDateTimeServerClock(iso: string): string {
  return `${formatDateServerClock(iso)}, ${formatTimeServerClock(iso)}`
}

export const bookingStatusLabel: Record<BookingStatus, string> = {
  pending: 'Menunggu',
  confirmed: 'Terkonfirmasi',
  completed: 'Selesai',
  cancelled: 'Dibatalkan',
  expired: 'Kadaluarsa',
}

export const bookingStatusColor: Record<BookingStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  expired: 'bg-gray-100 text-gray-600',
}

export const paymentStatusLabel: Record<PaymentStatus, string> = {
  pending: 'Belum Bayar',
  paid: 'Lunas',
  failed: 'Gagal',
  expired: 'Kadaluarsa',
}

export const paymentStatusColor: Record<PaymentStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  expired: 'bg-gray-100 text-gray-600',
}

export function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}
