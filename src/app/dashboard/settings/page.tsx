'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Table } from '@/components/ui/Table'
import { useAuth } from '@/hooks/useAuth'
import { apiFetch } from '@/lib/api'
import { formatRupiah } from '@/lib/utils'
import type { Package, Studio } from '@/types'

export default function SettingsPage() {
  const router = useRouter()
  const { user } = useAuth({ requireAuth: true })
  const [tab, setTab] = useState<'studio' | 'package' | 'hours'>('studio')
  const [studios, setStudios] = useState<Studio[]>([])
  const [packages, setPackages] = useState<Package[]>([])
  const [hours, setHours] = useState<Record<string, { open: string; close: string; closed: boolean }>>({})

  const load = async () => {
    const [studioRes, packageRes, hoursRes] = await Promise.all([
      apiFetch<{ data: Studio[] }>('/api/studios').catch(() => Promise.resolve({ data: [] })),
      apiFetch<{ data: Package[] }>('/api/packages').catch(() => Promise.resolve({ data: [] })),
      apiFetch<{ data: Record<string, { open: string; close: string; closed: boolean }> }>('/api/settings/hours').catch(() =>
        Promise.resolve({ data: {} }),
      ),
    ])
    setStudios(studioRes.data || [])
    setPackages(packageRes.data || [])
    setHours(hoursRes.data || {})
  }

  useEffect(() => {
    if (user && user.role !== 'owner') router.replace('/dashboard/overview')
  }, [router, user])

  useEffect(() => {
    if (user?.role === 'owner') void load()
  }, [user])

  if (!user || user.role !== 'owner') return null

  return (
    <div className="space-y-4">
      <Card title="Pengaturan" subtitle="Studio, paket, dan jam operasional">
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant={tab === 'studio' ? 'primary' : 'secondary'} onClick={() => setTab('studio')}>
            Studio
          </Button>
          <Button size="sm" variant={tab === 'package' ? 'primary' : 'secondary'} onClick={() => setTab('package')}>
            Paket Layanan
          </Button>
          <Button size="sm" variant={tab === 'hours' ? 'primary' : 'secondary'} onClick={() => setTab('hours')}>
            Jam Operasional
          </Button>
        </div>
      </Card>

      {tab === 'studio' ? (
        <Card>
          <Table
            data={studios as unknown as Record<string, unknown>[]}
            columns={[
              { key: 'name', label: 'Nama' },
              { key: 'capacity', label: 'Kapasitas' },
              { key: 'status', label: 'Status', render: (item) => ((item as unknown as Studio).isActive ? 'Aktif' : 'Nonaktif') },
              {
                key: 'action',
                label: 'Aksi',
                render: (item) => (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={async () => {
                      const studio = item as unknown as Studio
                      await apiFetch(`/api/studios/${studio.id}`, {
                        method: 'PUT',
                        body: JSON.stringify({ isActive: !studio.isActive }),
                      }).catch(() => null)
                      await load()
                    }}
                  >
                    Toggle Aktif
                  </Button>
                ),
              },
            ]}
          />
        </Card>
      ) : null}

      {tab === 'package' ? (
        <Card>
          <p className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
            Family Lite hanya Studio K1. Family Deluxe & Premium hanya Studio K2.
          </p>
          <Table
            data={packages as unknown as Record<string, unknown>[]}
            columns={[
              { key: 'name', label: 'Nama' },
              { key: 'price', label: 'Harga', render: (item) => formatRupiah((item as unknown as Package).price) },
              { key: 'durationMin', label: 'Durasi (menit)' },
              { key: 'maxPax', label: 'Maks Peserta' },
              {
                key: 'studios',
                label: 'Studio Diizinkan',
                render: (item) => ((item as unknown as Package).studios || []).map((studio) => studio.name).join(', ') || '-',
              },
            ]}
          />
        </Card>
      ) : null}

      {tab === 'hours' ? (
        <Card>
          <div className="space-y-3">
            {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
              <div key={day} className="grid gap-2 rounded-lg border border-gray-200 p-3 md:grid-cols-4">
                <p className="text-sm font-medium capitalize text-gray-800">{day}</p>
                <Input
                  type="time"
                  value={hours[day]?.open || '08:00'}
                  onChange={(event) =>
                    setHours((prev) => ({ ...prev, [day]: { ...prev[day], open: event.target.value, close: prev[day]?.close || '21:00', closed: prev[day]?.closed || false } }))
                  }
                />
                <Input
                  type="time"
                  value={hours[day]?.close || '21:00'}
                  onChange={(event) =>
                    setHours((prev) => ({ ...prev, [day]: { ...prev[day], close: event.target.value, open: prev[day]?.open || '08:00', closed: prev[day]?.closed || false } }))
                  }
                />
                <Select
                  value={hours[day]?.closed ? 'closed' : 'open'}
                  onChange={(event) =>
                    setHours((prev) => ({ ...prev, [day]: { ...prev[day], closed: event.target.value === 'closed', open: prev[day]?.open || '08:00', close: prev[day]?.close || '21:00' } }))
                  }
                  options={[
                    { label: 'Buka', value: 'open' },
                    { label: 'Libur', value: 'closed' },
                  ]}
                />
              </div>
            ))}
          </div>
          <div className="mt-4">
            <Button
              onClick={async () => {
                await apiFetch('/api/settings/hours', { method: 'PUT', body: JSON.stringify(hours) }).catch(() => null)
              }}
            >
              Simpan Jam Operasional
            </Button>
          </div>
        </Card>
      ) : null}
    </div>
  )
}
