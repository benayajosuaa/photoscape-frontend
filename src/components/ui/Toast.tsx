'use client'

import { useEffect } from 'react'

type ToastType = 'success' | 'error'

interface ToastProps {
  show: boolean
  message: string
  type?: ToastType
  onClose: () => void
}

export function Toast({ show, message, type = 'success', onClose }: ToastProps) {
  useEffect(() => {
    if (!show) return
    const id = window.setTimeout(onClose, 3000)
    return () => window.clearTimeout(id)
  }, [show, onClose])

  if (!show) return null

  return (
    <div className="fixed right-4 top-4 z-[60]">
      <div
        className={`rounded-xl border px-4 py-3 text-sm shadow-lg ${
          type === 'success'
            ? 'border-green-200 bg-green-50 text-green-800'
            : 'border-red-200 bg-red-50 text-red-800'
        }`}
      >
        {message}
      </div>
    </div>
  )
}
