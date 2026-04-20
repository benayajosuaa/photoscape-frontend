import type { Role, User } from '@/types'

const TOKEN_KEY = 'photoscape_token'
const USER_KEY = 'photoscape_user'

export function normalizeRole(role: string | undefined): Role {
  if (role === 'admin') return 'staff'
  if (role === 'cashier') return 'cashier'
  if (role === 'staff' || role === 'manager' || role === 'owner' || role === 'customer' || role === 'cashier') return role
  return 'customer'
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(TOKEN_KEY)
}

export function getUser(): User | null {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem(USER_KEY)
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as User & { role?: string }
    return {
      ...parsed,
      role: normalizeRole(parsed.role),
    }
  } catch {
    return null
  }
}

export function setAuth(token: string, user: User) {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function clearDashboardAuth() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

export function clearAuth() {
  clearDashboardAuth()
  localStorage.removeItem('authToken')
  localStorage.removeItem('token')
  localStorage.removeItem('accessToken')
  localStorage.removeItem('authUser')
}

export function hasRole(user: User | null, roles: Role[]): boolean {
  if (!user) return false
  return roles.includes(user.role)
}
