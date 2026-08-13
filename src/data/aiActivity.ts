import type { LoadDetail } from './loadDetail'

export type AiActivityStatus = 'success' | 'warn' | 'info'

export type AiActivityKind = 'check' | 'rate' | 'email' | 'whatsapp' | 'board' | 'score'

export type AiActivityEntry = {
  id: string
  run: string
  when: string
  title: string
  detail: string
  status: AiActivityStatus
  kind: AiActivityKind
  stats?: { label: string; value: string }[]
}

export function clockNow() {
  return new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}

/* Mock feed: the runs Auto Sourcing / Auto Tender have already performed on this load */
export function buildAiActivity(detail: LoadDetail): AiActivityEntry[] {
  const lane = `${detail.load.origin} → ${detail.load.destination}`
  const hardLimit = detail.maxBuy && detail.maxBuy !== '—' ? detail.maxBuy : 'not set'
  const bookNow = detail.bookNowRate && detail.bookNowRate !== '—' ? detail.bookNowRate : 'not set'
  const topBid = detail.bids[0]

  const feed: AiActivityEntry[] = [
    {
      id: 'ai-check',
      run: 'Auto Sourcing',
      when: '11:58 AM',
      title: 'Readiness check',
      detail: `2 missing data points found on ${detail.load.id} — book now and max buy.`,
      status: 'info',
      kind: 'check',
      stats: [
        { label: 'Lane', value: lane },
        { label: 'Equipment', value: detail.load.equipment },
      ],
    },
    {
      id: 'ai-rate',
      run: 'Auto Sourcing',
      when: '12:04 PM',
      title: 'Rates applied',
      detail: `Book now ${bookNow}, max buy ${hardLimit} locked as a hard limit.`,
      status: 'success',
      kind: 'rate',
      stats: [
        { label: 'Book now', value: bookNow },
        { label: 'Hard limit', value: hardLimit },
      ],
    },
    {
      id: 'ai-email',
      run: 'Auto Sourcing',
      when: '12:07 PM',
      title: 'Blast email sent',
      detail: '25 approved carriers reached across 31 unique contacts.',
      status: 'success',
      kind: 'email',
      stats: [
        { label: 'Carriers', value: '25' },
        { label: 'Opened', value: '11' },
      ],
    },
    {
      id: 'ai-wa',
      run: 'Auto Sourcing',
      when: '12:08 PM',
      title: 'Blast WhatsApp sent',
      detail: '20 carriers messaged with the load card — 3 replied with a rate.',
      status: 'success',
      kind: 'whatsapp',
      stats: [
        { label: 'Delivered', value: '20' },
        { label: 'Replies', value: '3' },
      ],
    },
    {
      id: 'ai-dat',
      run: 'Auto Sourcing',
      when: '12:09 PM',
      title: 'Posted to DAT',
      detail: 'Posting DAT-MOCK-88421 is live and reposts every 20 minutes.',
      status: 'success',
      kind: 'board',
      stats: [
        { label: 'Posting', value: 'DAT-MOCK-88421' },
        { label: 'Repost', value: 'Every 20 min' },
      ],
    },
    {
      id: 'ai-loadlink',
      run: 'Auto Sourcing',
      when: '12:09 PM',
      title: 'Loadlink posting failed',
      detail: 'Broker session expired before the post landed — retry is available.',
      status: 'warn',
      kind: 'board',
      stats: [{ label: 'Reason', value: 'Session expired' }],
    },
  ]

  if (detail.bids.length > 0) {
    feed.push({
      id: 'ai-score',
      run: 'Auto Tender',
      when: '12:22 PM',
      title: 'Offers scored',
      detail: `${detail.bids.length} offers ranked on rate, carrier rating, Highway identity and monitoring.`,
      status: 'info',
      kind: 'score',
      stats: [
        { label: 'Suggested', value: topBid?.carrier ?? '—' },
        { label: 'Offers', value: String(detail.bids.length) },
      ],
    })
  }

  return feed.reverse()
}
