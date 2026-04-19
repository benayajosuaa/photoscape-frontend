'use client'

import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import type { Booking, PaymentMethod } from '@/types'

interface TransactionFormProps {
  bookings: Booking[]
  onSubmit: (payload: { bookingId: string; method: PaymentMethod; amount: number; proofUrl?: string }) => Promise<void>
}

export function TransactionForm({ bookings, onSubmit }: TransactionFormProps) {
  const [bookingId, setBookingId] = useState('')
  const [method, setMethod] = useState<PaymentMethod>('cash')
  const [amount, setAmount] = useState('0')
  const [proofUrl, setProofUrl] = useState('')
  const [loading, setLoading] = useState(false)

  const selectedBooking = useMemo(() => bookings.find((item) => item.id === bookingId), [bookings, bookingId])

  return (
    <form
      className="space-y-3"
      onSubmit={async (event) => {
        event.preventDefault()
        setLoading(true)
        try {
          await onSubmit({
            bookingId,
            method,
            amount: Number(amount || selectedBooking?.package.price || 0),
            proofUrl: proofUrl || undefined,
          })
        } finally {
          setLoading(false)
        }
      }}
    >
      <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
        Transaksi yang sudah dicatat tidak dapat diubah.
      </p>
      <Select
        label="Pilih booking"
        value={bookingId}
        onChange={(event) => {
          const value = event.target.value
          setBookingId(value)
          const booking = bookings.find((item) => item.id === value)
          if (booking) setAmount(String(booking.package?.price || 0))
        }}
        options={[
          { label: 'Pilih booking', value: '' },
          ...bookings.map((booking) => ({
            value: booking.id,
            label: `${booking.bookingCode} - ${booking.user?.name || booking.guestName || '-'}`,
          })),
        ]}
      />
      <Select
        label="Metode"
        value={method}
        onChange={(event) => setMethod(event.target.value as PaymentMethod)}
        options={[
          { label: 'Tunai', value: 'cash' },
          { label: 'QRIS', value: 'qris' },
          { label: 'Transfer', value: 'transfer' },
          { label: 'Virtual Account', value: 'va' },
        ]}
      />
      <Input label="Jumlah" type="number" value={amount} onChange={(event) => setAmount(event.target.value)} />
      <Input label="Bukti URL (opsional)" value={proofUrl} onChange={(event) => setProofUrl(event.target.value)} />
      <Button type="submit" className="w-full" loading={loading}>
        Simpan Transaksi
      </Button>
    </form>
  )
}
