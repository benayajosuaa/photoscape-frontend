'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function WalkinDeprecatedPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/dashboard/overview')
  }, [router])

  return <div className="p-4 text-sm text-gray-500">Fitur walk-in dinonaktifkan. Mengalihkan...</div>
}
