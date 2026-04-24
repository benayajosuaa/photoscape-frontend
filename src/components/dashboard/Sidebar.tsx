'use client'

import type { ComponentType } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  MdBarChart,
  MdCalendarToday,
  MdDashboard,
  MdHistory,
  MdPayment,
  MdQrCodeScanner,
  MdSettings,
  MdViewWeek,
} from 'react-icons/md'
import { Button } from '@/components/ui/Button'
import { getInitials } from '@/lib/utils'
import type { Role, User } from '@/types'

interface SidebarProps {
  user: User
  onLogout: () => void
}

interface NavItem {
  label: string
  href: string
  icon: ComponentType<{ className?: string }>
  roles: Role[]
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard/overview', icon: MdDashboard, roles: ['staff', 'owner'] },
  { label: 'Booking', href: '/dashboard/bookings', icon: MdCalendarToday, roles: ['staff', 'owner'] },
  { label: 'Jadwal Studio', href: '/dashboard/schedule', icon: MdViewWeek, roles: ['staff', 'owner'] },
  { label: 'Transaksi', href: '/dashboard/transactions', icon: MdPayment, roles: ['staff', 'owner'] },
  { label: 'Scan Tiket', href: '/dashboard/checkin', icon: MdQrCodeScanner, roles: ['staff'] },
  { label: 'Manager Dashboard', href: '/dashboard/manager', icon: MdDashboard, roles: ['manager'] },
  { label: 'Daftar Booking', href: '/dashboard/manager/bookings', icon: MdCalendarToday, roles: ['manager'] },
  { label: 'Laporan Studio', href: '/dashboard/manager/studios', icon: MdViewWeek, roles: ['manager'] },
  { label: 'Laporan Transaksi', href: '/dashboard/manager/transactions', icon: MdPayment, roles: ['manager'] },
  { label: 'Activity Log', href: '/dashboard/manager/logs', icon: MdHistory, roles: ['manager'] },
  { label: 'Laporan', href: '/dashboard/reports', icon: MdBarChart, roles: ['owner'] },
  { label: 'Activity Log', href: '/dashboard/logs', icon: MdHistory, roles: ['owner'] },
  { label: 'Pengaturan', href: '/dashboard/settings', icon: MdSettings, roles: ['owner'] },
]

export function Sidebar({ user, onLogout }: SidebarProps) {
  const pathname = usePathname()
  const visibleNavItems = navItems.filter((item) => item.roles.includes(user.role))

  const matchesPath = (href: string) => pathname === href || pathname.startsWith(`${href}/`)
  const activeHref =
    visibleNavItems
      .filter((item) => matchesPath(item.href))
      .sort((a, b) => b.href.length - a.href.length)[0]?.href ?? null

  return (
    <aside className="flex h-full w-60 flex-col bg-gray-900 p-4 text-white">
      <div className="mb-6 border-b border-white/15 pb-4">
        <p className="text-lg font-semibold tracking-wide">Photoscape</p>
        <p className="text-xs text-gray-300">Internal Dashboard</p>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto">
        {visibleNavItems.map((item) => {
          const Icon = item.icon
          const active = item.href === activeHref
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
          <div className="grid h-9 w-9 place-items-center rounded-full bg-white/20 text-xs font-semibold">
            {getInitials(user.name || 'User')}
          </div>
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
