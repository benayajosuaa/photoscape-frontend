'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Header } from '@/components/dashboard/Header'
import { OwnerSidebar } from '@/components/owner/OwnerSidebar'
import { clearDashboardAuth } from '@/lib/auth'
import { useAuth } from '@/hooks/useAuth'

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, loading, logout } = useAuth({
    requireAuth: true,
    allowedRoles: ['owner'],
    unauthorizedRedirectTo: '/dashboard/overview',
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
    if (!loading && user && user.role !== 'owner') {
      clearDashboardAuth()
      router.replace('/login')
    }
  }, [loading, router, user])

  if (loading || !user) {
    return <div className="grid min-h-screen place-items-center text-sm text-gray-500">Memuat owner panel...</div>
  }

  return (
    <div className="min-h-screen bg-[#f8f7f5]">
      <div className="hidden lg:block">
        <div className="fixed left-0 top-0 z-30 h-screen w-64">
          <OwnerSidebar user={user} onLogout={logout} />
        </div>
      </div>

      {openSidebar ? (
        <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setOpenSidebar(false)} role="presentation">
          <div className="h-full w-64" onClick={(event) => event.stopPropagation()} role="presentation">
            <OwnerSidebar user={user} onLogout={logout} />
          </div>
        </div>
      ) : null}

      <main className="min-w-0 p-4 lg:ml-64 lg:p-6">
        <Header title="Owner Admin Dashboard" subtitle={`Halo ${user.name}, monitoring bisnis hari ini siap.`} onMenu={() => setOpenSidebar(true)} />
        {children}
      </main>
    </div>
  )
}
