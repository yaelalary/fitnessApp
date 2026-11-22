import {
  BarElement,
  CategoryScale,
  Chart,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  type ChartOptions,
} from 'chart.js'

Chart.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip)

export const CHART_TOKENS = [
  '--color-chart-series',
  '--color-chart-grid',
  '--color-chart-axis',
  '--color-surface',
  '--color-text',
  '--color-border',
  '--font-body',
] as const

export type ChartTokens = Record<(typeof CHART_TOKENS)[number], string>

export function baseChartOptions(tokens: ChartTokens, formatValue: (value: number) => string): ChartOptions<'line' | 'bar'> {
  const font = { family: tokens['--font-body'], size: 12 }
  return {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: tokens['--color-surface'],
        titleColor: tokens['--color-text'],
        bodyColor: tokens['--color-text'],
        borderColor: tokens['--color-border'],
        borderWidth: 1,
        padding: 10,
        displayColors: false,
        titleFont: font,
        bodyFont: { ...font, weight: 'bold' },
        callbacks: { label: (context) => formatValue(Number(context.parsed.y)) },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        border: { color: tokens['--color-chart-grid'] },
        ticks: { color: tokens['--color-chart-axis'], font, maxRotation: 0, autoSkipPadding: 12 },
      },
      y: {
        grid: { color: tokens['--color-chart-grid'] },
        border: { display: false },
        ticks: { color: tokens['--color-chart-axis'], font, maxTicksLimit: 5 },
      },
    },
  }
}
