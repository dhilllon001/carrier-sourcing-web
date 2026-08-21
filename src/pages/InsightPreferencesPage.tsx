import { useMemo, useState } from 'react'
import {
  BellRing,
  Check,
  Clock3,
  MapPinned,
  Plus,
  Route,
  Search,
  UserRound,
  UsersRound,
  X,
} from 'lucide-react'
import { marketAreas } from '@/data/marketInsights'
import {
  subscriptionDetails,
  type InsightPreferenceProfile,
  type InsightPreferences,
  type InsightSubscription,
} from '@/data/insightPreferences'
import { cn } from '@/lib/cn'

type Props = {
  preferences: InsightPreferences
  onChange: (preferences: InsightPreferences) => void
}

const subscriptions = Object.keys(subscriptionDetails) as InsightSubscription[]

const timeLabel = (time: string) =>
  new Date(`2026-01-01T${time}`).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })

export function InsightPreferencesPage({ preferences, onChange }: Props) {
  const [origin, setOrigin] = useState('CA')
  const [destination, setDestination] = useState('TX')
  const [newTime, setNewTime] = useState('09:00')
  const [marketFilter, setMarketFilter] = useState('')
  const [saved, setSaved] = useState(true)

  const profile =
    preferences.profiles.find((item) => item.id === preferences.activeProfileId) ??
    preferences.profiles[0]

  const countries = useMemo(() => {
    const query = marketFilter.trim().toLowerCase()
    const match = (name: string, code: string) =>
      !query || name.toLowerCase().includes(query) || code.toLowerCase().includes(query)
    return [
      {
        id: 'US' as const,
        label: 'United States',
        all: marketAreas.filter((area) => area.country === 'US'),
        shown: marketAreas.filter((area) => area.country === 'US' && match(area.name, area.code)),
      },
      {
        id: 'CA' as const,
        label: 'Canada',
        all: marketAreas.filter((area) => area.country === 'CA'),
        shown: marketAreas.filter((area) => area.country === 'CA' && match(area.name, area.code)),
      },
      {
        id: 'MX' as const,
        label: 'Mexico',
        all: marketAreas.filter((area) => area.country === 'MX'),
        shown: marketAreas.filter((area) => area.country === 'MX' && match(area.name, area.code)),
      },
    ]
  }, [marketFilter])

  const updateProfile = (update: Partial<InsightPreferenceProfile>) => {
    setSaved(false)
    onChange({
      ...preferences,
      profiles: preferences.profiles.map((item) =>
        item.id === profile.id ? { ...item, ...update } : item
      ),
    })
  }

  const toggleArea = (code: string) => {
    updateProfile({
      areaCodes: profile.areaCodes.includes(code)
        ? profile.areaCodes.filter((item) => item !== code)
        : [...profile.areaCodes, code],
    })
  }

  const toggleSubscription = (subscription: InsightSubscription) => {
    updateProfile({
      subscriptions: profile.subscriptions.includes(subscription)
        ? profile.subscriptions.filter((item) => item !== subscription)
        : [...profile.subscriptions, subscription],
    })
  }

  const addLane = () => {
    if (origin === destination) return
    if (profile.lanes.some((lane) => lane.origin === origin && lane.destination === destination))
      return
    updateProfile({
      lanes: [...profile.lanes, { id: `${origin}-${destination}-${Date.now()}`, origin, destination }],
      areaCodes: Array.from(new Set([...profile.areaCodes, origin, destination])),
    })
  }

  const addTime = () => {
    if (profile.deliveryTimes.includes(newTime)) return
    updateProfile({ deliveryTimes: [...profile.deliveryTimes, newTime].sort() })
  }

  return (
    <main className="ip-page">
      <header className="ip-bar">
        <div className="ip-bar__title">
          <h2>Insight preferences</h2>
          <p>
            Controls the AI Market Insights board, alerts, and the brief shown when Sourcing opens.
          </p>
        </div>

        <div className="ip-bar__stats">
          <span>
            <b>{profile.areaCodes.length}</b> markets
          </span>
          <span>
            <b>{profile.lanes.length}</b> lanes
          </span>
          <span>
            <b>{profile.subscriptions.length}</b> alert types
          </span>
          <span>
            <b>{profile.deliveryTimes.length}</b> daily briefs
          </span>
        </div>

        <div className="ip-bar__save">
          <em className={cn(!saved && 'is-dirty')}>{saved ? 'All changes saved' : 'Unsaved changes'}</em>
          <button type="button" disabled={saved} onClick={() => setSaved(true)}>
            <Check size={14} /> Save preferences
          </button>
        </div>
      </header>

      <div className="ip-scroll">
        <div className="ip-layout">
          <aside className="ip-profiles">
            <span>Preference owner</span>
            {preferences.profiles.map((item) => (
              <button
                key={item.id}
                type="button"
                className={cn(item.id === profile.id && 'is-active')}
                onClick={() => {
                  setSaved(true)
                  onChange({ ...preferences, activeProfileId: item.id })
                }}
              >
                <i>{item.ownerType === 'user' ? <UserRound size={15} /> : <UsersRound size={15} />}</i>
                <span>
                  <strong>{item.name}</strong>
                  <small>{item.description}</small>
                </span>
                {item.id === profile.id && <Check size={14} />}
              </button>
            ))}
            <p>
              Team preferences are shared defaults. Personal preferences only affect your own board
              and notifications.
            </p>
          </aside>

          <div className="ip-content">
            <section className="ip-card">
              <header>
                <i>
                  <MapPinned size={16} />
                </i>
                <div>
                  <h3>States &amp; provinces</h3>
                  <p>Select individual markets, then combine them into lanes below.</p>
                </div>
                <label className="ip-find">
                  <Search size={13} />
                  <input
                    value={marketFilter}
                    onChange={(event) => setMarketFilter(event.target.value)}
                    placeholder="Find a state or province"
                  />
                </label>
              </header>

              {countries.map((country) => {
                const selected = country.all.filter((area) =>
                  profile.areaCodes.includes(area.code)
                ).length
                const codes = country.all.map((area) => area.code)
                return (
                  <div key={country.id} className="ip-country">
                    <div className="ip-country__head">
                      <strong>{country.label}</strong>
                      <em>
                        {selected} of {country.all.length} selected
                      </em>
                      <button
                        type="button"
                        onClick={() =>
                          updateProfile({
                            areaCodes: Array.from(new Set([...profile.areaCodes, ...codes])),
                          })
                        }
                      >
                        Select all
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          updateProfile({
                            areaCodes: profile.areaCodes.filter((code) => !codes.includes(code)),
                          })
                        }
                      >
                        Clear
                      </button>
                    </div>

                    {country.shown.length ? (
                      <div className="ip-market-grid">
                        {country.shown.map((area) => {
                          const active = profile.areaCodes.includes(area.code)
                          return (
                            <button
                              key={area.code}
                              type="button"
                              className={cn(active && 'is-selected')}
                              aria-pressed={active}
                              onClick={() => toggleArea(area.code)}
                            >
                              <b>{area.code}</b>
                              <span>{area.name}</span>
                              {active && <Check size={12} />}
                            </button>
                          )
                        })}
                      </div>
                    ) : (
                      <p className="ip-none">No market matches “{marketFilter}”.</p>
                    )}
                  </div>
                )
              })}
            </section>

            <section className="ip-card">
              <header>
                <i>
                  <Route size={16} />
                </i>
                <div>
                  <h3>Preferred lanes</h3>
                  <p>Build exact origin-to-destination pairs, such as California to Texas.</p>
                </div>
                <span>{profile.lanes.length} lanes</span>
              </header>

              <div className="ip-lane-builder">
                <label>
                  <span>Origin</span>
                  <select value={origin} onChange={(event) => setOrigin(event.target.value)}>
                    {marketAreas.map((area) => (
                      <option key={`o-${area.country}-${area.code}`} value={area.code}>
                        {area.name} ({area.code})
                      </option>
                    ))}
                  </select>
                </label>
                <i aria-hidden>→</i>
                <label>
                  <span>Destination</span>
                  <select
                    value={destination}
                    onChange={(event) => setDestination(event.target.value)}
                  >
                    {marketAreas.map((area) => (
                      <option key={`d-${area.country}-${area.code}`} value={area.code}>
                        {area.name} ({area.code})
                      </option>
                    ))}
                  </select>
                </label>
                <button type="button" onClick={addLane} disabled={origin === destination}>
                  <Plus size={14} /> Add lane
                </button>
              </div>

              {profile.lanes.length ? (
                <div className="ip-chips">
                  {profile.lanes.map((lane) => (
                    <span key={lane.id}>
                      <Route size={12} />
                      <b>{lane.origin}</b> → <b>{lane.destination}</b>
                      <button
                        type="button"
                        aria-label={`Remove ${lane.origin} to ${lane.destination}`}
                        onClick={() =>
                          updateProfile({
                            lanes: profile.lanes.filter((item) => item.id !== lane.id),
                          })
                        }
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="ip-none">No preferred lanes yet. Add one to get lane-level alerts.</p>
              )}
            </section>

            <section className="ip-card">
              <header>
                <i>
                  <BellRing size={16} />
                </i>
                <div>
                  <h3>Insight subscriptions</h3>
                  <p>Choose which market changes create a brief or an alert.</p>
                </div>
                <span>{profile.subscriptions.length} active</span>
              </header>

              <div className="ip-subscriptions">
                {subscriptions.map((subscription) => {
                  const active = profile.subscriptions.includes(subscription)
                  return (
                    <button
                      key={subscription}
                      type="button"
                      className={cn(active && 'is-selected')}
                      aria-pressed={active}
                      onClick={() => toggleSubscription(subscription)}
                    >
                      <i>{active && <Check size={12} />}</i>
                      <span>
                        <strong>{subscriptionDetails[subscription].label}</strong>
                        <small>{subscriptionDetails[subscription].description}</small>
                      </span>
                    </button>
                  )
                })}
              </div>
            </section>

            <section className="ip-card">
              <header>
                <i>
                  <Clock3 size={16} />
                </i>
                <div>
                  <h3>Notification schedule</h3>
                  <p>Add one or more daily delivery times, for example 9:00 AM and 2:00 PM.</p>
                </div>
                <span>Eastern Time</span>
              </header>

              <div className="ip-schedule">
                <div className="ip-chips">
                  {profile.deliveryTimes.map((time) => (
                    <span key={time}>
                      <Clock3 size={12} />
                      {timeLabel(time)}
                      <button
                        type="button"
                        aria-label={`Remove ${timeLabel(time)}`}
                        onClick={() =>
                          updateProfile({
                            deliveryTimes: profile.deliveryTimes.filter((item) => item !== time),
                          })
                        }
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
                <label>
                  <input
                    type="time"
                    value={newTime}
                    onChange={(event) => setNewTime(event.target.value)}
                  />
                  <button type="button" onClick={addTime}>
                    <Plus size={13} /> Add time
                  </button>
                </label>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  )
}
