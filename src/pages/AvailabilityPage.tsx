import { useMemo, useState } from 'react'
import {
  AlertTriangle,
  CalendarCheck2,
  CheckCircle2,
  Clock3,
  LayoutList,
  MapPin,
  Plus,
  Search,
  Bookmark,
} from 'lucide-react'
import { cn } from '@/lib/cn'
import {
  availabilityRows as seedRows,
  type AvailabilityRow,
  type AvailabilityStatus,
} from '@/data/availability'
import { PostAvailabilityPanel } from '@/components/availability/PostAvailabilityPanel'

type TabId = 'board' | 'posted' | 'available' | 'expired' | 'saved'

const TABS: { id: TabId; label: string; icon: typeof LayoutList }[] = [
  { id: 'board', label: 'Board', icon: LayoutList },
  { id: 'posted', label: 'Posted', icon: Clock3 },
  { id: 'available', label: 'Available', icon: CheckCircle2 },
  { id: 'expired', label: 'Expired', icon: AlertTriangle },
  { id: 'saved', label: 'Saved lanes', icon: Bookmark },
]

type Props = {
  search: string
}

export function AvailabilityPage({ search }: Props) {
  const [tab, setTab] = useState<TabId>('board')
  const [rows, setRows] = useState<AvailabilityRow[]>(seedRows)
  const [statusFilter, setStatusFilter] = useState<'all' | AvailabilityStatus>('all')
  const [localSearch, setLocalSearch] = useState('')
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(20)
  const [postOpen, setPostOpen] = useState(false)

  const q = (search || localSearch).trim().toLowerCase()

  const counts = useMemo(() => {
    const posted = rows.filter((r) => r.status === 'Posted').length
    const available = rows.filter((r) => r.status === 'Available').length
    const expired = rows.filter((r) => r.status === 'Expired').length
    return { posted, available, expired, total: rows.length }
  }, [rows])

  const filtered = useMemo(() => {
    let list = [...rows]
    if (tab === 'posted') list = list.filter((r) => r.status === 'Posted')
    if (tab === 'available') list = list.filter((r) => r.status === 'Available')
    if (tab === 'expired') list = list.filter((r) => r.status === 'Expired')
    if (tab === 'saved') list = list.filter((r) => r.onboarding === 'Onboarded' && r.status !== 'Expired')
    if (statusFilter !== 'all') list = list.filter((r) => r.status === statusFilter)
    if (q) {
      list = list.filter(
        (r) =>
          r.carrier.toLowerCase().includes(q) ||
          r.email.toLowerCase().includes(q) ||
          r.origin.toLowerCase().includes(q) ||
          r.destination.toLowerCase().includes(q) ||
          r.trailerType.toLowerCase().includes(q) ||
          r.notes.toLowerCase().includes(q) ||
          r.source.toLowerCase().includes(q)
      )
    }
    return list
  }, [rows, tab, statusFilter, q])

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage))
  const pageSafe = Math.min(page, totalPages)
  const pageRows = filtered.slice((pageSafe - 1) * perPage, pageSafe * perPage)

  return (
    <div className="av-page">
      <aside className="av-rail" aria-label="Availability tabs">
        <div className="av-rail__head">
          <CalendarCheck2 size={15} />
          <span>Availability</span>
        </div>
        <nav className="av-rail__nav">
          {TABS.map((t) => {
            const Icon = t.icon
            const count =
              t.id === 'posted'
                ? counts.posted
                : t.id === 'available'
                  ? counts.available
                  : t.id === 'expired'
                    ? counts.expired
                    : t.id === 'saved'
                      ? rows.filter((r) => r.onboarding === 'Onboarded' && r.status !== 'Expired').length
                      : counts.total
            return (
              <button
                key={t.id}
                type="button"
                className={cn('av-rail__tab', tab === t.id && 'is-active')}
                onClick={() => {
                  setTab(t.id)
                  setStatusFilter('all')
                  setPage(1)
                }}
              >
                <Icon size={14} />
                <span>{t.label}</span>
                <em>{count}</em>
              </button>
            )
          })}
        </nav>
      </aside>

      <div className="av-main">
        <div className="av-main__head">
          <div>
            <h2>Carrier Availability</h2>
            <p>Post available trucks, lanes, and equipment.</p>
          </div>
          <button type="button" className="av-btn av-btn--primary" onClick={() => setPostOpen(true)}>
            <Plus size={15} />
            New Availability
          </button>
        </div>

        <div className="av-toolbar">
          <div className="av-chips">
            <button
              type="button"
              className={cn('av-chip is-posted', statusFilter === 'all' && 'is-active')}
              onClick={() => {
                setStatusFilter('all')
                setPage(1)
              }}
            >
              {counts.total} Total Posted
            </button>
            <button
              type="button"
              className={cn('av-chip is-available', statusFilter === 'Available' && 'is-active')}
              onClick={() => {
                setStatusFilter('Available')
                setPage(1)
              }}
            >
              {counts.available} Available
            </button>
            <button
              type="button"
              className={cn('av-chip is-expired', statusFilter === 'Expired' && 'is-active')}
              onClick={() => {
                setStatusFilter('Expired')
                setPage(1)
              }}
            >
              {counts.expired} Expired
            </button>
          </div>

          <label className="av-search">
            <Search size={14} />
            <input
              value={localSearch}
              onChange={(e) => {
                setLocalSearch(e.target.value)
                setPage(1)
              }}
              placeholder="Search carrier, lane, equipment, notes…"
            />
          </label>
        </div>

        <div className="av-table-wrap">
          <table className="av-table">
            <thead>
              <tr>
                <th>Carrier</th>
                <th>Origin</th>
                <th>Destination</th>
                <th>Trailer type</th>
                <th>Available start</th>
                <th>Available end</th>
                <th>Status</th>
                <th>Onboarding</th>
                <th>Source</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map((r) => (
                <tr key={r.id}>
                  <td>
                    <div className="av-cell-2">
                      <strong>{r.carrier}</strong>
                      <em>{r.email}</em>
                    </div>
                  </td>
                  <td>
                    <div className="av-cell-2">
                      <strong>{r.origin}</strong>
                      <em>Pickup</em>
                    </div>
                  </td>
                  <td>
                    <div className="av-dest">
                      <MapPin size={12} />
                      <div className="av-cell-2">
                        <strong>{r.destination}</strong>
                        <em>Delivery lane</em>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="av-equip">{r.trailerType}</span>
                  </td>
                  <td>
                    <div className="av-cell-2">
                      <strong>{r.startDate}</strong>
                      <em>Start</em>
                    </div>
                  </td>
                  <td>
                    <div className="av-cell-2">
                      <strong>{r.endDate}</strong>
                      <em>End</em>
                    </div>
                  </td>
                  <td>
                    <span className={cn('av-status', `is-${r.status.toLowerCase()}`)}>{r.status}</span>
                  </td>
                  <td>
                    <span
                      className={cn(
                        'av-onboard',
                        r.onboarding === 'Onboarded' ? 'is-ok' : 'is-warn'
                      )}
                    >
                      {r.onboarding === 'Onboarded' ? (
                        <CheckCircle2 size={12} />
                      ) : (
                        <AlertTriangle size={12} />
                      )}
                      {r.onboarding}
                    </span>
                  </td>
                  <td>
                    <div className="av-cell-2">
                      <strong>{r.source}</strong>
                      <em>Channel</em>
                    </div>
                  </td>
                  <td>
                    <div className="av-notes">{r.notes || '—'}</div>
                  </td>
                </tr>
              ))}
              {pageRows.length === 0 && (
                <tr>
                  <td colSpan={10} className="av-empty">
                    No availability rows match this view.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="av-pager">
          <div className="av-pager__meta">
            <strong>{filtered.length} results</strong>
            <span>
              Showing {(pageSafe - 1) * perPage + (pageRows.length ? 1 : 0)}–
              {(pageSafe - 1) * perPage + pageRows.length}
            </span>
            <label>
              Per page
              <select
                value={perPage}
                onChange={(e) => {
                  setPerPage(Number(e.target.value))
                  setPage(1)
                }}
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </label>
          </div>
          <div className="av-pager__nav">
            <button type="button" disabled={pageSafe <= 1} onClick={() => setPage((p) => p - 1)}>
              Prev
            </button>
            <span>
              Page {pageSafe} of {totalPages}
            </span>
            <button
              type="button"
              disabled={pageSafe >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <PostAvailabilityPanel
        open={postOpen}
        onClose={() => setPostOpen(false)}
        onPosted={(row) => {
          setRows((prev) => [row, ...prev])
          setTab('posted')
          setStatusFilter('all')
          setPage(1)
        }}
      />
    </div>
  )
}
