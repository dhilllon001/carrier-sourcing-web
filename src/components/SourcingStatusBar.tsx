import { useEffect, useMemo, useState } from 'react'
import {
  AlertTriangle,
  ArrowUpRight,
  Gavel,
  Radio,
  Shield,
  Timer,
  TrendingUp,
} from 'lucide-react'
import { cn } from '@/lib/cn'
import { LIFECYCLE_DISPLAY, STATUS_DISPLAY_COUNTS, reportLoads } from '@/data/report'
import { cmtReviewQueue } from '@/data/cmtReview'
import { laneSearches } from '@/data/carrierSearch'
import { areaRatio, marketAreas, nationalTrend } from '@/data/marketInsights'

type NavId =
  | 'sourcing'
  | 'capacity'
  | 'capacity-dashboard'
  | 'configuration'
  | 'availability'
  | 'carrier-search'
  | 'market-insights'
  | 'insight-preferences'
  | 'carriers'
  | 'access'
  | 'cmt'
  | 'cmt-configuration'
  | 'rfp'
  | 'rfp-design'
  | 'rfp-publish'
  | 'rfp-bids'
  | 'rfp-evaluate'
  | 'rfp-award'

type Props = {
  active: NavId
  onNavigate: (id: NavId) => void
  onOpenLaneSearch: () => void
}

const clock = (date: Date) =>
  date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })

export function SourcingStatusBar({ active, onNavigate, onOpenLaneSearch }: Props) {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30_000)
    return () => window.clearInterval(timer)
  }, [])

  const stats = useMemo(() => {
    const offers =
      LIFECYCLE_DISPLAY.stages
        .find((stage) => stage.stage === 'Tender')
        ?.items.find((item) => item.label === 'Offers & Bids')?.count ?? 0

    const closing = reportLoads.filter(
      (load) =>
        load.subStage === 'Offers & Bids' &&
        load.bidExpiresInMin !== undefined &&
        load.bidExpiresInMin <= 30
    ).length

    const quotes = laneSearches.reduce(
      (sum, lane) =>
        sum + lane.carriers.filter((carrier) => carrier.offer === 'Quoted').length,
      0
    )
    const awaiting = laneSearches.reduce(
      (sum, lane) => sum + lane.carriers.filter((carrier) => carrier.offer === 'Sent').length,
      0
    )

    const tightest = marketAreas.reduce((top, area) =>
      areaRatio(area) > areaRatio(top) ? area : top
    )

    const van = nationalTrend.van
    const vanSpot = van[van.length - 1]
    const vanTrend = vanSpot - van[van.length - 2]
    const priorMonth = nationalTrend.labels[nationalTrend.labels.length - 2]

    return {
      needCarrier: STATUS_DISPLAY_COUNTS.NeedCarrier,
      offers,
      closing,
      quotes,
      awaiting,
      cmt: cmtReviewQueue.filter((row) => row.status === 'Pending').length,
      tightest,
      vanSpot,
      vanTrend,
      priorMonth,
    }
  }, [])

  return (
    <footer className="sr-strip">
      <span className="sr-strip__live">
        <i />
        Live · {clock(now)}
      </span>

      <span className="sr-strip__div" />

      <button
        type="button"
        className={cn('sr-strip__chip', 'is-critical', active === 'sourcing' && 'is-here')}
        onClick={() => onNavigate('sourcing')}
      >
        <AlertTriangle size={12} />
        <b>{stats.needCarrier.toLocaleString()}</b> need carrier
      </button>

      <button
        type="button"
        className="sr-strip__chip is-urgent"
        onClick={() => onNavigate('sourcing')}
      >
        <Timer size={12} />
        <b>{stats.closing}</b> bids closing &lt; 30m
      </button>

      <button
        type="button"
        className="sr-strip__chip is-action"
        onClick={() => onNavigate('sourcing')}
      >
        <Gavel size={12} />
        <b>{stats.offers}</b> offers to review
      </button>

      <button
        type="button"
        className={cn('sr-strip__chip', 'is-action', active === 'carrier-search' && 'is-here')}
        onClick={() => onNavigate('carrier-search')}
      >
        <Radio size={12} />
        <b>{stats.quotes}</b> quotes in
        <em>· {stats.awaiting} awaiting reply</em>
      </button>

      <button
        type="button"
        className={cn('sr-strip__chip', 'is-warn', active === 'cmt' && 'is-here')}
        onClick={() => onNavigate('cmt')}
      >
        <Shield size={12} />
        <b>{stats.cmt}</b> CMT pending
      </button>

      <span className="sr-strip__spacer" />

      <button
        type="button"
        className="sr-strip__market"
        onClick={() => onNavigate('market-insights')}
      >
        <TrendingUp size={12} />
        Van spot <b>${stats.vanSpot.toFixed(2)}</b>/mi
        <em className={stats.vanTrend >= 0 ? 'is-up' : 'is-down'}>
          {stats.vanTrend >= 0 ? '▲' : '▼'} ${Math.abs(stats.vanTrend).toFixed(2)} vs{' '}
          {stats.priorMonth}
        </em>
        <span>
          Tightest {stats.tightest.code} {areaRatio(stats.tightest).toFixed(2)}×
        </span>
        <ArrowUpRight size={12} />
      </button>

      <span className="sr-strip__div" />

      <button type="button" className="sr-strip__shortcut" onClick={onOpenLaneSearch}>
        Quick lane search <kbd>L</kbd>
      </button>
    </footer>
  )
}
