'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'

interface CancelModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (reason: string) => Promise<void>
  loading?: boolean
}

export function CancelModal({ isOpen, onClose, onSubmit, loading }: CancelModalProps) {
  const [reason, setReason] = useState('')

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Batalkan Booking"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Tutup
          </Button>
          <Button
            variant="danger"
            loading={loading}
            onClick={() => {
              if (!reason.trim()) return
              void onSubmit(reason)
            }}
          >
            Batalkan Booking
          </Button>
        </div>
      }
    >
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-gray-700">Alasan pembatalan</span>
        <textarea
          className="h-28 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          value={reason}
          onChange={(event) => setReason(event.target.value)}
        />
      </label>
    </Modal>
  )
}
