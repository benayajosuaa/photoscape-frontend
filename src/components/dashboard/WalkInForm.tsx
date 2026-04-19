'use client'

import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import type { Package, Studio } from '@/types'

interface WalkInFormProps {
  packages: Package[]
  studios: Studio[]
  onSubmit: (payload: {
    guestName: string
    guestPhone?: string
    packageId: string
    studioId: string
    paxCount: number
  }) => Promise<void>
}

export function WalkInForm({ packages, studios, onSubmit }: WalkInFormProps) {
  const [guestName, setGuestName] = useState('')
  const [guestPhone, setGuestPhone] = useState('')
  const [packageId, setPackageId] = useState('')
  const [studioId, setStudioId] = useState('')
  const [paxCount, setPaxCount] = useState(1)
  const [loading, setLoading] = useState(false)

  const allowedStudios = useMemo(() => {
    const selectedPackage = packages.find((item) => item.id === packageId)
    if (!selectedPackage?.studios?.length) return studios
    const allowedIds = new Set(selectedPackage.studios.map((studio) => studio.id))
    return studios.filter((studio) => allowedIds.has(studio.id))
  }, [packageId, packages, studios])

  return (
    <form
      className="space-y-3"
      onSubmit={async (event) => {
        event.preventDefault()
        setLoading(true)
        try {
          await onSubmit({ guestName, guestPhone, packageId, studioId, paxCount })
          setGuestName('')
          setGuestPhone('')
          setPackageId('')
          setStudioId('')
          setPaxCount(1)
        } finally {
          setLoading(false)
        }
      }}
    >
      <Input label="Nama tamu" value={guestName} onChange={(event) => setGuestName(event.target.value)} required />
      <Input label="No. HP" value={guestPhone} onChange={(event) => setGuestPhone(event.target.value)} />
      <Select
        label="Paket"
        value={packageId}
        onChange={(event) => setPackageId(event.target.value)}
        options={[{ label: 'Pilih paket', value: '' }, ...packages.map((item) => ({ label: item.name, value: item.id }))]}
        required
      />
      <Select
        label="Studio"
        value={studioId}
        onChange={(event) => setStudioId(event.target.value)}
        options={[{ label: 'Pilih studio', value: '' }, ...allowedStudios.map((item) => ({ label: item.name, value: item.id }))]}
        required
      />
      <Input
        label="Jumlah peserta"
        type="number"
        min={1}
        value={String(paxCount)}
        onChange={(event) => setPaxCount(Number(event.target.value))}
      />
      <Button loading={loading} className="w-full" type="submit">
        Buat Walk-in
      </Button>
    </form>
  )
}
