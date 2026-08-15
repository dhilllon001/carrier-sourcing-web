import { useMemo, useState } from 'react'
import { Heart, Plus, Search, Route, X } from 'lucide-react'
import { cn } from '@/lib/cn'
import { carrierList, type CarrierStatus } from '@/data/carriers'
import { useFavoriteCarriers } from '@/lib/favoriteCarriers'

type Props = {
  search: string
  onOpenCarrier: (id: string) => void
  onOpenLaneSearch?: () => void
}

const STATUS_OPTS: Array<'all' | CarrierStatus> = ['all', 'Active', 'Inactive', 'Disabled']

export function MyCarriersPage({ search, onOpenCarrier, onOpenLaneSearch }: Props) {
  const [mode, setMode] = useState<'search' | 'lane'>('search')
  const [localQ, setLocalQ] = useState('')
  const [status, setStatus] = useState<'all' | CarrierStatus>('all')
  const [favOnly, setFavOnly] = useState(false)
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(25)
  const { favorites, isFavorite, toggle } = useFavoriteCarriers()

  const q = (search || localQ).trim().toLowerCase()

  const filtered = useMemo(() => {
    let list = [...carrierList]
    if (favOnly) list = list.filter((c) => favorites.includes(c.id))
    if (status !== 'all') list = list.filter((c) => c.status === status)
    if (q) {
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.mc.includes(q) ||
          c.dot.includes(q) ||
          c.city.toLowerCase().includes(q) ||
          c.state.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.contactName.toLowerCase().includes(q) ||
          c.rep.toLowerCase().includes(q) ||
          c.team.toLowerCase().includes(q) ||
          c.scac.toLowerCase().includes(q) ||
          c.division.toLowerCase().includes(q)
      )
    }
    return list
  }, [q, status, favOnly, favorites])

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage))
  const pageSafe = Math.min(page, totalPages)
  const pageRows = filtered.slice((pageSafe - 1) * perPage, pageSafe * perPage)

  return (
    <div className="mc-page">
      <div className="mc-toolbar">
        <div className="mc-toolbar__modes">
          <button
            type="button"
            className={cn('mc-mode', mode === 'search' && 'is-active')}
            onClick={() => setMode('search')}
          >
            <Search size={14} strokeWidth={1.75} />
            Search
          </button>
          <button
            type="button"
            className={cn('mc-mode', mode === 'lane' && 'is-active')}
            onClick={() => {
              setMode('lane')
              onOpenLaneSearch?.()
            }}
          >
            <Route size={14} strokeWidth={1.75} />
            Lane Search
          </button>
        </div>

        <div className="mc-toolbar__search">
          <Search size={15} strokeWidth={1.75} className="mc-toolbar__search-icon" />
          <input
            value={localQ}
            onChange={(e) => {
              setLocalQ(e.target.value)
              setPage(1)
            }}
            placeholder="Search name, MC, DOT, city, contact…"
            aria-label="Search carriers"
          />
          {localQ && (
            <button
              type="button"
              className="mc-toolbar__clear"
              aria-label="Clear search"
              onClick={() => setLocalQ('')}
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="mc-toolbar__filters">
          <button
            type="button"
            className={cn('mc-chip mc-chip--fav', favOnly && 'is-active')}
            aria-pressed={favOnly}
            onClick={() => {
              setFavOnly((v) => !v)
              setPage(1)
            }}
          >
            <Heart size={12} fill={favOnly ? 'currentColor' : 'none'} />
            Favourites
            <i>{favorites.length}</i>
          </button>
          {STATUS_OPTS.map((s) => (
            <button
              key={s}
              type="button"
              className={cn('mc-chip', status === s && 'is-active')}
              onClick={() => {
                setStatus(s)
                setPage(1)
              }}
            >
              {s === 'all' ? 'All' : s}
            </button>
          ))}
        </div>

        <div className="mc-toolbar__actions">
          <button type="button" className="mc-btn mc-btn--ghost">
            Carrier Onboarding
          </button>
          <button type="button" className="mc-btn mc-btn--primary">
            <Plus size={15} strokeWidth={2} />
            Add New Carrier
          </button>
        </div>
      </div>

      <div className="mc-table-wrap">
        <table className="mc-table">
          <thead>
            <tr>
              <th className="mc-col-fav" aria-label="Favourite" />
              <th>Carrier Name</th>
              <th>Status</th>
              <th>Carrier rep</th>
              <th>Contact</th>
              <th className="mc-num">Loads 90d</th>
              <th className="mc-num">On time</th>
              <th>Last load</th>
              <th>Equipment</th>
              <th>MC No</th>
              <th>DOT No</th>
              <th>City</th>
              <th>State</th>
              <th>SCAC</th>
            </tr>
          </thead>
          <tbody>
            {pageRows.map((c) => {
              const fav = isFavorite(c.id)
              const onTimeNum = parseInt(c.onTime, 10)
              return (
                <tr key={c.id} onClick={() => onOpenCarrier(c.id)}>
                  <td className="mc-col-fav">
                    <button
                      type="button"
                      className={cn('mc-heart', fav && 'is-on')}
                      aria-pressed={fav}
                      aria-label={fav ? `Remove ${c.name} from favourites` : `Add ${c.name} to favourites`}
                      title={fav ? 'Remove from favourites' : 'Add to favourites'}
                      onClick={(e) => {
                        e.stopPropagation()
                        toggle(c.id)
                      }}
                    >
                      <Heart size={14} fill={fav ? 'currentColor' : 'none'} />
                    </button>
                  </td>
                  <td>
                    <div className="mc-cell-2">
                      <strong>{c.name}</strong>
                      <span>{c.division}</span>
                    </div>
                  </td>
                  <td>
                    <span className={cn('mc-status', `is-${c.status.toLowerCase()}`)}>
                      {c.status}
                    </span>
                  </td>
                  <td>
                    <div className="mc-cell-2">
                      <strong>{c.rep}</strong>
                      <span>{c.team}</span>
                    </div>
                  </td>
                  <td>
                    <div className="mc-cell-2">
                      <strong>{c.contactName}</strong>
                      <span>{c.phone}</span>
                    </div>
                  </td>
                  <td className="mc-num mc-mono">{c.loads90}</td>
                  <td className="mc-num">
                    <span
                      className={cn(
                        'mc-ontime',
                        onTimeNum >= 93 ? 'is-good' : onTimeNum >= 85 ? 'is-mid' : 'is-low'
                      )}
                    >
                      {c.onTime}
                    </span>
                  </td>
                  <td>{c.lastLoad}</td>
                  <td>
                    <div className="mc-eq">
                      {c.equipment.map((e) => (
                        <em key={e}>{e}</em>
                      ))}
                    </div>
                  </td>
                  <td className="mc-mono">{c.mc}</td>
                  <td className="mc-mono">{c.dot}</td>
                  <td>{c.city}</td>
                  <td>{c.state}</td>
                  <td className="mc-mono">{c.scac}</td>
                </tr>
              )
            })}
            {pageRows.length === 0 && (
              <tr>
                <td colSpan={14} className="mc-empty">
                  No carriers match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mc-pager">
        <span>
          Showing {(pageSafe - 1) * perPage + 1} –{' '}
          {Math.min(pageSafe * perPage, filtered.length)} of {filtered.length}
        </span>
        <label className="mc-pager__per">
          Per page
          <select
            value={perPage}
            onChange={(e) => {
              setPerPage(Number(e.target.value))
              setPage(1)
            }}
          >
            {[10, 25, 50].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
        <div className="mc-pager__nav">
          <button
            type="button"
            disabled={pageSafe <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Prev
          </button>
          <span>
            {pageSafe} / {totalPages}
          </span>
          <button
            type="button"
            disabled={pageSafe >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  )
}
