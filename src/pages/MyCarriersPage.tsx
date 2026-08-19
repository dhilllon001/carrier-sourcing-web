import { useMemo, useState } from 'react'
import { History, Search, Star, Users, X } from 'lucide-react'
import { cn } from '@/lib/cn'
import {
  bookCarriers,
  bookTotals,
  isLapsed,
  vsMarketPct,
  type BookCarrier,
} from '@/data/carrierBook'
import { MyBookView } from '@/components/carriers/MyBookView'
import { FavouritesRankView } from '@/components/carriers/FavouritesRankView'
import {
  TrackRecordView,
  type TrackFlag,
  type TrackRange,
} from '@/components/carriers/TrackRecordView'
import { AllCarriersView } from '@/components/carriers/AllCarriersView'

type Props = {
  search: string
  onOpenCarrier: (id: string) => void
  onOpenLaneSearch?: () => void
}

type Tab = 'book' | 'favourites' | 'record' | 'all'

const RANGE_DAYS: Record<TrackRange, number> = {
  'All time': Infinity,
  'Last 90 days': 90,
  'Last 30 days': 30,
}

const money = (n: number) => `$${Math.round(n / 1000).toLocaleString()}k`

function matches(c: BookCarrier, q: string) {
  if (!q) return true
  return (
    c.name.toLowerCase().includes(q) ||
    c.mc.includes(q) ||
    c.dot.includes(q) ||
    c.city.toLowerCase().includes(q) ||
    c.contact.toLowerCase().includes(q) ||
    c.owner.toLowerCase().includes(q) ||
    c.lanes.some((l) => l.lane.toLowerCase().includes(q))
  )
}

export function MyCarriersPage({ search, onOpenCarrier, onOpenLaneSearch }: Props) {
  const [tab, setTab] = useState<Tab>('book')
  const [localQ, setLocalQ] = useState('')
  const [dismissed, setDismissed] = useState<string[]>([])
  const [range, setRange] = useState<TrackRange>('All time')
  const [flags, setFlags] = useState<TrackFlag[]>([])
  const [openId, setOpenId] = useState<string | null>(null)
  const [favourites, setFavourites] = useState<string[]>(() =>
    bookCarriers
      .filter((c) => c.rank)
      .sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0))
      .map((c) => c.id)
  )

  const q = (search || localQ).trim().toLowerCase()
  const totals = useMemo(() => bookTotals(bookCarriers), [])

  const mine = useMemo(() => bookCarriers.filter((c) => c.inBook), [])
  const bookRows = useMemo(
    () => mine.filter((c) => matches(c, q)).sort((a, b) => b.loadsRun - a.loadsRun),
    [mine, q]
  )

  const ranked = useMemo(
    () =>
      favourites
        .map((id) => bookCarriers.find((c) => c.id === id))
        .filter((c): c is BookCarrier => Boolean(c) && matches(c as BookCarrier, q)),
    [favourites, q]
  )

  const poolAccept = useMemo(
    () => Math.round(bookCarriers.reduce((sum, c) => sum + c.accept, 0) / bookCarriers.length),
    []
  )

  const recordRows = useMemo(() => {
    const days = RANGE_DAYS[range]
    return bookCarriers
      .filter((c) => matches(c, q))
      .filter((c) => days === Infinity || c.daysSinceLoad <= days)
      .filter((c) => {
        if (flags.includes('Lapsed') && !isLapsed(c)) return false
        if (flags.includes('New') && !c.isNew) return false
        if (flags.includes('Has claims') && c.claims === 0) return false
        if (flags.includes('Above market') && vsMarketPct(c) <= 0) return false
        return true
      })
      .sort((a, b) => b.loadsRun - a.loadsRun)
  }, [q, range, flags])

  const toggleFavourite = (id: string) =>
    setFavourites((list) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id]))

  const moveFavourite = (id: string, delta: number) =>
    setFavourites((list) => {
      const i = list.indexOf(id)
      const j = i + delta
      if (i < 0 || j < 0 || j >= list.length) return list
      const next = [...list]
      next.splice(j, 0, next.splice(i, 1)[0])
      return next
    })

  const TABS: Array<{ id: Tab; label: string; icon: typeof Users; count?: number; hint: string }> = [
    {
      id: 'book',
      label: 'My book',
      icon: Users,
      count: bookRows.length,
      hint: 'Carriers you own as rep or backup',
    },
    {
      id: 'favourites',
      label: 'Favourites',
      icon: Star,
      count: ranked.length,
      hint: 'Ranked shortlist, tendered first',
    },
    {
      id: 'record',
      label: 'Track record',
      icon: History,
      count: recordRows.length,
      hint: 'Every carrier you have moved freight with',
    },
    {
      id: 'all',
      label: 'All carriers',
      icon: Search,
      hint: 'The full carrier directory',
    },
  ]

  const activeTab = TABS.find((t) => t.id === tab)

  return (
    <div className="bk-page">
      <header className="bk-head">
        <div className="bk-head__title">
          <h2>My carriers</h2>
          <span>Mandeep Singh · carrier sales</span>
        </div>
        <div className="bk-head__stats">
          <Stat label="My book" value={String(totals.myBook)} />
          <Stat label="Favourites" value={String(totals.favourites)} />
          <Stat label="Loads run" value={totals.loadsRun.toLocaleString()} />
          <Stat label="Spend" value={money(totals.spend)} />
          <Stat
            label="Needs you"
            value={String(Math.max(0, totals.needsYou - dismissed.length))}
            tone="warn"
          />
        </div>
      </header>

      <nav className="bk-tabs" aria-label="Carrier views">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={cn('bk-tab', tab === t.id && 'is-on')}
            aria-current={tab === t.id}
            title={t.hint}
            onClick={() => setTab(t.id)}
          >
            <t.icon size={13} strokeWidth={2} />
            {t.label}
            {t.count !== undefined && <i>{t.count}</i>}
          </button>
        ))}
        <span className="bk-tabs__hint">{activeTab?.hint}</span>
      </nav>

      {tab !== 'all' && (
        <div className="bk-searchrow">
          <label className="bk-search">
            <Search size={13} strokeWidth={2} />
            <input
              value={localQ}
              onChange={(e) => setLocalQ(e.target.value)}
              placeholder="Search carrier, MC, or lane…"
              aria-label="Search carriers"
            />
            {localQ && (
              <button type="button" aria-label="Clear search" onClick={() => setLocalQ('')}>
                <X size={12} />
              </button>
            )}
          </label>
          {tab === 'book' && (
            <span className="bk-searchrow__meta">
              {bookRows.filter((c) => c.role === 'Rep').length} as rep ·{' '}
              {bookRows.filter((c) => c.role === 'Backup').length} as backup
              {totals.lapsed > 0 ? ` · ${totals.lapsed} lapsed` : ''}
            </span>
          )}
          {tab === 'favourites' && (
            <span className="bk-searchrow__meta">
              Drag-free ranking — use the arrows to reorder
            </span>
          )}
          {tab === 'record' && (
            <span className="bk-searchrow__meta">Hover a carrier name for the full profile</span>
          )}
        </div>
      )}

      <div className="bk-body">
        {tab === 'book' && (
          <MyBookView
            carriers={bookRows}
            dismissed={dismissed}
            onDismiss={(id) => setDismissed((d) => [...d, id])}
            favourites={favourites}
            onToggleFavourite={toggleFavourite}
            onOpen={onOpenCarrier}
          />
        )}
        {tab === 'favourites' && (
          <FavouritesRankView
            ranked={ranked}
            poolAccept={poolAccept}
            onMove={moveFavourite}
            onRemove={toggleFavourite}
            onOpen={onOpenCarrier}
          />
        )}
        {tab === 'record' && (
          <TrackRecordView
            carriers={recordRows}
            range={range}
            setRange={setRange}
            flags={flags}
            toggleFlag={(f) =>
              setFlags((list) => (list.includes(f) ? list.filter((x) => x !== f) : [...list, f]))
            }
            openId={openId}
            setOpenId={setOpenId}
            favourites={favourites}
            onToggleFavourite={toggleFavourite}
          />
        )}
        {tab === 'all' && (
          <AllCarriersView
            search={search}
            onOpenCarrier={onOpenCarrier}
            onOpenLaneSearch={onOpenLaneSearch}
          />
        )}
      </div>
    </div>
  )
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: 'warn' }) {
  return (
    <div className={cn('bk-stat', tone && `is-${tone}`)}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}
