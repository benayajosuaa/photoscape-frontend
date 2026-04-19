'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Header } from '@/components/dashboard/Header'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { clearDashboardAuth } from '@/lib/auth'
import { useAuth } from '@/hooks/useAuth'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, loading, logout } = useAuth({
    requireAuth: true,
    allowedRoles: ['staff', 'manager', 'owner'],
    unauthorizedRedirectTo: '/',
  })
  const [openSidebar, setOpenSidebar] = useState(false)

  useEffect(() => {
    setOpenSidebar(false)
  }, [pathname])

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login')
    }
  }, [loading, router, user])

  useEffect(() => {
    if (!loading && user && user.role === 'customer') {
      clearDashboardAuth()
      router.replace('/')
    }
  }, [loading, router, user])

  if (loading || !user) {
    return <div className="grid min-h-screen place-items-center text-sm text-gray-500">Memuat dashboard...</div>
  }

  return (
    <div className="min-h-screen bg-[#f8f7f5]">
      <div className="hidden lg:block">
        <div className="fixed left-0 top-0 z-30 h-screen w-60">
          <Sidebar user={user} onLogout={logout} />
        </div>
      </div>

      {openSidebar ? (
        <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setOpenSidebar(false)} role="presentation">
          <div className="h-full w-60" onClick={(event) => event.stopPropagation()} role="presentation">
            <Sidebar user={user} onLogout={logout} />
          </div>
        </div>
      ) : null}

      <main className="min-w-0 p-4 lg:ml-60 lg:p-6">
        <Header title="Dashboard Internal" subtitle={`Halo ${user.name}, semoga operasional hari ini lancar.`} onMenu={() => setOpenSidebar(true)} />
        {children}
      </main>
    </div>
  )
}
