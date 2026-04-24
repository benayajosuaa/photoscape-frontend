import { getToken } from './auth'

const BASE = '/api/proxy'

function unique(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)))
}

function normalizeBase(base: string) {
  return String(base || '').trim().replace(/\/$/, '')
}

function getBaseCandidates() {
  const directBackend = normalizeBase(
    process.env.NEXT_PUBLIC_BACKEND_PUBLIC_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      process.env.NEXT_PUBLIC_BACKEND_URL ||
      ''
  )

  const isLocalBackend = /^(http:\/\/)?(localhost|127\.0\.0\.1)(:\d+)?$/i.test(directBackend)
  return isLocalBackend ? unique([directBackend, BASE]) : unique([BASE, directBackend])
}

async function performFetch(path: string, options?: RequestInit) {
  const bases = getBaseCandidates()
  let lastNetworkError: unknown = null

  for (let index = 0; index < bases.length; index += 1) {
    const base = bases[index]
    try {
      const response = await fetch(`${base}${path}`, options)
      const hasNextCandidate = index < bases.length - 1

      // If proxy/backend gives 5xx, try next candidate before failing hard.
      if (response.status >= 500 && hasNextCandidate) {
        continue
      }

      return response
    } catch (error) {
      lastNetworkError = error
    }
  }

  if (lastNetworkError instanceof Error) {
    throw new Error('Tidak bisa terhubung ke server API. Pastikan backend aktif dan URL API benar.')
  }
  throw new Error('Koneksi ke server API gagal.')
}

export function toQuery(params: Record<string, string | number | undefined | null>) {
  const qs = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && `${value}`.trim() !== '') qs.set(key, String(value))
  })
  return qs.toString()
}

export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getToken()
  const res = await performFetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || err.message || `HTTP ${res.status}`)
  }

  return res.json() as Promise<T>
}

export async function apiFetchPublic<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await performFetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || err.message || `HTTP ${res.status}`)
  }

  return res.json() as Promise<T>
}

export async function apiFetchBlob(path: string, options?: RequestInit): Promise<Blob> {
  const token = getToken()
  const res = await performFetch(path, {
    ...options,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  })

  if (!res.ok) {
    throw new Error(`Gagal export file (${res.status})`)
  }

  return res.blob()
}
