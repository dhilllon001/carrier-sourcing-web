/* RFP manager — customer bid files, the lanes inside them, and the pricing
   walk a broker does round by round. Mock data only. */

import {
  driverAssignmentSubStatusColors,
  getColorByType,
  tagColors,
  transitStatusColors,
} from '@/data/statusColors'

export type RfpStatus = 'Draft' | 'Pricing' | 'Submitted' | 'Awarded' | 'Lost'

/** Where our cost for the lane came from, best to worst. */
export type CostSource = 'History' | 'Contract' | 'Market'

export type RfpLane = {
  id: string
  /** Row number in the customer's own file, so a pricer can point at it. */
  row: number
  /** Their lane identifier, written back to the export untouched. */
  laneId: string
  origin: string
  destination: string
  equipment: string
  miles: number
  annualLoads: number
  ourCost: number
  costSource: CostSource
  /** How wide our cost record is on this lane, percent either side. */
  costSpread: number
  incumbent: number | null
  /** Our price. Null until someone prices the lane. */
  rate: number | null
  /** True when a human typed the rate, which bulk apply then leaves alone. */
  manual?: boolean
  noBid?: boolean
  history: { loads: number; months: number; lastRun: string; carriers: number }
  /** Confidence is the sum of these, out of 40 / 25 / 20 / 15. */
  score: { loads: number; recency: number; carriers: number; source: number }
  fuelProgram: string
  awardSplit: number
  comments: string
}

export type RfpRound = {
  id: string
  label: string
  /** Null while the round is still being priced. */
  sentOn: string | null
  margin: number | null
}

export type Rfp = {
  id: string
  customer: string
  title: string
  file: string
  owner: string
  status: RfpStatus
  /** Display date of the customer's deadline. */
  due: string
  /** Days left. Null once the RFP is closed. */
  dueIn: number | null
  targetMargin: number
  rounds: RfpRound[]
  lanes: RfpLane[]
}

/* ── status tone, from the shared status palette ── */

const tone = (arr: Parameters<typeof getColorByType>[0], type: string) =>
  getColorByType(arr, type)?.hex ?? '#64748B'

export const rfpStatusHex: Record<RfpStatus, string> = {
  Draft: tone(transitStatusColors, 'Unassigned'),
  Pricing: tone(transitStatusColors, 'Assigned'),
  Submitted: tone(tagColors, 'Brokerage'),
  Awarded: tone(driverAssignmentSubStatusColors, 'Confirmed'),
  Lost: tone(driverAssignmentSubStatusColors, 'Rejected'),
}

export const rfpFlagHex = {
  warn: tone(tagColors, 'CONTINGENCY'),
  info: tone(tagColors, 'Border Customs Hold'),
  risk: tone(driverAssignmentSubStatusColors, 'Rejected'),
  clear: tone(driverAssignmentSubStatusColors, 'Confirmed'),
  neutral: tone(transitStatusColors, 'Unassigned'),
} as const

/* ── geography, only enough to spot a border crossing ── */

const CANADA = new Set(['ON', 'QC', 'BC', 'AB', 'MB', 'SK', 'NS', 'NB', 'PE'])
const MEXICO = new Set(['NL', 'TM', 'CH', 'CU', 'SO', 'GTO', 'QE', 'JA', 'BS'])

export function placeCountry(place: string) {
  const code = place.split(',').pop()?.trim() ?? ''
  if (CANADA.has(code)) return 'CA'
  if (MEXICO.has(code)) return 'MX'
  return 'US'
}

export const isCrossBorder = (lane: RfpLane) =>
  placeCountry(lane.origin) !== placeCountry(lane.destination)

/* ── lane maths ── */

export const laneConfidence = (lane: RfpLane) =>
  lane.score.loads + lane.score.recency + lane.score.carriers + lane.score.source

export type ConfidenceBand = 'high' | 'medium' | 'thin'

export function confidenceBand(score: number): ConfidenceBand {
  if (score >= 85) return 'high'
  if (score >= 50) return 'medium'
  return 'thin'
}

export const confidenceLabel: Record<ConfidenceBand, string> = {
  high: 'high confidence',
  medium: 'workable',
  thin: 'thin history',
}

/** Margin as a percentage of our rate, the way a bid sheet reads it. */
export function laneMargin(lane: RfpLane) {
  if (!lane.rate) return null
  return ((lane.rate - lane.ourCost) / lane.rate) * 100
}

export const perLoadMargin = (lane: RfpLane) => (lane.rate ? lane.rate - lane.ourCost : null)

export const annualRevenue = (lane: RfpLane) => (lane.rate ? lane.rate * lane.annualLoads : 0)

export const annualMargin = (lane: RfpLane) =>
  lane.rate ? (lane.rate - lane.ourCost) * lane.annualLoads : 0

export function vsIncumbent(lane: RfpLane) {
  if (!lane.rate || !lane.incumbent) return null
  return ((lane.rate - lane.incumbent) / lane.incumbent) * 100
}

/** Rate that hits a target margin percentage. */
export const rateForMargin = (cost: number, margin: number) => cost / (1 - margin / 100)

/** Priced lanes only — a no-bid is a deliberate blank, not a gap. */
export const isPriced = (lane: RfpLane) => Boolean(lane.rate) && !lane.noBid

export const lowConfidence = (lane: RfpLane) => laneConfidence(lane) < 50

/** Lanes a pricer has to look at before the file goes back. */
export function needsLook(lane: RfpLane, target: number) {
  if (lane.noBid) return false
  if (lowConfidence(lane)) return true
  const margin = laneMargin(lane)
  if (margin === null) return false
  return margin < 0 || Math.abs(margin - target) > 1.5
}

export type LaneFlag = { label: string; tone: keyof typeof rfpFlagHex }

/** The chips on the lane row: context a pricer wants without opening the lane. */
export function laneFlags(lane: RfpLane, target: number): LaneFlag[] {
  const flags: LaneFlag[] = []
  if (lane.noBid) return [{ label: 'No bid', tone: 'neutral' }]
  if (isCrossBorder(lane)) flags.push({ label: 'Cross-border', tone: 'info' })
  if (lowConfidence(lane)) flags.push({ label: 'Thin history', tone: 'risk' })
  const vs = vsIncumbent(lane)
  if (vs !== null && vs > 0) flags.push({ label: 'Above incumbent', tone: 'warn' })
  if (lane.costSpread >= 12) flags.push({ label: `±${lane.costSpread}%`, tone: 'warn' })
  const margin = laneMargin(lane)
  if (margin !== null && Math.abs(margin - target) > 1.5) {
    flags.push({ label: margin < target ? 'Under target' : 'Over target', tone: 'warn' })
  }
  if (lane.manual) flags.push({ label: 'Manual', tone: 'neutral' })
  return flags.length ? flags : [{ label: 'clear', tone: 'clear' }]
}

/** How the confidence score was built, for the "why this number" panel. */
export function confidenceParts(lane: RfpLane) {
  return [
    {
      label: 'Our loads on this lane',
      detail: `${lane.history.loads} loads in ${lane.history.months} mo`,
      got: lane.score.loads,
      of: 40,
    },
    {
      label: 'How recently we ran it',
      detail: lane.history.lastRun,
      got: lane.score.recency,
      of: 25,
    },
    {
      label: 'Carriers who cover it',
      detail: `${lane.history.carriers} carriers`,
      got: lane.score.carriers,
      of: 20,
    },
    {
      label: 'Where the cost came from',
      detail: lane.costSource,
      got: lane.score.source,
      of: 15,
    },
  ]
}

export type RfpTotals = {
  lanes: number
  priced: number
  noBid: number
  pricedPct: number
  revenue: number
  margin: number
  marginPct: number | null
  flagged: number
  thin: number
  manual: number
  loads: number
}

export function rfpTotals(rfp: Rfp): RfpTotals {
  const priced = rfp.lanes.filter(isPriced)
  const revenue = priced.reduce((sum, lane) => sum + annualRevenue(lane), 0)
  const margin = priced.reduce((sum, lane) => sum + annualMargin(lane), 0)
  const toPrice = rfp.lanes.filter((lane) => !lane.noBid)
  return {
    lanes: rfp.lanes.length,
    priced: priced.length,
    noBid: rfp.lanes.filter((lane) => lane.noBid).length,
    pricedPct: toPrice.length ? Math.round((priced.length / toPrice.length) * 100) : 0,
    revenue,
    margin,
    marginPct: revenue ? (margin / revenue) * 100 : null,
    flagged: rfp.lanes.filter((lane) => needsLook(lane, rfp.targetMargin)).length,
    thin: rfp.lanes.filter(lowConfidence).length,
    manual: rfp.lanes.filter((lane) => lane.manual).length,
    loads: rfp.lanes.reduce((sum, lane) => sum + lane.annualLoads, 0),
  }
}

export const isOpen = (rfp: Rfp) => rfp.status === 'Draft' || rfp.status === 'Pricing'
export const isClosed = (rfp: Rfp) => rfp.status === 'Awarded' || rfp.status === 'Lost'

export function boardTotals(rfps: Rfp[]) {
  const open = rfps.filter(isOpen)
  const decided = rfps.filter(isClosed)
  const won = decided.filter((rfp) => rfp.status === 'Awarded')
  return {
    open: open.length,
    toPrice: open.reduce(
      (sum, rfp) => sum + rfp.lanes.filter((lane) => !isPriced(lane) && !lane.noBid).length,
      0
    ),
    dueSoon: open.filter((rfp) => (rfp.dueIn ?? 99) <= 5).length,
    winRate: decided.length ? Math.round((won.length / decided.length) * 100) : null,
  }
}

/* ── formatting ── */

export const money = (n: number) =>
  n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export function compactMoney(n: number) {
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (Math.abs(n) >= 1_000) return `$${Math.round(n / 1_000)}k`
  return `$${Math.round(n)}`
}

export function compactCount(n: number) {
  if (n >= 1_000) return `${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1).replace(/\.0$/, '')}k`
  return String(n)
}

export const signed = (n: number, digits = 1) =>
  `${n > 0 ? '+' : n < 0 ? '−' : ''}${Math.abs(n).toFixed(digits)}%`

/* ── mock book of business ── */

export const rfps: Rfp[] = [
  {
    id: 'RFP-2451',
    customer: 'Procter & Gamble',
    title: 'FY27 North America network',
    file: 'PG_FY27_Bid_Lanes_v3.xlsx',
    owner: 'Mandeep Singh',
    status: 'Pricing',
    due: 'Aug 29, 2026',
    dueIn: 8,
    targetMargin: 14,
    rounds: [{ id: 'r1', label: 'Round 1', sentOn: null, margin: null }],
    lanes: [
      {
        id: 'pg-1',
        row: 2,
        laneId: 'PG-0001',
        origin: 'Cincinnati, OH',
        destination: 'Atlanta, GA',
        equipment: 'DRY-VAN',
        miles: 461,
        annualLoads: 380,
        ourCost: 940,
        costSource: 'History',
        costSpread: 6,
        incumbent: 1065,
        rate: null,
        history: { loads: 214, months: 12, lastRun: '2d ago', carriers: 11 },
        score: { loads: 38, recency: 24, carriers: 19, source: 15 },
        fuelProgram: 'DOE Weekly',
        awardSplit: 60,
        comments: 'Primary carrier award',
      },
      {
        id: 'pg-2',
        row: 3,
        laneId: 'PG-0002',
        origin: 'Cincinnati, OH',
        destination: 'Dallas, TX',
        equipment: 'DRY-VAN',
        miles: 920,
        annualLoads: 260,
        ourCost: 1760,
        costSource: 'History',
        costSpread: 8,
        incumbent: 1995,
        rate: null,
        history: { loads: 148, months: 12, lastRun: '5d ago', carriers: 8 },
        score: { loads: 37, recency: 22, carriers: 18, source: 15 },
        fuelProgram: 'DOE Weekly',
        awardSplit: 50,
        comments: '—',
      },
      {
        id: 'pg-3',
        row: 4,
        laneId: 'PG-0003',
        origin: 'Lima, OH',
        destination: 'Toronto, ON',
        equipment: 'DRY-VAN',
        miles: 372,
        annualLoads: 210,
        ourCost: 880,
        costSource: 'History',
        costSpread: 9,
        incumbent: 995,
        rate: null,
        history: { loads: 96, months: 12, lastRun: '9d ago', carriers: 6 },
        score: { loads: 35, recency: 22, carriers: 16, source: 15 },
        fuelProgram: 'DOE Weekly',
        awardSplit: 100,
        comments: 'Bonded, PARS required',
      },
      {
        id: 'pg-4',
        row: 5,
        laneId: 'PG-0004',
        origin: 'Greensboro, NC',
        destination: 'Chicago, IL',
        equipment: 'DRY-VAN',
        miles: 786,
        annualLoads: 300,
        ourCost: 1540,
        costSource: 'Contract',
        costSpread: 7,
        incumbent: 1730,
        rate: null,
        history: { loads: 88, months: 12, lastRun: '11d ago', carriers: 7 },
        score: { loads: 34, recency: 21, carriers: 17, source: 12 },
        fuelProgram: 'Fixed $0.42',
        awardSplit: 70,
        comments: '—',
      },
      {
        id: 'pg-5',
        row: 6,
        laneId: 'PG-0005',
        origin: 'Auburn, ME',
        destination: 'Mississauga, ON',
        equipment: 'REEFER',
        miles: 613,
        annualLoads: 120,
        ourCost: 1860,
        costSource: 'Market',
        costSpread: 18,
        incumbent: 2050,
        rate: null,
        history: { loads: 9, months: 12, lastRun: '4mo ago', carriers: 3 },
        score: { loads: 16, recency: 12, carriers: 12, source: 6 },
        fuelProgram: 'DOE Weekly',
        awardSplit: 100,
        comments: 'Temp 34–38F',
      },
      {
        id: 'pg-6',
        row: 7,
        laneId: 'PG-0006',
        origin: 'Bakersfield, CA',
        destination: 'Phoenix, AZ',
        equipment: 'REEFER',
        miles: 397,
        annualLoads: 240,
        ourCost: 1180,
        costSource: 'History',
        costSpread: 10,
        incumbent: 1290,
        rate: null,
        history: { loads: 132, months: 12, lastRun: '3d ago', carriers: 7 },
        score: { loads: 36, recency: 23, carriers: 16, source: 15 },
        fuelProgram: 'DOE Weekly',
        awardSplit: 80,
        comments: '—',
      },
      {
        id: 'pg-7',
        row: 8,
        laneId: 'PG-0007',
        origin: 'Memphis, TN',
        destination: 'Laredo, TX',
        equipment: 'DRY-VAN',
        miles: 908,
        annualLoads: 190,
        ourCost: 1690,
        costSource: 'History',
        costSpread: 11,
        incumbent: 1880,
        rate: null,
        history: { loads: 104, months: 12, lastRun: '8d ago', carriers: 6 },
        score: { loads: 35, recency: 21, carriers: 16, source: 15 },
        fuelProgram: 'DOE Weekly',
        awardSplit: 100,
        comments: 'Drop trailer at Laredo yard',
      },
      {
        id: 'pg-8',
        row: 9,
        laneId: 'PG-0008',
        origin: 'Reynosa, TM',
        destination: 'Memphis, TN',
        equipment: 'DRY-VAN',
        miles: 924,
        annualLoads: 160,
        ourCost: 1940,
        costSource: 'Market',
        costSpread: 21,
        incumbent: null,
        rate: null,
        history: { loads: 6, months: 12, lastRun: '6mo ago', carriers: 2 },
        score: { loads: 15, recency: 11, carriers: 12, source: 6 },
        fuelProgram: '—',
        awardSplit: 100,
        comments: 'New lane for FY27',
      },
      {
        id: 'pg-9',
        row: 10,
        laneId: 'PG-0009',
        origin: 'Pomona, CA',
        destination: 'Salt Lake City, UT',
        equipment: 'DRY-VAN',
        miles: 692,
        annualLoads: 210,
        ourCost: 1420,
        costSource: 'History',
        costSpread: 7,
        incumbent: 1560,
        rate: null,
        history: { loads: 156, months: 12, lastRun: '4d ago', carriers: 8 },
        score: { loads: 38, recency: 23, carriers: 17, source: 15 },
        fuelProgram: 'DOE Weekly',
        awardSplit: 60,
        comments: '—',
      },
      {
        id: 'pg-10',
        row: 11,
        laneId: 'PG-0010',
        origin: 'Kansas City, MO',
        destination: 'Denver, CO',
        equipment: 'FLATBED',
        miles: 604,
        annualLoads: 130,
        ourCost: 1340,
        costSource: 'Contract',
        costSpread: 12,
        incumbent: 1470,
        rate: null,
        history: { loads: 61, months: 12, lastRun: '16d ago', carriers: 5 },
        score: { loads: 33, recency: 20, carriers: 16, source: 12 },
        fuelProgram: 'Fixed $0.44',
        awardSplit: 100,
        comments: 'Tarps required',
      },
      {
        id: 'pg-11',
        row: 12,
        laneId: 'PG-0011',
        origin: 'Jacksonville, FL',
        destination: 'Charlotte, NC',
        equipment: 'DRY-VAN',
        miles: 384,
        annualLoads: 350,
        ourCost: 780,
        costSource: 'History',
        costSpread: 5,
        incumbent: 880,
        rate: null,
        history: { loads: 246, months: 12, lastRun: '1d ago', carriers: 12 },
        score: { loads: 39, recency: 24, carriers: 19, source: 15 },
        fuelProgram: 'DOE Weekly',
        awardSplit: 70,
        comments: '—',
      },
      {
        id: 'pg-12',
        row: 13,
        laneId: 'PG-0012',
        origin: 'Laredo, TX',
        destination: 'Monterrey, NL',
        equipment: 'DRY-VAN',
        miles: 148,
        annualLoads: 470,
        ourCost: 560,
        costSource: 'History',
        costSpread: 6,
        incumbent: 640,
        rate: null,
        history: { loads: 288, months: 12, lastRun: '1d ago', carriers: 9 },
        score: { loads: 38, recency: 23, carriers: 19, source: 15 },
        fuelProgram: 'DOE Weekly',
        awardSplit: 100,
        comments: 'Transfer at Colombia bridge',
      },
    ],
  },
  {
    id: 'RFP-2448',
    customer: 'Dollar Tree',
    title: 'Ontario Regional Reload',
    file: 'DT_Regional_RFP.csv',
    owner: 'Rohit Kumar',
    status: 'Submitted',
    due: 'Aug 24, 2026',
    dueIn: 3,
    targetMargin: 13.5,
    rounds: [
      { id: 'r1', label: 'R1', sentOn: 'Aug 6', margin: 16.2 },
      { id: 'r2', label: 'R2', sentOn: 'Aug 19', margin: 13.4 },
    ],
    lanes: [
      {
        id: 'dt-1',
        row: 3,
        laneId: 'DT-0002',
        origin: 'Brampton, ON',
        destination: 'Woodstock, ON',
        equipment: 'DRY-VAN',
        miles: 67,
        annualLoads: 520,
        ourCost: 392,
        costSource: 'History',
        costSpread: 4,
        incumbent: 512,
        rate: 453,
        history: { loads: 168, months: 12, lastRun: '1d ago', carriers: 9 },
        score: { loads: 40, recency: 25, carriers: 20, source: 15 },
        fuelProgram: 'DOE Weekly',
        awardSplit: 100,
        comments: '—',
      },
      {
        id: 'dt-2',
        row: 4,
        laneId: 'DT-0003',
        origin: 'Brampton, ON',
        destination: 'Chicago, IL',
        equipment: 'DRY-VAN',
        miles: 512,
        annualLoads: 310,
        ourCost: 1180,
        costSource: 'History',
        costSpread: 7,
        incumbent: 1265,
        rate: 1364,
        history: { loads: 74, months: 12, lastRun: '2d ago', carriers: 7 },
        score: { loads: 38, recency: 25, carriers: 20, source: 15 },
        fuelProgram: 'DOE Weekly',
        awardSplit: 100,
        comments: 'PAPS on all loads',
      },
      {
        id: 'dt-3',
        row: 5,
        laneId: 'DT-0004',
        origin: 'Mississauga, ON',
        destination: 'Montreal, QC',
        equipment: 'DRY-VAN',
        miles: 336,
        annualLoads: 260,
        ourCost: 890,
        costSource: 'History',
        costSpread: 6,
        incumbent: 940,
        rate: 1029,
        history: { loads: 64, months: 12, lastRun: '3d ago', carriers: 6 },
        score: { loads: 37, recency: 24, carriers: 19, source: 15 },
        fuelProgram: 'DOE Weekly',
        awardSplit: 100,
        comments: '—',
      },
      {
        id: 'dt-4',
        row: 6,
        laneId: 'DT-0005',
        origin: 'Laredo, TX',
        destination: 'Sterling Heights, MI',
        equipment: 'REEFER',
        miles: 1612,
        annualLoads: 180,
        ourCost: 2860,
        costSource: 'Contract',
        costSpread: 9,
        incumbent: 3180,
        rate: 3306,
        history: { loads: 96, months: 12, lastRun: '6d ago', carriers: 5 },
        score: { loads: 38, recency: 22, carriers: 19, source: 12 },
        fuelProgram: 'Fixed $0.46',
        awardSplit: 70,
        comments: 'Temp 36F, 2 stops max',
      },
      {
        id: 'dt-5',
        row: 7,
        laneId: 'DT-0006',
        origin: 'Nogales, SO',
        destination: 'Sedalia, MO',
        equipment: 'DRY-VAN',
        miles: 1433,
        annualLoads: 145,
        ourCost: 2320,
        costSource: 'Market',
        costSpread: 16,
        incumbent: null,
        rate: 2682,
        history: { loads: 12, months: 12, lastRun: '2mo ago', carriers: 3 },
        score: { loads: 18, recency: 13, carriers: 14, source: 6 },
        fuelProgram: '—',
        awardSplit: 100,
        comments: 'Produce season peak',
      },
      {
        id: 'dt-6',
        row: 8,
        laneId: 'DT-0007',
        origin: 'Fox River, WI',
        destination: 'Morris, IL',
        equipment: 'DRY-VAN',
        miles: 214,
        annualLoads: 640,
        ourCost: 372,
        costSource: 'History',
        costSpread: 4,
        incumbent: 405,
        rate: 430,
        history: { loads: 246, months: 12, lastRun: '1d ago', carriers: 11 },
        score: { loads: 40, recency: 25, carriers: 20, source: 15 },
        fuelProgram: 'DOE Weekly',
        awardSplit: 100,
        comments: '—',
      },
      {
        id: 'dt-7',
        row: 9,
        laneId: 'DT-0008',
        origin: 'Normal, IL',
        destination: 'Palo Alto, CA',
        equipment: 'DRY-VAN',
        miles: 2104,
        annualLoads: 95,
        ourCost: 3720,
        costSource: 'Market',
        costSpread: 14,
        incumbent: 4180,
        rate: 4301,
        history: { loads: 33, months: 12, lastRun: '21d ago', carriers: 4 },
        score: { loads: 34, recency: 24, carriers: 19, source: 6 },
        fuelProgram: 'DOE Weekly',
        awardSplit: 100,
        comments: 'Appointment delivery',
      },
      {
        id: 'dt-8',
        row: 10,
        laneId: 'DT-0009',
        origin: 'Silao, GTO',
        destination: 'Monterrey, NL',
        equipment: 'DRY-VAN',
        miles: 512,
        annualLoads: 220,
        ourCost: 720,
        costSource: 'History',
        costSpread: 8,
        incumbent: 795,
        rate: 832,
        history: { loads: 118, months: 12, lastRun: '4d ago', carriers: 6 },
        score: { loads: 38, recency: 24, carriers: 18, source: 15 },
        fuelProgram: 'DOE Weekly',
        awardSplit: 100,
        comments: '—',
      },
    ],
  },
  {
    id: 'RFP-2440',
    customer: 'BMW Manufacturing',
    title: 'Spartanburg inbound support',
    file: 'BMW_XB_Inbound.xlsx',
    owner: 'Kuldeep Ghuman',
    status: 'Draft',
    due: 'Sep 5, 2026',
    dueIn: 15,
    targetMargin: 12,
    rounds: [{ id: 'r1', label: 'Round 1', sentOn: null, margin: null }],
    lanes: [
      {
        id: 'bmw-1',
        row: 2,
        laneId: 'BMW-101',
        origin: 'Spartanburg, SC',
        destination: 'Charleston, SC',
        equipment: 'DRY-VAN',
        miles: 214,
        annualLoads: 620,
        ourCost: 470,
        costSource: 'History',
        costSpread: 6,
        incumbent: 540,
        rate: null,
        history: { loads: 198, months: 12, lastRun: '2d ago', carriers: 8 },
        score: { loads: 38, recency: 23, carriers: 18, source: 15 },
        fuelProgram: 'DOE Weekly',
        awardSplit: 100,
        comments: 'Port drayage window',
      },
      {
        id: 'bmw-2',
        row: 3,
        laneId: 'BMW-102',
        origin: 'Spartanburg, SC',
        destination: 'Toledo, OH',
        equipment: 'DRY-VAN',
        miles: 664,
        annualLoads: 340,
        ourCost: 1290,
        costSource: 'History',
        costSpread: 8,
        incumbent: 1420,
        rate: null,
        history: { loads: 112, months: 12, lastRun: '6d ago', carriers: 6 },
        score: { loads: 36, recency: 22, carriers: 16, source: 15 },
        fuelProgram: 'DOE Weekly',
        awardSplit: 80,
        comments: '—',
      },
      {
        id: 'bmw-3',
        row: 4,
        laneId: 'BMW-103',
        origin: 'Greer, SC',
        destination: 'Laredo, TX',
        equipment: 'DRY-VAN',
        miles: 1265,
        annualLoads: 180,
        ourCost: 2480,
        costSource: 'Contract',
        costSpread: 9,
        incumbent: 2690,
        rate: null,
        history: { loads: 74, months: 12, lastRun: '12d ago', carriers: 5 },
        score: { loads: 34, recency: 21, carriers: 16, source: 12 },
        fuelProgram: 'Fixed $0.45',
        awardSplit: 100,
        comments: '—',
      },
      {
        id: 'bmw-4',
        row: 5,
        laneId: 'BMW-104',
        origin: 'Ramos Arizpe, CU',
        destination: 'Greer, SC',
        equipment: 'DRY-VAN',
        miles: 1405,
        annualLoads: 150,
        ourCost: 3120,
        costSource: 'Market',
        costSpread: 19,
        incumbent: null,
        rate: null,
        history: { loads: 7, months: 12, lastRun: '5mo ago', carriers: 2 },
        score: { loads: 17, recency: 13, carriers: 12, source: 6 },
        fuelProgram: '—',
        awardSplit: 100,
        comments: 'Needs C-TPAT carrier',
      },
      {
        id: 'bmw-5',
        row: 6,
        laneId: 'BMW-105',
        origin: 'Woodstock, ON',
        destination: 'Greer, SC',
        equipment: 'DRY-VAN',
        miles: 762,
        annualLoads: 260,
        ourCost: 1640,
        costSource: 'History',
        costSpread: 10,
        incumbent: 1790,
        rate: null,
        history: { loads: 84, months: 12, lastRun: '9d ago', carriers: 4 },
        score: { loads: 35, recency: 22, carriers: 14, source: 15 },
        fuelProgram: 'DOE Weekly',
        awardSplit: 100,
        comments: 'PAPS, bonded',
      },
      {
        id: 'bmw-6',
        row: 7,
        laneId: 'BMW-106',
        origin: 'Greer, SC',
        destination: 'Savannah, GA',
        equipment: 'FLATBED',
        miles: 268,
        annualLoads: 420,
        ourCost: 620,
        costSource: 'History',
        costSpread: 7,
        incumbent: 700,
        rate: null,
        history: { loads: 148, months: 12, lastRun: '3d ago', carriers: 7 },
        score: { loads: 37, recency: 22, carriers: 17, source: 15 },
        fuelProgram: 'DOE Weekly',
        awardSplit: 100,
        comments: 'Tarps on request',
      },
    ],
  },
  {
    id: 'RFP-2431',
    customer: 'Rivian Automotive',
    title: 'Q4 outbound finished vehicle parts',
    file: 'Rivian_OB_Q4.xlsx',
    owner: 'Mandeep Singh',
    status: 'Awarded',
    due: 'Aug 15, 2026',
    dueIn: null,
    targetMargin: 13,
    rounds: [
      { id: 'r1', label: 'R1', sentOn: 'Jul 24', margin: 16 },
      { id: 'r2', label: 'R2', sentOn: 'Aug 11', margin: 12.9 },
    ],
    lanes: [
      {
        id: 'riv-1',
        row: 2,
        laneId: 'RIV-01',
        origin: 'Normal, IL',
        destination: 'Chicago, IL',
        equipment: 'DRY-VAN',
        miles: 134,
        annualLoads: 780,
        ourCost: 320,
        costSource: 'History',
        costSpread: 5,
        incumbent: 395,
        rate: 375,
        history: { loads: 264, months: 12, lastRun: '1d ago', carriers: 12 },
        score: { loads: 40, recency: 25, carriers: 19, source: 14 },
        fuelProgram: 'DOE Weekly',
        awardSplit: 100,
        comments: '—',
      },
      {
        id: 'riv-2',
        row: 3,
        laneId: 'RIV-02',
        origin: 'Normal, IL',
        destination: 'Dallas, TX',
        equipment: 'DRY-VAN',
        miles: 928,
        annualLoads: 340,
        ourCost: 1780,
        costSource: 'History',
        costSpread: 8,
        incumbent: 2060,
        rate: 2046,
        history: { loads: 118, months: 12, lastRun: '4d ago', carriers: 7 },
        score: { loads: 37, recency: 23, carriers: 17, source: 15 },
        fuelProgram: 'DOE Weekly',
        awardSplit: 80,
        comments: '—',
      },
      {
        id: 'riv-3',
        row: 4,
        laneId: 'RIV-03',
        origin: 'Palo Alto, CA',
        destination: 'Normal, IL',
        equipment: 'DRY-VAN',
        miles: 2104,
        annualLoads: 120,
        ourCost: 3640,
        costSource: 'Market',
        costSpread: 13,
        incumbent: 4020,
        rate: 4160,
        history: { loads: 26, months: 12, lastRun: '28d ago', carriers: 4 },
        score: { loads: 26, recency: 17, carriers: 13, source: 6 },
        fuelProgram: 'DOE Weekly',
        awardSplit: 100,
        comments: 'Backhaul of RIV-04',
      },
      {
        id: 'riv-4',
        row: 5,
        laneId: 'RIV-04',
        origin: 'Normal, IL',
        destination: 'Sparks, NV',
        equipment: 'DRY-VAN',
        miles: 1864,
        annualLoads: 210,
        ourCost: 3180,
        costSource: 'History',
        costSpread: 9,
        incumbent: 3560,
        rate: 3655,
        history: { loads: 92, months: 12, lastRun: '7d ago', carriers: 6 },
        score: { loads: 36, recency: 22, carriers: 16, source: 14 },
        fuelProgram: 'DOE Weekly',
        awardSplit: 100,
        comments: '—',
      },
      {
        id: 'riv-5',
        row: 6,
        laneId: 'RIV-05',
        origin: 'Atlanta, GA',
        destination: 'Normal, IL',
        equipment: 'DRY-VAN',
        miles: 597,
        annualLoads: 460,
        ourCost: 1120,
        costSource: 'History',
        costSpread: 7,
        incumbent: 1285,
        rate: 1250,
        manual: true,
        history: { loads: 176, months: 12, lastRun: '2d ago', carriers: 9 },
        score: { loads: 39, recency: 24, carriers: 18, source: 14 },
        fuelProgram: 'DOE Weekly',
        awardSplit: 100,
        comments: 'Held rate to win the award',
      },
    ],
  },
  {
    id: 'RFP-2422',
    customer: 'Unilever Canada',
    title: 'FY27 domestic Canada + border',
    file: 'Unilever_FY27.csv',
    owner: 'Gagan Chapadia',
    status: 'Lost',
    due: 'Aug 8, 2026',
    dueIn: null,
    targetMargin: 11.5,
    rounds: [
      { id: 'r1', label: 'R1', sentOn: 'Jul 10', margin: 14.8 },
      { id: 'r2', label: 'R2', sentOn: 'Jul 28', margin: 12.6 },
      { id: 'r3', label: 'R3', sentOn: 'Aug 6', margin: 11.2 },
    ],
    lanes: [
      {
        id: 'uni-1',
        row: 2,
        laneId: 'UL-01',
        origin: 'Toronto, ON',
        destination: 'Montreal, QC',
        equipment: 'DRY-VAN',
        miles: 336,
        annualLoads: 420,
        ourCost: 780,
        costSource: 'History',
        costSpread: 5,
        incumbent: 860,
        rate: 880,
        history: { loads: 232, months: 12, lastRun: '1d ago', carriers: 10 },
        score: { loads: 39, recency: 24, carriers: 18, source: 15 },
        fuelProgram: 'DOE Weekly',
        awardSplit: 100,
        comments: '—',
      },
      {
        id: 'uni-2',
        row: 3,
        laneId: 'UL-02',
        origin: 'Toronto, ON',
        destination: 'Calgary, AB',
        equipment: 'DRY-VAN',
        miles: 2120,
        annualLoads: 130,
        ourCost: 3860,
        costSource: 'History',
        costSpread: 11,
        incumbent: 4180,
        rate: 4350,
        history: { loads: 54, months: 12, lastRun: '14d ago', carriers: 5 },
        score: { loads: 32, recency: 20, carriers: 17, source: 15 },
        fuelProgram: 'DOE Weekly',
        awardSplit: 100,
        comments: 'Long haul, team optional',
      },
      {
        id: 'uni-3',
        row: 4,
        laneId: 'UL-03',
        origin: 'Rexdale, ON',
        destination: 'Buffalo, NY',
        equipment: 'DRY-VAN',
        miles: 106,
        annualLoads: 380,
        ourCost: 420,
        costSource: 'History',
        costSpread: 6,
        incumbent: 470,
        rate: 473,
        history: { loads: 188, months: 12, lastRun: '2d ago', carriers: 8 },
        score: { loads: 38, recency: 23, carriers: 17, source: 15 },
        fuelProgram: 'DOE Weekly',
        awardSplit: 100,
        comments: 'PAPS, daily crossing',
      },
      {
        id: 'uni-4',
        row: 5,
        laneId: 'UL-04',
        origin: 'Montreal, QC',
        destination: 'Boston, MA',
        equipment: 'REEFER',
        miles: 313,
        annualLoads: 160,
        ourCost: 940,
        costSource: 'Contract',
        costSpread: 8,
        incumbent: 1030,
        rate: 1058,
        history: { loads: 66, months: 12, lastRun: '10d ago', carriers: 4 },
        score: { loads: 33, recency: 21, carriers: 13, source: 12 },
        fuelProgram: 'Fixed $0.43',
        awardSplit: 100,
        comments: 'Temp 38F',
      },
    ],
  },
]
