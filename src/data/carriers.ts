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
  /** Who owns this relationship on our side. */
  rep: string
  team: string
  loads90: number
  onTime: string
  lastLoad: string
  equipment: string[]
  favorite?: boolean
}

/** Someone at the carrier, or on our side, tied to this relationship. */
export type CarrierPerson = {
  id: string
  name: string
  role: string
  email: string
  phone: string
  tz?: string
  /** Our-side people carry a duty label instead of a department. */
  duty?: 'Carrier rep' | 'Backup rep' | 'Escalation'
  since?: string
  note?: string
}

export type CarrierDetail = CarrierListItem & {
  activeSince: string
  /** People at the carrier — dispatch, after hours, billing, safety. */
  people: CarrierPerson[]
  /** Our side of the relationship — carrier rep, backup, escalation. */
  accountTeam: CarrierPerson[]
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
    highwayVerified?: boolean
    whatsappStatus?: 'Active' | 'Unknown' | 'Inactive'
  }[]
  preferredChannel?: 'Email' | 'WhatsApp' | 'SMS' | 'Phone'
  authorizedDomains?: string[]
  regionsPresent?: string[]
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
    rep: 'Mandeep Singh',
    team: 'Spot East',
    loads90: 34,
    onTime: '94%',
    lastLoad: 'Aug 11, 2026',
    equipment: ['DRY-VAN', 'FLATBED'],
    favorite: true,
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
    rep: 'Gagan Chapadia',
    team: 'Spot East',
    loads90: 51,
    onTime: '97%',
    lastLoad: 'Aug 13, 2026',
    equipment: ['DRY-VAN', 'TRI-AXLE'],
    favorite: true,
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
    rep: 'Sarah Kim',
    team: 'Power Only',
    loads90: 19,
    onTime: '91%',
    lastLoad: 'Jul 29, 2026',
    equipment: ['DRY-VAN'],
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
    rep: 'Mandeep Singh',
    team: 'Spot East',
    loads90: 27,
    onTime: '90%',
    lastLoad: 'Aug 09, 2026',
    equipment: ['DRY-VAN', 'REEFER'],
    favorite: true,
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
    rep: 'Tom Reyes',
    team: 'Power Only',
    loads90: 8,
    onTime: '78%',
    lastLoad: 'Jun 22, 2026',
    equipment: ['POWER ONLY'],
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
    rep: 'Gagan Chapadia',
    team: 'Spot East',
    loads90: 41,
    onTime: '95%',
    lastLoad: 'Aug 12, 2026',
    equipment: ['DRY-VAN'],
    favorite: true,
  },
  {
    id: 'c-roadlink',
    name: 'ROADLINK CARRIERS LIMITED',
    status: 'Active',
    division: 'CHARGER LOGISTICS INC',
    currency: 'CAD',
    mc: '512890',
    dot: '4212038',
    address: '77 Beachville Rd',
    city: 'Woodstock',
    state: 'ON',
    postal: 'N4S 7W1',
    contactName: 'Rohit Sharma',
    email: 'dispatch@roadlink.example',
    phone: '+1 (519) 555-0121',
    scac: 'RDLK',
    rep: 'Mandeep Singh',
    team: 'Spot East',
    loads90: 28,
    onTime: '94%',
    lastLoad: 'Aug 10, 2026',
    equipment: ['DRY-VAN', 'TRI-AXLE'],
    favorite: true,
  },
  {
    id: 'c-mangat',
    name: 'MANGAT TRANSHAUL INC',
    status: 'Active',
    division: 'CHARGER LOGISTICS INC',
    currency: 'CAD',
    mc: '903441',
    dot: '4544786',
    address: '13320 76 Ave',
    city: 'Surrey',
    state: 'BC',
    postal: 'V3W 2V6',
    contactName: 'Mandeep Mangat',
    email: 'ops@mangat.example',
    phone: '+1 (604) 555-0164',
    scac: 'MGTI',
    rep: 'Priya Nair',
    team: 'Cross-border MX',
    loads90: 11,
    onTime: '95%',
    lastLoad: 'Aug 06, 2026',
    equipment: ['DRY-VAN'],
    favorite: true,
  },
  {
    id: 'c-manney',
    name: 'MANNEY CROSS-BORDER SA',
    status: 'Active',
    division: 'CHARGER GLOBAL LOGISTICS INC.',
    currency: 'USD',
    mc: '1941466',
    dot: '3901254',
    address: 'Av. Reforma 220',
    city: 'Nuevo Laredo',
    state: 'TAM',
    postal: '88000',
    contactName: 'Miguel Ángel Ruiz',
    email: 'trafico@manney.example',
    phone: '+52 867 555 0142',
    scac: 'MNYX',
    rep: 'Priya Nair',
    team: 'Cross-border MX',
    loads90: 16,
    onTime: '88%',
    lastLoad: 'Aug 08, 2026',
    equipment: ['DRY-VAN', 'BONDED'],
    favorite: true,
  },
  {
    id: 'c-smart',
    name: 'SMART CHOICE TRANSPORT LTD',
    status: 'Active',
    division: 'CHARGER LOGISTICS INC',
    currency: 'CAD',
    mc: '4483133',
    dot: '4483133',
    address: '5170 Dixie Rd',
    city: 'Mississauga',
    state: 'ON',
    postal: 'L4W 1E3',
    contactName: 'Harjot Singh',
    email: 'harjot@smartchoice.example',
    phone: '+1 (416) 555-0110',
    scac: 'SMCT',
    rep: 'Jordan Lee',
    team: 'Fleet Ops',
    loads90: 14,
    onTime: '92%',
    lastLoad: 'Aug 04, 2026',
    equipment: ['DRY-VAN'],
  },
  {
    id: 'c-peak',
    name: 'PEAK FLATBED SOLUTIONS',
    status: 'Active',
    division: 'CHARGER GLOBAL LOGISTICS INC.',
    currency: 'USD',
    mc: '229441',
    dot: '2298117',
    address: '3400 Steel Mill Rd',
    city: 'Pittsburgh',
    state: 'PA',
    postal: '15201',
    contactName: 'Dana Whitfield',
    email: 'loads@peakflatbed.example',
    phone: '+1 (412) 555-0139',
    scac: 'PKFB',
    rep: 'Tom Reyes',
    team: 'Power Only',
    loads90: 6,
    onTime: '86%',
    lastLoad: 'Jul 18, 2026',
    equipment: ['FLATBED', 'STEP DECK'],
  },
  {
    id: 'c-greatlakes',
    name: 'GREAT LAKES DRAYAGE CO',
    status: 'Active',
    division: 'CHARGER GLOBAL LOGISTICS INC.',
    currency: 'USD',
    mc: '448290',
    dot: '5561224',
    address: '1500 Port Access Rd',
    city: 'Detroit',
    state: 'MI',
    postal: '48209',
    contactName: 'Ella Novak',
    email: 'drayage@greatlakes.example',
    phone: '+1 (313) 555-0155',
    scac: 'GLDC',
    rep: 'Sarah Kim',
    team: 'Power Only',
    loads90: 22,
    onTime: '89%',
    lastLoad: 'Aug 07, 2026',
    equipment: ['CONTAINER', 'CHASSIS'],
  },
  {
    id: 'c-bluebird',
    name: 'BLUEBIRD FREIGHT SYSTEMS',
    status: 'Inactive',
    division: 'CHARGER LOGISTICS INC',
    currency: 'CAD',
    mc: '617355',
    dot: '3388120',
    address: '900 Rue Notre-Dame',
    city: 'Montréal',
    state: 'QC',
    postal: 'H3C 1J9',
    contactName: 'Luc Tremblay',
    email: 'repartition@bluebird.example',
    phone: '+1 (514) 555-0173',
    scac: 'BBFS',
    rep: 'Jordan Lee',
    team: 'Fleet Ops',
    loads90: 9,
    onTime: '83%',
    lastLoad: 'Jul 02, 2026',
    equipment: ['DRY-VAN', 'REEFER'],
  },
  {
    id: 'c-northstar',
    name: 'NORTHSTAR VAN LINES INC',
    status: 'Active',
    division: 'CHARGER GLOBAL LOGISTICS INC.',
    currency: 'USD',
    mc: '730118',
    dot: '4887710',
    address: '620 Cargo Loop',
    city: 'Minneapolis',
    state: 'MN',
    postal: '55401',
    contactName: 'Grace Lindqvist',
    email: 'ops@northstarvan.example',
    phone: '+1 (612) 555-0128',
    scac: 'NSVL',
    rep: 'Tom Reyes',
    team: 'Power Only',
    loads90: 12,
    onTime: '90%',
    lastLoad: 'Aug 01, 2026',
    equipment: ['DRY-VAN'],
  },
  {
    id: 'c-edontario',
    name: 'E & D ONTARIO FREIGHT',
    status: 'Disabled',
    division: 'CHARGER LOGISTICS INC',
    currency: 'CAD',
    mc: '508122',
    dot: '4282695',
    address: '145 Exeter Rd',
    city: 'London',
    state: 'ON',
    postal: 'N6L 1A3',
    contactName: 'Dave Kowalchuk',
    email: 'dave@edontario.example',
    phone: '+1 (519) 555-0177',
    scac: 'EDOF',
    rep: 'Gagan Chapadia',
    team: 'Spot East',
    loads90: 4,
    onTime: '61%',
    lastLoad: 'Jun 28, 2026',
    equipment: ['DRY-VAN'],
  },
]

function detailFromList(base: CarrierListItem, extras: Partial<CarrierDetail>): CarrierDetail {
  const domain = base.email.split('@')[1] ?? 'carrier.example'
  const firstName = base.contactName.split(' ')[0]

  return {
    ...base,
    activeSince: '3 yrs',
    people: [
      {
        id: 'p-dispatch',
        name: base.contactName,
        role: 'Dispatch lead',
        email: base.email,
        phone: base.phone,
        tz: base.state === 'TAM' ? 'CT' : base.currency === 'CAD' ? 'ET' : 'CT',
        since: 'Since Mar 2024',
        note: 'Books tenders and confirms appointments',
      },
      {
        id: 'p-night',
        name: 'Night desk',
        role: 'After hours',
        email: `nights@${domain}`,
        phone: base.phone.replace(/\d{2}$/, '88'),
        tz: base.currency === 'CAD' ? 'ET' : 'CT',
        note: 'Covers 18:00 – 06:00 and weekend tracking',
      },
      {
        id: 'p-owner',
        name: `${firstName}'s owner desk`,
        role: 'Owner / authority',
        email: `owner@${domain}`,
        phone: base.phone.replace(/\d{2}$/, '01'),
        tz: base.currency === 'CAD' ? 'ET' : 'CT',
        note: 'Signs contracts and rate agreements',
      },
      {
        id: 'p-billing',
        name: 'Accounts receivable',
        role: 'Billing',
        email: `ap@${domain}`,
        phone: base.phone.replace(/\d{2}$/, '70'),
        tz: base.currency === 'CAD' ? 'ET' : 'CT',
        note: 'Invoices, rate con copies, payment status',
      },
      {
        id: 'p-safety',
        name: 'Safety & compliance',
        role: 'Safety',
        email: `safety@${domain}`,
        phone: base.phone.replace(/\d{2}$/, '55'),
        tz: base.currency === 'CAD' ? 'ET' : 'CT',
        note: 'Insurance certificates and driver files',
      },
    ],
    accountTeam: [
      {
        id: 'a-rep',
        name: base.rep,
        role: `Carrier sales · ${base.team}`,
        duty: 'Carrier rep',
        email: `${base.rep.toLowerCase().replace(/\s+/g, '.')}@chargerlogistics.com`,
        phone: '+1 (905) 366-0100',
        since: 'Owns this relationship',
      },
      {
        id: 'a-backup',
        name: base.team === 'Cross-border MX' ? 'Marcus Chen' : 'Gagan Chapadia',
        role: 'CSR',
        duty: 'Backup rep',
        email: 'csr.desk@chargerlogistics.com',
        phone: '+1 (905) 366-0122',
        since: 'Covers time off and after hours',
      },
      {
        id: 'a-escalation',
        name: 'Inderjit Singh Dhillon',
        role: 'Account manager',
        duty: 'Escalation',
        email: 'inderjit.dhillon@chargerlogistics.com',
        phone: '+1 (905) 366-0155',
        since: 'Rate disputes and service failures',
      },
    ],
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
        highwayVerified: true,
        whatsappStatus: 'Active' as const,
      },
      {
        name: 'Dispatch Desk',
        role: 'DISPATCH',
        email: `desk@${base.email.split('@')[1] ?? 'carrier.example'}`,
        phone: base.phone,
        status: 'Approved',
        source: 'Highway',
        domain: base.email.split('@')[1] ?? '—',
        highwayVerified: true,
        whatsappStatus: 'Unknown' as const,
      },
      {
        name: 'Insurance Broker',
        role: 'INSURANCE',
        email: 'policies@reliance.example',
        phone: '+1 (800) 555-0100',
        status: 'Pending',
        source: 'Highway',
        domain: 'reliance.example',
        highwayVerified: false,
        whatsappStatus: 'Inactive' as const,
      },
    ],
    preferredChannel: 'Email' as const,
    authorizedDomains: [base.email.split('@')[1] ?? 'carrier.example'],
    regionsPresent:
      base.state === 'ON' || /toronto|brampton|on\b/i.test(`${base.city} ${base.state}`)
        ? ['ON', 'MI', 'NY']
        : ['TX', 'CA', 'IL', 'MO'],
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
