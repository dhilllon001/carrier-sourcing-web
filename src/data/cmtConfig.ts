/* CMT validation policy.
   Two automatic checkpoints: carrier award, and contract creation for data that
   only lands later. Organization defaults are governed; customer settings win
   for the same rule key. */

export type CmtLevel = 'Organization' | 'Customer'
export type CmtGroupId = 'identity' | 'tenure' | 'insurance' | 'contract'
export type CmtInputType = 'toggle' | 'duration' | 'currency' | 'list'
export type CmtCheckpoint = 'Award' | 'Contract' | 'Both'
export type CmtCurrency = 'USD' | 'CAD'
export type CmtDurationUnit = 'days' | 'months' | 'years'

/** Rule-set dimension. Keeps a third hierarchy from being needed later. */
export type CmtApplicability =
  | 'All freight'
  | 'Power only'
  | 'Temp controlled'
  | 'High value'
  | 'Cross-border'

export type CmtValue =
  | { kind: 'toggle'; on: boolean }
  | { kind: 'duration'; amount: number; unit: CmtDurationUnit }
  | { kind: 'currency'; amount: number; currency: CmtCurrency }
  | { kind: 'list'; items: string[] }

export type CmtGroup = {
  id: CmtGroupId
  label: string
  hint: string
}

export const CMT_GROUPS: CmtGroup[] = [
  {
    id: 'identity',
    label: 'Identity & authority',
    hint: 'Runs at carrier award against SAFER and the Canadian registry',
  },
  {
    id: 'tenure',
    label: 'Carrier tenure',
    hint: 'How long continuous operating authority must have been active',
  },
  {
    id: 'insurance',
    label: 'Insurance',
    hint: 'Re-validated at contract creation because certificates often arrive later',
  },
  {
    id: 'contract',
    label: 'Contract data completeness',
    hint: 'Runs at contract creation once the carrier assigns the trip',
  },
]

export type CmtRuleDef = {
  key: string
  group: CmtGroupId
  label: string
  hint: string
  input: CmtInputType
  /** Only relevant when a condition is met, e.g. power-only lanes. */
  condition?: string
}

export const CMT_RULES: CmtRuleDef[] = [
  {
    key: 'dot-number',
    group: 'identity',
    label: 'DOT number required',
    hint: 'Carrier must have a DOT number on file',
    input: 'toggle',
  },
  {
    key: 'mc-number',
    group: 'identity',
    label: 'MC number required',
    hint: 'Carrier must have an MC number on file',
    input: 'toggle',
  },
  {
    key: 'operating-status',
    group: 'identity',
    label: 'Active operating status',
    hint: 'DOT status active in SAFER, or the equivalent Canadian registry',
    input: 'toggle',
  },
  {
    key: 'property-authority',
    group: 'identity',
    label: 'Property authority, not broker only',
    hint: 'Excludes carriers holding broker-only authority for brokered freight',
    input: 'toggle',
  },
  {
    key: 'out-of-service',
    group: 'identity',
    label: 'No out-of-service orders',
    hint: 'Blocks any carrier with an active out-of-service order',
    input: 'toggle',
  },
  {
    key: 'safety-rating',
    group: 'identity',
    label: 'Satisfactory safety rating',
    hint: 'Applies only when the carrier has been rated',
    input: 'toggle',
  },
  {
    key: 'fraud-alerts',
    group: 'identity',
    label: 'No identity or fraud alerts',
    hint: 'Blocks carriers with published identity or fraud alerts',
    input: 'toggle',
  },
  {
    key: 'authority-age',
    group: 'tenure',
    label: 'Minimum authority age',
    hint: 'Continuous operating authority must be at least this old',
    input: 'duration',
  },
  {
    key: 'bipd',
    group: 'insurance',
    label: 'Minimum BIPD / auto liability',
    hint: 'Bodily injury and property damage coverage floor',
    input: 'currency',
  },
  {
    key: 'cargo',
    group: 'insurance',
    label: 'Minimum cargo coverage',
    hint: 'Raise per customer or commodity for high-value freight',
    input: 'currency',
  },
  {
    key: 'trailer-interchange',
    group: 'insurance',
    label: 'Trailer interchange coverage',
    hint: 'Checked only when our trailer moves under the carrier',
    input: 'currency',
    condition: 'Power-only lanes',
  },
  {
    key: 'reefer-breakdown',
    group: 'insurance',
    label: 'Refrigeration breakdown coverage',
    hint: 'Required for temperature-controlled freight',
    input: 'toggle',
    condition: 'Temp-controlled freight',
  },
  {
    key: 'policy-expiry',
    group: 'insurance',
    label: 'Policy valid through delivery',
    hint: 'Policy cannot expire before the delivery date',
    input: 'toggle',
  },
  {
    key: 'domicile-bipd',
    group: 'insurance',
    label: 'Higher BIPD by domicile',
    hint: 'Raises the liability floor for carriers domiciled in a listed state',
    input: 'currency',
    condition: 'Domiciled in NJ',
  },
  {
    key: 'restricted-insurers',
    group: 'insurance',
    label: 'Insurers needing manual approval',
    hint: 'Certificates from these insurers route to the CMT team',
    input: 'list',
  },
  {
    key: 'driver-name',
    group: 'contract',
    label: 'Driver name required',
    hint: 'Full legal driver name before the contract is created',
    input: 'toggle',
  },
  {
    key: 'driver-phone',
    group: 'contract',
    label: 'Driver phone required',
    hint: 'Reachable mobile number for the assigned driver',
    input: 'toggle',
  },
  {
    key: 'truck-trailer',
    group: 'contract',
    label: 'Truck / trailer number required',
    hint: 'Power unit and trailer identifiers on the trip',
    input: 'toggle',
  },
  {
    key: 'equipment-confirm',
    group: 'contract',
    label: 'Equipment type confirmation',
    hint: 'Carrier confirms the equipment matches the order',
    input: 'toggle',
  },
]

export type CmtSetting = {
  ruleKey: string
  value: CmtValue
  checkpoint: CmtCheckpoint
  applicability: CmtApplicability
  updatedBy: string
  updatedAt: string
  /** Customer settings may be time-boxed; empty means indefinite. */
  expiresOn?: string
}

export const CMT_CUSTOMERS = [
  'P&G',
  'Honda North America',
  'Amazon Fulfillment',
  'BMW Manufacturing',
  'Dollar Tree',
  'PepsiCo',
]

const on = (
  ruleKey: string,
  checkpoint: CmtCheckpoint,
  updatedBy: string,
  updatedAt: string,
  applicability: CmtApplicability = 'All freight'
): CmtSetting => ({
  ruleKey,
  value: { kind: 'toggle', on: true },
  checkpoint,
  applicability,
  updatedBy,
  updatedAt,
})

export const cmtOrgDefaults: CmtSetting[] = [
  on('dot-number', 'Award', 'CMT Governance', 'Jan 12, 2026'),
  on('mc-number', 'Award', 'CMT Governance', 'Jan 12, 2026'),
  on('operating-status', 'Award', 'CMT Governance', 'Jan 12, 2026'),
  on('property-authority', 'Award', 'Compliance Admin', 'Feb 3, 2026'),
  on('out-of-service', 'Award', 'CMT Governance', 'Jan 12, 2026'),
  on('safety-rating', 'Award', 'Compliance Admin', 'Feb 3, 2026'),
  on('fraud-alerts', 'Award', 'Compliance Admin', 'Mar 18, 2026'),
  {
    ruleKey: 'authority-age',
    value: { kind: 'duration', amount: 180, unit: 'days' },
    checkpoint: 'Award',
    applicability: 'All freight',
    updatedBy: 'CMT Governance',
    updatedAt: 'Jan 12, 2026',
  },
  {
    ruleKey: 'bipd',
    value: { kind: 'currency', amount: 1_000_000, currency: 'USD' },
    checkpoint: 'Both',
    applicability: 'All freight',
    updatedBy: 'CMT Governance',
    updatedAt: 'Jan 12, 2026',
  },
  {
    ruleKey: 'cargo',
    value: { kind: 'currency', amount: 100_000, currency: 'USD' },
    checkpoint: 'Both',
    applicability: 'All freight',
    updatedBy: 'CMT Governance',
    updatedAt: 'Jan 12, 2026',
  },
  {
    ruleKey: 'trailer-interchange',
    value: { kind: 'currency', amount: 50_000, currency: 'USD' },
    checkpoint: 'Contract',
    applicability: 'Power only',
    updatedBy: 'Compliance Admin',
    updatedAt: 'Apr 2, 2026',
  },
  on('reefer-breakdown', 'Contract', 'Compliance Admin', 'Apr 2, 2026', 'Temp controlled'),
  on('policy-expiry', 'Both', 'CMT Governance', 'Jan 12, 2026'),
  {
    ruleKey: 'domicile-bipd',
    value: { kind: 'currency', amount: 1_500_000, currency: 'USD' },
    checkpoint: 'Award',
    applicability: 'All freight',
    updatedBy: 'Compliance Admin',
    updatedAt: 'May 6, 2026',
  },
  {
    ruleKey: 'restricted-insurers',
    value: {
      kind: 'list',
      items: ['Gateway Insurance Co', 'Spirit Commercial Risk', 'Prime Property & Casualty'],
    },
    checkpoint: 'Contract',
    applicability: 'All freight',
    updatedBy: 'CMT Governance',
    updatedAt: 'Jun 1, 2026',
  },
  on('driver-name', 'Contract', 'CMT Governance', 'Jan 12, 2026'),
  on('truck-trailer', 'Contract', 'CMT Governance', 'Jan 12, 2026'),
]

export const cmtCustomerSettings: Record<string, CmtSetting[]> = {
  'P&G': [
    {
      ruleKey: 'cargo',
      value: { kind: 'currency', amount: 250_000, currency: 'USD' },
      checkpoint: 'Both',
      applicability: 'High value',
      updatedBy: 'Sarah Patel',
      updatedAt: 'Apr 9, 2026',
    },
    {
      ruleKey: 'authority-age',
      value: { kind: 'duration', amount: 12, unit: 'months' },
      checkpoint: 'Award',
      applicability: 'All freight',
      updatedBy: 'Sarah Patel',
      updatedAt: 'Apr 9, 2026',
    },
    on('driver-phone', 'Contract', 'Sarah Patel', 'Apr 9, 2026'),
  ],
  'Honda North America': [
    on('driver-phone', 'Contract', 'Michael Chen', 'May 21, 2026'),
    on('equipment-confirm', 'Contract', 'Michael Chen', 'May 21, 2026'),
  ],
  'Amazon Fulfillment': [
    {
      ruleKey: 'bipd',
      value: { kind: 'currency', amount: 1_500_000, currency: 'USD' },
      checkpoint: 'Both',
      applicability: 'All freight',
      updatedBy: 'Jennifer Wong',
      updatedAt: 'Jun 14, 2026',
    },
    {
      ruleKey: 'authority-age',
      value: { kind: 'duration', amount: 2, unit: 'years' },
      checkpoint: 'Award',
      applicability: 'All freight',
      updatedBy: 'Jennifer Wong',
      updatedAt: 'Jun 14, 2026',
      expiresOn: 'Dec 31, 2026',
    },
  ],
  'BMW Manufacturing': [
    {
      ruleKey: 'trailer-interchange',
      value: { kind: 'currency', amount: 100_000, currency: 'USD' },
      checkpoint: 'Contract',
      applicability: 'Power only',
      updatedBy: 'Daniel Ross',
      updatedAt: 'Jul 2, 2026',
    },
    on('equipment-confirm', 'Contract', 'Daniel Ross', 'Jul 2, 2026', 'Cross-border'),
  ],
  'Dollar Tree': [
    {
      ruleKey: 'cargo',
      value: { kind: 'currency', amount: 150_000, currency: 'CAD' },
      checkpoint: 'Both',
      applicability: 'All freight',
      updatedBy: 'Priya Sharma',
      updatedAt: 'Jul 28, 2026',
    },
  ],
  PepsiCo: [
    on('reefer-breakdown', 'Contract', 'Andre Lopez', 'Aug 4, 2026', 'Temp controlled'),
    {
      ruleKey: 'cargo',
      value: { kind: 'currency', amount: 250_000, currency: 'USD' },
      checkpoint: 'Both',
      applicability: 'Temp controlled',
      updatedBy: 'Andre Lopez',
      updatedAt: 'Aug 4, 2026',
    },
  ],
}

export function describeCmtValue(value: CmtValue): string {
  if (value.kind === 'toggle') return value.on ? 'Required' : 'Not required'
  if (value.kind === 'duration') return `${value.amount} ${value.unit}`
  if (value.kind === 'currency')
    return `${value.currency} $${value.amount.toLocaleString()}`
  return value.items.length ? `${value.items.length} insurers` : 'None listed'
}
