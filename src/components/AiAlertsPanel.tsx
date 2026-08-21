import { useMemo, useState } from 'react'
import {
  BellRing,
  CircleDollarSign,
  Droplets,
  ExternalLink,
  Gauge,
  MapPinned,
  Newspaper,
} from 'lucide-react'
import { cn } from '@/lib/cn'
import {
  insightAlerts,
  subscriptionDetails,
  type InsightAlert,
  type InsightPreferenceProfile,
} from '@/data/insightPreferences'
import { datHeadlines } from '@/data/marketInsights'

const typeIcon = {
  'load-truck': Gauge,
  coverage: MapPinned,
  rate: CircleDollarSign,
  fuel: Droplets,
}

type FeedTab = 'all' | 'alerts' | 'news' | 'history'

/** Alerts, market news, and past alert history in one switchable rail. */
export function MarketFeedPanel({ profile }: { profile: InsightPreferenceProfile }) {
  const [tab, setTab] = useState<FeedTab>('all')

  const alerts = useMemo(
    () => insightAlerts.filter((alert) => alert.profileId === profile.id),
    [profile.id]
  )
  const live = alerts.filter((alert) => !alert.read)
  const history = alerts.filter((alert) => alert.read)

  const tabs: Array<{ id: FeedTab; label: string; count: number }> = [
    { id: 'all', label: 'Everything', count: alerts.length + datHeadlines.length },
    { id: 'alerts', label: 'AI alerts', count: live.length },
    { id: 'news', label: 'News', count: datHeadlines.length },
    { id: 'history', label: 'History', count: history.length },
  ]

  const showNews = tab === 'all' || tab === 'news'
  const shownAlerts = tab === 'all' ? alerts : tab === 'alerts' ? live : tab === 'history' ? history : []
  const empty = !showNews && shownAlerts.length === 0

  return (
    <article className="mi-card mi-card--feed">
      <header>
        <div>
          <span>Market feed</span>
          <h3>Alerts, news and history</h3>
        </div>
        <span className="al-count">
          <BellRing size={13} />
          {live.length} new
        </span>
      </header>

      <div className="al-tabs" role="tablist" aria-label="Market feed">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={tab === item.id}
            className={cn(tab === item.id && 'is-active')}
            onClick={() => setTab(item.id)}
          >
            {item.label} <b>{item.count}</b>
          </button>
        ))}
      </div>

      <div className="al-feed">
        {tab === 'all' && live.length ? <FeedLabel>New since your last brief</FeedLabel> : null}
        {(tab === 'all' ? live : shownAlerts).map((alert) => (
          <AlertRow key={alert.id} alert={alert} />
        ))}

        {showNews ? (
          <>
            {tab === 'all' ? <FeedLabel>Market news</FeedLabel> : null}
            {datHeadlines.map((headline) => (
              <article key={headline.title} className="al-row is-news">
                <i className="is-news">
                  <Newspaper size={13} />
                </i>
                <div>
                  <div className="al-row__meta">
                    <span>Market news</span>
                    <em>{headline.date}</em>
                  </div>
                  <strong>{headline.title}</strong>
                  <p>{headline.detail}</p>
                </div>
              </article>
            ))}
          </>
        ) : null}

        {tab === 'all' && history.length ? (
          <>
            <FeedLabel>Earlier alerts</FeedLabel>
            {history.map((alert) => (
              <AlertRow key={alert.id} alert={alert} />
            ))}
          </>
        ) : null}

        {empty ? <p className="al-none">Nothing sent to {profile.name} yet.</p> : null}
      </div>

      <a
        href="https://www.dat.com/blog/dry-van-report-capacity-stays-tight-as-the-july-lmi-holds-near-a-4-year-high"
        target="_blank"
        rel="noreferrer"
      >
        Read source report <ExternalLink size={13} />
      </a>
    </article>
  )
}

function FeedLabel({ children }: { children: string }) {
  return <p className="al-group">{children}</p>
}

function AlertRow({ alert }: { alert: InsightAlert }) {
  const Icon = typeIcon[alert.type]
  return (
    <article className={cn('al-row', alert.read && 'is-read')}>
      <i className={`is-${alert.severity}`}>
        <Icon size={14} />
      </i>
      <div>
        <div className="al-row__meta">
          <span>{subscriptionDetails[alert.type].label}</span>
          <em>{alert.sentAt}</em>
        </div>
        <strong>{alert.title}</strong>
        <p>{alert.detail}</p>
      </div>
      <div className="al-row__tail">
        <b>{alert.market}</b>
        <span className={cn('al-status', `is-${alert.severity}`)}>
          {alert.read ? 'Reviewed' : 'New'}
        </span>
      </div>
    </article>
  )
}
