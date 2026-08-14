import { useMemo, useState, type ReactNode } from 'react'
import { ArrowDown, ArrowUp, Mail, Phone, Plus, Search, Sparkles, Star, X } from 'lucide-react'
import { cn } from '@/lib/cn'
import {
  CAPABILITIES,
  CHANNELS,
  CHANNEL_NOTE,
  LANGUAGES,
  PAYMENT_TERMS,
  QUIET_FROM,
  QUIET_TO,
  RATE_CON_MODES,
  type Capability,
  type CarrierPref,
  type PrefContact,
} from '@/data/autoWorkflows'
import { Chip, Metric, NumCard, Stepper, Switch } from './parts'

type CarrierPrefsViewProps = {
  carriers: CarrierPref[]
  total: number
  selectedId: string
  onSelect: (id: string) => void
  onChange: (next: CarrierPref) => void
  onReset: (id: string) => void
  dirty: boolean
  onSave: () => void
}

function contactChannel(carrier: CarrierPref, contact: PrefContact): 'WhatsApp' | 'Email' {
  if (contact.channel) return contact.channel
  return carrier.channels.includes('WhatsApp') ? 'WhatsApp' : 'Email'
}

function PrefRow({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: ReactNode
}) {
  return (
    <div className="cfg-prow">
      <span className="cfg-prow__label">{label}</span>
      <div className="cfg-prow__ctl">{children}</div>
      {hint && <p className="cfg-prow__hint">{hint}</p>}
    </div>
  )
}

function CarrierCard({
  carrier,
  active,
  onSelect,
}: {
  carrier: CarrierPref
  active: boolean
  onSelect: () => void
}) {
  const fav = carrier.contacts.find((c) => c.id === carrier.favouriteId)
  const first = carrier.channels[0]
  return (
    <button
      type="button"
      className={cn('cfg-carrier', active && 'is-on', carrier.doNotUse && 'is-blocked')}
      onClick={onSelect}
    >
      <span className="cfg-carrier__top">
        <i className={cn('cfg-dot', carrier.doNotUse ? 'is-alert' : 'is-live')} aria-hidden />
        <strong>{carrier.name}</strong>
      </span>
      <span className="cfg-carrier__id">
        {carrier.mc}
        <i aria-hidden />
        {carrier.city}
      </span>
      <span className="cfg-carrier__tags">
        <em className={cn('cfg-tag', carrier.doNotUse ? 'is-neg' : 'is-accent')}>
          {carrier.doNotUse ? 'Do not use first' : `${first} first`}
        </em>
        <em className="cfg-tag">
          {carrier.contacts.length} contact{carrier.contacts.length === 1 ? '' : 's'}
        </em>
        {fav && (
          <em className="cfg-tag is-fav">
            <Star size={10} strokeWidth={2.4} fill="currentColor" />
            {fav.name.split(' ')[0]}
          </em>
        )}
      </span>
    </button>
  )
}

export function CarrierPrefsView({
  carriers,
  total,
  selectedId,
  onSelect,
  onChange,
  onReset,
  dirty,
  onSave,
}: CarrierPrefsViewProps) {
  const [q, setQ] = useState('')
  const [lane, setLane] = useState('')

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase()
    if (!needle) return carriers
    return carriers.filter((c) =>
      [c.name, c.mc, c.city].join(' ').toLowerCase().includes(needle)
    )
  }, [carriers, q])

  const active = shown.find((c) => c.id === selectedId) ?? shown[0]

  const patch = (next: Partial<CarrierPref>) => {
    if (active) onChange({ ...active, ...next })
  }

  const patchContact = (id: string, next: Partial<PrefContact>) => {
    if (!active) return
    onChange({
      ...active,
      contacts: active.contacts.map((c) => (c.id === id ? { ...c, ...next } : c)),
    })
  }

  const moveChannel = (index: number, dir: -1 | 1) => {
    if (!active) return
    const next = [...active.channels]
    const target = index + dir
    if (target < 0 || target >= next.length) return
    ;[next[index], next[target]] = [next[target], next[index]]
    patch({ channels: next })
  }

  const fav = active?.contacts.find((c) => c.id === active.favouriteId) ?? active?.contacts[0]
  const tenderCount = active?.contacts.filter((c) => c.caps.includes('Tenders')).length ?? 0
  const unusedChannels = CHANNELS.filter((c) => !active?.channels.includes(c))

  return (
    <div className="cfg-split">
      <aside className="cfg-list">
        <header className="cfg-list__head">
          <span className="cfg-eyebrow">Carriers</span>
          <em>{q ? `${shown.length} of ${total}` : total}</em>
        </header>

        <div className="cfg-list__search">
          <Search size={13} strokeWidth={2.2} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name, MC, city…"
            aria-label="Search carriers"
          />
        </div>

        <div className="cfg-list__body">
          {shown.length === 0 && <p className="cfg-empty">No carrier matches that search.</p>}
          {shown.map((carrier) => (
            <CarrierCard
              key={carrier.id}
              carrier={carrier}
              active={carrier.id === active?.id}
              onSelect={() => onSelect(carrier.id)}
            />
          ))}
        </div>
      </aside>

      {!active && (
        <section className="cfg-detail">
          <div className="cfg-detail__blank">Nothing to show for this search.</div>
        </section>
      )}

      {active && (
        <section className="cfg-detail cfg-detail--prefs">
          <div className="cfg-detail__body">
            <header className="cfg-prefs__head">
              <h2>{active.name}</h2>
              <p>
                These preferences apply to every future sourcing run. When this carrier is in a
                waterfall, the broadcast uses the contacts and channel order set here rather than
                the workflow defaults.
              </p>
            </header>

            <div className="cfg-metrics">
              <Metric
                label="MC / DOT"
                value={active.mc}
                note={`DOT ${active.dot} · ${active.city}`}
              />
              <Metric
                label="Loads booked"
                value={String(active.stats.loadsBooked)}
                note={active.stats.lastBooked}
              />
              <Metric
                label="On time"
                value={active.stats.onTime}
                note={active.stats.onTimeNote}
                tone={parseInt(active.stats.onTime, 10) >= 90 ? 'pos' : 'neg'}
              />
              <Metric
                label="Avg response"
                value={active.stats.avgResponse}
                note={active.stats.avgResponseNote}
              />
              <Metric
                label="Insurance"
                value={active.stats.insurance}
                note={active.stats.insuranceNote}
                tone={active.stats.insurance.startsWith('Expired') ? 'neg' : undefined}
              />
            </div>

            <p className="cfg-summary">
              <Sparkles size={13} strokeWidth={2.2} />
              <span>
                Tenders go to <b>{fav?.name}</b> on <b>{active.channels[0]}</b> first
                {active.channels[1] ? (
                  <>
                    , then <b>{active.channels[1]}</b> after {active.fallThrough} min
                  </>
                ) : null}
                . {tenderCount} contact{tenderCount === 1 ? '' : 's'} receive tenders.{' '}
                {active.quietOn
                  ? `Nothing is sent between ${active.quietFrom} and ${active.quietTo}. `
                  : 'This carrier accepts tenders around the clock. '}
                Rate confirmations go out by {active.rateCon}
                {active.signedRateCon ? ' and must come back signed.' : ' — no signature needed.'}
              </span>
            </p>

            <NumCard
              n={1}
              title="Contacts"
              hint="Star the favourite — that's who the automation talks to first"
              right={
                <span className="cfg-card__aside">
                  {active.contacts.length} on file · {tenderCount} get tenders
                </span>
              }
            >
              <div className="cfg-contacts">
                {active.contacts.map((contact) => {
                  const isFav = contact.id === active.favouriteId
                  const channel = contactChannel(active, contact)
                  return (
                    <article
                      key={contact.id}
                      className={cn('cfg-contact', isFav && 'is-fav')}
                    >
                      <button
                        type="button"
                        className={cn('cfg-contact__star', isFav && 'is-on')}
                        aria-label={`Make ${contact.name} the favourite`}
                        aria-pressed={isFav}
                        onClick={() => patch({ favouriteId: contact.id })}
                      >
                        <Star
                          size={14}
                          strokeWidth={2.2}
                          fill={isFav ? 'currentColor' : 'none'}
                        />
                      </button>

                      <div className="cfg-contact__main">
                        <div className="cfg-contact__name">
                          <strong>{contact.name}</strong>
                          <em className="cfg-tag">{contact.role}</em>
                          {isFav && <em className="cfg-tag is-fav">Favourite</em>}
                        </div>
                        <div className="cfg-contact__reach">
                          <span>
                            <Mail size={11} strokeWidth={2} />
                            {contact.email}
                          </span>
                          <span>
                            <Phone size={11} strokeWidth={2} />
                            {contact.phone}
                            <i>{contact.tz}</i>
                          </span>
                        </div>
                        <div className="cfg-contact__caps">
                          {CAPABILITIES.map((cap) => {
                            const on = contact.caps.includes(cap)
                            return (
                              <Chip
                                key={cap}
                                label={cap}
                                active={on}
                                onClick={() =>
                                  patchContact(contact.id, {
                                    caps: on
                                      ? contact.caps.filter((c) => c !== cap)
                                      : [...contact.caps, cap as Capability],
                                  })
                                }
                              />
                            )
                          })}
                        </div>
                      </div>

                      <div className="cfg-contact__side">
                        <button
                          type="button"
                          className={cn('cfg-pick', channel === 'WhatsApp' && 'is-on')}
                          onClick={() => patchContact(contact.id, { channel: 'WhatsApp' })}
                        >
                          WhatsApp
                        </button>
                        <button
                          type="button"
                          className={cn('cfg-pick', channel === 'Email' && 'is-on')}
                          onClick={() => patchContact(contact.id, { channel: 'Email' })}
                        >
                          Email
                        </button>
                        <button
                          type="button"
                          className="cfg-remove"
                          onClick={() =>
                            patch({
                              contacts: active.contacts.filter((c) => c.id !== contact.id),
                            })
                          }
                        >
                          Remove
                        </button>
                      </div>
                    </article>
                  )
                })}
              </div>
            </NumCard>

            <NumCard
              n={2}
              title="Preferred mode of communication"
              hint="Tried in this order, falling through when nobody replies"
              right={<span className="cfg-card__aside">{active.channels.join(' → ')}</span>}
            >
              <ol className="cfg-order">
                {active.channels.map((channel, i) => (
                  <li key={channel} className={cn('cfg-order__row', i === 0 && 'is-first')}>
                    <span className="cfg-order__n" aria-hidden>
                      {i + 1}
                    </span>
                    <div className="cfg-order__main">
                      <div className="cfg-order__name">
                        <strong>{channel}</strong>
                        {i === 0 && <em className="cfg-tag is-accent">First try</em>}
                      </div>
                      <p>{CHANNEL_NOTE[channel]}</p>
                    </div>
                    <div className="cfg-order__acts">
                      <button
                        type="button"
                        aria-label={`Move ${channel} up`}
                        disabled={i === 0}
                        onClick={() => moveChannel(i, -1)}
                      >
                        <ArrowUp size={12} strokeWidth={2.2} />
                      </button>
                      <button
                        type="button"
                        aria-label={`Move ${channel} down`}
                        disabled={i === active.channels.length - 1}
                        onClick={() => moveChannel(i, 1)}
                      >
                        <ArrowDown size={12} strokeWidth={2.2} />
                      </button>
                      <button
                        type="button"
                        aria-label={`Remove ${channel}`}
                        disabled={active.channels.length === 1}
                        onClick={() =>
                          patch({ channels: active.channels.filter((c) => c !== channel) })
                        }
                      >
                        <X size={12} strokeWidth={2.2} />
                      </button>
                    </div>
                  </li>
                ))}
              </ol>

              {unusedChannels.length > 0 && (
                <div className="cfg-order__add">
                  {unusedChannels.map((channel) => (
                    <button
                      type="button"
                      key={channel}
                      className="cfg-add"
                      onClick={() => patch({ channels: [...active.channels, channel] })}
                    >
                      <Plus size={12} strokeWidth={2.4} />
                      {channel}
                    </button>
                  ))}
                </div>
              )}

              <PrefRow
                label="Fall through after"
                hint="If the first channel gets no reply in this long, the next one is tried automatically."
              >
                <Stepper
                  value={active.fallThrough}
                  onChange={(v) => patch({ fallThrough: v })}
                  step={5}
                  min={5}
                  max={120}
                  unit="min"
                />
              </PrefRow>

              <PrefRow label="Quiet hours">
                <div className="cfg-inline">
                  <Switch
                    checked={active.quietOn}
                    onChange={(v) => patch({ quietOn: v })}
                    label="Quiet hours"
                  />
                  {QUIET_FROM.map((t) => (
                    <Chip
                      key={t}
                      label={`from ${t}`}
                      active={active.quietOn && active.quietFrom === t}
                      onClick={() => patch({ quietOn: true, quietFrom: t })}
                    />
                  ))}
                  {QUIET_TO.map((t) => (
                    <Chip
                      key={t}
                      label={`to ${t}`}
                      active={active.quietOn && active.quietTo === t}
                      onClick={() => patch({ quietOn: true, quietTo: t })}
                    />
                  ))}
                </div>
              </PrefRow>

              <PrefRow label="Language">
                <div className="cfg-inline">
                  {LANGUAGES.map((l) => (
                    <Chip
                      key={l}
                      label={l}
                      active={active.language === l}
                      onClick={() => patch({ language: l })}
                    />
                  ))}
                </div>
              </PrefRow>
            </NumCard>

            <NumCard
              n={3}
              title="Tender & booking"
              hint="How this carrier accepts work and paperwork"
              right={
                <span className="cfg-card__aside">
                  {active.rateCon} · {active.paymentTerms}
                </span>
              }
            >
              <PrefRow label="Rate con delivery">
                <div className="cfg-inline">
                  {RATE_CON_MODES.map((mode) => (
                    <Chip
                      key={mode}
                      label={mode}
                      active={active.rateCon === mode}
                      onClick={() => patch({ rateCon: mode })}
                    />
                  ))}
                </div>
              </PrefRow>

              <PrefRow
                label="Auto-tender allowed"
                hint="A workflow may tender to this carrier without a human."
              >
                <Switch
                  checked={active.autoTender}
                  onChange={(v) => patch({ autoTender: v })}
                  label="Auto-tender allowed"
                />
              </PrefRow>

              <PrefRow label="Signed rate con required">
                <Switch
                  checked={active.signedRateCon}
                  onChange={(v) => patch({ signedRateCon: v })}
                  label="Signed rate con required"
                />
              </PrefRow>

              <PrefRow
                label="Accepts WhatsApp confirmation"
                hint="Lets the booking stage close on a WhatsApp reply instead of waiting for a signature."
              >
                <Switch
                  checked={active.whatsappConfirm}
                  onChange={(v) => patch({ whatsappConfirm: v })}
                  label="Accepts WhatsApp confirmation"
                />
              </PrefRow>

              <PrefRow label="Payment terms">
                <div className="cfg-inline">
                  {PAYMENT_TERMS.map((term) => (
                    <Chip
                      key={term}
                      label={term}
                      active={active.paymentTerms === term}
                      onClick={() => patch({ paymentTerms: term })}
                    />
                  ))}
                </div>
              </PrefRow>
            </NumCard>

            <NumCard
              n={4}
              title="Lanes & capacity"
              hint="Used to rank this carrier inside the waterfall"
              right={
                <span className="cfg-card__aside">
                  {active.lanes.length} lane{active.lanes.length === 1 ? '' : 's'} ·{' '}
                  {active.loadsPerWeek}/week
                </span>
              }
            >
              <div className="cfg-lanes">
                <span className="cfg-field__label">Preferred lanes</span>
                <div className="cfg-inline">
                  {active.lanes.map((l) => (
                    <span key={l} className="cfg-chip is-on">
                      {l}
                      <button
                        type="button"
                        aria-label={`Remove ${l}`}
                        onClick={() => patch({ lanes: active.lanes.filter((x) => x !== l) })}
                      >
                        <X size={10} strokeWidth={2.6} />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="cfg-inline">
                  <input
                    className="cfg-input"
                    value={lane}
                    placeholder="Brampton → Chicago"
                    onChange={(e) => setLane(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && lane.trim()) {
                        patch({ lanes: [...active.lanes, lane.trim()] })
                        setLane('')
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="cfg-add"
                    disabled={!lane.trim()}
                    onClick={() => {
                      patch({ lanes: [...active.lanes, lane.trim()] })
                      setLane('')
                    }}
                  >
                    <Plus size={12} strokeWidth={2.4} />
                    Add lane
                  </button>
                </div>
              </div>

              <PrefRow
                label="Loads per week"
                hint="The waterfall stops offering once this carrier is at capacity for the week."
              >
                <Stepper
                  value={active.loadsPerWeek}
                  onChange={(v) => patch({ loadsPerWeek: v })}
                  step={1}
                  min={1}
                  max={60}
                  unit="loads"
                />
              </PrefRow>

              <PrefRow
                label="Equipment they run"
                hint="Comes from the carrier profile, not editable here."
              >
                <div className="cfg-inline">
                  {active.equipment.map((e) => (
                    <Chip key={e} label={e} locked />
                  ))}
                </div>
              </PrefRow>
            </NumCard>

            <NumCard
              n={5}
              title="Restrictions"
              hint="Take this carrier out of automated sourcing"
              right={
                <span className={cn('cfg-card__aside', active.doNotUse && 'is-neg')}>
                  {active.doNotUse ? 'excluded' : 'no restrictions'}
                </span>
              }
            >
              <PrefRow
                label="Do not use"
                hint="Excluded from every waterfall while this is on, whatever the workflow says."
              >
                <Switch
                  checked={active.doNotUse}
                  onChange={(v) => patch({ doNotUse: v })}
                  label="Do not use"
                />
              </PrefRow>
            </NumCard>
          </div>

          <footer className="cfg-savebar">
            <span>
              {dirty
                ? 'Unsaved changes · nothing applies until you save'
                : 'All changes saved · applied to every future sourcing run'}
            </span>
            <button
              type="button"
              className="cfg-btn"
              disabled={!dirty}
              onClick={() => onReset(active.id)}
            >
              Reset
            </button>
            <button
              type="button"
              className={cn('cfg-btn is-primary', !dirty && 'is-quiet')}
              disabled={!dirty}
              onClick={onSave}
            >
              Save preferences
            </button>
          </footer>
        </section>
      )}
    </div>
  )
}
