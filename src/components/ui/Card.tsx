import type { ReactNode } from 'react'

interface CardProps {
  title?: string
  subtitle?: string
  right?: ReactNode
  children: ReactNode
  className?: string
}

export function Card({ title, subtitle, right, children, className = '' }: CardProps) {
  return (
    <section className={`rounded-2xl border border-[#e5e5e5] bg-white p-5 shadow-sm ${className}`}>
      {title || subtitle || right ? (
        <header className="mb-4 flex items-start justify-between gap-4">
          <div>
            {title ? <h3 className="text-sm font-semibold text-gray-900">{title}</h3> : null}
            {subtitle ? <p className="mt-0.5 text-xs text-gray-500">{subtitle}</p> : null}
          </div>
          {right}
        </header>
      ) : null}
      {children}
    </section>
  )
}
