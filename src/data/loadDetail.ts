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
  role?: 'Hook' | 'Drop'
  facility: string
  city: string
  address: string
  when: string
  status: string
  statusTone: 'live' | 'pending' | 'neutral'
  appointmentRequired?: boolean
  /** Miles from this stop to the next (omit on final stop). */
  legMiles?: number
}

export type CommodityLine = {
  probill: string
  bol: string
  qty: string
  weight: string
  description?: string
  pieces?: string
  classCode?: string
  hazmat?: boolean
  dims?: string
  stackable?: boolean
}

export type CarrierRow = {
  id: string
  name: string
  mc?: string
  dot?: string
  source: 'PAST' | 'DAT' | 'NEW'
  lastUsed: string
  lastUsedRel: string
  lastContacted?: string
  lastContactChannel?: 'Email' | 'WhatsApp' | 'Phone' | 'SMS'
  contactedRecently?: boolean
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
  recommended?: boolean
  recommendScore?: number
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
  source?: string
  equipment?: string
  rpm?: string
  allIn?: string
  dhP?: string
  dhD?: string
  loads?: number
  updated?: string
  contact?: string
  phone?: string
  email?: string
  channel?: 'Email' | 'WhatsApp' | 'Phone' | 'DAT'
  sentAt?: string
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
  targetAllIn: string
  marketMid: string
  marketRange: string
  thresholdNote: string
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
    bol?: string
    appointment?: string
    trailer?: string
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
    lastContacted: 'Today, 09:12',
    lastContactChannel: 'Email',
    contactedRecently: true,
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
    recommended: true,
    recommendScore: 92,
  },
  {
    id: 'c2',
    name: 'KULDIP TRANSPORT INC',
    mc: '712904',
    source: 'PAST',
    lastUsed: '12 Jun, 09:12',
    lastUsedRel: '4d ago',
    lastContacted: '4d ago',
    lastContactChannel: 'WhatsApp',
    contactedRecently: true,
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
    recommended: true,
    recommendScore: 84,
  },
  {
    id: 'c3',
    name: 'MIDWEST POWER HAUL INC',
    mc: '551002',
    source: 'DAT',
    lastUsed: '01 Jul, 16:40',
    lastUsedRel: '12d ago',
    lastContacted: '12d ago',
    lastContactChannel: 'Phone',
    contactedRecently: false,
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
    recommendScore: 71,
  },
  {
    id: 'c4',
    name: 'ONTARIO EXPRESS CARRIERS',
    mc: '339811',
    source: 'PAST',
    lastUsed: '08 Jul, 11:05',
    lastUsedRel: '5d ago',
    lastContacted: '5d ago',
    lastContactChannel: 'Email',
    contactedRecently: true,
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
    recommended: true,
    recommendScore: 88,
  },
  {
    id: 'c5',
    name: 'PEAK FLATBED SOLUTIONS',
    mc: '229441',
    source: 'NEW',
    lastUsed: '—',
    lastUsedRel: 'Never',
    lastContacted: 'Never',
    contactedRecently: false,
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
    recommendScore: 45,
  },
  {
    id: 'c6',
    name: 'SUNRISE CARTAGE LTD',
    mc: '902117',
    dot: '31A4',
    source: 'PAST',
    lastUsed: '21 Jun, 07:45',
    lastUsedRel: '22d ago',
    lastContacted: '22d ago',
    lastContactChannel: 'Email',
    contactedRecently: false,
    dhP: 3,
    dhD: 14,
    lastRate: '$1,180',
    loads: 128,
    legs: 1,
    favorite: true,
    phone: '+1 (519) 555-0164',
    email: 'dispatch@sunrisecartage.example',
    offer: 'Not sent',
    configRate: '$1.92',
    updated: '22d ago',
    recommended: true,
    recommendScore: 79,
  },
  {
    id: 'c7',
    name: 'GREAT LAKES DRAYAGE CO',
    mc: '448290',
    dot: '55C1',
    source: 'DAT',
    lastUsed: '04 Jul, 13:20',
    lastUsedRel: '9d ago',
    lastContacted: 'Never',
    contactedRecently: false,
    dhP: 18,
    dhD: 22,
    lastRate: '$1,045',
    loads: 37,
    legs: 2,
    phone: '+1 (216) 555-0121',
    email: 'loads@greatlakesdrayage.example',
    offer: 'Not sent',
    configRate: '$2.04',
    updated: '9d ago',
    recommendScore: 76,
  },
  {
    id: 'c8',
    name: 'BLUEBIRD FREIGHT SYSTEMS',
    mc: '617355',
    source: 'PAST',
    lastUsed: '18 May, 10:02',
    lastUsedRel: '56d ago',
    lastContacted: 'Today, 08:40',
    lastContactChannel: 'SMS',
    contactedRecently: true,
    dhP: 27,
    dhD: 5,
    lastRate: '$960',
    loads: 22,
    legs: 1,
    phone: '+1 (614) 555-0189',
    email: 'ops@bluebirdfreight.example',
    offer: 'Sent',
    configRate: '$1.78',
    updated: '6h ago',
    recommendScore: 68,
  },
  {
    id: 'c9',
    name: 'NORTHSTAR VAN LINES INC',
    mc: '730118',
    dot: '48F7',
    source: 'DAT',
    lastUsed: '—',
    lastUsedRel: 'Never',
    lastContacted: 'Never',
    contactedRecently: false,
    dhP: 41,
    dhD: 31,
    lastRate: '—',
    loads: 0,
    legs: 0,
    phone: '+1 (763) 555-0107',
    email: 'bids@northstarvan.example',
    offer: 'Not sent',
    configRate: '—',
    updated: '—',
    recommendScore: 58,
  },
  {
    id: 'c10',
    name: 'APEX ROAD LOGISTICS',
    mc: '285904',
    source: 'NEW',
    lastUsed: '—',
    lastUsedRel: 'Never',
    lastContacted: 'Never',
    contactedRecently: false,
    dhP: 62,
    dhD: 48,
    lastRate: '—',
    loads: 0,
    legs: 0,
    phone: '+1 (469) 555-0158',
    email: 'hello@apexroad.example',
    offer: 'Not sent',
    configRate: '—',
    updated: '—',
    recommendScore: 39,
  },
]

export const SAMPLE_BIDS: BidOffer[] = [
  {
    id: 'b1',
    carrier: 'TestCarrier Rohan',
    mc: 'Test12345664',
    dot: '3842911',
    amount: '$0.93',
    allIn: '$2,418',
    vsTarget: '-$0.07 vs Target',
    status: 'Accepted',
    best: true,
    source: 'Past',
    equipment: 'Dry Van 53′',
    rpm: '$0.93',
    dhP: '18 mi',
    dhD: '42 mi',
    loads: 14,
    updated: '12m ago',
    contact: 'Rohan K.',
    phone: '+1 (312) 555-0142',
    email: 'rohan@testcarrier.example',
    channel: 'WhatsApp',
    sentAt: 'Today · 12:34 PM',
  },
  {
    id: 'b2',
    carrier: 'Midwest Power Haul',
    mc: '712904',
    dot: '2910448',
    amount: '$1.05',
    allIn: '$2,730',
    vsTarget: '+$0.05 vs Target',
    status: 'Pending',
    source: 'DAT',
    equipment: 'Reefer 53′',
    rpm: '$1.05',
    dhP: '31 mi',
    dhD: '12 mi',
    loads: 6,
    updated: '2h ago',
    contact: 'Jamie Holt',
    phone: '+1 (816) 555-0199',
    email: 'dispatch@midwestpower.example',
    channel: 'Email',
    sentAt: 'Today · 10:08 AM',
  },
  {
    id: 'b3',
    carrier: 'ONTARIO EXPRESS CARRIERS',
    mc: '339811',
    dot: '3104472',
    amount: '$0.89',
    allIn: '$2,314',
    vsTarget: '-$0.11 vs Target',
    status: 'Pending',
    source: 'Internal',
    equipment: 'Dry Van 53′',
    rpm: '$0.89',
    dhP: '6 mi',
    dhD: '9 mi',
    loads: 41,
    updated: '38m ago',
    contact: 'Priya Nair',
    phone: '+1 (647) 555-0177',
    email: 'desk@ontarioexpress.example',
    channel: 'Email',
    sentAt: 'Today · 11:52 AM',
  },
  {
    id: 'b4',
    carrier: 'Border Bridge Logistics',
    mc: '884120',
    dot: '4110293',
    amount: '$1.18',
    allIn: '$3,068',
    vsTarget: '+$0.18 vs Target',
    status: 'Countered',
    source: 'Loadlink',
    equipment: 'Dry Van 53′',
    rpm: '$1.18',
    dhP: '44 mi',
    dhD: '27 mi',
    loads: 2,
    updated: '4h ago',
    contact: 'Marco Diaz',
    phone: '+1 (915) 555-0128',
    email: 'ops@borderbridge.example',
    channel: 'DAT',
    sentAt: 'Yesterday · 4:20 PM',
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

  const originCity = load.origin.split(',')[0]?.trim() || load.origin
  const destCity = load.destination.split(',')[0]?.trim() || load.destination
  const midCity =
    load.origin.includes('ON') || load.destination.includes('ON')
      ? 'London, ON'
      : load.origin.includes('TX')
        ? 'San Antonio, TX'
        : 'Columbus, OH'
  const midCityShort = midCity.split(',')[0]

  const stops: RouteStop[] =
    load.miles > 500
      ? [
          {
            kind: 'Pickup',
            index: 1,
            role: 'Hook',
            facility: `${originCity.toUpperCase()} DC`,
            city: load.origin,
            address: `1200 Industrial Pkwy, ${load.origin}`,
            when: load.pickupDate,
            status: 'Live Appointment',
            statusTone: 'live',
            appointmentRequired: true,
            legMiles: Math.round(load.miles * 0.28),
          },
          {
            kind: 'Pickup',
            index: 2,
            role: 'Hook',
            facility: `${midCityShort.toUpperCase()} CROSS-DOCK`,
            city: midCity,
            address: `88 Transfer Rd, ${midCity}`,
            when: load.pickupDate,
            status: 'Live Appointment',
            statusTone: 'live',
            appointmentRequired: false,
            legMiles: Math.round(load.miles * 0.72),
          },
          {
            kind: 'Delivery',
            index: 3,
            role: 'Drop',
            facility: `${destCity.toUpperCase()} DOCK`,
            city: load.destination,
            address: `400 Receiving Dock, ${load.destination}`,
            when: load.deliveryDate,
            status: 'Pending Customer Approval',
            statusTone: 'pending',
            appointmentRequired: true,
          },
        ]
      : [
          {
            kind: 'Pickup',
            index: 1,
            role: 'Hook',
            facility: `${originCity.toUpperCase()} YARD`,
            city: load.origin,
            address: `100 Main St, ${load.origin}`,
            when: load.pickupDate,
            status: 'Live Window',
            statusTone: 'live',
            appointmentRequired: true,
            legMiles: load.miles,
          },
          {
            kind: 'Delivery',
            index: 2,
            role: 'Drop',
            facility: `${destCity.toUpperCase()} DOCK`,
            city: load.destination,
            address: `250 Harbor Ave, ${load.destination}`,
            when: load.deliveryDate,
            status:
              load.status === 'Covered'
                ? 'Live Appointment'
                : 'Pending Customer Approval',
            statusTone: load.status === 'Covered' ? 'live' : 'pending',
            appointmentRequired: true,
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
            description: 'Finished auto parts · palletized',
            pieces: `${(h % 40) + 12}`,
            classCode: '70',
            hazmat: false,
            dims: '48×40×52 in',
            stackable: true,
          },
          {
            probill: `P${Number(load.id) + 1}`,
            bol: `${poNumber}-002`,
            qty: `${(h % 80) + 10} PCS`,
            weight: `${(h % 2000) + 400} LBS`,
            description: 'Corrugated packaging · floor loaded',
            pieces: `${(h % 20) + 4}`,
            classCode: '55',
            hazmat: load.miles > 1200,
            dims: '40×48×36 in',
            stackable: false,
          },
        ]
      : [
          {
            probill: `P${load.id}`,
            bol: poNumber,
            qty: `${(h % 6) + 1} SKIDS`,
            weight: `${(h % 2000) + 500} LBS`,
            description: `${load.equipment} freight · standard`,
            pieces: `${(h % 8) + 2}`,
            classCode: '65',
            hazmat: false,
            dims: '48×40×48 in',
            stackable: true,
          },
        ]

  return {
    load: {
      ...load,
      broker: load.status === 'NeedCarrier' ? '' : load.broker,
    },
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
    type: load.modeDetail.toLowerCase().includes('broker')
      ? 'Pure brokerage'
      : load.modeDetail,
    bookNowRate: '—',
    maxBuy: '$0.00',
    rejectAbove: '—',
    targetAllIn: `$${load.fee.toLocaleString()}`,
    marketMid: load.rate
      ? `$${(parseFloat(load.rate.replace(/[^0-9.]/g, '')) * 0.97 || 0).toFixed(2)}`
      : '—',
    marketRange: load.rate
      ? `$${(parseFloat(load.rate.replace(/[^0-9.]/g, '')) * 0.88 || 0).toFixed(2)} – $${(
          parseFloat(load.rate.replace(/[^0-9.]/g, '')) * 1.14 || 0
        ).toFixed(2)}`
      : '—',
    thresholdNote: 'Required to post',
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
      shipper: `SHP-${(h % 90000) + 10000}`,
      consignee: `CNS-${(h % 80000) + 20000}`,
      customer: load.identifier,
      tender: `TND-${load.id.slice(-4)}`,
      bol: poNumber,
      appointment: load.pickupDate,
      trailer: load.equipment,
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
