import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { bookingStatusColor, bookingStatusLabel } from '@/lib/utils'
import type { ScheduleSlot } from '@/types'

interface StudioTimelineProps {
  schedules: ScheduleSlot[]
}

export function StudioTimeline({ schedules }: StudioTimelineProps) {
  return (
    <Card title="Timeline Studio Hari Ini" subtitle="Slot ketersediaan per studio">
      <div className="grid gap-4 md:grid-cols-2">
        {schedules.map((studio) => (
          <div key={studio.studioId} className="rounded-xl border border-gray-200 p-3">
            <h4 className="mb-2 text-sm font-semibold text-gray-800">{studio.studioName}</h4>
            <div className="grid grid-cols-3 gap-2">
              {studio.slots.slice(0, 9).map((slot) => (
                <div
                  key={`${studio.studioId}-${slot.time}`}
                  className={`rounded-md border px-2 py-1 text-xs ${slot.available ? 'border-gray-200 bg-gray-50 text-gray-500' : 'border-blue-100 bg-blue-50 text-blue-800'}`}
                >
                  <div>{slot.time}</div>
                  {!slot.available ? (
                    <Badge className={bookingStatusColor[(slot.booking?.status || 'confirmed') as keyof typeof bookingStatusColor]}>
                      {bookingStatusLabel[(slot.booking?.status || 'confirmed') as keyof typeof bookingStatusLabel]}
                    </Badge>
                  ) : (
                    <span>Tersedia</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
