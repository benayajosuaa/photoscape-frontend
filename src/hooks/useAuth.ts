'use client'

import { useEffect, useMemo, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { clearAuth, getToken, getUser, hasRole } from '@/lib/auth'
import type { Role, User } from '@/types'

interface UseAuthOptions {
  requireAuth?: boolean
  allowedRoles?: Role[]
  redirectTo?: string
  unauthorizedRedirectTo?: string
}

export function useAuth(options: UseAuthOptions = {}) {
  const { requireAuth = true, allowedRoles, redirectTo = '/login', unauthorizedRedirectTo = '/dashboard/overview' } = options
  const router = useRouter()
  const pathname = usePathname()
  const allowedRolesKey = (allowedRoles ?? []).join('|')
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    const currentToken = getToken()
    const currentUser = getUser()

    if (requireAuth && !currentToken) {
      router.replace(`${redirectTo}?redirect=${encodeURIComponent(pathname || '/dashboard/overview')}`)
      setLoading(false)
      return
    }

    const allowedRoleList = allowedRolesKey ? (allowedRolesKey.split('|') as Role[]) : undefined

    if (allowedRoleList && !hasRole(currentUser, allowedRoleList)) {
      router.replace(unauthorizedRedirectTo)
      setLoading(false)
      return
    }

    setToken(currentToken)
    setUser(currentUser)
    setLoading(false)
  }, [allowedRolesKey, pathname, redirectTo, requireAuth, router, unauthorizedRedirectTo])

  const logout = () => {
    clearAuth()
    router.replace('/login')
  }

  return useMemo(
    () => ({
      loading,
      user,
      token,
      logout,
      isAuthenticated: !!token,
    }),
    [loading, token, user],
  )
}
