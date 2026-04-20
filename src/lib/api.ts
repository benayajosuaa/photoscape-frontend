import { getToken } from './auth'

const BASE = '/api/proxy'

function getBaseCandidates() {
  return [BASE]
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
