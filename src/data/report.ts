export type ReportLoad = {
  id: string
  identifier: string
  shiftName: string
  mode: 'Spot' | 'Expedited' | 'Managed'
  status: 'NeedCarrier' | 'Posted' | 'Covered'
  stage: 'Sourcing' | 'Tender' | 'Award' | 'Booking'
  customer: string
  equipment: string
  origin: string
  destination: string
  miles: number
  fee: number
  margin: number
  pickupDate: string
  team: string
}

export const DATE_PRESETS = [
  { id: '7d', label: 'Last 7 days' },
  { id: '30d', label: 'Last 30 days' },
  { id: '90d', label: 'Last 90 days' },
  { id: 'ytd', label: 'Year to date' },
] as const

export type ReportFilters = {
  datePreset: string
  dateFrom: string
  dateTo: string
  search: string
  identifier: string
  shiftName: string
  mode: string
  status: string
  stage: string
  colFilters: Record<string, string | { min?: string; max?: string }>
}

export const DEFAULT_FILTERS: ReportFilters = {
  datePreset: '30d',
  dateFrom: '2026-06-13',
  dateTo: '2026-07-13',
  search: '',
  identifier: 'ALL',
  shiftName: 'ALL',
  mode: 'ALL',
  status: 'ALL',
  stage: 'ALL',
  colFilters: {},
}

export const SELECT_FILTER_DEFS: { key: keyof ReportFilters; label: string }[] = [
  { key: 'identifier', label: 'Identifier' },
  { key: 'shiftName', label: 'Shift' },
  { key: 'mode', label: 'Mode' },
  { key: 'status', label: 'Status' },
  { key: 'stage', label: 'Stage' },
]

export const COL_FILTER_DEFS = [
  { key: 'customer', label: 'Customer', type: 'text' as const },
  { key: 'equipment', label: 'Equipment', type: 'text' as const },
  { key: 'miles', label: 'Miles', type: 'range' as const },
  { key: 'fee', label: 'Fee', type: 'range' as const },
]

export const reportLoads: ReportLoad[] = [
  {
    id: '11436778',
    identifier: 'PO-88421',
    shiftName: 'Day',
    mode: 'Spot',
    status: 'NeedCarrier',
    stage: 'Sourcing',
    customer: 'Honda North America',
    equipment: 'DRY-VAN',
    origin: 'Marysville, OH',
    destination: 'Detroit, MI',
    miles: 186,
    fee: 1250,
    margin: 8.4,
    pickupDate: '2026-07-14',
    team: 'Ohio',
  },
  {
    id: '11440520',
    identifier: 'PO-99102',
    shiftName: 'Night',
    mode: 'Expedited',
    status: 'NeedCarrier',
    stage: 'Sourcing',
    customer: 'Nova Chemicals',
    equipment: 'FLATBED',
    origin: 'Sarnia, ON',
    destination: 'Houston, TX',
    miles: 1818,
    fee: 4820,
    margin: -2.1,
    pickupDate: '2026-07-13',
    team: 'Ontario',
  },
  {
    id: '11402376',
    identifier: 'Test_12Sept',
    shiftName: 'Day',
    mode: 'Spot',
    status: 'Posted',
    stage: 'Tender',
    customer: 'Dollar Tree',
    equipment: 'DRY-VAN',
    origin: 'Brampton, ON',
    destination: 'Brampton, ON',
    miles: 12,
    fee: 340,
    margin: 12.5,
    pickupDate: '2026-06-12',
    team: 'Ontario',
  },
  {
    id: '11441288',
    identifier: 'PO-77210',
    shiftName: 'Swing',
    mode: 'Managed',
    status: 'Covered',
    stage: 'Booking',
    customer: 'Phillips Industries',
    equipment: 'REEFER',
    origin: 'Chicago, IL',
    destination: 'Atlanta, GA',
    miles: 716,
    fee: 2680,
    margin: 6.2,
    pickupDate: '2026-07-15',
    team: 'Midwest',
  },
  {
    id: '11439801',
    identifier: 'PO-55019',
    shiftName: 'Day',
    mode: 'Spot',
    status: 'NeedCarrier',
    stage: 'Sourcing',
    customer: 'Procter & Gamble',
    equipment: 'DRY-VAN',
    origin: 'Cincinnati, OH',
    destination: 'Nashville, TN',
    miles: 273,
    fee: 980,
    margin: 4.8,
    pickupDate: '2026-07-14',
    team: 'Tennessee',
  },
  {
    id: '11440155',
    identifier: 'PO-33088',
    shiftName: 'Night',
    mode: 'Spot',
    status: 'Covered',
    stage: 'Booking',
    customer: 'Home Depot',
    equipment: 'INTERMODAL',
    origin: 'Dallas, TX',
    destination: 'Phoenix, AZ',
    miles: 887,
    fee: 2140,
    margin: 3.1,
    pickupDate: '2026-07-13',
    team: 'Southwest',
  },
  {
    id: '11438992',
    identifier: 'PO-11990',
    shiftName: 'Day',
    mode: 'Expedited',
    status: 'NeedCarrier',
    stage: 'Award',
    customer: 'Tesla Energy',
    equipment: 'FLATBED',
    origin: 'Fremont, CA',
    destination: 'Austin, TX',
    miles: 1756,
    fee: 5120,
    margin: -4.6,
    pickupDate: '2026-07-14',
    team: 'Pacific',
  },
  {
    id: '11437640',
    identifier: 'PO-44120',
    shiftName: 'Swing',
    mode: 'Managed',
    status: 'Posted',
    stage: 'Tender',
    customer: 'Walmart Logistics',
    equipment: 'DRY-VAN',
    origin: 'Bentonville, AR',
    destination: 'Memphis, TN',
    miles: 292,
    fee: 760,
    margin: 9.0,
    pickupDate: '2026-07-15',
    team: 'South',
  },
  {
    id: '11442011',
    identifier: 'PO-88200',
    shiftName: 'Day',
    mode: 'Spot',
    status: 'NeedCarrier',
    stage: 'Sourcing',
    customer: 'Unilever Canada',
    equipment: 'REEFER',
    origin: 'Toronto, ON',
    destination: 'Montreal, QC',
    miles: 337,
    fee: 1180,
    margin: 5.5,
    pickupDate: '2026-07-14',
    team: 'Ontario',
  },
  {
    id: '11441567',
    identifier: 'PO-22991',
    shiftName: 'Night',
    mode: 'Spot',
    status: 'Covered',
    stage: 'Booking',
    customer: 'Costco Wholesale',
    equipment: 'DRY-VAN',
    origin: 'Seattle, WA',
    destination: 'Portland, OR',
    miles: 174,
    fee: 620,
    margin: 11.2,
    pickupDate: '2026-07-13',
    team: 'Pacific',
  },
  {
    id: '11440890',
    identifier: 'PO-67001',
    shiftName: 'Day',
    mode: 'Managed',
    status: 'NeedCarrier',
    stage: 'Award',
    customer: 'Amazon Fulfillment',
    equipment: 'DRY-VAN',
    origin: 'Allentown, PA',
    destination: 'Baltimore, MD',
    miles: 168,
    fee: 540,
    margin: 7.3,
    pickupDate: '2026-07-14',
    team: 'Northeast',
  },
  {
    id: '11439234',
    identifier: 'PO-10355',
    shiftName: 'Swing',
    mode: 'Spot',
    status: 'NeedCarrier',
    stage: 'Sourcing',
    customer: 'Nestlé Waters',
    equipment: 'DRY-VAN',
    origin: 'Dallas, TX',
    destination: 'Kansas City, MO',
    miles: 502,
    fee: 1420,
    margin: 2.4,
    pickupDate: '2026-07-15',
    team: 'Central',
  },
]

export function filterReportLoads(
  rows: ReportLoad[],
  filters: ReportFilters,
  options?: { ignoreKey?: keyof ReportFilters }
) {
  const ignore = options?.ignoreKey
  return rows.filter((row) => {
    if (ignore !== 'search' && filters.search.trim()) {
      const q = filters.search.toLowerCase()
      const hay = `${row.id} ${row.identifier} ${row.customer} ${row.equipment} ${row.origin} ${row.destination} ${row.team}`.toLowerCase()
      if (!hay.includes(q)) return false
    }
    if (ignore !== 'identifier' && filters.identifier !== 'ALL' && row.identifier !== filters.identifier) {
      return false
    }
    if (ignore !== 'shiftName' && filters.shiftName !== 'ALL' && row.shiftName !== filters.shiftName) {
      return false
    }
    if (ignore !== 'mode' && filters.mode !== 'ALL' && row.mode !== filters.mode) return false
    if (ignore !== 'status' && filters.status !== 'ALL' && row.status !== filters.status) return false
    if (ignore !== 'stage' && filters.stage !== 'ALL' && row.stage !== filters.stage) return false

    const cf = filters.colFilters
    if (cf.customer && typeof cf.customer === 'string') {
      if (!row.customer.toLowerCase().includes(cf.customer.toLowerCase())) return false
    }
    if (cf.equipment && typeof cf.equipment === 'string') {
      if (!row.equipment.toLowerCase().includes(cf.equipment.toLowerCase())) return false
    }
    if (cf.miles && typeof cf.miles === 'object') {
      if (cf.miles.min && row.miles < parseFloat(cf.miles.min)) return false
      if (cf.miles.max && row.miles > parseFloat(cf.miles.max)) return false
    }
    if (cf.fee && typeof cf.fee === 'object') {
      if (cf.fee.min && row.fee < parseFloat(cf.fee.min)) return false
      if (cf.fee.max && row.fee > parseFloat(cf.fee.max)) return false
    }
    return true
  })
}
