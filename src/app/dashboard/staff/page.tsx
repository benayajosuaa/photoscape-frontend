'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function DashboardStaffPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/dashboard/overview')
  }, [router])

  return null
}
