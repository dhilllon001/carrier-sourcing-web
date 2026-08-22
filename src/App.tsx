import { useMemo, useState } from 'react'
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
  Route,
  SlidersHorizontal,
  Gauge,
  ShieldCog,
  Sparkles,
  UserRoundCog,
  FileSpreadsheet,
} from 'lucide-react'
import {
  CarrierSourcingReportPage,
  type ViewMode,
} from '@/pages/CarrierSourcingReportPage'
import { LoadDetailsPage } from '@/pages/LoadDetailsPage'
import { AvailabilityPage } from '@/pages/AvailabilityPage'
import { MyCarriersPage } from '@/pages/MyCarriersPage'
import { CarrierDetailPage } from '@/pages/CarrierDetailPage'
import { QuickLaneSearchPanel } from '@/components/QuickLaneSearchPanel'
import { SourcingStatusBar } from '@/components/SourcingStatusBar'
import { RouteInsightModal } from '@/components/RouteInsightModal'
import { insightRoutes } from '@/data/marketInsights'
import { CmtReviewPage } from '@/pages/CmtReviewPage'
import { CmtConfigurationPage } from '@/pages/CmtConfigurationPage'
import { AccessManagementPage } from '@/pages/AccessManagementPage'
import { ConfigurationPage } from '@/pages/ConfigurationPage'
import { CapacityManagerPage } from '@/pages/CapacityManagerPage'
import { CarrierSearchPage } from '@/pages/CarrierSearchPage'
import { MarketInsightsPage } from '@/pages/MarketInsightsPage'
import { InsightPreferencesPage } from '@/pages/InsightPreferencesPage'
import { RfpManagerPage } from '@/pages/RfpManagerPage'
import { reportLoads } from '@/data/report'
import { cmtReviewQueue } from '@/data/cmtReview'
import {
  defaultInsightPreferences,
  routeMatchesProfile,
} from '@/data/insightPreferences'
import { cn } from '@/lib/cn'

const NAV = [
  { id: 'sourcing', label: 'Sourcing', icon: Truck },
  { id: 'capacity', label: 'Carrier capacity manager', icon: Gauge },
  { id: 'configuration', label: 'Auto sourcing configuration', icon: SlidersHorizontal },
  { id: 'availability', label: 'Availability', icon: CalendarCheck2 },
  { id: 'carrier-search', label: 'Carrier capacity', icon: Search },
  { id: 'market-insights', label: 'AI market insights', icon: Sparkles },
  { id: 'insight-preferences', label: 'User preferences', icon: UserRoundCog, sub: true },
  { id: 'carriers', label: 'My carriers', icon: Users },
  { id: 'access', label: 'Access & management', icon: KeyRound },
  { id: 'cmt', label: 'CMT', icon: Shield },
  { id: 'cmt-configuration', label: 'CMT configuration', icon: ShieldCog },
  { id: 'rfp', label: 'RFP manager', icon: FileSpreadsheet },
] as const

export default function App() {
  const [nav, setNav] = useState<(typeof NAV)[number]['id']>('sourcing')
  const [collapsed, setCollapsed] = useState(true)
  const [search, setSearch] = useState('')
  const [viewMode, setViewMode] = useState<ViewMode>('table')
  const [refreshKey, setRefreshKey] = useState(0)
  const [openLoadId, setOpenLoadId] = useState<string | null>(null)
  const [openCarrierId, setOpenCarrierId] = useState<string | null>(null)
  const [laneSearchOpen, setLaneSearchOpen] = useState(false)
  const [newLaneOpen, setNewLaneOpen] = useState(false)
  /* Quick market read for whoever lands on Sourcing, so they see the news before working loads. */
  const [briefOpen, setBriefOpen] = useState(true)
  const [insightPreferences, setInsightPreferences] = useState(defaultInsightPreferences)
  const [configView, setConfigView] = useState<
    'workflows' | 'runs' | 'carriers' | 'favorites' | 'new'
  >('workflows')
  const cmtPendingCount = cmtReviewQueue.filter((r) => r.status === 'Pending').length
  const activeInsightProfile =
    insightPreferences.profiles.find(
      (profile) => profile.id === insightPreferences.activeProfileId
    ) ?? insightPreferences.profiles[0]
  const preferredBriefRoute =
    insightRoutes.find((route) => routeMatchesProfile(route, activeInsightProfile)) ??
    insightRoutes[0]

  const openLoad = useMemo(
    () => reportLoads.find((r) => r.id === openLoadId) ?? null,
    [openLoadId]
  )

  const inDetails = Boolean(openLoad) || Boolean(openCarrierId)

  const openCarrierPrefs = () => {
    setOpenLoadId(null)
    setOpenCarrierId(null)
    setConfigView('carriers')
    setNav('configuration')
  }

  return (
    <div className="sr-shell">
    <div className={cn('sr-app', collapsed && 'is-collapsed', inDetails && 'is-details')}>
      {!inDetails && (
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
                className={cn(
                  'sr-sidebar__nav-link',
                  'sub' in item && item.sub && 'is-sub',
                  nav === item.id && 'is-active'
                )}
                onClick={() => {
                  setNav(item.id)
                  setOpenLoadId(null)
                  setOpenCarrierId(null)
                  if (item.id === 'configuration') setConfigView('workflows')
                  if (item.id === 'sourcing' && nav !== 'sourcing') setBriefOpen(true)
                }}
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
      )}

      <div className="sr-main">
        {inDetails && openLoad ? (
          <LoadDetailsPage
            load={openLoad}
            onBack={() => setOpenLoadId(null)}
            onOpenCarrierPrefs={openCarrierPrefs}
          />
        ) : inDetails && openCarrierId ? (
          <CarrierDetailPage
            carrierId={openCarrierId}
            onBack={() => setOpenCarrierId(null)}
          />
        ) : (
          <>
            <header className="sr-topbar">
              <div className="sr-topbar__left">
                <h1 className="sr-topbar__title">
                  {nav === 'cmt'
                    ? 'CMT Review'
                    : (NAV.find((n) => n.id === nav)?.label ?? 'Sourcing')}
                </h1>
              </div>

              <label className="sr-search sr-search--header">
                <Search size={15} strokeWidth={1.75} />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={
                    nav === 'capacity'
                      ? 'Search lane, customer, team, or carrier…'
                      : nav === 'configuration'
                      ? 'Search workflows, runs, probill, carrier…'
                      : nav === 'availability'
                      ? 'Search carrier, lane, equipment, notes…'
                      : nav === 'carrier-search'
                        ? 'Search carrier, MC, contact, or lane…'
                      : nav === 'market-insights'
                        ? 'Search market, route, customer…'
                      : nav === 'insight-preferences'
                        ? 'Search preferences, states, lanes…'
                      : nav === 'carriers'
                        ? 'Search carrier, MC, DOT, contact…'
                        : nav === 'cmt'
                          ? 'Search carrier, lane, equipment, notes…'
                          : nav === 'cmt-configuration'
                            ? 'Search configuration, customer, condition, owner…'
                          : nav === 'rfp'
                            ? 'Search RFP, customer, owner, lane…'
                          : nav === 'access'
                            ? 'Search user, role, team…'
                            : 'Search probills, PO, customer, equipment…'
                  }
                />
              </label>

              <div className="sr-topbar__actions">
                {nav === 'carrier-search' ? (
                  <button
                    type="button"
                    className="sr-btn sr-btn--lane"
                    onClick={() => setNewLaneOpen(true)}
                  >
                    <SlidersHorizontal size={14} strokeWidth={1.85} />
                    New lane search
                  </button>
                ) : ['market-insights', 'insight-preferences'].includes(nav) ? null : (
                  <button
                    type="button"
                    className="sr-btn sr-btn--lane"
                    onClick={() => setLaneSearchOpen(true)}
                  >
                    <Route size={14} strokeWidth={1.85} />
                    Quick Lane Search
                  </button>
                )}

                {nav === 'sourcing' && (
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
                )}

                {nav !== 'carrier-search' && (
                  <>
                    <button
                      type="button"
                      className={cn('sr-btn sr-btn--cmt', nav === 'cmt' && 'is-active')}
                      onClick={() => setNav('cmt')}
                      title="CMT"
                    >
                      <Shield size={14} strokeWidth={1.75} />
                      CMT
                      {cmtPendingCount > 0 && (
                        <span className="sr-btn__badge">{cmtPendingCount}</span>
                      )}
                    </button>

                    <button
                      type="button"
                      className="sr-btn sr-btn--icon"
                      aria-label="Refresh"
                      onClick={() => setRefreshKey((k) => k + 1)}
                    >
                      <RefreshCw size={15} strokeWidth={1.75} />
                    </button>
                  </>
                )}
              </div>
            </header>

            {nav === 'sourcing' ? (
              <CarrierSourcingReportPage
                search={search}
                onSearchChange={setSearch}
                viewMode={viewMode}
                refreshKey={refreshKey}
                onOpenLoad={setOpenLoadId}
              />
            ) : nav === 'capacity' ? (
              <CapacityManagerPage search={search} />
            ) : nav === 'configuration' ? (
              <ConfigurationPage
                key={configView}
                search={search}
                initialView={configView}
                onOpenLoad={(probill) => {
                  if (reportLoads.some((r) => r.id === probill)) {
                    setNav('sourcing')
                    setOpenLoadId(probill)
                  }
                }}
              />
            ) : nav === 'availability' ? (
              <AvailabilityPage search={search} />
            ) : nav === 'carrier-search' ? (
              <CarrierSearchPage
                search={search}
                onOpenCarrier={setOpenCarrierId}
                panelOpen={newLaneOpen}
                onPanelOpenChange={setNewLaneOpen}
              />
            ) : nav === 'market-insights' ? (
              <MarketInsightsPage
                search={search}
                profile={activeInsightProfile}
                onOpenCapacity={() => setNav('carrier-search')}
                onOpenPreferences={() => setNav('insight-preferences')}
              />
            ) : nav === 'insight-preferences' ? (
              <InsightPreferencesPage
                preferences={insightPreferences}
                onChange={setInsightPreferences}
              />
            ) : nav === 'carriers' ? (
              <MyCarriersPage
                search={search}
                onOpenCarrier={setOpenCarrierId}
                onOpenLaneSearch={() => setLaneSearchOpen(true)}
              />
            ) : nav === 'cmt' ? (
              <CmtReviewPage search={search} refreshKey={refreshKey} />
            ) : nav === 'cmt-configuration' ? (
              <CmtConfigurationPage search={search} />
            ) : nav === 'rfp' ? (
              <RfpManagerPage search={search} />
            ) : nav === 'access' ? (
              <AccessManagementPage search={search} />
            ) : (
              <div className="sr-page">
                <div className="sr-card sr-card__pad">
                  <h3 className="sr-card__title">
                    {NAV.find((n) => n.id === nav)?.label}
                  </h3>
                  <p className="sr-card__meta">
                    This module is ready for wiring. Use Sourcing for the full load table and
                    lifecycle filters.
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <QuickLaneSearchPanel open={laneSearchOpen} onClose={() => setLaneSearchOpen(false)} />

      {nav === 'sourcing' && briefOpen && !inDetails && (
        <RouteInsightModal
          route={preferredBriefRoute}
          eyebrow="Sourcing brief · Aug 20"
          primaryLabel="Open AI market insights"
          onPrimary={() => setNav('market-insights')}
          onClose={() => setBriefOpen(false)}
          withNews
          profile={activeInsightProfile}
        />
      )}
    </div>

      <SourcingStatusBar
        active={nav}
        onNavigate={(id) => {
          setOpenLoadId(null)
          setOpenCarrierId(null)
          if (id === 'sourcing' && nav !== 'sourcing') setBriefOpen(true)
          setNav(id)
        }}
        onOpenLaneSearch={() => setLaneSearchOpen(true)}
      />
    </div>
  )
}
