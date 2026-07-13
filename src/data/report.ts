export type SubStage =
  | 'Overview'
  | 'Find & Post'
  | 'Offers & Bids'
  | 'Finalize Tender'
  | 'CMT'
  | 'Finalize Carrier Award'
  | 'Create Contract'
  | 'Send Confirmation'
  | 'Signed Confirmation'
  | 'Resources'

export type ReportLoad = {
  id: string
  identifier: string
  shiftName: string
  mode: 'Spot' | 'Expedited' | 'Managed'
  status: 'NeedCarrier' | 'Posted' | 'Covered'
  stage: 'Sourcing' | 'Tender' | 'Award' | 'Booking'
  subStage: SubStage
  customer: string
  equipment: string
  origin: string
  destination: string
  miles: number
  fee: number
  margin: number
  pickupDate: string
  deliveryDate: string
  team: string
}

export type ReportFilters = {
  search: string
  mode: string
  status: string
  stage: string
  subStage: string
  colFilters: Record<string, string | { min?: string; max?: string }>
}

export const DEFAULT_FILTERS: ReportFilters = {
  search: '',
  mode: 'ALL',
  status: 'ALL',
  stage: 'ALL',
  subStage: 'ALL',
  colFilters: {},
}

export const SELECT_FILTER_DEFS: { key: keyof ReportFilters; label: string }[] = [
  { key: 'mode', label: 'Mode' },
  { key: 'status', label: 'Status' },
  { key: 'stage', label: 'Stage' },
  { key: 'subStage', label: 'Sub-stage' },
]

export const COL_FILTER_DEFS = [
  { key: 'customer', label: 'Customer', type: 'text' as const },
  { key: 'equipment', label: 'Equipment', type: 'text' as const },
  { key: 'miles', label: 'Miles', type: 'range' as const },
  { key: 'fee', label: 'Fee', type: 'range' as const },
]

export const LIFECYCLE = [
  {
    stage: 'Sourcing' as const,
    number: '01',
    items: [
      { label: 'Overview' as const },
      { label: 'Find & Post' as const },
    ],
  },
  {
    stage: 'Tender' as const,
    number: '02',
    items: [
      { label: 'Offers & Bids' as const },
      { label: 'Finalize Tender' as const },
    ],
  },
  {
    stage: 'Award' as const,
    number: '03',
    items: [
      { label: 'CMT' as const },
      { label: 'Finalize Carrier Award' as const },
    ],
  },
  {
    stage: 'Booking' as const,
    number: '04',
    items: [
      { label: 'Create Contract' as const },
      { label: 'Send Confirmation' as const },
      { label: 'Signed Confirmation' as const },
      { label: 'Resources' as const },
    ],
  },
]

export const reportLoads: ReportLoad[] = [
  {
    id: '11436778',
    identifier: 'PO-88421',
    shiftName: 'Day',
    mode: 'Spot',
    status: 'NeedCarrier',
    stage: 'Sourcing',
    subStage: 'Overview',
    customer: 'Honda North America',
    equipment: 'DRY-VAN',
    origin: 'Marysville, OH',
    destination: 'Detroit, MI',
    miles: 186,
    fee: 1250,
    margin: 8.4,
    pickupDate: 'Jul 14 · 08:00',
    deliveryDate: 'Jul 14 · 18:00',
    team: 'Ohio',
  },
  {
    id: '11440520',
    identifier: 'PO-99102',
    shiftName: 'Night',
    mode: 'Expedited',
    status: 'NeedCarrier',
    stage: 'Sourcing',
    subStage: 'Find & Post',
    customer: 'Nova Chemicals',
    equipment: 'FLATBED',
    origin: 'Sarnia, ON',
    destination: 'Houston, TX',
    miles: 1818,
    fee: 4820,
    margin: -2.1,
    pickupDate: 'Jul 13 · 14:30',
    deliveryDate: 'Jul 16 · 09:00',
    team: 'Ontario',
  },
  {
    id: '11402376',
    identifier: 'Test_12Sept',
    shiftName: 'Day',
    mode: 'Spot',
    status: 'Posted',
    stage: 'Tender',
    subStage: 'Offers & Bids',
    customer: 'Dollar Tree',
    equipment: 'DRY-VAN',
    origin: 'Brampton, ON',
    destination: 'Brampton, ON',
    miles: 12,
    fee: 340,
    margin: 12.5,
    pickupDate: 'Jun 12 · 11:30',
    deliveryDate: 'Jun 13 · 11:30',
    team: 'Ontario',
  },
  {
    id: '11441288',
    identifier: 'PO-77210',
    shiftName: 'Swing',
    mode: 'Managed',
    status: 'Covered',
    stage: 'Booking',
    subStage: 'Resources',
    customer: 'Phillips Industries',
    equipment: 'REEFER',
    origin: 'Chicago, IL',
    destination: 'Atlanta, GA',
    miles: 716,
    fee: 2680,
    margin: 6.2,
    pickupDate: 'Jul 15 · 06:00',
    deliveryDate: 'Jul 16 · 16:00',
    team: 'Midwest',
  },
  {
    id: '11439801',
    identifier: 'PO-55019',
    shiftName: 'Day',
    mode: 'Spot',
    status: 'NeedCarrier',
    stage: 'Sourcing',
    subStage: 'Overview',
    customer: 'Procter & Gamble',
    equipment: 'DRY-VAN',
    origin: 'Cincinnati, OH',
    destination: 'Nashville, TN',
    miles: 273,
    fee: 980,
    margin: 4.8,
    pickupDate: 'Jul 14 · 10:00',
    deliveryDate: 'Jul 14 · 22:00',
    team: 'Tennessee',
  },
  {
    id: '11440155',
    identifier: 'PO-33088',
    shiftName: 'Night',
    mode: 'Spot',
    status: 'Covered',
    stage: 'Booking',
    subStage: 'Send Confirmation',
    customer: 'Home Depot',
    equipment: 'INTERMODAL',
    origin: 'Dallas, TX',
    destination: 'Phoenix, AZ',
    miles: 887,
    fee: 2140,
    margin: 3.1,
    pickupDate: 'Jul 13 · 07:00',
    deliveryDate: 'Jul 15 · 12:00',
    team: 'Southwest',
  },
  {
    id: '11438992',
    identifier: 'PO-11990',
    shiftName: 'Day',
    mode: 'Expedited',
    status: 'NeedCarrier',
    stage: 'Award',
    subStage: 'CMT',
    customer: 'Tesla Energy',
    equipment: 'FLATBED',
    origin: 'Fremont, CA',
    destination: 'Austin, TX',
    miles: 1756,
    fee: 5120,
    margin: -4.6,
    pickupDate: 'Jul 14 · 05:00',
    deliveryDate: 'Jul 16 · 20:00',
    team: 'Pacific',
  },
  {
    id: '11437640',
    identifier: 'PO-44120',
    shiftName: 'Swing',
    mode: 'Managed',
    status: 'Posted',
    stage: 'Tender',
    subStage: 'Finalize Tender',
    customer: 'Walmart Logistics',
    equipment: 'DRY-VAN',
    origin: 'Bentonville, AR',
    destination: 'Memphis, TN',
    miles: 292,
    fee: 760,
    margin: 9.0,
    pickupDate: 'Jul 15 · 09:00',
    deliveryDate: 'Jul 15 · 18:00',
    team: 'South',
  },
  {
    id: '11442011',
    identifier: 'PO-88200',
    shiftName: 'Day',
    mode: 'Spot',
    status: 'NeedCarrier',
    stage: 'Sourcing',
    subStage: 'Find & Post',
    customer: 'Unilever Canada',
    equipment: 'REEFER',
    origin: 'Toronto, ON',
    destination: 'Montreal, QC',
    miles: 337,
    fee: 1180,
    margin: 5.5,
    pickupDate: 'Jul 14 · 11:00',
    deliveryDate: 'Jul 15 · 08:00',
    team: 'Ontario',
  },
  {
    id: '11441567',
    identifier: 'PO-22991',
    shiftName: 'Night',
    mode: 'Spot',
    status: 'Covered',
    stage: 'Booking',
    subStage: 'Signed Confirmation',
    customer: 'Costco Wholesale',
    equipment: 'DRY-VAN',
    origin: 'Seattle, WA',
    destination: 'Portland, OR',
    miles: 174,
    fee: 620,
    margin: 11.2,
    pickupDate: 'Jul 13 · 13:00',
    deliveryDate: 'Jul 13 · 19:00',
    team: 'Pacific',
  },
  {
    id: '11440890',
    identifier: 'PO-67001',
    shiftName: 'Day',
    mode: 'Managed',
    status: 'NeedCarrier',
    stage: 'Award',
    subStage: 'Finalize Carrier Award',
    customer: 'Amazon Fulfillment',
    equipment: 'DRY-VAN',
    origin: 'Allentown, PA',
    destination: 'Baltimore, MD',
    miles: 168,
    fee: 540,
    margin: 7.3,
    pickupDate: 'Jul 14 · 16:00',
    deliveryDate: 'Jul 15 · 06:00',
    team: 'Northeast',
  },
  {
    id: '11439234',
    identifier: 'PO-10355',
    shiftName: 'Swing',
    mode: 'Spot',
    status: 'NeedCarrier',
    stage: 'Sourcing',
    subStage: 'Overview',
    customer: 'Nestlé Waters',
    equipment: 'DRY-VAN',
    origin: 'Dallas, TX',
    destination: 'Kansas City, MO',
    miles: 502,
    fee: 1420,
    margin: 2.4,
    pickupDate: 'Jul 15 · 08:30',
    deliveryDate: 'Jul 16 · 14:00',
    team: 'Central',
  },
  {
    id: '11443002',
    identifier: 'PO-90110',
    shiftName: 'Day',
    mode: 'Spot',
    status: 'Covered',
    stage: 'Booking',
    subStage: 'Create Contract',
    customer: 'PepsiCo North America',
    equipment: 'DRY-VAN',
    origin: 'Chicago, IL',
    destination: 'Columbus, OH',
    miles: 355,
    fee: 980,
    margin: 6.8,
    pickupDate: 'Jul 14 · 09:00',
    deliveryDate: 'Jul 15 · 11:00',
    team: 'Midwest',
  },
]

export function countByMode(rows: ReportLoad[]) {
  return {
    All: rows.length,
    Spot: rows.filter((r) => r.mode === 'Spot').length,
    Expedited: rows.filter((r) => r.mode === 'Expedited').length,
    Managed: rows.filter((r) => r.mode === 'Managed').length,
  }
}

export function countByStatus(rows: ReportLoad[]) {
  return {
    All: rows.length,
    NeedCarrier: rows.filter((r) => r.status === 'NeedCarrier').length,
    Posted: rows.filter((r) => r.status === 'Posted').length,
    Covered: rows.filter((r) => r.status === 'Covered').length,
  }
}

export function countLifecycle(rows: ReportLoad[]) {
  return LIFECYCLE.map((block) => ({
    ...block,
    count: rows.filter((r) => r.stage === block.stage).length,
    items: block.items.map((item) => ({
      ...item,
      count: rows.filter((r) => r.subStage === item.label).length,
    })),
  }))
}

export function filterReportLoads(rows: ReportLoad[], filters: ReportFilters) {
  return rows.filter((row) => {
    if (filters.search.trim()) {
      const q = filters.search.toLowerCase()
      const hay =
        `${row.id} ${row.identifier} ${row.customer} ${row.equipment} ${row.origin} ${row.destination} ${row.team} ${row.stage} ${row.subStage}`.toLowerCase()
      if (!hay.includes(q)) return false
    }
    if (filters.mode !== 'ALL' && row.mode !== filters.mode) return false
    if (filters.status !== 'ALL' && row.status !== filters.status) return false
    if (filters.stage !== 'ALL' && row.stage !== filters.stage) return false
    if (filters.subStage !== 'ALL' && row.subStage !== filters.subStage) return false

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
