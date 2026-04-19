'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'

interface RescheduleModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (payload: { date: string; time: string; reason: string }) => Promise<void>
  slots: string[]
  loading?: boolean
}

export function RescheduleModal({ isOpen, onClose, onSubmit, slots, loading }: RescheduleModalProps) {
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [reason, setReason] = useState('')

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Ubah Jadwal Booking"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Batal
          </Button>
          <Button
            loading={loading}
            onClick={() => {
              if (!date || !time || !reason.trim()) return
              void onSubmit({ date, time, reason })
            }}
          >
            Simpan Jadwal
          </Button>
        </div>
      }
    >
      <div className="space-y-3">
        <Input label="Tanggal baru" type="date" value={date} onChange={(event) => setDate(event.target.value)} />
        <div>
          <p className="mb-1.5 text-sm font-medium text-gray-700">Pilih slot waktu</p>
          <div className="grid grid-cols-4 gap-2">
            {slots.map((slot) => (
              <button
                key={slot}
                className={`rounded-md border px-2 py-1 text-xs ${time === slot ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-200 bg-white text-gray-700'}`}
                onClick={() => setTime(slot)}
              >
                {slot}
              </button>
            ))}
          </div>
        </div>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-gray-700">Alasan</span>
          <textarea
            className="h-24 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
          />
        </label>
      </div>
    </Modal>
  )
}
