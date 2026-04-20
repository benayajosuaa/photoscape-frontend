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
  const chartData = data.slice(0, 7)
  const count = Math.max(chartData.length, 1)
  const plotLeft = 34
  const plotRight = width - 34
  const plotWidth = Math.max(plotRight - plotLeft, 1)
  const barWidth = Math.max(22, Math.min(56, Math.floor(plotWidth / Math.max(count * 2, 2))))

  const formatLabel = (label: string) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(label)) return label
    const date = new Date(`${label}T00:00:00.000Z`)
    if (Number.isNaN(date.getTime())) return label
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      timeZone: 'UTC',
    })
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
      <svg viewBox={`0 0 ${width} ${height}`} className="mt-4 w-full" role="img" aria-label={title}>
        {chartData.map((item, index) => {
          const xCenter = count === 1 ? width / 2 : plotLeft + (index / (count - 1)) * plotWidth
          const x = xCenter - barWidth / 2
          const barHeight = (item.value / max) * 140
          const y = 165 - barHeight
          return (
            <g key={item.label}>
              <rect x={x} y={y} width={barWidth} height={barHeight} rx={6} fill="#1a1a1a" opacity="0.9" />
              <text x={xCenter} y={180} textAnchor="middle" fontSize="10" fill="#6b7280">
                {formatLabel(item.label)}
              </text>
              <text x={xCenter} y={y - 6} textAnchor="middle" fontSize="10" fill="#111827">
                {item.value}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
