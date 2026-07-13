import { useState } from 'react'
import {
  Search,
  Shield,
  RefreshCw,
  Table2,
  LayoutGrid,
  PanelLeftClose,
  PanelLeftOpen,
  Truck,
  CalendarCheck2,
  Users,
  KeyRound,
  MapPin,
} from 'lucide-react'
import {
  CarrierSourcingReportPage,
  type ViewMode,
} from '@/pages/CarrierSourcingReportPage'
import { cn } from '@/lib/cn'

const NAV = [
  { id: 'sourcing', label: 'Sourcing', icon: Truck },
  { id: 'availability', label: 'Availability', icon: CalendarCheck2 },
  { id: 'carriers', label: 'My carriers', icon: Users },
  { id: 'access', label: 'Access & management', icon: KeyRound },
  { id: 'cmt', label: 'CMT', icon: Shield },
] as const

export default function App() {
  const [nav, setNav] = useState<(typeof NAV)[number]['id']>('sourcing')
  const [collapsed, setCollapsed] = useState(false)
  const [search, setSearch] = useState('')
  const [viewMode, setViewMode] = useState<ViewMode>('table')
  const [refreshKey, setRefreshKey] = useState(0)

  return (
    <div className={cn('sr-app', collapsed && 'is-collapsed')}>
      <aside className={cn('sr-sidebar', collapsed && 'is-collapsed')}>
        <div className="sr-sidebar__brand">
          <div className="sr-sidebar__mark">CS</div>
          {!collapsed && (
            <div className="sr-sidebar__brand-text">
              <div className="sr-sidebar__brand-title">Carrier Sourcing</div>
              <div className="sr-sidebar__brand-sub">ChargerFleet · Pearl</div>
            </div>
          )}
          <button
            type="button"
            className="sr-sidebar__collapse"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            onClick={() => setCollapsed((v) => !v)}
          >
            {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
          </button>
        </div>

        {!collapsed && <div className="sr-sidebar__eyebrow">Modules</div>}

        <nav className="sr-sidebar__nav">
          {NAV.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                type="button"
                title={item.label}
                className={cn('sr-sidebar__nav-link', nav === item.id && 'is-active')}
                onClick={() => setNav(item.id)}
              >
                <Icon size={16} strokeWidth={1.75} />
                {!collapsed && <span>{item.label}</span>}
              </button>
            )
          })}
        </nav>

        <div className="sr-sidebar__spacer" />

        <div className={cn('sr-sidebar__user', collapsed && 'is-collapsed')}>
          <div className="sr-sidebar__avatar" aria-hidden>
            SD
          </div>
          {!collapsed && (
            <div className="sr-sidebar__user-meta">
              <div className="sr-sidebar__user-name">Sukhdeep Dhillon</div>
              <div className="sr-sidebar__user-role">Carrier ops · Online</div>
            </div>
          )}
        </div>
      </aside>

      <div className="sr-main">
        <header className="sr-topbar">
          <div className="sr-topbar__left">
            <h1 className="sr-topbar__title">
              {NAV.find((n) => n.id === nav)?.label ?? 'Sourcing'}
            </h1>
          </div>

          <label className="sr-search sr-search--header">
            <Search size={15} strokeWidth={1.75} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search probills, PO, customer, equipment…"
            />
          </label>

          <div className="sr-topbar__actions">
            <button type="button" className="sr-btn">
              <MapPin size={14} strokeWidth={1.75} />
              Quick lane search
            </button>

            <div className="sr-view-toggle" role="group" aria-label="View mode">
              <button
                type="button"
                className={cn(viewMode === 'table' && 'is-active')}
                onClick={() => setViewMode('table')}
              >
                <Table2 size={14} />
                Table
              </button>
              <button
                type="button"
                className={cn(viewMode === 'cards' && 'is-active')}
                onClick={() => setViewMode('cards')}
              >
                <LayoutGrid size={14} />
                Cards
              </button>
            </div>

            <button
              type="button"
              className="sr-btn"
              onClick={() => setNav('cmt')}
              title="CMT"
            >
              <Shield size={14} strokeWidth={1.75} />
              CMT
            </button>

            <button
              type="button"
              className="sr-btn sr-btn--icon"
              aria-label="Refresh"
              onClick={() => setRefreshKey((k) => k + 1)}
            >
              <RefreshCw size={15} strokeWidth={1.75} />
            </button>
          </div>
        </header>

        {nav === 'sourcing' ? (
          <CarrierSourcingReportPage
            search={search}
            onSearchChange={setSearch}
            viewMode={viewMode}
            refreshKey={refreshKey}
          />
        ) : (
          <div className="sr-page">
            <div className="sr-card sr-card__pad">
              <h3 className="sr-card__title">
                {NAV.find((n) => n.id === nav)?.label}
              </h3>
              <p className="sr-card__meta">
                This module is ready for wiring. Use Sourcing for the full load table and lifecycle
                filters.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
