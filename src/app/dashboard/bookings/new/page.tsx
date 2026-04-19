'use client'

import { Card } from '@/components/ui/Card'

export default function NewBookingPage() {
  return (
    <Card title="Buat Booking Baru" subtitle="Form booking internal akan diisi sesuai endpoint create booking backend.">
      <p className="text-sm text-gray-600">
        Halaman ini sudah disiapkan sebagai entry point dari dashboard overview dan schedule. Implementasi form detail booking
        dapat kita lanjutkan di iterasi berikutnya.
      </p>
    </Card>
  )
}
