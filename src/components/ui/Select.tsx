import type { SelectHTMLAttributes } from 'react'

interface Option {
  label: string
  value: string
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: Option[]
}

export function Select({ label, error, options, className = '', ...props }: SelectProps) {
  return (
    <label className="block">
      {label ? <span className="mb-1.5 block text-sm font-medium text-gray-700">{label}</span> : null}
      <select
        className={`w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 outline-none ring-0 transition focus:border-gray-900 ${className}`}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error ? <span className="mt-1 block text-xs text-red-600">{error}</span> : null}
    </label>
  )
}
