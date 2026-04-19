'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Select } from '@/components/ui/Select'
import { Table } from '@/components/ui/Table'
import { useAuth } from '@/hooks/useAuth'
import { apiFetch } from '@/lib/api'
import type { User } from '@/types'

export default function StaffPage() {
  const router = useRouter()
  const { user } = useAuth({ requireAuth: true })
  const [items, setItems] = useState<User[]>([])
  const [openCreate, setOpenCreate] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'staff' })

  const load = async () => {
    const res = await apiFetch<{ data: User[] }>('/api/users?role=staff,manager').catch(() => Promise.resolve({ data: [] }))
    setItems(res.data || [])
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
      <Card title="Manajemen Staff" subtitle="Kelola akun staff dan manager" right={<Button onClick={() => setOpenCreate(true)}>Tambah Staff</Button>}>
        <Table
          data={items as unknown as Record<string, unknown>[]}
          columns={[
            { key: 'name', label: 'Nama' },
            { key: 'email', label: 'Email' },
            { key: 'role', label: 'Role' },
            { key: 'status', label: 'Status', render: (item) => ((item as unknown as User).isActive ?? true ? 'Aktif' : 'Nonaktif') },
            { key: 'lastLogin', label: 'Last Login', render: () => '-' },
            {
              key: 'action',
              label: 'Aksi',
              render: (item) => {
                const row = item as unknown as User
                return (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={async () => {
                        const role = row.role === 'staff' ? 'manager' : 'staff'
                        await apiFetch(`/api/users/${row.id}`, { method: 'PUT', body: JSON.stringify({ role }) }).catch(() => null)
                        await load()
                      }}
                    >
                      Edit Role
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={async () => {
                        await apiFetch(`/api/users/${row.id}/status`, {
                          method: 'PUT',
                          body: JSON.stringify({ isActive: !(row.isActive ?? true) }),
                        }).catch(() => null)
                        await load()
                      }}
                    >
                      Aktif/Nonaktif
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={async () => {
                        await apiFetch(`/api/users/${row.id}/reset-password`, { method: 'POST' }).catch(() => null)
                      }}
                    >
                      Reset Password
                    </Button>
                  </div>
                )
              },
            },
          ]}
        />
      </Card>

      <Modal
        isOpen={openCreate}
        onClose={() => setOpenCreate(false)}
        title="Tambah Staff"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setOpenCreate(false)}>
              Batal
            </Button>
            <Button
              onClick={async () => {
                await apiFetch('/api/users', { method: 'POST', body: JSON.stringify(form) }).catch(() => null)
                setOpenCreate(false)
                await load()
              }}
            >
              Simpan
            </Button>
          </div>
        }
      >
        <div className="space-y-3">
          <Input label="Nama" value={form.name} onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))} />
          <Input label="Email" value={form.email} onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))} />
          <Input
            label="Password"
            type="password"
            value={form.password}
            onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
          />
          <Select
            label="Role"
            value={form.role}
            onChange={(event) => setForm((prev) => ({ ...prev, role: event.target.value }))}
            options={[
              { label: 'Staff', value: 'staff' },
              { label: 'Manager', value: 'manager' },
            ]}
          />
        </div>
      </Modal>
    </div>
  )
}
