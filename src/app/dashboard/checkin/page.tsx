'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { MdCameraAlt, MdQrCodeScanner } from 'react-icons/md'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Toast } from '@/components/ui/Toast'
import { useAuth } from '@/hooks/useAuth'
import { apiFetch } from '@/lib/api'
import { formatDateTimeServerClock } from '@/lib/utils'

type BarcodeDetectorCtor = {
  new (options?: { formats?: string[] }): {
    detect: (source: ImageBitmapSource) => Promise<Array<{ rawValue?: string }>>
  }
  getSupportedFormats?: () => Promise<string[]>
}

type AdminBookingSearchItem = {
  bookingId: string
  bookingCode: string
  customer?: { name?: string }
  status?: { booking?: string }
  schedule?: { startTime?: string }
  ticket?: { qrCode?: string; status?: string; scannedAt?: string | null }
}

const QR_PREFIX = 'PHOTOSCAPE-TICKET:'
const AUTO_SCAN_COOLDOWN_MS = 2500

function parseBookingCode(raw: string) {
  const value = raw.trim()
  if (!value) return ''
  if (value.startsWith(QR_PREFIX)) {
    return value.replace(QR_PREFIX, '').trim()
  }
  return value
}

function normalizeQrValue(value?: string) {
  if (!value) return ''
  return value.trim().toLowerCase()
}

export default function CheckinPage() {
  const router = useRouter()
  const { user } = useAuth({
    requireAuth: true,
    allowedRoles: ['staff', 'owner'],
    unauthorizedRedirectTo: '/dashboard/overview',
  })

  const videoRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const rafRef = useRef<number | null>(null)
  const scanActiveRef = useRef(false)
  const autoLookupLockRef = useRef(false)
  const lastAutoProcessedCodeRef = useRef('')
  const lastAutoProcessedAtRef = useRef(0)

  const [manualCode, setManualCode] = useState('')
  const [scanValue, setScanValue] = useState('')
  const [cameraActive, setCameraActive] = useState(false)
  const [cameraError, setCameraError] = useState('')
  const [processing, setProcessing] = useState(false)
  const [result, setResult] = useState<AdminBookingSearchItem | null>(null)
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({
    show: false,
    message: '',
    type: 'success',
  })

  const bookingCode = useMemo(() => parseBookingCode(scanValue || manualCode), [scanValue, manualCode])

  const stopCamera = useCallback(() => {
    scanActiveRef.current = false
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    setCameraActive(false)
  }, [])

  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [stopCamera])

  const findBookingByCode = async (rawInput: string) => {
    const code = parseBookingCode(rawInput)
    if (!code) throw new Error('Kode tiket wajib diisi.')

    const response = await apiFetch<{ data?: { bookings?: AdminBookingSearchItem[] } }>(
      `/api/admin/bookings?search=${encodeURIComponent(code)}`,
    )

    const bookings = response.data?.bookings || []
    if (!bookings.length) throw new Error('Booking tidak ditemukan untuk kode tersebut.')

    const normalizedCode = code.toLowerCase()
    const rawCandidates = [normalizeQrValue(rawInput), normalizeQrValue(`${QR_PREFIX}${code}`)]

    const match =
      bookings.find((item) => item.bookingCode?.toLowerCase() === normalizedCode) ||
      bookings.find((item) => rawCandidates.includes(normalizeQrValue(item.ticket?.qrCode))) ||
      bookings[0]

    return match
  }

  const handleCheck = async (rawInput?: string, source: 'manual' | 'auto' = 'manual') => {
    const input = rawInput || scanValue || manualCode
    setProcessing(true)
    try {
      const booking = await findBookingByCode(input)
      setResult(booking)
      if (source === 'manual') {
        setToast({ show: true, message: `Booking ${booking.bookingCode} ditemukan.`, type: 'success' })
      }
    } catch (error) {
      setResult(null)
      setToast({ show: true, message: error instanceof Error ? error.message : 'Gagal mencari booking.', type: 'error' })
    } finally {
      autoLookupLockRef.current = false
      setProcessing(false)
    }
  }

  const startCamera = async () => {
    setCameraError('')

    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError('Browser tidak mendukung akses kamera. Gunakan input kode manual.')
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false,
      })

      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      setCameraActive(true)
      scanActiveRef.current = true

      const detectorClass = (window as Window & { BarcodeDetector?: BarcodeDetectorCtor }).BarcodeDetector
      if (!detectorClass) {
        setCameraError('Auto scan tidak didukung browser ini. Gunakan input kode manual.')
        return
      }

      const detector = new detectorClass({ formats: ['qr_code', 'code_128', 'code_39', 'ean_13'] })

      const scan = async () => {
        if (!videoRef.current || !scanActiveRef.current) return
        try {
          const barcodes = await detector.detect(videoRef.current)
          const raw = barcodes.find((item) => item.rawValue)?.rawValue
          if (raw) {
            setScanValue(raw)
            setManualCode(raw)

            const code = parseBookingCode(raw)
            if (code) {
              const normalizedCode = code.toLowerCase()
              const now = Date.now()
              const sameCodeWithinCooldown =
                lastAutoProcessedCodeRef.current === normalizedCode &&
                now - lastAutoProcessedAtRef.current < AUTO_SCAN_COOLDOWN_MS

              if (!autoLookupLockRef.current && !sameCodeWithinCooldown) {
                autoLookupLockRef.current = true
                lastAutoProcessedCodeRef.current = normalizedCode
                lastAutoProcessedAtRef.current = now
                void handleCheck(raw, 'auto')
              }
            }
          }
        } catch {
          // keep scanning without breaking the camera stream
        }
        rafRef.current = requestAnimationFrame(scan)
      }

      rafRef.current = requestAnimationFrame(scan)
    } catch {
      setCameraError('Izin kamera ditolak atau kamera tidak tersedia.')
      stopCamera()
    }
  }

  const handleUseTicket = async () => {
    if (!result?.bookingId) {
      setToast({ show: true, message: 'Pilih booking tiket terlebih dahulu.', type: 'error' })
      return
    }

    if (result.status?.booking === 'completed' || result.ticket?.status === 'used') {
      setToast({ show: true, message: 'Tiket ini sudah pernah digunakan.', type: 'error' })
      return
    }

    if (result.status?.booking !== 'confirmed') {
      setToast({ show: true, message: 'Hanya booking berstatus confirmed yang bisa di-use.', type: 'error' })
      return
    }

    setProcessing(true)
    try {
      await apiFetch(`/api/admin/bookings/${result.bookingId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: 'completed',
          reason: 'Ticket used via dashboard scanner',
        }),
      })

      const refreshed = await findBookingByCode(result.bookingCode)
      setResult(refreshed)
      setToast({ show: true, message: 'Tiket berhasil di-use dan status booking menjadi completed.', type: 'success' })
    } catch (error) {
      setToast({ show: true, message: error instanceof Error ? error.message : 'Gagal memproses tiket.', type: 'error' })
    } finally {
      setProcessing(false)
    }
  }

  useEffect(() => {
    if (!user) return
    if (user.role !== 'staff' && user.role !== 'owner') {
      router.replace('/dashboard/overview')
    }
  }, [router, user])

  if (!user || (user.role !== 'staff' && user.role !== 'owner')) return null

  return (
    <div className="space-y-4">
      <Toast show={toast.show} message={toast.message} type={toast.type} onClose={() => setToast((prev) => ({ ...prev, show: false }))} />

      <Card title="Scan Tiket" subtitle="Scan barcode tiket user/client atau input kode booking manual.">
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-3 rounded-xl border border-gray-200 p-3">
            <p className="text-sm font-medium text-gray-800">Scanner Kamera</p>
            <div className="overflow-hidden rounded-lg border border-gray-200 bg-black">
              <video ref={videoRef} className="h-64 w-full object-cover" muted playsInline />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => void startCamera()} variant="secondary">
                <MdCameraAlt /> Aktifkan Kamera
              </Button>
              <Button onClick={stopCamera} variant="ghost">
                Stop Kamera
              </Button>
            </div>
            {cameraActive ? <p className="text-xs text-green-700">Kamera aktif, arahkan ke barcode tiket.</p> : null}
            {cameraError ? <p className="text-xs text-amber-700">{cameraError}</p> : null}
          </div>

          <div className="space-y-3 rounded-xl border border-gray-200 p-3">
            <p className="text-sm font-medium text-gray-800">Input Kode</p>
            <Input
              label="Kode tiket / booking code"
              placeholder="Contoh: PHOTOSCAPE-TICKET:PS-260418-1234"
              value={manualCode}
              onChange={(event) => setManualCode(event.target.value)}
            />
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => void handleCheck()} loading={processing}>
                <MdQrCodeScanner /> Cek Tiket
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setManualCode('')
                  setScanValue('')
                  setResult(null)
                  autoLookupLockRef.current = false
                  lastAutoProcessedCodeRef.current = ''
                  lastAutoProcessedAtRef.current = 0
                }}
              >
                Reset
              </Button>
            </div>
            <p className="text-xs text-gray-500">Booking code terbaca: <span className="font-medium text-gray-800">{bookingCode || '-'}</span></p>
          </div>
        </div>
      </Card>

      <Card title="Hasil Validasi Tiket">
        {!result ? (
          <p className="text-sm text-gray-500">Belum ada tiket yang divalidasi.</p>
        ) : (
          <div className="space-y-2 text-sm">
            <p><span className="font-medium">Booking Code:</span> {result.bookingCode}</p>
            <p><span className="font-medium">Nama Customer:</span> {result.customer?.name || '-'}</p>
            <p><span className="font-medium">Status Booking:</span> {result.status?.booking || '-'}</p>
            <p><span className="font-medium">Status Ticket:</span> {result.ticket?.status || '-'}</p>
            <p><span className="font-medium">Jadwal:</span> {result.schedule?.startTime ? formatDateTimeServerClock(result.schedule.startTime) : '-'}</p>
            <p><span className="font-medium">Scanned At:</span> {result.ticket?.scannedAt ? formatDateTimeServerClock(result.ticket.scannedAt) : '-'}</p>

            <div className="pt-2">
              <Button onClick={() => void handleUseTicket()} loading={processing}>
                Use Ticket
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
