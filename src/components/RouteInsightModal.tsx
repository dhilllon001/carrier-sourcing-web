import { useMemo } from 'react'
import type { EChartsOption } from 'echarts'
import { ArrowRight, Sparkles, X } from 'lucide-react'
import { cn } from '@/lib/cn'
import { EChart } from '@/components/charts/EChart'
import { CHART_FONT, chartTooltip } from '@/components/charts/chartTheme'
import { datHeadlines, toneLabel, type InsightRoute, type MarketTone } from '@/data/marketInsights'
import {
  subscriptionDetails,
  type InsightPreferenceProfile,
} from '@/data/insightPreferences'

type Props = {
  route: InsightRoute
  /** Shown above the title, e.g. "Route intelligence" or "Sourcing brief". */
  eyebrow: string
  primaryLabel: string
  onPrimary?: () => void
  onClose: () => void
  /** Adds this week's market headlines, for the brief shown when sourcing opens. */
  withNews?: boolean
  profile?: InsightPreferenceProfile
}

const axisLabel = { color: '#64748b', fontSize: 13, fontFamily: CHART_FONT }

function Signal({ tone }: { tone: MarketTone }) {
  return <span className={cn('mi-signal', `is-${tone}`)}>{toneLabel[tone]}</span>
}

export function RouteInsightModal({
  route,
  eyebrow,
  primaryLabel,
  onPrimary,
  onClose,
  withNews,
  profile,
}: Props) {
  const delta = route.spot - route.contract

  const trendOption = useMemo<EChartsOption>(
    () => ({
      textStyle: { fontFamily: CHART_FONT, fontSize: 13 },
      grid: { top: 14, right: 14, bottom: 24, left: 46 },
      tooltip: { ...chartTooltip, valueFormatter: (v) => `$${Number(v).toFixed(2)}/mi` },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7'],
        axisLabel,
        axisLine: { lineStyle: { color: '#dfe4ea' } },
        axisTick: { show: false },
      },
      yAxis: {
        type: 'value',
        scale: true,
        axisLabel: { ...axisLabel, formatter: (v: number) => `$${v.toFixed(2)}` },
        splitLine: { lineStyle: { color: '#eef1f5' } },
      },
      series: [
        {
          name: 'Spot rate',
          type: 'line',
          smooth: true,
          symbolSize: 7,
          data: route.trend,
          lineStyle: { color: '#2563eb', width: 2.5 },
          itemStyle: { color: '#2563eb' },
          areaStyle: { color: 'rgba(37,99,235,0.10)' },
        },
      ],
    }),
    [route]
  )

  return (
    <div className="mi-modal-root" role="dialog" aria-modal="true" aria-labelledby="mi-route-title">
      <button
        type="button"
        className="mi-modal__veil"
        aria-label="Close brief"
        onClick={onClose}
      />
      <section className="mi-modal">
        <header>
          <div>
            <span>
              <Sparkles size={13} /> {eyebrow}
            </span>
            <h2 id="mi-route-title">
              {route.origin} <ArrowRight size={18} /> {route.destination}
            </h2>
            <p>
              {route.customer} · {route.equipment} · {route.miles.toLocaleString()} miles ·{' '}
              {route.weeklyLoads} loads a week
            </p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </header>

        <div className="mi-modal__body">
          <div className="mi-modal__signal">
            <Signal tone={route.signal} />
            <strong>{route.summary}</strong>
          </div>

          <div className="mi-modal__kpis">
            <div>
              <span>Spot rate</span>
              <strong>
                ${route.spot.toFixed(2)}
                <small>/mi</small>
              </strong>
            </div>
            <div>
              <span>Contract</span>
              <strong>
                ${route.contract.toFixed(2)}
                <small>/mi</small>
              </strong>
            </div>
            <div>
              <span>Spot vs contract</span>
              <strong className={delta > 0 ? 'is-bad' : 'is-good'}>
                {delta > 0 ? '+' : '−'}${Math.abs(delta).toFixed(2)}
              </strong>
            </div>
            <div>
              <span>35-day outlook</span>
              <strong>
                ${route.forecast.toFixed(2)}
                <small>/mi</small>
              </strong>
            </div>
            <div>
              <span>Load / truck</span>
              <strong>{route.loadToTruck.toFixed(1)}</strong>
            </div>
            <div>
              <span>Carriers</span>
              <strong>
                {route.carrierMatches}
                <small>{route.preferredCarriers} preferred</small>
              </strong>
            </div>
          </div>

          <div className="mi-modal__split">
            <article>
              <span>7-week rate direction</span>
              <EChart option={trendOption} height={168} ariaLabel="Seven week rate direction" />
            </article>
            <article>
              <span>AI planning recommendation</span>
              <strong>{route.recommendation}</strong>
              <div className="mi-modal__watch">
                <span>Watch on this lane</span>
                {route.watch.map((item) => (
                  <div key={item}>
                    <i />
                    {item}
                  </div>
                ))}
              </div>
            </article>
          </div>

          {withNews && (
            <div className="mi-modal__news">
              <span>
                Market news for {profile?.name ?? 'your preferences'}
                {profile && (
                  <small>
                    Watching {profile.areaCodes.join(', ')} ·{' '}
                    {profile.subscriptions
                      .map((item) => subscriptionDetails[item].label)
                      .join(' · ')}
                  </small>
                )}
              </span>
              {datHeadlines.slice(0, 3).map((headline) => (
                <article key={headline.title}>
                  <em>{headline.date}</em>
                  <strong>{headline.title}</strong>
                  <p>{headline.detail}</p>
                </article>
              ))}
            </div>
          )}
        </div>

        <footer>
          <span>Static snapshot · refreshed Aug 20, 2026</span>
          <button type="button" onClick={onClose}>
            {withNews ? 'Start sourcing' : 'Keep current plan'}
          </button>
          <button
            type="button"
            className="is-primary"
            onClick={() => {
              onClose()
              onPrimary?.()
            }}
          >
            {primaryLabel}
          </button>
        </footer>
      </section>
    </div>
  )
}
