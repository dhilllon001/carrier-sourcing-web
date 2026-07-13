import { useState } from 'react'
import {
  LayoutDashboard,
  Table2,
  Radar,
  Shield,
  Settings,
} from 'lucide-react'
import { CarrierSourcingReportPage } from '@/pages/CarrierSourcingReportPage'
import { cn } from '@/lib/cn'

const NAV = [
  { id: 'report', label: 'Sourcing report', icon: LayoutDashboard, count: '12' },
  { id: 'loads', label: 'All loads', icon: Table2, count: '8.6k' },
  { id: 'radar', label: 'Lane radar', icon: Radar, count: '99+' },
  { id: 'cmt', label: 'CMT', icon: Shield, count: '20' },
  { id: 'settings', label: 'Settings', icon: Settings },
] as const

export default function App() {
  const [nav, setNav] = useState<(typeof NAV)[number]['id']>('report')

  return (
    <div className="sr-app">
      <aside className="sr-sidebar">
        <div className="sr-sidebar__brand">
          <div className="sr-sidebar__mark">CS</div>
          <div>
            <div className="sr-sidebar__brand-title">Carrier Sourcing</div>
            <div className="sr-sidebar__brand-sub">ChargerFleet · Pearl</div>
          </div>
        </div>

        <div className="sr-sidebar__eyebrow">Workspace</div>
        {NAV.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.id}
              type="button"
              className={cn('sr-sidebar__nav-link', nav === item.id && 'is-active')}
              onClick={() => setNav(item.id)}
            >
              <Icon size={16} strokeWidth={1.75} />
              <span>{item.label}</span>
              {'count' in item && item.count && (
                <span className="sr-nav-count">{item.count}</span>
              )}
            </button>
          )
        })}
      </aside>

      <div className="sr-main">
        <header className="sr-topbar">
          <div>
            <h1 className="sr-topbar__title">Carrier sourcing report</h1>
            <p className="sr-topbar__sub">
              Enterprise reporting table · ChargerFleet / Pearl tokens
            </p>
          </div>
          <button type="button" className="sr-btn sr-btn--primary">
            Export CSV
          </button>
        </header>

        {nav === 'report' ? (
          <CarrierSourcingReportPage />
        ) : (
          <div className="sr-page">
            <div className="sr-card sr-card__pad">
              <h3 className="sr-card__title">{NAV.find((n) => n.id === nav)?.label}</h3>
              <p className="sr-card__meta">
                Placeholder section — switch back to Sourcing report for the full table system.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
