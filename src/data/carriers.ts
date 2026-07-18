export type CarrierStatus = 'Active' | 'Inactive' | 'Disabled'

export type CarrierListItem = {
  id: string
  name: string
  status: CarrierStatus
  division: string
  currency: 'USD' | 'CAD'
  mc: string
  dot: string
  address: string
  city: string
  state: string
  postal: string
  contactName: string
  email: string
  phone: string
  scac: string
}

export type CarrierDetail = CarrierListItem & {
  activeSince: string
  passMonths: number
  units: number
  drivers: number
  trailers: number
  terminals: number
  offices: number
  badges: { label: string; active?: boolean }[]
  assignmentsInProgress: number
  loads30d: number
  insurance: {
    cargoCoverage: string
    interchange: string
    hazmat: string
    bipdInsurer: string
    bipdPolicy: string
    bipdLimit: string
    bipdEffective: string
    bipdExpiry: string
  }
  compliance: {
    eldVerified: boolean
    tinVerified: boolean
    w9OnFile: boolean
    hazmatCertified: boolean
    highValueApproved: boolean
    safetyRating: string
    ratedOn: string
    reviewedOn: string
    crashes: { total: number; fatal: number; injury: number; towAway: number }
  }
  expirations: { title: string; policy: string; expires: string; status: 'Expired' | 'Soon' }[]
  policies: {
    type: string
    broker: string
    policyNo: string
    effective: string
    expiry: string
    limit: string
    deductible: string
    source: string
    status: 'Active' | 'Expired'
  }[]
  coverage: {
    canada: string
    usa: string
    mexico: string
  }
  availabilityPosts: {
    id: string
    origin: string
    destination: string
    trailer: string
    start: string
    end: string
    status: string
  }[]
  preferredLanes: { origin: string; destination: string; volume: string }[]
  dedicatedLanes: { origin: string; destination: string; contract: string }[]
  resources: {
    trucks: number
    trailers: number
    drivers: { name: string; phone: string; email: string; status: string }[]
    terminals: number
    offices: number
  }
  comparison: { field: string; group: string; highway: string; genlogs: string; status: string }[]
  banking: {
    country: string
    flag: string
    currency: string
    apCode: string
    bank: string
    account: string
    method: string
    terms: string
    status: string
  }[]
  contacts: {
    name: string
    role: string
    email: string
    phone: string
    status: string
    source: string
    domain: string
  }[]
  contractTypes: string[]
  documents: { id: string; folder: string; name: string; date: string; kind: string }[]
  notes: { id: string; type: 'Internal' | 'External' | 'Carrier Dispatch Alert'; text: string; when: string; who: string }[]
  vetting: {
    blocked: number
    warnings: number
    passed: number
    total: number
    issues: { title: string; detail: string; severity: 'Blocking' | 'Warning' }[]
  }
}

export const carrierList: CarrierListItem[] = [
  {
    id: 'c-bspj',
    name: 'BSPJ COMPANY LLC',
    status: 'Active',
    division: 'CHARGER GLOBAL LOGISTICS INC.',
    currency: 'USD',
    mc: '1333344',
    dot: '3753418',
    address: '1200 Industrial Pkwy',
    city: 'Columbia',
    state: 'MO',
    postal: '65201',
    contactName: 'James Parker',
    email: 'dispatch@bspj.example',
    phone: '+1 (573) 555-0144',
    scac: 'BSPJ',
  },
  {
    id: 'c-micra',
    name: 'MICRA TRANSPORTATION SERVICES',
    status: 'Active',
    division: 'CHARGER LOGISTICS INC',
    currency: 'CAD',
    mc: '884120',
    dot: '2551021',
    address: '88 Transfer Rd',
    city: 'Brampton',
    state: 'ON',
    postal: 'L6T 4N8',
    contactName: 'Priya Singh',
    email: 'ops@micra.example',
    phone: '+1 (905) 555-0198',
    scac: 'MCRA',
  },
  {
    id: 'c-uacl',
    name: 'UACL LOGISTICS LLC',
    status: 'Inactive',
    division: 'CHARGER GLOBAL LOGISTICS INC.',
    currency: 'USD',
    mc: '712904',
    dot: '1984412',
    address: '400 Harbor Ave',
    city: 'Chicago',
    state: 'IL',
    postal: '60607',
    contactName: 'Marcus Lee',
    email: 'desk@uacl.example',
    phone: '+1 (312) 555-0110',
    scac: 'UACL',
  },
  {
    id: 'c-kuldip',
    name: 'KULDIP TRANSPORT INC',
    status: 'Active',
    division: 'CHARGER LOGISTICS INC',
    currency: 'CAD',
    mc: '551002',
    dot: '2294410',
    address: '25 Production Road',
    city: 'Mississauga',
    state: 'ON',
    postal: 'L5T 2C3',
    contactName: 'Kuldip Grewal',
    email: 'rates@kuldip.example',
    phone: '+1 (647) 555-0177',
    scac: 'KLDP',
  },
  {
    id: 'c-midwest',
    name: 'MIDWEST POWER HAUL INC',
    status: 'Disabled',
    division: 'CHARGER GLOBAL LOGISTICS INC.',
    currency: 'USD',
    mc: '339811',
    dot: '1182044',
    address: '910 Freight Way',
    city: 'Dallas',
    state: 'TX',
    postal: '75201',
    contactName: 'Sam Ortiz',
    email: 'power@midwest.example',
    phone: '+1 (214) 555-0133',
    scac: 'MPHI',
  },
  {
    id: 'c-ontario',
    name: 'ONTARIO EXPRESS CARRIERS',
    status: 'Active',
    division: 'CHARGER LOGISTICS INC',
    currency: 'CAD',
    mc: '229441',
    dot: '4419021',
    address: '2836 Dingman Drive',
    city: 'London',
    state: 'ON',
    postal: 'N6N 1G4',
    contactName: 'Alex Rivera',
    email: 'cover@ontarioexpress.example',
    phone: '+1 (519) 555-0188',
    scac: 'ONEX',
  },
]

function detailFromList(base: CarrierListItem, extras: Partial<CarrierDetail>): CarrierDetail {
  return {
    ...base,
    activeSince: '3 yrs',
    passMonths: 45,
    units: 1,
    drivers: 1,
    trailers: 2,
    terminals: 1,
    offices: 1,
    badges: [
      { label: 'Property Auth', active: true },
      { label: 'SmartWay' },
      { label: 'C-TPAT', active: true },
      { label: 'CARB' },
      { label: 'Hazmat' },
    ],
    assignmentsInProgress: 2,
    loads30d: 14,
    insurance: {
      cargoCoverage: '$250,000',
      interchange: 'Yes',
      hazmat: 'No',
      bipdInsurer: 'Reliance Partners',
      bipdPolicy: 'MMTH25549090',
      bipdLimit: '$1,000,000',
      bipdEffective: 'Aug 25, 2025',
      bipdExpiry: 'Aug 25, 2026',
    },
    compliance: {
      eldVerified: true,
      tinVerified: true,
      w9OnFile: true,
      hazmatCertified: false,
      highValueApproved: true,
      safetyRating: 'Satisfactory',
      ratedOn: '10/22/2025',
      reviewedOn: '08/17/2025',
      crashes: { total: 0, fatal: 0, injury: 0, towAway: 0 },
    },
    expirations: [
      {
        title: 'Automobile Liability Insurance',
        policy: 'MMTH25549090',
        expires: '08/26/2026',
        status: 'Soon',
      },
      {
        title: 'Motor Cargo Liability Insurance',
        policy: 'MMTH25549090',
        expires: '08/26/2026',
        status: 'Soon',
      },
    ],
    policies: [
      {
        type: 'Automobile Liability',
        broker: 'Reliance Partners',
        policyNo: 'MMTH25549090',
        effective: 'Aug 25, 2025',
        expiry: 'Aug 25, 2026',
        limit: '$1,000,000',
        deductible: 'None',
        source: 'ChargerFleet',
        status: 'Active',
      },
      {
        type: 'Motor Cargo Liability',
        broker: 'Reliance Partners',
        policyNo: 'MMTH25549091',
        effective: 'Aug 25, 2025',
        expiry: 'Aug 25, 2026',
        limit: '$250,000',
        deductible: '$1,000',
        source: 'ChargerFleet',
        status: 'Active',
      },
    ],
    coverage: {
      canada: 'Active · ON · QC · MB',
      usa: 'Active · IL · MI · OH · NY · PA',
      mexico: 'No active coverage on file',
    },
    availabilityPosts: [
      {
        id: 'ap1',
        origin: 'Columbia, MO',
        destination: 'Chicago, IL',
        trailer: 'DRY-VAN',
        start: 'Jul 18, 2026',
        end: 'Jul 20, 2026',
        status: 'Available',
      },
      {
        id: 'ap2',
        origin: 'St. Louis, MO',
        destination: 'Dallas, TX',
        trailer: 'FLATBED',
        start: 'Jul 21, 2026',
        end: 'Jul 23, 2026',
        status: 'Posted',
      },
    ],
    preferredLanes: [
      { origin: 'Columbia, MO', destination: 'Chicago, IL', volume: '12 / 30d' },
      { origin: 'Kansas City, MO', destination: 'Dallas, TX', volume: '7 / 30d' },
    ],
    dedicatedLanes: [
      { origin: 'Columbia, MO', destination: 'Atlanta, GA', contract: 'DED-2026-041' },
    ],
    resources: {
      trucks: 1,
      trailers: 2,
      drivers: [
        {
          name: 'Jordan Blake',
          phone: '+1 (573) 555-0190',
          email: 'jordan.blake@bspj.example',
          status: 'ACTIVE',
        },
      ],
      terminals: 1,
      offices: 1,
    },
    comparison: [
      { field: 'Legal Name', group: 'Identity & Registration', highway: '—', genlogs: base.name, status: 'GenLogs only' },
      { field: 'DOT Number', group: 'Identity & Registration', highway: '—', genlogs: base.dot, status: 'GenLogs only' },
      { field: 'MC Number', group: 'Identity & Registration', highway: base.mc, genlogs: base.mc, status: 'Match' },
      { field: 'Authority Status', group: 'Authority & Operations', highway: '—', genlogs: 'Active', status: 'GenLogs only' },
      { field: 'Power Units', group: 'Authority & Operations', highway: '—', genlogs: '1', status: 'GenLogs only' },
      { field: 'Drivers', group: 'Authority & Operations', highway: '1', genlogs: '1', status: 'Match' },
      { field: 'Cargo Carried', group: 'Authority & Operations', highway: '—', genlogs: 'General Freight', status: 'GenLogs only' },
      { field: 'Vetting Verdict', group: 'Vetting Verdict', highway: '—', genlogs: 'Pass', status: 'GenLogs only' },
    ],
    banking: [
      {
        country: 'Canada',
        flag: '🇨🇦',
        currency: 'CAD',
        apCode: `${base.name}-C`,
        bank: 'TD Commercial',
        account: '****4421',
        method: 'EFT',
        terms: 'Net 30',
        status: 'Verified',
      },
      {
        country: 'U.S.',
        flag: '🇺🇸',
        currency: 'USD',
        apCode: `${base.name}-U`,
        bank: 'Chase Business',
        account: '****8890',
        method: 'ACH',
        terms: 'Net 30',
        status: 'Verified',
      },
    ],
    contacts: [
      {
        name: base.contactName,
        role: 'OWNER',
        email: base.email,
        phone: base.phone,
        status: 'Approved',
        source: 'Internal',
        domain: base.email.split('@')[1] ?? '—',
      },
      {
        name: 'Dispatch Desk',
        role: 'DISPATCH',
        email: `desk@${base.email.split('@')[1] ?? 'carrier.example'}`,
        phone: base.phone,
        status: 'Approved',
        source: 'Internal',
        domain: base.email.split('@')[1] ?? '—',
      },
      {
        name: 'Insurance Broker',
        role: 'INSURANCE',
        email: 'policies@reliance.example',
        phone: '+1 (800) 555-0100',
        status: 'Pending',
        source: 'Highway',
        domain: 'reliance.example',
      },
    ],
    contractTypes: ['Freight Move', 'Brokerage Spot', 'Power Only'],
    documents: [
      { id: 'd1', folder: 'Contract', name: `${base.mc}-CONTRACT.pdf`, date: 'Oct 24, 2025', kind: 'pdf' },
      { id: 'd2', folder: 'Insurance', name: 'COI-Auto-Liability.pdf', date: 'Aug 25, 2025', kind: 'pdf' },
      { id: 'd3', folder: 'Insurance', name: 'COI-Cargo.pdf', date: 'Aug 25, 2025', kind: 'pdf' },
      { id: 'd4', folder: 'Carrier Package', name: 'W9.pdf', date: 'Jun 12, 2025', kind: 'pdf' },
      { id: 'd5', folder: 'Carrier Package', name: 'Authority.png', date: 'Jun 12, 2025', kind: 'img' },
      { id: 'd6', folder: 'Carrier Package', name: 'Carrier-Packet.zip', date: 'Jun 12, 2025', kind: 'zip' },
    ],
    notes: [
      {
        id: 'n1',
        type: 'Internal',
        text: 'Preferred for Midwest dry van — reliable on-time performance.',
        when: 'Jul 10, 2026 · 2:14 PM',
        who: 'Sukhdeep Dhillon',
      },
      {
        id: 'n2',
        type: 'External',
        text: 'Asked carrier to confirm tarp kit before flatbed tenders.',
        when: 'Jul 08, 2026 · 11:02 AM',
        who: 'CSR Desk',
      },
    ],
    vetting: {
      blocked: 0,
      warnings: 1,
      passed: 5,
      total: 6,
      issues: [
        {
          title: 'Safety Rating',
          detail: 'Satisfactory · review recommended before high-value loads',
          severity: 'Warning',
        },
      ],
    },
    ...extras,
  }
}

export const carrierDetails: Record<string, CarrierDetail> = Object.fromEntries(
  carrierList.map((c) => [c.id, detailFromList(c, {})])
)

export function getCarrierDetail(id: string) {
  return carrierDetails[id] ?? null
}
