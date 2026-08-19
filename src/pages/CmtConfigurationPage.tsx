import { useMemo, useState } from 'react'
import {
  Building2,
  CalendarClock,
  Check,
  ChevronRight,
  FileCheck2,
  LockKeyhole,
  Plus,
  RotateCcw,
  ShieldCheck,
  UnlockKeyhole,
  UserRoundCheck,
  X,
} from 'lucide-react'
import {
  CMT_CUSTOMERS,
  CMT_GROUPS,
  CMT_RULES,
  cmtCustomerSettings,
  cmtOrgDefaults,
  describeCmtValue,
  type CmtApplicability,
  type CmtCheckpoint,
  type CmtCurrency,
  type CmtDurationUnit,
  type CmtGroupId,
  type CmtRuleDef,
  type CmtSetting,
  type CmtValue,
} from '@/data/cmtConfig'
import { cn } from '@/lib/cn'

type Props = { search: string }

const CHECKPOINTS: CmtCheckpoint[] = ['Award', 'Contract', 'Both']
const APPLICABILITY: CmtApplicability[] = [
  'All freight',
  'Power only',
  'Temp controlled',
  'High value',
  'Cross-border',
]

const ORG_SCOPE = 'Company default'

function blankValue(rule: CmtRuleDef): CmtValue {
  if (rule.input === 'toggle') return { kind: 'toggle', on: true }
  if (rule.input === 'duration') return { kind: 'duration', amount: 180, unit: 'days' }
  if (rule.input === 'currency') return { kind: 'currency', amount: 100_000, currency: 'USD' }
  return { kind: 'list', items: [] }
}

export function CmtConfigurationPage({ search }: Props) {
  const [orgSettings, setOrgSettings] = useState<CmtSetting[]>(cmtOrgDefaults)
  const [customerSettings, setCustomerSettings] =
    useState<Record<string, CmtSetting[]>>(cmtCustomerSettings)
  const [scope, setScope] = useState<string>(ORG_SCOPE)
  const [group, setGroup] = useState<CmtGroupId | 'all'>('all')
  const [adminUnlock, setAdminUnlock] = useState(false)
  const [addOpen, setAddOpen] = useState(false)

  const isOrg = scope === ORG_SCOPE
  const overrides = isOrg ? [] : (customerSettings[scope] ?? [])
  const locked = isOrg && !adminUnlock

  const q = search.trim().toLowerCase()
  const rules = useMemo(
    () =>
      CMT_RULES.filter((rule) => {
        if (group !== 'all' && rule.group !== group) return false
        if (!q) return true
        return [rule.label, rule.hint, rule.condition]
          .filter(Boolean)
          .some((text) => String(text).toLowerCase().includes(q))
      }),
    [group, q]
  )

  const orgOf = (key: string) => orgSettings.find((item) => item.ruleKey === key)
  const overrideOf = (key: string) => overrides.find((item) => item.ruleKey === key)

  const effective = (key: string) => {
    const override = overrideOf(key)
    if (override) return { setting: override, source: 'customer' as const }
    const org = orgOf(key)
    if (org) return { setting: org, source: 'org' as const }
    return { setting: undefined, source: 'none' as const }
  }

  const writeSetting = (key: string, patch: Partial<CmtSetting>, value?: CmtValue) => {
    const current = effective(key)
    const next: CmtSetting = {
      ruleKey: key,
      value: value ?? current.setting?.value ?? blankValue(CMT_RULES.find((r) => r.key === key)!),
      checkpoint: current.setting?.checkpoint ?? 'Award',
      applicability: current.setting?.applicability ?? 'All freight',
      updatedBy: 'Sukhdeep Dhillon',
      updatedAt: 'Aug 19, 2026',
      expiresOn: current.source === 'customer' ? current.setting?.expiresOn : undefined,
      ...patch,
    }
    if (isOrg) {
      setOrgSettings((list) => {
        const exists = list.some((item) => item.ruleKey === key)
        return exists ? list.map((item) => (item.ruleKey === key ? next : item)) : [...list, next]
      })
      return
    }
    setCustomerSettings((all) => {
      const list = all[scope] ?? []
      const exists = list.some((item) => item.ruleKey === key)
      return {
        ...all,
        [scope]: exists
          ? list.map((item) => (item.ruleKey === key ? next : item))
          : [...list, next],
      }
    })
  }

  const clearOverride = (key: string) =>
    setCustomerSettings((all) => ({
      ...all,
      [scope]: (all[scope] ?? []).filter((item) => item.ruleKey !== key),
    }))

  const totals = {
    org: orgSettings.length,
    overrides: Object.values(customerSettings).reduce((sum, list) => sum + list.length, 0),
    award: orgSettings.filter((s) => s.checkpoint === 'Award' || s.checkpoint === 'Both').length,
    contract: orgSettings.filter((s) => s.checkpoint === 'Contract' || s.checkpoint === 'Both')
      .length,
  }

  return (
    <div className="cmtcfg-page">
      <section className="cmtcfg-summary">
        <div className="cmtcfg-summary__intro">
          <span className="cmtcfg-kicker">Automatic validation policy</span>
          <strong>CMT runs itself at award and again at contract creation</strong>
          <p>
            Nobody raises a CMT request by hand. The system evaluates every rule below, and the
            CMT team only sees the loads that fail.
          </p>
        </div>
        <Fact label="Default rules" value={totals.org} icon={Building2} />
        <Fact label="Customer settings" value={totals.overrides} icon={UserRoundCheck} />
        <Fact label="Run at award" value={totals.award} icon={ShieldCheck} />
        <Fact label="Run at contract" value={totals.contract} icon={FileCheck2} />
      </section>

      <section className="cmtcfg-precedence">
        <div className="cmtcfg-precedence__step">
          <i>
            <Building2 size={14} />
          </i>
          <div>
            <strong>1. Company default</strong>
            <span>Applies to every brokered load</span>
          </div>
        </div>
        <ChevronRight size={15} />
        <div className="cmtcfg-precedence__step is-customer">
          <i>
            <UserRoundCheck size={14} />
          </i>
          <div>
            <strong>2. Customer setting</strong>
            <span>Supersedes the default for the same rule</span>
          </div>
        </div>

        <button
          type="button"
          className={cn('cmtcfg-unlock', adminUnlock && 'is-on')}
          onClick={() => setAdminUnlock((value) => !value)}
        >
          {adminUnlock ? <UnlockKeyhole size={13} /> : <LockKeyhole size={13} />}
          {adminUnlock ? 'Governance edit on' : 'Defaults locked'}
        </button>
      </section>

      <div className="cmtcfg-shell">
        <aside className="cmtcfg-scopes">
          <div className="cmtcfg-scopes__label">Scope</div>
          <button
            type="button"
            className={cn('cmtcfg-scope', isOrg && 'is-active')}
            onClick={() => setScope(ORG_SCOPE)}
          >
            <Building2 size={14} />
            <span>
              <strong>{ORG_SCOPE}</strong>
              <em>Organization level</em>
            </span>
            <i>{orgSettings.length}</i>
          </button>

          <div className="cmtcfg-scopes__label">Customers</div>
          {CMT_CUSTOMERS.map((name) => {
            const count = (customerSettings[name] ?? []).length
            return (
              <button
                key={name}
                type="button"
                className={cn('cmtcfg-scope', scope === name && 'is-active')}
                onClick={() => setScope(name)}
              >
                <UserRoundCheck size={14} />
                <span>
                  <strong>{name}</strong>
                  <em>{count ? `${count} override${count === 1 ? '' : 's'}` : 'Inherits default'}</em>
                </span>
                {count > 0 && <i className="is-blue">{count}</i>}
              </button>
            )
          })}
        </aside>

        <section className="cmtcfg-main">
          <header className="cmtcfg-toolbar">
            <div className="cmtcfg-toolbar__title">
              <strong>{isOrg ? 'Company default policy' : `${scope} effective policy`}</strong>
              <span>
                {isOrg
                  ? locked
                    ? 'Read-only for regular users. Turn on governance edit to change a default.'
                    : 'Governance edit is on. Changes apply to every brokered load.'
                  : 'Shows the merged result: customer settings first, then company defaults.'}
              </span>
            </div>

            <div className="cmtcfg-toolbar__right">
              <div className="cmtcfg-groups" role="tablist" aria-label="Rule group">
                <button
                  type="button"
                  role="tab"
                  aria-selected={group === 'all'}
                  className={cn(group === 'all' && 'is-active')}
                  onClick={() => setGroup('all')}
                >
                  All
                </button>
                {CMT_GROUPS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    role="tab"
                    aria-selected={group === item.id}
                    className={cn(group === item.id && 'is-active')}
                    onClick={() => setGroup(item.id)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <button type="button" className="cmtcfg-add" onClick={() => setAddOpen(true)}>
                <Plus size={14} />
                Add configuration
              </button>
            </div>
          </header>

          <div className="cmtcfg-groupsbody">
            {CMT_GROUPS.filter((block) => rules.some((rule) => rule.group === block.id)).map(
              (block) => (
                <section key={block.id} className="cmtcfg-block">
                  <header>
                    <strong>{block.label}</strong>
                    <span>{block.hint}</span>
                  </header>

                  <div className="cmtcfg-rows">
                    <div className="cmtcfg-rule cmtcfg-rule--head">
                      <span>Rule</span>
                      <span>Requirement</span>
                      <span>Runs at</span>
                      <span>Applies to</span>
                      <span>Source</span>
                      <span>Last updated</span>
                      <span />
                    </div>

                    {rules
                      .filter((rule) => rule.group === block.id)
                      .map((rule) => {
                        const { setting, source } = effective(rule.key)
                        return (
                          <RuleRow
                            key={rule.key}
                            rule={rule}
                            setting={setting}
                            source={source}
                            orgSetting={orgOf(rule.key)}
                            locked={locked}
                            isOrg={isOrg}
                            onChange={(patch, value) => writeSetting(rule.key, patch, value)}
                            onReset={() => clearOverride(rule.key)}
                          />
                        )
                      })}
                  </div>
                </section>
              )
            )}

            {rules.length === 0 && (
              <div className="cmtcfg-empty">
                <ShieldCheck size={22} />
                <strong>No rules match this search</strong>
                <span>Clear the search or pick a different group.</span>
              </div>
            )}
          </div>
        </section>
      </div>

      {addOpen && (
        <AddConfigModal
          scope={scope}
          onClose={() => setAddOpen(false)}
          onCreate={(target, settings) => {
            const keys = new Set(settings.map((item) => item.ruleKey))
            if (target === ORG_SCOPE) {
              setOrgSettings((list) => [
                ...list.filter((item) => !keys.has(item.ruleKey)),
                ...settings,
              ])
            } else {
              setCustomerSettings((all) => ({
                ...all,
                [target]: [
                  ...(all[target] ?? []).filter((item) => !keys.has(item.ruleKey)),
                  ...settings,
                ],
              }))
            }
            setScope(target)
            setAddOpen(false)
          }}
        />
      )}
    </div>
  )
}

function Fact({
  label,
  value,
  icon: Icon,
}: {
  label: string
  value: number
  icon: typeof Building2
}) {
  return (
    <div className="cmtcfg-fact">
      <i>
        <Icon size={15} />
      </i>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

function RuleRow({
  rule,
  setting,
  source,
  orgSetting,
  locked,
  isOrg,
  onChange,
  onReset,
}: {
  rule: CmtRuleDef
  setting?: CmtSetting
  source: 'customer' | 'org' | 'none'
  orgSetting?: CmtSetting
  locked: boolean
  isOrg: boolean
  onChange: (patch: Partial<CmtSetting>, value?: CmtValue) => void
  onReset: () => void
}) {
  const value = setting?.value ?? blankValue(rule)
  const unset = source === 'none'
  const editable = !locked

  return (
    <article className={cn('cmtcfg-rule', unset && 'is-unset')}>
      <div className="cmtcfg-rule__name">
        <strong>{rule.label}</strong>
        <span>{rule.hint}</span>
        {rule.condition && (
          <em className="cmtcfg-cond">
            <CalendarClock size={10} />
            {rule.condition}
          </em>
        )}
      </div>

      <div className="cmtcfg-rule__control">
        <ValueControl
          rule={rule}
          value={value}
          disabled={!editable}
          active={!unset}
          onChange={(next) => onChange({}, next)}
        />
      </div>

      <div>
        {unset ? (
          <span className="cmtcfg-dash">—</span>
        ) : (
          <select
            className="cmtcfg-select"
            value={setting?.checkpoint ?? 'Award'}
            disabled={!editable}
            aria-label={`${rule.label} checkpoint`}
            onChange={(event) => onChange({ checkpoint: event.target.value as CmtCheckpoint })}
          >
            {CHECKPOINTS.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        )}
      </div>

      <div>
        {unset ? (
          <span className="cmtcfg-dash">—</span>
        ) : (
          <select
            className="cmtcfg-select"
            value={setting?.applicability ?? 'All freight'}
            disabled={!editable}
            aria-label={`${rule.label} applicability`}
            onChange={(event) =>
              onChange({ applicability: event.target.value as CmtApplicability })
            }
          >
            {APPLICABILITY.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        )}
      </div>

      <div className="cmtcfg-rule__source">
        {source === 'customer' ? (
          <>
            <span className="cmtcfg-tag is-override">Override</span>
            {orgSetting && <em>Default {describeCmtValue(orgSetting.value)}</em>}
            {setting?.expiresOn && <em className="is-expiry">Until {setting.expiresOn}</em>}
          </>
        ) : source === 'org' ? (
          <span className="cmtcfg-tag">{isOrg ? 'Default' : 'Inherited'}</span>
        ) : (
          <span className="cmtcfg-tag is-off">Not configured</span>
        )}
      </div>

      <div className="cmtcfg-rule__audit">
        {setting ? (
          <>
            <strong>{setting.updatedBy}</strong>
            <span>{setting.updatedAt}</span>
          </>
        ) : (
          <span className="cmtcfg-dash">—</span>
        )}
      </div>

      <div className="cmtcfg-rule__action">
        {source === 'customer' && (
          <button type="button" onClick={onReset} title="Remove override and inherit the default">
            <RotateCcw size={12} />
            Reset
          </button>
        )}
        {locked && source !== 'none' && <LockKeyhole size={12} aria-label="Governed default" />}
      </div>
    </article>
  )
}

function ValueControl({
  rule,
  value,
  disabled,
  active,
  onChange,
}: {
  rule: CmtRuleDef
  value: CmtValue
  disabled: boolean
  active: boolean
  onChange: (value: CmtValue) => void
}) {
  if (value.kind === 'toggle') {
    const on = active && value.on
    return (
      <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-label={rule.label}
        disabled={disabled}
        className={cn('cmtcfg-switch', on && 'is-on')}
        onClick={() => onChange({ kind: 'toggle', on: !on })}
      >
        <span className="cmtcfg-switch__track">
          <span className="cmtcfg-switch__knob" />
        </span>
        <em>{on ? 'On' : 'Off'}</em>
      </button>
    )
  }

  if (value.kind === 'duration') {
    return (
      <div className="cmtcfg-input">
        <input
          type="number"
          min={1}
          value={value.amount}
          disabled={disabled}
          aria-label={`${rule.label} amount`}
          onChange={(event) =>
            onChange({ ...value, amount: Math.max(1, Number(event.target.value) || 1) })
          }
        />
        <select
          value={value.unit}
          disabled={disabled}
          aria-label={`${rule.label} unit`}
          onChange={(event) =>
            onChange({ ...value, unit: event.target.value as CmtDurationUnit })
          }
        >
          <option value="days">days</option>
          <option value="months">months</option>
          <option value="years">years</option>
        </select>
      </div>
    )
  }

  if (value.kind === 'currency') {
    return (
      <div className="cmtcfg-input">
        <select
          value={value.currency}
          disabled={disabled}
          aria-label={`${rule.label} currency`}
          onChange={(event) =>
            onChange({ ...value, currency: event.target.value as CmtCurrency })
          }
        >
          <option value="USD">USD</option>
          <option value="CAD">CAD</option>
        </select>
        <input
          type="number"
          min={0}
          step={25_000}
          value={value.amount}
          disabled={disabled}
          aria-label={`${rule.label} amount`}
          onChange={(event) => onChange({ ...value, amount: Number(event.target.value) || 0 })}
        />
      </div>
    )
  }

  return <InsurerList value={value.items} disabled={disabled} onChange={(items) => onChange({ kind: 'list', items })} />
}

function InsurerList({
  value,
  disabled,
  onChange,
}: {
  value: string[]
  disabled: boolean
  onChange: (items: string[]) => void
}) {
  const [draft, setDraft] = useState('')
  const add = () => {
    const name = draft.trim()
    if (!name || value.includes(name)) return
    onChange([...value, name])
    setDraft('')
  }

  return (
    <div className="cmtcfg-list">
      <div className="cmtcfg-list__chips">
        {value.map((item) => (
          <span key={item}>
            {item}
            {!disabled && (
              <button
                type="button"
                aria-label={`Remove ${item}`}
                onClick={() => onChange(value.filter((entry) => entry !== item))}
              >
                <X size={10} />
              </button>
            )}
          </span>
        ))}
        {value.length === 0 && <em>No insurers listed</em>}
      </div>
      {!disabled && (
        <div className="cmtcfg-list__add">
          <input
            value={draft}
            placeholder="Add insurer…"
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                add()
              }
            }}
          />
          <button type="button" onClick={add}>
            <Plus size={12} />
          </button>
        </div>
      )}
    </div>
  )
}

function AddConfigModal({
  scope,
  onClose,
  onCreate,
}: {
  scope: string
  onClose: () => void
  onCreate: (target: string, settings: CmtSetting[]) => void
}) {
  const [target, setTarget] = useState(scope)
  const [queue, setQueue] = useState<CmtSetting[]>([])
  const [expiresOn, setExpiresOn] = useState('')

  const queued = new Set(queue.map((item) => item.ruleKey))
  const remaining = CMT_RULES.filter((rule) => !queued.has(rule.key))
  const [ruleKey, setRuleKey] = useState(CMT_RULES[0].key)
  const pickKey = queued.has(ruleKey) ? (remaining[0]?.key ?? '') : ruleKey

  const addRule = (key: string) => {
    const rule = CMT_RULES.find((item) => item.key === key)
    if (!rule) return
    setQueue((list) => [
      ...list,
      {
        ruleKey: rule.key,
        value: blankValue(rule),
        checkpoint: rule.group === 'contract' ? 'Contract' : 'Award',
        applicability: 'All freight',
        updatedBy: 'Sukhdeep Dhillon',
        updatedAt: 'Aug 19, 2026',
      },
    ])
    const next = CMT_RULES.find((item) => item.key !== key && !queued.has(item.key))
    if (next) setRuleKey(next.key)
  }

  const patchQueued = (key: string, patch: Partial<CmtSetting>) =>
    setQueue((list) => list.map((item) => (item.ruleKey === key ? { ...item, ...patch } : item)))

  const addGroup = (groupId: CmtGroupId) => {
    const additions = CMT_RULES.filter(
      (rule) => rule.group === groupId && !queued.has(rule.key)
    ).map((rule) => ({
      ruleKey: rule.key,
      value: blankValue(rule),
      checkpoint: (rule.group === 'contract' ? 'Contract' : 'Award') as CmtCheckpoint,
      applicability: 'All freight' as CmtApplicability,
      updatedBy: 'Sukhdeep Dhillon',
      updatedAt: 'Aug 19, 2026',
    }))
    if (additions.length) setQueue((list) => [...list, ...additions])
  }

  return (
    <div className="cmtcfg-modal-root" role="dialog" aria-modal="true" aria-labelledby="cmtcfg-new">
      <button type="button" className="cmtcfg-modal__veil" aria-label="Close" onClick={onClose} />
      <form
        className="cmtcfg-modal cmtcfg-modal--wide"
        onSubmit={(event) => {
          event.preventDefault()
          if (queue.length === 0) return
          onCreate(
            target,
            queue.map((item) => ({
              ...item,
              expiresOn: target === ORG_SCOPE || !expiresOn ? undefined : expiresOn,
            }))
          )
        }}
      >
        <header>
          <div>
            <span>New CMT policy</span>
            <h2 id="cmtcfg-new">Add configurations</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </header>

        <div className="cmtcfg-modal__body">
          <fieldset className="cmtcfg-scope-select">
            <legend>Configuration level</legend>
            <button
              type="button"
              className={cn(target === ORG_SCOPE && 'is-selected')}
              onClick={() => setTarget(ORG_SCOPE)}
            >
              <Building2 size={16} />
              <span>
                <strong>Company default</strong>
                <em>Applies to all brokered loads</em>
              </span>
              {target === ORG_SCOPE && <Check size={14} />}
            </button>
            <button
              type="button"
              className={cn(target !== ORG_SCOPE && 'is-selected')}
              onClick={() => setTarget(scope === ORG_SCOPE ? CMT_CUSTOMERS[0] : scope)}
            >
              <UserRoundCheck size={16} />
              <span>
                <strong>Customer setting</strong>
                <em>Supersedes the default for one customer</em>
              </span>
              {target !== ORG_SCOPE && <Check size={14} />}
            </button>
          </fieldset>

          {target !== ORG_SCOPE && (
            <label>
              Customer
              <select value={target} onChange={(event) => setTarget(event.target.value)}>
                {CMT_CUSTOMERS.map((name) => (
                  <option key={name}>{name}</option>
                ))}
              </select>
            </label>
          )}

          <div className="cmtcfg-picker">
            <label>
              Add a rule
              <select
                value={pickKey}
                disabled={remaining.length === 0}
                onChange={(event) => setRuleKey(event.target.value)}
              >
                {CMT_GROUPS.map((block) => {
                  const options = remaining.filter((item) => item.group === block.id)
                  if (options.length === 0) return null
                  return (
                    <optgroup key={block.id} label={block.label}>
                      {options.map((item) => (
                        <option key={item.key} value={item.key}>
                          {item.label}
                        </option>
                      ))}
                    </optgroup>
                  )
                })}
              </select>
            </label>
            <button
              type="button"
              className="cmtcfg-picker__add"
              disabled={!pickKey}
              onClick={() => addRule(pickKey)}
            >
              <Plus size={13} />
              Add to list
            </button>
          </div>

          <div className="cmtcfg-picker__groups">
            <span>Add a whole group</span>
            {CMT_GROUPS.map((block) => {
              const left = CMT_RULES.filter(
                (rule) => rule.group === block.id && !queued.has(rule.key)
              ).length
              return (
                <button
                  key={block.id}
                  type="button"
                  disabled={left === 0}
                  onClick={() => addGroup(block.id)}
                >
                  {block.label}
                  <em>+{left}</em>
                </button>
              )
            })}
          </div>

          <div className="cmtcfg-stage">
            <header>
              <strong>
                {queue.length} configuration{queue.length === 1 ? '' : 's'} ready
              </strong>
              {queue.length > 0 && (
                <button type="button" onClick={() => setQueue([])}>
                  Clear all
                </button>
              )}
            </header>

            {queue.length === 0 ? (
              <p className="cmtcfg-stage__empty">
                Pick rules above. Each one keeps its own requirement, checkpoint and scope, and
                they all save together.
              </p>
            ) : (
              <div className="cmtcfg-stage__rows">
                {queue.map((item) => {
                  const rule = CMT_RULES.find((entry) => entry.key === item.ruleKey)!
                  return (
                    <article key={item.ruleKey} className="cmtcfg-stage__row">
                      <div>
                        <strong>{rule.label}</strong>
                        <span>{CMT_GROUPS.find((g) => g.id === rule.group)?.label}</span>
                      </div>
                      <ValueControl
                        rule={rule}
                        value={item.value}
                        disabled={false}
                        active
                        onChange={(value) => patchQueued(item.ruleKey, { value })}
                      />
                      <select
                        className="cmtcfg-select"
                        value={item.checkpoint}
                        aria-label={`${rule.label} checkpoint`}
                        onChange={(event) =>
                          patchQueued(item.ruleKey, {
                            checkpoint: event.target.value as CmtCheckpoint,
                          })
                        }
                      >
                        {CHECKPOINTS.map((entry) => (
                          <option key={entry}>{entry}</option>
                        ))}
                      </select>
                      <select
                        className="cmtcfg-select"
                        value={item.applicability}
                        aria-label={`${rule.label} applicability`}
                        onChange={(event) =>
                          patchQueued(item.ruleKey, {
                            applicability: event.target.value as CmtApplicability,
                          })
                        }
                      >
                        {APPLICABILITY.map((entry) => (
                          <option key={entry}>{entry}</option>
                        ))}
                      </select>
                      <button
                        type="button"
                        className="cmtcfg-stage__x"
                        aria-label={`Remove ${rule.label}`}
                        onClick={() =>
                          setQueue((list) => list.filter((entry) => entry.ruleKey !== item.ruleKey))
                        }
                      >
                        <X size={13} />
                      </button>
                    </article>
                  )
                })}
              </div>
            )}
          </div>

          {target !== ORG_SCOPE && (
            <label>
              Expires on <em>optional — applies to every rule in this batch</em>
              <input
                value={expiresOn}
                placeholder="e.g. Dec 31, 2026"
                onChange={(event) => setExpiresOn(event.target.value)}
              />
            </label>
          )}
        </div>

        <footer>
          <button type="button" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="is-primary" disabled={queue.length === 0}>
            <ShieldCheck size={14} />
            {queue.length === 1 ? 'Save 1 configuration' : `Save ${queue.length || ''} configurations`}
          </button>
        </footer>
      </form>
    </div>
  )
}
