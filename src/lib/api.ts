import { getToken } from './auth'

const BASE = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL || ''

function unique(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)))
}

function withFallbackPort(base: string, fallbackPort: string) {
  try {
    const url = new URL(base)
    if (url.hostname !== 'localhost' && url.hostname !== '127.0.0.1') return ''
    url.port = fallbackPort
    return url.toString().replace(/\/$/, '')
  } catch {
    return ''
  }
}

function getBaseCandidates() {
  const bases = unique([
    BASE,
    process.env.NEXT_PUBLIC_API_URL || '',
    process.env.NEXT_PUBLIC_BACKEND_URL || '',
    'http://localhost:8080',
    'http://localhost:3001',
  ])

  const fallbacks = bases.flatMap((base) => [withFallbackPort(base, '8080'), withFallbackPort(base, '3001')])
  return unique([...bases, ...fallbacks])
}

async function performFetch(path: string, options?: RequestInit) {
  const bases = getBaseCandidates()
  let lastNetworkError: unknown = null

  for (const base of bases) {
    try {
      const response = await fetch(`${base}${path}`, options)
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
