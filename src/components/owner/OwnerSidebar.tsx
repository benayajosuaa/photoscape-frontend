'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { MdBarChart, MdCalendarToday, MdDashboard, MdHistory, MdManageAccounts, MdPayment, MdPeople, MdSettings, MdViewWeek } from 'react-icons/md'
import { Button } from '@/components/ui/Button'
import { getInitials } from '@/lib/utils'
import type { User } from '@/types'

const items = [
  { label: 'Dashboard', href: '/owner/dashboard', icon: MdDashboard },
  { label: 'Booking Management', href: '/owner/bookings', icon: MdCalendarToday },
  { label: 'Schedule Studio', href: '/owner/schedule', icon: MdViewWeek },
  { label: 'Transactions', href: '/owner/transactions', icon: MdPayment },
  { label: 'Customers', href: '/owner/customers', icon: MdPeople },
  { label: 'Staff Management', href: '/owner/staff', icon: MdManageAccounts },
  { label: 'Reports', href: '/owner/reports', icon: MdBarChart },
  { label: 'Audit Logs', href: '/owner/logs', icon: MdHistory },
  { label: 'Settings', href: '/owner/settings', icon: MdSettings },
]

export function OwnerSidebar({ user, onLogout }: { user: User; onLogout: () => void }) {
  const pathname = usePathname()

  return (
    <aside className="flex h-full w-64 flex-col bg-gray-900 p-4 text-white">
      <div className="mb-6 border-b border-white/15 pb-4">
        <p className="text-lg font-semibold tracking-wide">Photoscape</p>
        <p className="text-xs text-gray-300">Owner Admin Panel</p>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto">
        {items.map((item) => {
          const Icon = item.icon
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${
                active ? 'bg-white text-gray-900' : 'text-gray-200 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Icon className="text-lg" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="mt-4 border-t border-white/15 pt-4">
        <div className="mb-3 flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-full bg-white/20 text-xs font-semibold">{getInitials(user.name || 'Owner')}</div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{user.name}</p>
            <p className="text-xs text-gray-300">{user.role}</p>
          </div>
        </div>
        <Button variant="secondary" size="sm" className="w-full border-white text-white hover:bg-white/15" onClick={onLogout}>
          Logout
        </Button>
      </div>
    </aside>
  )
}
