import type { Booking, BookingStatus, PaymentMethod, PaymentStatus, ScheduleSlot, Studio } from '@/types'
import { inferStudioTypeFromName, normalizeStudioType, STUDIO_LABEL_BY_TYPE, STUDIO_TYPE_ORDER, type StudioType } from '@/lib/studio'

function normalizeBookingStatus(value?: string): BookingStatus {
  if (value === 'pending' || value === 'confirmed' || value === 'completed' || value === 'cancelled' || value === 'expired') {
    return value
  }
  return 'pending'
}

function normalizePaymentStatus(value?: string): PaymentStatus {
  if (value === 'pending' || value === 'paid' || value === 'failed' || value === 'expired') return value
  return 'pending'
}

function normalizePaymentMethod(value?: string): PaymentMethod {
  if (value === 'cash' || value === 'qris' || value === 'bca_va' || value === 'mandiri_va' || value === 'gopay' || value === 'ovo') {
    return value
  }
  if (value === 'va') return 'bca_va'
  if (value === 'transfer') return 'mandiri_va'
  return 'qris'
}

function toIsoOrFallback(value: unknown, fallback: string) {
  if (typeof value !== 'string' || !value.trim()) return fallback
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return fallback
  return d.toISOString()
}

export function normalizeBooking(raw: any): Booking {
  const id = String(raw?.id || raw?.bookingId || '')
  const nowIso = new Date().toISOString()

  const scheduleStart = raw?.startTime || raw?.schedule?.startTime || raw?.schedule?.date
  const scheduleEnd = raw?.endTime || raw?.schedule?.endTime || scheduleStart

  const studioType = normalizeStudioType(raw?.studio?.type) || inferStudioTypeFromName(raw?.studio?.name)
  const studioName = raw?.studio?.name || (studioType ? STUDIO_LABEL_BY_TYPE[studioType] : 'Studio')

  const status = normalizeBookingStatus(raw?.status?.booking || raw?.status)
  const paymentStatus = normalizePaymentStatus(raw?.transaction?.status || raw?.payment?.status)

  return {
    id,
    bookingCode: raw?.bookingCode || '-',
    user: raw?.user || raw?.customer?.user
      ? {
          id: String(raw?.user?.id || raw?.customer?.user?.id || ''),
          name: String(raw?.user?.name || raw?.customer?.user?.name || ''),
          email: String(raw?.user?.email || raw?.customer?.user?.email || ''),
          role: (raw?.user?.role || raw?.customer?.user?.role || 'customer') as any,
          isActive: true,
        }
      : undefined,
    userId: raw?.userId || raw?.customer?.user?.id || undefined,
    guestName: raw?.guestName || raw?.customer?.name || undefined,
    guestPhone: raw?.guestPhone || raw?.customer?.phone || undefined,
    package: {
      id: String(raw?.package?.id || raw?.packageId || ''),
      name: String(raw?.package?.name || '-'),
      price: Number(raw?.package?.price || 0),
      durationMin: Number(raw?.package?.durationMin || raw?.package?.durationMinutes || 0),
      maxPax: Number(raw?.package?.maxPax || raw?.package?.maxCapacity || 0),
      isActive: true,
      description: raw?.package?.description,
    },
    packageId: String(raw?.packageId || raw?.package?.id || ''),
    studio: {
      id: String(raw?.studio?.id || raw?.studioId || ''),
      name: studioName,
      capacity: Number(raw?.studio?.capacity || 0),
      description: studioType ? STUDIO_LABEL_BY_TYPE[studioType] : undefined,
      isActive: true,
    },
    studioId: String(raw?.studioId || raw?.studio?.id || ''),
    startTime: toIsoOrFallback(scheduleStart, nowIso),
    endTime: toIsoOrFallback(scheduleEnd, nowIso),
    paxCount: Number(raw?.paxCount || raw?.participantCount || 1),
    status,
    isWalkIn: Boolean(raw?.isWalkIn || raw?.source === 'walk_in'),
    notes: raw?.notes,
    createdAt: toIsoOrFallback(raw?.createdAt, nowIso),
    transaction: raw?.transaction || raw?.payment
      ? {
          id: String(raw?.transaction?.id || raw?.payment?.id || ''),
          transactionCode: String(raw?.transaction?.transactionCode || raw?.payment?.gatewayReference || '-'),
          bookingId: id,
          amount: Number(raw?.transaction?.amount || raw?.payment?.amount || 0),
          method: normalizePaymentMethod(raw?.transaction?.method || raw?.payment?.method),
          status: paymentStatus,
          proofUrl: raw?.transaction?.proofUrl,
          createdAt: toIsoOrFallback(raw?.transaction?.createdAt || raw?.payment?.createdAt, nowIso),
        }
      : undefined,
    changeLogs: raw?.changeLogs,
  }
}

export function normalizeBookingList(rawList: unknown): Booking[] {
  if (!Array.isArray(rawList)) return []
  return rawList.map((item) => normalizeBooking(item))
}

export function buildStudioTimelineFromBookings(bookings: Booking[], date: string): ScheduleSlot[] {
  const targetDate = new Date(`${date}T00:00:00+07:00`)
  const validTarget = Number.isNaN(targetDate.getTime()) ? new Date() : targetDate
  const hours = Array.from({ length: 14 }, (_, idx) => String(idx + 8).padStart(2, '0'))

  const byType = new Map<StudioType, Studio>()

  bookings.forEach((booking) => {
    const type = normalizeStudioType((booking as any).studio?.description) || inferStudioTypeFromName(booking.studio?.name)
    if (type && !byType.has(type)) {
      byType.set(type, booking.studio)
    }
  })

  STUDIO_TYPE_ORDER.forEach((type) => {
    if (!byType.has(type)) {
      byType.set(type, {
        id: `type-${type}`,
        name: STUDIO_LABEL_BY_TYPE[type],
        capacity: 0,
        isActive: true,
      })
    }
  })

  return STUDIO_TYPE_ORDER.map((type) => {
    const studio = byType.get(type)!

    return {
      studioId: studio.id,
      studioName: STUDIO_LABEL_BY_TYPE[type],
      date: validTarget.toISOString(),
      slots: hours.map((hour) => {
        const match = bookings.find((booking) => {
          const bookingType = normalizeStudioType((booking as any).studio?.description) || inferStudioTypeFromName(booking.studio?.name)
          const sameType = bookingType === type
          const localHour = new Date(booking.startTime).toLocaleTimeString('id-ID', {
            timeZone: 'UTC',
            hour: '2-digit',
            hour12: false,
          })
          return sameType && localHour === hour
        })

        return {
          time: `${hour}:00`,
          available: !match,
          bookingId: match?.id,
          booking: match,
        }
      }),
    }
  })
}
