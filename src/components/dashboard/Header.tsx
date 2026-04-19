'use client'

import { MdMenu } from 'react-icons/md'

interface HeaderProps {
  title: string
  subtitle?: string
  onMenu?: () => void
}

export function Header({ title, subtitle, onMenu }: HeaderProps) {
  return (
    <header className="mb-5 flex items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3">
      <div className="flex items-start gap-3">
        {onMenu ? (
          <button onClick={onMenu} className="rounded-lg border border-gray-200 p-2 text-gray-700 lg:hidden" aria-label="Open menu">
            <MdMenu />
          </button>
        ) : null}
        <div>
          <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
          {subtitle ? <p className="text-sm text-gray-500">{subtitle}</p> : null}
        </div>
      </div>
      <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800">Photoscape Ops</span>
    </header>
  )
}
