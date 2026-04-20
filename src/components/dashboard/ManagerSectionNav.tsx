'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const items = [
  { href: '/dashboard/manager', label: 'Dashboard' },
  { href: '/dashboard/manager/bookings', label: 'Daftar Booking' },
  { href: '/dashboard/manager/studios', label: 'Laporan Studio' },
  { href: '/dashboard/manager/transactions', label: 'Laporan Transaksi' },
  { href: '/dashboard/manager/logs', label: 'Activity Log' },
]

export function ManagerSectionNav() {
  const pathname = usePathname()

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => {
        const active = pathname === item.href
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
              active ? 'bg-gray-900 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            {item.label}
          </Link>
        )
      })}
    </div>
  )
}
