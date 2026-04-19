'use client'

import { useCallback, useEffect, useState } from 'react'
import { apiFetch, toQuery } from '@/lib/api'
import { normalizeBookingList } from '@/lib/booking-adapter'
import type { Booking, PaginatedResponse } from '@/types'

interface BookingParams {
  page?: number
  limit?: number
  status?: string
  studioId?: string
  date?: string
  search?: string
  isWalkIn?: string
  paymentStatus?: string
}

export function useBookings(initialParams: BookingParams = {}) {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [total, setTotal] = useState(0)
  const [params, setParams] = useState<BookingParams>(initialParams)

  const fetchBookings = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const query = toQuery({ page: 1, limit: 20, ...params })
      let res: unknown
      try {
        res = await apiFetch<unknown>(`/api/bookings?${query}`)
      } catch {
        res = await apiFetch<unknown>(`/api/admin/bookings?${query}`)
      }

      let normalizedBookings: Booking[] = []
      let normalizedTotal = 0

      const payload = res as
        | PaginatedResponse<Booking>
        | { data?: Booking[] | { bookings?: Booking[]; total?: number }; total?: number }

      if (Array.isArray(payload?.data)) {
        normalizedBookings = normalizeBookingList(payload.data)
        normalizedTotal = payload.total || payload.data.length
      } else if (payload?.data && typeof payload.data === 'object' && Array.isArray(payload.data.bookings)) {
        normalizedBookings = normalizeBookingList(payload.data.bookings)
        normalizedTotal = payload.data.total || payload.total || payload.data.bookings.length
      }

      setBookings(normalizedBookings)
      setTotal(normalizedTotal)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat booking')
      setBookings([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }, [params])

  useEffect(() => {
    void fetchBookings()
  }, [fetchBookings])

  return {
    bookings,
    loading,
    error,
    total,
    params,
    setParams,
    refresh: fetchBookings,
  }
}
