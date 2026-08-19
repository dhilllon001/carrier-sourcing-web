/* My carriers, from the rep's side: who I own, who I tender first, and what we have actually run. */

export type BookRole = 'Rep' | 'Backup' | 'Watching'
export type InsuranceState = 'ok' | 'soon' | 'expired'

export type BookLane = {
  lane: string
  loads: number
  /** Lane the carrier is favourited on — sourcing tenders them first there. */
  favourite?: boolean
}

export type BookCarrier = {
  id: string
  name: string
  mc: string
  dot: string
  city: string
  state: string
  /** True when this carrier sits in my own book rather than a colleague's. */
  inBook: boolean
  role: BookRole
  owner: string
  backupRep?: string
  contact: string
  phone: string
  email: string
  loadsRun: number
  since: string
  lastLoad: string
  daysSinceLoad: number
  spend: number
  marketPerLoad: number
  accept: number
  onTime: number
  claims: number
  insuranceExpiry: string
  insurance: InsuranceState
  lanes: BookLane[]
  /** Loads moved in each of the last six months, oldest first. */
  months: number[]
  /** Position on the ranked shortlist, when the carrier is a favourite. */
  rank?: number
  isNew?: boolean
}

export const bookCarriers: BookCarrier[] = [
  {
    id: 'bk-dgs',
    name: 'DGS Logistics',
    mc: '771204',
    dot: '771204',
    city: 'Brampton',
    state: 'ON',
    inBook: true,
    role: 'Rep',
    owner: 'You',
    backupRep: 'Gagan Chapadia',
    contact: 'Davinder Gill',
    phone: '+1 (905) 555-0142',
    email: 'dispatch@dgslogistics.example',
    loadsRun: 412,
    since: 'Mar 2023',
    lastLoad: 'today',
    daysSinceLoad: 0,
    spend: 204600,
    marketPerLoad: 513,
    accept: 98,
    onTime: 98,
    claims: 0,
    insuranceExpiry: 'Nov 30, 2026',
    insurance: 'ok',
    lanes: [
      { lane: 'Brampton → Woodstock', loads: 168, favourite: true },
      { lane: 'Brampton → London', loads: 94 },
      { lane: 'Toronto → Detroit', loads: 61 },
    ],
    months: [22, 26, 31, 29, 34, 38],
    rank: 1,
  },
  {
    id: 'bk-midwest',
    name: 'Midwest Van Lines',
    mc: '6612900',
    dot: '3391204',
    city: 'Green Bay',
    state: 'WI',
    inBook: true,
    role: 'Rep',
    owner: 'You',
    contact: 'Ella Novak',
    phone: '+1 (920) 555-0119',
    email: 'ops@midwestvan.example',
    loadsRun: 341,
    since: 'Nov 2022',
    lastLoad: 'today',
    daysSinceLoad: 0,
    spend: 157500,
    marketPerLoad: 470,
    accept: 97,
    onTime: 97,
    claims: 0,
    insuranceExpiry: 'Dec 15, 2026',
    insurance: 'ok',
    lanes: [
      { lane: 'Fox River → Morris', loads: 214, favourite: true },
      { lane: 'Morris → Fox River', loads: 108 },
    ],
    months: [48, 52, 55, 58, 61, 67],
  },
  {
    id: 'bk-roadlink',
    name: 'Roadlink Carriers Limited',
    mc: '4212038',
    dot: '4212038',
    city: 'Woodstock',
    state: 'ON',
    inBook: true,
    role: 'Rep',
    owner: 'You',
    contact: 'Rohit Sharma',
    phone: '+1 (519) 555-0121',
    email: 'dispatch@roadlink.example',
    loadsRun: 287,
    since: 'Jan 2023',
    lastLoad: '1d ago',
    daysSinceLoad: 1,
    spend: 141900,
    marketPerLoad: 501,
    accept: 94,
    onTime: 96,
    claims: 1,
    insuranceExpiry: 'Jun 30, 2027',
    insurance: 'ok',
    lanes: [
      { lane: 'Brampton → Woodstock', loads: 151 },
      { lane: 'Mississauga → Montréal', loads: 96 },
    ],
    months: [38, 41, 44, 46, 49, 52],
    rank: 2,
  },
  {
    id: 'bk-smart',
    name: 'Smart Choice Transport Ltd',
    mc: '4483133',
    dot: '4483133',
    city: 'Mississauga',
    state: 'ON',
    inBook: true,
    role: 'Backup',
    owner: 'Rohit Kumar',
    contact: 'Harjot Singh',
    phone: '+1 (416) 555-0110',
    email: 'harjot@smartchoice.example',
    loadsRun: 198,
    since: 'Jun 2023',
    lastLoad: '1d ago',
    daysSinceLoad: 1,
    spend: 488300,
    marketPerLoad: 2527,
    accept: 93,
    onTime: 91,
    claims: 2,
    insuranceExpiry: 'Apr 30, 2027',
    insurance: 'ok',
    lanes: [
      { lane: 'Nogales → Sedalia', loads: 118, favourite: true },
      { lane: 'Seabrook → Modesto', loads: 64 },
    ],
    months: [28, 30, 33, 31, 35, 36],
  },
  {
    id: 'bk-manney',
    name: 'Manney Cross-Border SA',
    mc: '1941466',
    dot: '3901254',
    city: 'Nuevo Laredo',
    state: 'TAM',
    inBook: true,
    role: 'Rep',
    owner: 'You',
    backupRep: 'Priya Nair',
    contact: 'Miguel Ángel Ruiz',
    phone: '+52 867 555 0142',
    email: 'trafico@manney.example',
    loadsRun: 156,
    since: 'Aug 2023',
    lastLoad: '2d ago',
    daysSinceLoad: 2,
    spend: 372800,
    marketPerLoad: 2419,
    accept: 96,
    onTime: 97,
    claims: 0,
    insuranceExpiry: 'Sep 30, 2026',
    insurance: 'soon',
    lanes: [
      { lane: 'Laredo → Sterling Heights', loads: 96, favourite: true },
      { lane: 'Nogales → Sedalia', loads: 44 },
    ],
    months: [22, 24, 25, 27, 28, 30],
    rank: 3,
  },
  {
    id: 'bk-bajio',
    name: 'Transportes Bajío',
    mc: '7781200',
    dot: '1904455',
    city: 'Silao',
    state: 'GTO',
    inBook: false,
    role: 'Watching',
    owner: 'Kuldeep Ghuman',
    contact: 'Ana Sofía Vega',
    phone: '+52 472 555 0188',
    email: 'trafico@bajio.example',
    loadsRun: 143,
    since: 'May 2023',
    lastLoad: '1d ago',
    daysSinceLoad: 1,
    spend: 123700,
    marketPerLoad: 905,
    accept: 94,
    onTime: 94,
    claims: 0,
    insuranceExpiry: 'Mar 31, 2027',
    insurance: 'ok',
    lanes: [{ lane: 'Silao → Monterrey', loads: 121 }],
    months: [20, 22, 23, 24, 26, 28],
  },
  {
    id: 'bk-kruger',
    name: 'Kruger Haul Ltd',
    mc: '2277341',
    dot: '2277341',
    city: 'Brampton',
    state: 'ON',
    inBook: true,
    role: 'Rep',
    owner: 'You',
    contact: 'Luc Tremblay',
    phone: '+1 (905) 555-0173',
    email: 'dispatch@krugerhaul.example',
    loadsRun: 88,
    since: 'Feb 2024',
    lastLoad: '2d ago',
    daysSinceLoad: 2,
    spend: 101200,
    marketPerLoad: 1095,
    accept: 82,
    onTime: 89,
    claims: 1,
    insuranceExpiry: 'Aug 31, 2026',
    insurance: 'soon',
    lanes: [
      { lane: 'Mississauga → Montréal', loads: 54, favourite: true },
      { lane: 'Brampton → Québec City', loads: 26 },
    ],
    months: [12, 13, 15, 14, 16, 18],
  },
  {
    id: 'bk-forestcity',
    name: 'Forest City Cartage',
    mc: '3721167',
    dot: '3721167',
    city: 'London',
    state: 'ON',
    inBook: true,
    role: 'Rep',
    owner: 'You',
    contact: 'Dave Kowalchuk',
    phone: '+1 (519) 555-0177',
    email: 'dave@forestcity.example',
    loadsRun: 74,
    since: 'Oct 2023',
    lastLoad: '78d ago',
    daysSinceLoad: 78,
    spend: 38400,
    marketPerLoad: 511,
    accept: 90,
    onTime: 93,
    claims: 0,
    insuranceExpiry: 'Feb 28, 2027',
    insurance: 'ok',
    lanes: [{ lane: 'Brampton → Woodstock', loads: 61 }],
    months: [18, 16, 14, 9, 0, 0],
  },
  {
    id: 'bk-prairie',
    name: 'Prairie Link Transport',
    mc: '889201',
    dot: '4118220',
    city: 'Des Moines',
    state: 'IA',
    inBook: true,
    role: 'Rep',
    owner: 'You',
    contact: 'Grace Lindqvist',
    phone: '+1 (515) 555-0128',
    email: 'ops@prairielink.example',
    loadsRun: 62,
    since: 'Apr 2023',
    lastLoad: '1d ago',
    daysSinceLoad: 1,
    spend: 29700,
    marketPerLoad: 471,
    accept: 92,
    onTime: 95,
    claims: 0,
    insuranceExpiry: 'Jul 22, 2027',
    insurance: 'ok',
    lanes: [{ lane: 'Fox River → Morris', loads: 55 }],
    months: [8, 9, 10, 11, 11, 13],
  },
  {
    id: 'bk-coldchain',
    name: 'ColdChain West',
    mc: '3320981',
    dot: '3320981',
    city: 'Reno',
    state: 'NV',
    inBook: false,
    role: 'Watching',
    owner: 'Gagan Chapadia',
    contact: 'Marta Ibarra',
    phone: '+1 (775) 555-0164',
    email: 'cold@coldchainwest.example',
    loadsRun: 41,
    since: 'Jul 2023',
    lastLoad: '5d ago',
    daysSinceLoad: 5,
    spend: 175900,
    marketPerLoad: 4182,
    accept: 84,
    onTime: 88,
    claims: 1,
    insuranceExpiry: 'Jan 31, 2027',
    insurance: 'ok',
    lanes: [{ lane: 'Normal → Palo Alto', loads: 31 }],
    months: [6, 7, 6, 8, 7, 7],
  },
  {
    id: 'bk-edontario',
    name: 'E & D Ontario Inc.',
    mc: '4282695',
    dot: '4282695',
    city: 'London',
    state: 'ON',
    inBook: false,
    role: 'Watching',
    owner: 'Gagan Chapadia',
    contact: 'Dave Kowalchuk',
    phone: '+1 (519) 555-0177',
    email: 'dave@edontario.example',
    loadsRun: 34,
    since: 'Sep 2023',
    lastLoad: '112d ago',
    daysSinceLoad: 112,
    spend: 27200,
    marketPerLoad: 718,
    accept: 58,
    onTime: 74,
    claims: 3,
    insuranceExpiry: 'Jun 12, 2026',
    insurance: 'expired',
    lanes: [{ lane: 'Mississauga → Montréal', loads: 28 }],
    months: [9, 7, 6, 4, 0, 0],
  },
  {
    id: 'bk-sierra',
    name: 'Sierra Reefer Express',
    mc: '4429011',
    dot: '4429011',
    city: 'Fresno',
    state: 'CA',
    inBook: true,
    role: 'Rep',
    owner: 'You',
    contact: 'Nina Alvarez',
    phone: '+1 (559) 555-0133',
    email: 'dispatch@sierrareefer.example',
    loadsRun: 12,
    since: 'Feb 2026',
    lastLoad: '21d ago',
    daysSinceLoad: 21,
    spend: 53500,
    marketPerLoad: 4178,
    accept: 62,
    onTime: 79,
    claims: 0,
    insuranceExpiry: 'Sep 05, 2026',
    insurance: 'soon',
    lanes: [{ lane: 'Normal → Palo Alto', loads: 10 }],
    months: [0, 0, 2, 3, 3, 4],
    isNew: true,
  },
]

/* ── derived reads ── */

export function perLoad(c: BookCarrier) {
  return c.loadsRun ? c.spend / c.loadsRun : 0
}

export function vsMarketPct(c: BookCarrier) {
  const paid = perLoad(c)
  return c.marketPerLoad ? ((paid - c.marketPerLoad) / c.marketPerLoad) * 100 : 0
}

export function isLapsed(c: BookCarrier) {
  return c.daysSinceLoad >= 60
}

export type BookAlert = {
  id: string
  carrierId: string
  level: 'critical' | 'warn'
  title: string
  detail: string
  action: string
}

/** Every alert restates a number that is visible in the same table. */
export function bookAlerts(carriers: BookCarrier[]): BookAlert[] {
  const out: BookAlert[] = []

  for (const c of carriers) {
    if (c.insurance === 'expired') {
      out.push({
        id: `${c.id}-ins`,
        carrierId: c.id,
        level: 'critical',
        title: `${c.name} insurance expired ${c.insuranceExpiry}`,
        detail: `They have moved ${c.loadsRun} loads for you and cannot be tendered again until a fresh certificate is on file.`,
        action: 'Request certificate',
      })
    } else if (c.insurance === 'soon') {
      out.push({
        id: `${c.id}-ins`,
        carrierId: c.id,
        level: 'critical',
        title: `${c.name} insurance expires ${c.insuranceExpiry}`,
        detail: `They have moved ${c.loadsRun} loads for you and ran one ${c.lastLoad}. Without a fresh certificate they cannot be tendered.`,
        action: 'Request certificate',
      })
    }

    const vs = vsMarketPct(c)
    if (vs > 3) {
      out.push({
        id: `${c.id}-rate`,
        carrierId: c.id,
        level: 'warn',
        title: `${c.name} is ${vs.toFixed(1)}% above market`,
        detail: `Paying $${Math.round(perLoad(c)).toLocaleString()} against a market reference of $${c.marketPerLoad.toLocaleString()} on their main lane.`,
        action: 'Open renegotiation',
      })
    }

    if (isLapsed(c)) {
      out.push({
        id: `${c.id}-quiet`,
        carrierId: c.id,
        level: 'warn',
        title: `${c.name} has gone quiet`,
        detail: `No loads for ${c.daysSinceLoad} days, but they ran ${c.loadsRun} for you at ${c.accept}% acceptance. Worth a call before the capacity goes elsewhere.`,
        action: 'Re-engage',
      })
    }
  }

  return out
}

export function bookTotals(carriers: BookCarrier[]) {
  const mine = carriers.filter((c) => c.inBook)
  return {
    myBook: mine.length,
    favourites: carriers.filter((c) => c.rank).length,
    loadsRun: carriers.reduce((sum, c) => sum + c.loadsRun, 0),
    spend: carriers.reduce((sum, c) => sum + c.spend, 0),
    needsYou: bookAlerts(mine).length,
    lapsed: mine.filter(isLapsed).length,
  }
}
