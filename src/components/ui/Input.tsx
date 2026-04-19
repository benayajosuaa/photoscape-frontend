import type { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <label className="block">
      {label ? <span className="mb-1.5 block text-sm font-medium text-gray-700">{label}</span> : null}
      <input
        className={`w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 outline-none ring-0 transition focus:border-gray-900 ${className}`}
        {...props}
      />
      {error ? <span className="mt-1 block text-xs text-red-600">{error}</span> : null}
    </label>
  )
}
