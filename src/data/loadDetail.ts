import type { ReportLoad, SubStage } from './report'

export type DetailStage =
  | 'Sourcing'
  | 'Tender'
  | 'Award'
  | 'Booking'
  | 'In Transit'
  | 'Settlement'

export type DetailSub = {
  label: string
  done: boolean
}

export type DetailStageBlock = {
  stage: DetailStage
  number: string
  items: DetailSub[]
}

export type RouteStop = {
  kind: 'Pickup' | 'Delivery'
  index?: number
  facility: string
  city: string
  address: string
  when: string
  status: string
  statusTone: 'live' | 'pending' | 'neutral'
}

export type CommodityLine = {
  probill: string
  bol: string
  qty: string
  weight: string
}

export type CarrierRow = {
  id: string
  name: string
  mc?: string
  dot?: string
  source: 'PAST' | 'DAT' | 'NEW'
  lastUsed: string
  lastUsedRel: string
  dhP: number
  dhD: number
  lastRate: string
  loads: number
  legs: number
  favorite?: boolean
  phone?: string
  email?: string
  offer?: string
  configRate?: string
  updated?: string
}

export type BidOffer = {
  id: string
  carrier: string
  mc: string
  dot?: string
  amount: string
  vsTarget: string
  status: 'Drafted' | 'Pending' | 'Countered' | 'Accepted' | 'Rejected' | 'Closed' | 'Sent'
  best?: boolean
}

export type DocFile = {
  id: string
  name: string
  kind: 'pdf' | 'xml'
  folder: string
  source: string
  date: string
}

export type LoadDetail = {
  load: ReportLoad
  orderNumber: string
  poNumber: string
  poStatus: 'PENDING' | 'CONFIRMED' | 'CLOSED'
  billing: 'PENDING' | 'READY' | 'INVOICED'
  currency: 'USD' | 'CAD'
  execution: string
  properties: string
  orderCategory: string
  poCategory: string
  division: string
  salesRep: string
  csr: string
  accountManager: string
  cargoValue: string
  type: string
  bookNowRate: string
  maxBuy: string
  rejectAbove: string
  market: string
  action: string
  subStatus: string
  startedAt: string
  tags: string[]
  references: {
    pro: string
    shipper: string
    consignee: string
    customer: string
    tender: string
  }
  stops: RouteStop[]
  commodities: CommodityLine[]
  stages: DetailStageBlock[]
  completedSubs: number
  totalSubs: number
  carriers: CarrierRow[]
  bids: BidOffer[]
  documents: DocFile[]
  carrierInstructions: string
  internalInstructions: string
}

const STAGE_TEMPLATE: DetailStageBlock[] = [
  {
    stage: 'Sourcing',
    number: '01',
    items: [
      { label: 'Overview', done: false },
      { label: 'Find & Post', done: false },
    ],
  },
  {
    stage: 'Tender',
    number: '02',
    items: [
      { label: 'Offers & Bids', done: false },
      { label: 'Finalize Tender', done: false },
    ],
  },
  {
    stage: 'Award',
    number: '03',
    items: [
      { label: 'CMT', done: false },
      { label: 'Finalize Carrier Award', done: false },
    ],
  },
  {
    stage: 'Booking',
    number: '04',
    items: [
      { label: 'Create Contract', done: false },
      { label: 'Send Confirmation', done: false },
      { label: 'Signed Confirmation', done: false },
      { label: 'Resources', done: false },
      { label: 'Dispatch Handoff', done: false },
    ],
  },
  {
    stage: 'In Transit',
    number: '05',
    items: [
      { label: 'Pickup Confirm', done: false },
      { label: 'In Transit Updates', done: false },
      { label: 'ETA Watch', done: false },
      { label: 'Delivery Confirm', done: false },
      { label: 'Exceptions', done: false },
      { label: 'POD Received', done: false },
    ],
  },
  {
    stage: 'Settlement',
    number: '06',
    items: [
      { label: 'Invoice Review', done: false },
      { label: 'Carrier Pay', done: false },
      { label: 'Customer Bill', done: false },
      { label: 'Close File', done: false },
    ],
  },
]

const PEOPLE = [
  ['James Baumer', 'Denise Da Costa', 'Hektor Silho'],
  ['Kevin Harmer', 'Kamaldeep Kalsi', 'Sebastian Pantoja'],
  ['Ava Patel', 'Marcus Chen', 'Priya Nair'],
  ['Tom Reyes', 'Sarah Kim', 'Jordan Lee'],
]

const CARRIERS: CarrierRow[] = [
  {
    id: 'c1',
    name: 'UACL LOGISTICS LLC',
    mc: '884120',
    dot: '27D8',
    source: 'DAT',
    lastUsed: '27 May, 14:59',
    lastUsedRel: '2m ago',
    dhP: 0,
    dhD: 7,
    lastRate: '$135',
    loads: 279,
    legs: 1,
    favorite: true,
    phone: '+1 (416) 555-0142',
    email: 'dispatch@uacl.example',
    offer: 'Not sent',
    configRate: '—',
    updated: '2m ago',
  },
  {
    id: 'c2',
    name: 'KULDIP TRANSPORT INC',
    mc: '712904',
    source: 'PAST',
    lastUsed: '12 Jun, 09:12',
    lastUsedRel: '4d ago',
    dhP: 12,
    dhD: 0,
    lastRate: '$210',
    loads: 64,
    legs: 2,
    phone: '+1 (905) 555-0198',
    email: 'ops@kuldip.example',
    offer: 'Not sent',
    configRate: '$1.85',
    updated: '1h ago',
  },
  {
    id: 'c3',
    name: 'MIDWEST POWER HAUL INC',
    mc: '551002',
    source: 'DAT',
    lastUsed: '01 Jul, 16:40',
    lastUsedRel: '12d ago',
    dhP: 34,
    dhD: 18,
    lastRate: '$980',
    loads: 12,
    legs: 1,
    phone: '+1 (312) 555-0110',
    email: 'rates@midwestpower.example',
    offer: 'Sent',
    configRate: '$2.10',
    updated: '3d ago',
  },
  {
    id: 'c4',
    name: 'ONTARIO EXPRESS CARRIERS',
    mc: '339811',
    source: 'PAST',
    lastUsed: '08 Jul, 11:05',
    lastUsedRel: '5d ago',
    dhP: 6,
    dhD: 9,
    lastRate: '$420',
    loads: 41,
    legs: 1,
    favorite: true,
    phone: '+1 (647) 555-0177',
    email: 'desk@ontarioexpress.example',
    offer: 'Not sent',
    configRate: '—',
    updated: '5d ago',
  },
  {
    id: 'c5',
    name: 'PEAK FLATBED SOLUTIONS',
    mc: '229441',
    source: 'NEW',
    lastUsed: '—',
    lastUsedRel: 'Never',
    dhP: 55,
    dhD: 40,
    lastRate: '—',
    loads: 0,
    legs: 0,
    phone: '+1 (214) 555-0133',
    email: 'new@peakflatbed.example',
    offer: 'Not sent',
    configRate: '—',
    updated: '—',
  },
]

export const SAMPLE_BIDS: BidOffer[] = [
  {
    id: 'b1',
    carrier: 'TestCarrier Rohan',
    mc: 'Test12345664',
    amount: '$0.93',
    vsTarget: '-$0.07 vs Target',
    status: 'Sent',
    best: true,
  },
  {
    id: 'b2',
    carrier: 'Midwest Power Haul',
    mc: '712904',
    amount: '$1.05',
    vsTarget: '+$0.05 vs Target',
    status: 'Pending',
  },
]

function hash(s: string) {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return h
}

function markProgress(load: ReportLoad): DetailStageBlock[] {
  const stages = STAGE_TEMPLATE.map((s) => ({
    ...s,
    items: s.items.map((it) => ({ ...it })),
  }))

  const order: DetailStage[] = [
    'Sourcing',
    'Tender',
    'Award',
    'Booking',
    'In Transit',
    'Settlement',
  ]
  const currentIdx = Math.max(
    0,
    order.indexOf(load.stage as DetailStage)
  )

  for (let i = 0; i < currentIdx; i++) {
    stages[i].items = stages[i].items.map((it) => ({ ...it, done: true }))
  }

  const cur = stages[currentIdx]
  if (!cur) return stages
  const subIdx = cur.items.findIndex((it) => it.label === load.subStage)
  for (let i = 0; i < cur.items.length; i++) {
    if (i < subIdx) cur.items[i].done = true
  }
  return stages
}

export function buildLoadDetail(load: ReportLoad): LoadDetail {
  const h = hash(load.id)
  const people = PEOPLE[h % PEOPLE.length]
  const stages = markProgress(load)
  const completedSubs = stages.reduce(
    (n, s) => n + s.items.filter((i) => i.done).length,
    0
  )
  const totalSubs = stages.reduce((n, s) => n + s.items.length, 0)

  const orderNumber = String(11_280_000 + (h % 9000))
  const poNumber = load.identifier.replace(/^PO-?/i, '') || String(600000 + (h % 90000))

  const stops: RouteStop[] =
    load.miles > 500
      ? [
          {
            kind: 'Pickup',
            index: 1,
            facility: `${load.customer.split(' ')[0].toUpperCase()} DC`,
            city: load.origin,
            address: `1200 Industrial Pkwy, ${load.origin}`,
            when: load.pickupDate,
            status: 'Live Appointment',
            statusTone: 'live',
          },
          {
            kind: 'Pickup',
            index: 2,
            facility: 'CROSS-DOCK HUB',
            city: load.origin,
            address: `88 Transfer Rd, ${load.origin}`,
            when: load.pickupDate,
            status: 'Live Appointment',
            statusTone: 'live',
          },
          {
            kind: 'Delivery',
            facility: load.customer.toUpperCase(),
            city: load.destination,
            address: `400 Receiving Dock, ${load.destination}`,
            when: load.deliveryDate,
            status: 'Pending Customer Approval',
            statusTone: 'pending',
          },
        ]
      : [
          {
            kind: 'Pickup',
            facility: `${load.origin.split(',')[0].toUpperCase()} YARD`,
            city: load.origin,
            address: `100 Main St, ${load.origin}`,
            when: load.pickupDate,
            status: 'Live Window',
            statusTone: 'live',
          },
          {
            kind: 'Delivery',
            facility: `${load.destination.split(',')[0].toUpperCase()} DOCK`,
            city: load.destination,
            address: `250 Harbor Ave, ${load.destination}`,
            when: load.deliveryDate,
            status:
              load.status === 'Covered'
                ? 'Live Appointment'
                : 'Pending Customer Approval',
            statusTone: load.status === 'Covered' ? 'live' : 'pending',
          },
        ]

  const commodities: CommodityLine[] =
    load.miles > 800
      ? [
          {
            probill: `P${load.id}`,
            bol: `${poNumber}-001`,
            qty: `${(h % 4000) + 40} PCS`,
            weight: `${(h % 20000) + 1200} LBS`,
          },
          {
            probill: `P${Number(load.id) + 1}`,
            bol: `${poNumber}-002`,
            qty: `${(h % 80) + 10} PCS`,
            weight: `${(h % 2000) + 400} LBS`,
          },
        ]
      : [
          {
            probill: `P${load.id}`,
            bol: poNumber,
            qty: `${(h % 6) + 1} SKIDS`,
            weight: `${(h % 2000) + 500} LBS`,
          },
        ]

  return {
    load,
    orderNumber,
    poNumber,
    poStatus: load.status === 'Covered' ? 'CONFIRMED' : 'PENDING',
    billing: load.status === 'Covered' ? 'READY' : 'PENDING',
    currency: load.origin.includes('ON') || load.destination.includes('ON') ? 'CAD' : 'USD',
    execution: load.modeDetail.includes('Broker') ? 'Brokerage' : load.modeDetail,
    properties: load.miles < 250 ? 'LTL' : 'Regular',
    orderCategory: load.team.toUpperCase(),
    poCategory: load.shiftName === 'Night' ? 'DFM' : 'BOCST',
    division:
      load.team === 'Ontario' || load.origin.includes('ON')
        ? 'CHARGER GLOBAL LOGISTICS INC.'
        : 'CHARGER LOGISTICS INC',
    salesRep: people[0],
    csr: people[1],
    accountManager: people[2],
    cargoValue: load.fee > 2000 ? `$${(load.fee * 18).toLocaleString()}` : '',
    type: load.modeDetail.replace(/\s+/g, ''),
    bookNowRate: load.rate ?? '—',
    maxBuy: load.rate
      ? `$${(parseFloat(load.rate.replace(/[^0-9.]/g, '')) * 1.08 || 0).toFixed(2)}`
      : '—',
    rejectAbove: load.rate
      ? `$${(parseFloat(load.rate.replace(/[^0-9.]/g, '')) * 1.2 || 0).toFixed(2)}`
      : '—',
    market: '—',
    action:
      load.subStage === 'Find & Post'
        ? 'Find & post'
        : load.subStage === 'Overview'
          ? 'Open & review'
          : load.subStage,
    subStatus:
      load.status === 'NeedCarrier'
        ? 'Pending'
        : load.status === 'Posted'
          ? 'InProgress'
          : 'Complete',
    startedAt: 'Jul 13 at 12:36 PM',
    tags: [],
    references: {
      pro: `PRO-${load.id}`,
      shipper: '',
      consignee: '',
      customer: '',
      tender: '',
    },
    stops,
    commodities,
    stages,
    completedSubs,
    totalSubs,
    carriers: CARRIERS,
    bids: SAMPLE_BIDS,
    documents: [
      {
        id: 'd1',
        name: `CartaPorte_${load.id}.pdf`,
        kind: 'pdf',
        folder: 'Carta Porte Pdf',
        source: 'System',
        date: 'Jul 10, 2026',
      },
      {
        id: 'd2',
        name: `CartaPorte_${load.id}.xml`,
        kind: 'xml',
        folder: 'Carta Porte Xml',
        source: 'System',
        date: 'Jul 10, 2026',
      },
      {
        id: 'd3',
        name: `BOL_${poNumber}.pdf`,
        kind: 'pdf',
        folder: 'Bill of Lading',
        source: 'Upload',
        date: 'Jul 11, 2026',
      },
    ],
    carrierInstructions: '',
    internalInstructions: '',
  }
}

export function activeStageKey(load: ReportLoad): DetailStage {
  return (load.stage as DetailStage) || 'Sourcing'
}

export function isFindPost(sub: SubStage | string) {
  return sub === 'Find & Post'
}
