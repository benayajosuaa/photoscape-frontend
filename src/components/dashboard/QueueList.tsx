'use client'

import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { bookingStatusColor, bookingStatusLabel, formatTime } from '@/lib/utils'
import type { Booking } from '@/types'

interface QueueListProps {
  items: Booking[]
  onStart: (bookingId: string) => Promise<void>
  onComplete: (bookingId: string) => Promise<void>
}

export function QueueList({ items, onStart, onComplete }: QueueListProps) {
  return (
    <Card title="Antrian Aktif Hari Ini">
      <div className="space-y-2">
        {items.length === 0 ? <p className="text-sm text-gray-500">Belum ada antrian aktif.</p> : null}
        {items.map((item, index) => (
          <div key={item.id} className="rounded-lg border border-gray-200 p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-gray-900">#{index + 1} - {item.guestName || item.user?.name || '-'}</p>
                <p className="text-xs text-gray-500">{item.package?.name} • {item.studio?.name} • {formatTime(item.startTime)}</p>
              </div>
              <Badge className={bookingStatusColor[item.status]}>{bookingStatusLabel[item.status]}</Badge>
            </div>
            <div className="mt-3 flex gap-2">
              <Button size="sm" variant="secondary" onClick={() => void onStart(item.id)}>
                Mulai Sesi
              </Button>
              <Button size="sm" onClick={() => void onComplete(item.id)}>
                Selesai
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
