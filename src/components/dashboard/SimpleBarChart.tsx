interface ChartItem {
  label: string
  value: number
}

interface SimpleBarChartProps {
  data: ChartItem[]
  title: string
}

export function SimpleBarChart({ data, title }: SimpleBarChartProps) {
  const max = Math.max(...data.map((item) => item.value), 1)
  const width = 560
  const height = 220
  const barWidth = Math.max(24, Math.floor(width / Math.max(data.length * 2, 2)))

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
      <svg viewBox={`0 0 ${width} ${height}`} className="mt-4 w-full" role="img" aria-label={title}>
        {data.map((item, index) => {
          const x = 20 + index * (barWidth + 18)
          const barHeight = (item.value / max) * 140
          const y = 165 - barHeight
          return (
            <g key={item.label}>
              <rect x={x} y={y} width={barWidth} height={barHeight} rx={6} fill="#1a1a1a" opacity="0.9" />
              <text x={x + barWidth / 2} y={180} textAnchor="middle" fontSize="10" fill="#6b7280">
                {item.label}
              </text>
              <text x={x + barWidth / 2} y={y - 6} textAnchor="middle" fontSize="10" fill="#111827">
                {item.value}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
