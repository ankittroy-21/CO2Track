import { TrendingDown, TrendingUp, Lightbulb } from 'lucide-react'

/**
 * Displays a single AI-generated insight
 * @param {{ insight: string, index: number }} props
 */
export default function InsightCard({ insight, index }) {
  const isPositive = !insight.toLowerCase().includes('reduce') &&
    !insight.toLowerCase().includes('high') &&
    !insight.toLowerCase().includes('above')

  return (
    <article
      className={`rounded-lg border p-4 ${
        isPositive
          ? 'bg-green-light/20 border-green-med/30'
          : 'bg-orange-50 border-orange-200'
      }`}
      aria-label={`Insight ${index + 1}`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`mt-0.5 flex-shrink-0 ${isPositive ? 'text-green-dark' : 'text-orange-500'}`}
          aria-hidden="true"
        >
          {isPositive ? (
            <TrendingDown className="h-4 w-4" strokeWidth={1.5} />
          ) : (
            <Lightbulb className="h-4 w-4" strokeWidth={1.5} />
          )}
        </div>
        <div className="flex-1">
          <div className="text-xs font-medium text-gray-500 mb-1">Insight {index + 1}</div>
          <p className="text-sm text-charcoal leading-relaxed">{insight}</p>
        </div>
      </div>
    </article>
  )
}