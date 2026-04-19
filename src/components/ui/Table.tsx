import type { ReactNode } from 'react'

interface Column<T> {
  key: keyof T | string
  label: string
  sortable?: boolean
  render?: (item: T) => ReactNode
}

interface TableProps<T> {
  columns: Column<T>[]
  data: T[]
  loading?: boolean
  emptyMessage?: string
}

export function Table<T extends Record<string, unknown>>({
  columns,
  data,
  loading = false,
  emptyMessage = 'Belum ada data',
}: TableProps<T>) {
  const safeData = Array.isArray(data) ? data : []

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-gray-50 text-xs uppercase text-gray-500">
          <tr>
            {columns.map((column) => (
              <th key={String(column.key)} className="px-4 py-3 font-medium">
                <span className="inline-flex items-center gap-1">
                  {column.label}
                  {column.sortable ? <span className="text-[10px]">↑↓</span> : null}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading
            ? Array.from({ length: 6 }).map((_, idx) => (
                <tr key={`skeleton-${idx}`} className="border-t border-gray-200">
                  {columns.map((column) => (
                    <td key={String(column.key)} className="px-4 py-3">
                      <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
                    </td>
                  ))}
                </tr>
              ))
            : safeData.map((item, rowIndex) => (
                <tr key={`row-${rowIndex}`} className="border-t border-gray-200 bg-white">
                  {columns.map((column) => (
                    <td key={String(column.key)} className="px-4 py-3 text-gray-800">
                      {column.render ? column.render(item) : String(item[column.key] ?? '-')}
                    </td>
                  ))}
                </tr>
              ))}

          {!loading && safeData.length === 0 ? (
            <tr>
              <td className="px-4 py-8 text-center text-sm text-gray-500" colSpan={columns.length}>
                {emptyMessage}
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  )
}
