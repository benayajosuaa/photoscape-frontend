'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { BookingDetailModal } from '@/components/dashboard/BookingDetailModal'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { buildStudioTimelineFromBookings, normalizeBookingList } from '@/lib/booking-adapter'
import { apiFetch, toQuery } from '@/lib/api'
import { bookingStatusColor, formatDateServerClock, formatTimeServerClock } from '@/lib/utils'
import { STUDIO_LABEL_BY_TYPE, STUDIO_TYPE_ORDER, type StudioType } from '@/lib/studio'
import { useAuth } from '@/hooks/useAuth'
import type { Booking, ScheduleSlot } from '@/types'

function addDays(dateInput: string, days: number) {
  const [year, month, day] = dateInput.split('-').map((part) => Number(part))
  if (!year || !month || !day) return new Date().toISOString().slice(0, 10)
  const base = new Date(Date.UTC(year, month - 1, day))
  base.setUTCDate(base.getUTCDate() + days)
  return base.toISOString().slice(0, 10)
}

export default function SchedulePage() {
  const router = useRouter()
  const { user } = useAuth({ requireAuth: true })
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [activeStudioType, setActiveStudioType] = useState<StudioType>('K1')
  const [schedules, setSchedules] = useState<ScheduleSlot[]>([])
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)

  const hours = useMemo(() => Array.from({ length: 14 }, (_, idx) => String(idx + 8).padStart(2, '0')), [])

  useEffect(() => {
    const load = async () => {
      const res = await apiFetch<{ data?: { bookings?: unknown[] } | unknown[] }>(
        `/api/admin/bookings?${toQuery({ date, page: 1, limit: 200 })}`,
      ).catch(() => Promise.resolve({ data: [] as unknown[] }))

      const raw = Array.isArray(res.data)
        ? res.data
        : Array.isArray((res.data as { bookings?: unknown[] })?.bookings)
          ? (res.data as { bookings?: unknown[] }).bookings || []
          : []

      const normalizedBookings = normalizeBookingList(raw)
      setSchedules(buildStudioTimelineFromBookings(normalizedBookings, date))
    }
    void load()
  }, [date])

  if (!user) return null

  const studioData = schedules.find((item) => item.studioName === STUDIO_LABEL_BY_TYPE[activeStudioType])

  return (
    <div className="space-y-4">
      <Card title="Jadwal Studio" subtitle="Pantau slot jam 08:00 - 21:00">
        <p className="text-xs text-gray-500">Tanggal: {formatDateServerClock(`${date}T00:00:00.000Z`)}</p>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="secondary" onClick={() => setDate((prev) => addDays(prev, -1))}>
            ← Kemarin
          </Button>
          <Button variant="ghost" onClick={() => setDate(new Date().toISOString().slice(0, 10))}>
            Hari ini
          </Button>
          <Button variant="secondary" onClick={() => setDate((prev) => addDays(prev, 1))}>
            Besok →
          </Button>
          <Input type="date" value={date} onChange={(event) => setDate(event.target.value)} className="w-44" />
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {STUDIO_TYPE_ORDER.map((type) => (
            <Button
              key={type}
              size="sm"
              variant={activeStudioType === type ? 'primary' : 'secondary'}
              onClick={() => setActiveStudioType(type)}
            >
              {STUDIO_LABEL_BY_TYPE[type]}
            </Button>
          ))}
        </div>

        <div className="mt-4 rounded-xl border border-gray-200 bg-white p-3">
          <div className="space-y-2">
            {hours.map((hour) => {
              const slot = studioData?.slots?.find((item) => item.time.startsWith(hour))
              const booking = slot?.booking

              return (
                <div key={hour} className="flex gap-3">
                  <div className="w-14 pt-2 text-xs font-medium text-gray-500">{hour}:00</div>
                  <div className="relative flex-1 pb-2">
                    <div className="absolute left-0 top-0 h-full w-px bg-gray-200" />
                    <div className="absolute left-[-4px] top-3 h-2 w-2 rounded-full bg-gray-300" />
                    {!slot || slot.available ? (
                      <button
                        className="ml-4 w-[calc(100%-1rem)] rounded-lg border border-dashed border-gray-200 bg-gray-50 px-3 py-2 text-left text-xs text-gray-500"
                        onClick={() =>
                          router.push(`/dashboard/bookings/new?date=${date}&studioType=${activeStudioType}&time=${hour}:00`)
                        }
                      >
                        Slot kosong
                      </button>
                    ) : (
                      <button
                        className={`ml-4 w-[calc(100%-1rem)] rounded-lg px-3 py-2 text-left text-xs ${bookingStatusColor[(booking?.status || 'confirmed') as keyof typeof bookingStatusColor]}`}
                        onClick={() => setSelectedBooking(booking || null)}
                      >
                        <p className="font-semibold">{booking?.guestName || booking?.user?.name || 'Booking'}</p>
                        <p>{booking?.package?.name || '-'}</p>
                        <p className="opacity-80">
                          {booking?.startTime ? formatTimeServerClock(booking.startTime) : hour}:00
                          {' - '}
                          {booking?.endTime
                            ? formatTimeServerClock(booking.endTime)
                            : `${String(Number(hour) + 1).padStart(2, '0')}:00`}
                        </p>
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </Card>

      <BookingDetailModal
        isOpen={!!selectedBooking}
        onClose={() => setSelectedBooking(null)}
        booking={selectedBooking}
        role={user.role}
      />
    </div>
  )
}
