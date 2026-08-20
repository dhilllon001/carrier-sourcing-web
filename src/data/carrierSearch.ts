/* Lane searches a rep has run, each holding the carrier board that search returned. */

import type { InsuranceState } from './carrierBook'

export type SearchSource = 'PAST' | 'DAT' | 'HIGHWAY' | 'LOADLINK'
export type OfferState = 'Not sent' | 'Sent' | 'Quoted' | 'Awarded'

export type SearchCarrier = {
  id: string
  name: string
  mc: string
  dot: string
  /** Where this search found them, not whether we have used them. */
  source: SearchSource
  lastUsed?: string
  lastUsedTime?: string
  lastUsedAgo?: string
  /** Deadhead to pickup and from delivery, in miles. */
  dhP: number
  dhD: number
  lastRate?: number
  rateCountry?: 'US' | 'CA' | 'MX'
  loads: number
  legs: number
  offer: OfferState
  offerAmount?: number
  configRate?: number
  updated?: string
  updatedTime?: string
  contact?: string
  email?: string
  whatsapp?: boolean
  assignedProbill?: string
  insurance?: InsuranceState
  insuranceExpiry?: string
  /** Minutes from blast to quote. Only set once they have replied. */
  repliedInMin?: number
}

export type LaneSearch = {
  id: string
  /** Created the first time carriers are contacted for this capacity request. */
  capacityId?: string
  capacityCreatedAt?: string
  /** Pickup city / facility. */
  origin: string
  /** Delivery city / facility. */
  destination: string
  equipment: string
  pickup: string
  delivery: string
  searchedAt: string
  radius: number
  /** Loads this search still needs covered today. */
  need: number
  sources: SearchSource[]
  carriers: SearchCarrier[]
}

export const equipmentOptions = ['DRY-VAN', 'REEFER', 'FLATBED', 'POWER-ONLY', 'TRI-AXLE']

export const sourceOptions: SearchSource[] = ['PAST', 'DAT', 'HIGHWAY', 'LOADLINK']

export function formatDay(value: Date) {
  return value.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function todayStamp() {
  const now = new Date()
  return {
    date: formatDay(now),
    time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
  }
}

/* Brampton → Woodstock: ~90 mi Ontario regional run, so rates sit in the $700–$1,000 CAD band. */
const bramptonWoodstock: SearchCarrier[] = [
  {
    id: 'srsv',
    name: 'SRS V CORP',
    mc: '1303134',
    dot: '03712017',
    source: 'PAST',
    lastUsed: 'Aug 10, 2026',
    lastUsedTime: '09:44',
    lastUsedAgo: '9d ago',
    dhP: 0,
    dhD: 12,
    lastRate: 860,
    rateCountry: 'CA',
    loads: 6,
    legs: 11,
    offer: 'Quoted',
    offerAmount: 840,
    configRate: 875,
    updated: 'Aug 19, 2026',
    updatedTime: '09:58',
    contact: '+1 (224) 519-8121',
    email: 'ceo.srsvcorp@gmail.com',
    whatsapp: true,
  },
  {
    id: 'roadrunner',
    name: 'Roadrunner Freight Inc',
    mc: '1410643',
    dot: '3861304',
    source: 'DAT',
    lastUsed: 'Aug 16, 2026',
    lastUsedTime: '09:10',
    lastUsedAgo: '3d ago',
    dhP: 50,
    dhD: 18,
    lastRate: 720,
    rateCountry: 'CA',
    loads: 15,
    legs: 28,
    offer: 'Sent',
    configRate: 745,
    updated: 'Aug 19, 2026',
    updatedTime: '09:55',
    contact: '+1 (519) 555-0166',
    email: 'john@roadrunnerfrt.com',
    whatsapp: true,
  },
  {
    id: 'solid',
    name: 'Solid Transportation Services Inc',
    mc: '780939',
    dot: '2286449',
    source: 'DAT',
    lastUsed: 'Aug 14, 2026',
    lastUsedTime: '13:05',
    lastUsedAgo: '5d ago',
    dhP: 79,
    dhD: 21,
    lastRate: 750,
    rateCountry: 'CA',
    loads: 12,
    legs: 21,
    offer: 'Sent',
    configRate: 775,
    updated: 'Aug 19, 2026',
    updatedTime: '09:47',
    contact: '+1 (248) 607-7012',
    email: 'dispatch@solidtrans.example',
  },
  {
    id: 'korol',
    name: 'KOROL TRUCKING INC',
    mc: '137600',
    dot: '3192445',
    source: 'DAT',
    lastUsed: 'Aug 05, 2026',
    lastUsedTime: '11:15',
    lastUsedAgo: '14d ago',
    dhP: 84,
    dhD: 27,
    lastRate: 795,
    rateCountry: 'CA',
    loads: 9,
    legs: 16,
    offer: 'Quoted',
    offerAmount: 780,
    configRate: 810,
    updated: 'Aug 19, 2026',
    updatedTime: '10:04',
    contact: '+1 (708) 713-8306 ext. 321',
    email: 'ops@koroltrucking.example',
    whatsapp: true,
  },
  {
    id: 'mgm',
    name: 'MGM Worldwide Logistics Inc',
    mc: '1035605',
    dot: '3277287',
    source: 'DAT',
    lastUsed: 'Aug 12, 2026',
    lastUsedTime: '07:25',
    lastUsedAgo: '7d ago',
    dhP: 95,
    dhD: 41,
    lastRate: 830,
    rateCountry: 'CA',
    loads: 7,
    legs: 13,
    offer: 'Quoted',
    offerAmount: 815,
    updated: 'Aug 19, 2026',
    updatedTime: '10:12',
    email: 'chris@mgmwwl.com',
  },
  {
    id: 'cadence',
    name: 'Cadence Premier Cargo',
    mc: '673246',
    dot: '1861195',
    source: 'DAT',
    lastUsed: 'Jul 28, 2026',
    lastUsedTime: '15:20',
    lastUsedAgo: '22d ago',
    dhP: 76,
    dhD: 34,
    lastRate: 910,
    rateCountry: 'CA',
    loads: 3,
    legs: 5,
    offer: 'Sent',
    updated: 'Aug 19, 2026',
    updatedTime: '09:52',
    contact: '+1 (708) 808-9850 ext. 8122',
    email: 'oliver@cadencepremier.com',
    whatsapp: true,
  },
  {
    id: 'vgn',
    name: 'VGN Trucking Inc',
    mc: '529994',
    dot: '1348031',
    source: 'DAT',
    lastUsed: 'Jul 31, 2026',
    lastUsedTime: '16:50',
    lastUsedAgo: '19d ago',
    dhP: 105,
    dhD: 44,
    lastRate: 880,
    rateCountry: 'CA',
    loads: 4,
    legs: 7,
    offer: 'Not sent',
    contact: '+1 (312) 238-9210',
  },
  {
    id: 'vss',
    name: 'VSS Transportation Group Inc',
    mc: '284464',
    dot: '2545275',
    source: 'DAT',
    lastUsed: 'Jun 19, 2026',
    lastUsedTime: '08:40',
    lastUsedAgo: '61d ago',
    dhP: 136,
    dhD: 52,
    lastRate: 1020,
    rateCountry: 'CA',
    loads: 2,
    legs: 3,
    offer: 'Not sent',
    contact: '+1 (469) 568-6380',
  },
  {
    id: 'roadlegends',
    name: 'Road Legends',
    mc: '598300',
    dot: '1345616',
    source: 'DAT',
    dhP: 95,
    dhD: 38,
    loads: 0,
    legs: 0,
    offer: 'Not sent',
    contact: '+1 (773) 377-8721',
  },
  {
    id: 'niceguys',
    name: 'Nice Guys LLC',
    mc: '1003510',
    dot: '3212502',
    source: 'DAT',
    dhP: 122,
    dhD: 48,
    loads: 0,
    legs: 0,
    offer: 'Not sent',
    contact: '+1 (773) 347-3214 ext. 170',
    whatsapp: true,
  },
  {
    id: 'ay',
    name: 'Ay Trucking LLC',
    mc: '77701',
    dot: '3706827',
    source: 'DAT',
    dhP: 73,
    dhD: 30,
    loads: 0,
    legs: 0,
    offer: 'Not sent',
    email: 'ian@aytruckingllc.com',
  },
  {
    id: 'dij',
    name: 'DIJ Transco Ltd',
    mc: '115896',
    dot: '3167871',
    source: 'DAT',
    dhP: 105,
    dhD: 36,
    loads: 0,
    legs: 0,
    offer: 'Not sent',
    contact: '+1 (708) 888-9778',
  },
  {
    id: 'emr',
    name: 'Emr Express Inc',
    mc: '737936',
    dot: '2117041',
    source: 'DAT',
    dhP: 145,
    dhD: 61,
    loads: 0,
    legs: 0,
    offer: 'Not sent',
    contact: '+1 (708) 381-1272',
  },
  {
    id: 'zeez',
    name: 'Zeez Logistics Llc',
    mc: '976175',
    dot: '2901619',
    source: 'DAT',
    dhP: 122,
    dhD: 55,
    loads: 0,
    legs: 0,
    offer: 'Not sent',
    contact: '+1 (612) 206-1848',
  },
]

/* Laredo → Sterling Heights: cross-border reefer, ~1,500 mi, $2,800–$3,500. */
const laredoSterling: SearchCarrier[] = [
  {
    id: 'manney',
    name: 'MANNEY CROSS-BORDER SA',
    mc: '1941466',
    dot: '3901254',
    source: 'PAST',
    lastUsed: 'Aug 17, 2026',
    lastUsedTime: '14:10',
    lastUsedAgo: '2d ago',
    dhP: 12,
    dhD: 8,
    lastRate: 3420,
    rateCountry: 'MX',
    loads: 32,
    legs: 64,
    offer: 'Awarded',
    offerAmount: 3380,
    configRate: 3450,
    updated: 'Aug 19, 2026',
    updatedTime: '08:20',
    contact: '+52 867 555 0142',
    email: 'trafico@manney.example',
    whatsapp: true,
    assignedProbill: '11436778',
  },
  {
    id: 'smartchoice',
    name: 'SMART CHOICE TRANSPORT LTD',
    mc: '4483133',
    dot: '4483133',
    source: 'PAST',
    lastUsed: 'Aug 18, 2026',
    lastUsedTime: '11:02',
    lastUsedAgo: '1d ago',
    dhP: 58,
    dhD: 22,
    lastRate: 2860,
    rateCountry: 'US',
    loads: 28,
    legs: 51,
    offer: 'Sent',
    configRate: 2950,
    updated: 'Aug 19, 2026',
    updatedTime: '09:40',
    contact: '+1 (416) 555-0110',
    email: 'harjot@smartchoice.example',
    whatsapp: true,
  },
  {
    id: 'bajio',
    name: 'TRANSPORTES BAJIO',
    mc: '7781200',
    dot: '1904455',
    source: 'PAST',
    lastUsed: 'Aug 18, 2026',
    lastUsedTime: '07:35',
    lastUsedAgo: '1d ago',
    dhP: 34,
    dhD: 15,
    lastRate: 3180,
    rateCountry: 'MX',
    loads: 19,
    legs: 38,
    offer: 'Quoted',
    offerAmount: 3260,
    configRate: 3200,
    updated: 'Aug 19, 2026',
    updatedTime: '09:14',
    contact: '+52 472 555 0188',
    email: 'trafico@bajio.example',
    whatsapp: true,
  },
  {
    id: 'reeferpro',
    name: 'ReeferPro Logistics Inc',
    mc: '1420331',
    dot: '3902118',
    source: 'DAT',
    lastUsed: 'Aug 08, 2026',
    lastUsedTime: '12:45',
    lastUsedAgo: '11d ago',
    dhP: 88,
    dhD: 40,
    lastRate: 3290,
    rateCountry: 'US',
    loads: 3,
    legs: 6,
    offer: 'Sent',
    updated: 'Aug 19, 2026',
    updatedTime: '09:33',
    contact: '+1 (210) 555-0134',
    email: 'book@reeferpro.example',
    whatsapp: true,
  },
  {
    id: 'laredoline',
    name: 'Laredo Line Haul LLC',
    mc: '882140',
    dot: '2551900',
    source: 'DAT',
    lastUsed: 'Jul 22, 2026',
    lastUsedTime: '10:30',
    lastUsedAgo: '28d ago',
    dhP: 41,
    dhD: 26,
    lastRate: 3050,
    rateCountry: 'US',
    loads: 5,
    legs: 9,
    offer: 'Not sent',
    contact: '+1 (956) 555-0170',
  },
  {
    id: 'borderfreight',
    name: 'Border Freight Partners',
    mc: '1194420',
    dot: '3388012',
    source: 'HIGHWAY',
    dhP: 66,
    dhD: 31,
    loads: 0,
    legs: 0,
    offer: 'Not sent',
    email: 'dispatch@borderfp.example',
  },
]

/* Chicago → Detroit: ~280 mi dry van, $900–$1,100. */
const chicagoDetroit: SearchCarrier[] = [
  {
    id: 'midwest',
    name: 'MIDWEST POWER HAUL INC',
    mc: '6612900',
    dot: '3391204',
    source: 'PAST',
    lastUsed: 'Aug 19, 2026',
    lastUsedTime: '06:12',
    lastUsedAgo: 'today',
    dhP: 6,
    dhD: 4,
    lastRate: 1050,
    rateCountry: 'US',
    loads: 22,
    legs: 44,
    offer: 'Quoted',
    offerAmount: 1020,
    configRate: 1075,
    updated: 'Aug 19, 2026',
    updatedTime: '09:05',
    contact: '+1 (920) 555-0119',
    email: 'ops@midwestvan.example',
    whatsapp: true,
  },
  {
    id: 'greatlakes',
    name: 'GREAT LAKES DRAYAGE CO',
    mc: '904118',
    dot: '2661204',
    source: 'PAST',
    lastUsed: 'Aug 11, 2026',
    lastUsedTime: '10:05',
    lastUsedAgo: '8d ago',
    dhP: 24,
    dhD: 9,
    lastRate: 980,
    rateCountry: 'US',
    loads: 14,
    legs: 26,
    offer: 'Not sent',
    configRate: 1010,
    contact: '+1 (313) 555-0155',
    email: 'dispatch@greatlakesdray.example',
    whatsapp: true,
  },
  {
    id: 'uacl',
    name: 'UACL LOGISTICS LLC',
    mc: '712904',
    dot: '1984412',
    source: 'PAST',
    lastUsed: 'Aug 02, 2026',
    lastUsedTime: '16:40',
    lastUsedAgo: '17d ago',
    dhP: 18,
    dhD: 12,
    lastRate: 1095,
    rateCountry: 'US',
    loads: 11,
    legs: 19,
    offer: 'Not sent',
    contact: '+1 (312) 555-0110',
    email: 'desk@uacl.example',
  },
  {
    id: 'motorcity',
    name: 'Motor City Freightways',
    mc: '801277',
    dot: '2288401',
    source: 'HIGHWAY',
    lastUsed: 'Aug 15, 2026',
    lastUsedTime: '08:55',
    lastUsedAgo: '4d ago',
    dhP: 31,
    dhD: 11,
    lastRate: 950,
    rateCountry: 'US',
    loads: 6,
    legs: 11,
    offer: 'Quoted',
    offerAmount: 935,
    updated: 'Aug 19, 2026',
    updatedTime: '09:20',
    contact: '+1 (248) 555-0128',
    whatsapp: true,
  },
  {
    id: 'lakeshore',
    name: 'Lakeshore Carriers Inc',
    mc: '1188204',
    dot: '3312884',
    source: 'DAT',
    lastUsed: 'Aug 09, 2026',
    lastUsedTime: '14:20',
    lastUsedAgo: '10d ago',
    dhP: 62,
    dhD: 24,
    lastRate: 1010,
    rateCountry: 'US',
    loads: 8,
    legs: 15,
    offer: 'Not sent',
    configRate: 1040,
    contact: '+1 (773) 555-0192',
  },
  {
    id: 'windycity',
    name: 'Windy City Van Lines',
    mc: '1339002',
    dot: '3711922',
    source: 'DAT',
    dhP: 47,
    dhD: 19,
    loads: 0,
    legs: 0,
    offer: 'Not sent',
    email: 'load@windycityvan.example',
  },
]

const BOARD_META: Record<
  string,
  Pick<SearchCarrier, 'insurance' | 'insuranceExpiry' | 'repliedInMin'>
> = {
  srsv: { insurance: 'ok', insuranceExpiry: 'Nov 30, 2026', repliedInMin: 18 },
  roadrunner: { insurance: 'ok', insuranceExpiry: 'Jan 12, 2027' },
  solid: { insurance: 'ok', insuranceExpiry: 'Mar 04, 2027' },
  korol: { insurance: 'ok', insuranceExpiry: 'Oct 18, 2026', repliedInMin: 42 },
  mgm: { insurance: 'ok', insuranceExpiry: 'Feb 28, 2027', repliedInMin: 11 },
  cadence: { insurance: 'soon', insuranceExpiry: 'Sep 02, 2026' },
  vgn: { insurance: 'ok', insuranceExpiry: 'Apr 15, 2027' },
  vss: { insurance: 'ok', insuranceExpiry: 'Jun 09, 2027' },
  roadlegends: { insurance: 'ok', insuranceExpiry: 'Dec 01, 2026' },
  niceguys: { insurance: 'soon', insuranceExpiry: 'Aug 31, 2026' },
  ay: { insurance: 'ok', insuranceExpiry: 'May 20, 2027' },
  dij: { insurance: 'ok', insuranceExpiry: 'Jul 08, 2027' },
  emr: { insurance: 'ok', insuranceExpiry: 'Nov 14, 2026' },
  zeez: { insurance: 'expired', insuranceExpiry: 'Jul 22, 2026' },
  manney: { insurance: 'ok', insuranceExpiry: 'Dec 15, 2026', repliedInMin: 9 },
  smartchoice: { insurance: 'ok', insuranceExpiry: 'Mar 31, 2027' },
  bajio: { insurance: 'ok', insuranceExpiry: 'Jan 22, 2027', repliedInMin: 27 },
  reeferpro: { insurance: 'soon', insuranceExpiry: 'Sep 12, 2026' },
  laredoline: { insurance: 'ok', insuranceExpiry: 'Feb 02, 2027' },
  borderfreight: { insurance: 'expired', insuranceExpiry: 'Jun 12, 2026' },
  midwest: { insurance: 'ok', insuranceExpiry: 'Oct 30, 2026', repliedInMin: 14 },
  greatlakes: { insurance: 'ok', insuranceExpiry: 'Apr 01, 2027' },
  uacl: { insurance: 'ok', insuranceExpiry: 'Aug 19, 2027' },
  motorcity: { insurance: 'ok', insuranceExpiry: 'Dec 08, 2026', repliedInMin: 31 },
  lakeshore: { insurance: 'soon', insuranceExpiry: 'Sep 05, 2026' },
  windycity: { insurance: 'expired', insuranceExpiry: 'May 18, 2026' },
}

function decorate(carriers: SearchCarrier[]): SearchCarrier[] {
  return carriers.map((carrier) => ({
    insurance: 'ok',
    ...carrier,
    ...BOARD_META[carrier.id],
  }))
}

const scenarioPool = decorate([...bramptonWoodstock, ...laredoSterling, ...chicagoDetroit])
/* keep in step with SEED_FAVORITES so generated lanes also carry starred carriers */
const favouriteScenarios = [
  'srsv',
  'korol',
  'vgn',
  'roadlegends',
  'manney',
  'bajio',
  'reeferpro',
  'midwest',
  'greatlakes',
  'motorcity',
]
const quotedScenarios = scenarioPool.filter(
  (carrier) => carrier.offer === 'Quoted' || carrier.offer === 'Awarded'
)
const insuranceScenarios = scenarioPool.filter(
  (carrier) => carrier.insurance === 'soon' || carrier.insurance === 'expired'
)
const openScenarios = scenarioPool.filter((carrier) => carrier.offer === 'Not sent')
const sentScenarios = scenarioPool.filter((carrier) => carrier.offer === 'Sent')

function scenarioCarrier(id: string) {
  return scenarioPool.find((carrier) => carrier.id === id) as SearchCarrier
}

/** Every added lane includes examples for each top filter while rates remain lane-specific. */
function scenarioCarriers(offset: number, baseRate: number): SearchCarrier[] {
  const candidates = [
    scenarioCarrier(favouriteScenarios[offset % favouriteScenarios.length]),
    scenarioCarrier(favouriteScenarios[(offset + 4) % favouriteScenarios.length]),
    quotedScenarios[offset % quotedScenarios.length],
    insuranceScenarios[offset % insuranceScenarios.length],
    openScenarios[offset % openScenarios.length],
    sentScenarios[offset % sentScenarios.length],
    scenarioPool[(offset * 2 + 3) % scenarioPool.length],
    scenarioPool[(offset * 3 + 8) % scenarioPool.length],
    scenarioPool[(offset * 5 + 13) % scenarioPool.length],
    scenarioPool[(offset * 7 + 17) % scenarioPool.length],
  ]

  return [...new Map(candidates.map((carrier) => [carrier.id, carrier])).values()]
    .slice(0, 8)
    .map((carrier, index) => ({
      ...carrier,
      lastRate: carrier.lastRate ? baseRate - 90 + index * 28 : undefined,
      offerAmount: carrier.offerAmount ? baseRate + index * 36 : undefined,
      configRate: baseRate + index * 30,
      dhP: Math.max(3, (carrier.dhP + offset * 9 + index * 7) % 96),
      dhD: Math.max(2, (carrier.dhD + offset * 5 + index * 4) % 62),
    }))
}

export const laneSearches: LaneSearch[] = [
  {
    id: 'ls-brampton-woodstock',
    capacityId: 'CAP-260820-1042',
    capacityCreatedAt: 'Aug 20 · 09:14',
    origin: 'Brampton, ON',
    destination: 'Woodstock, ON',
    equipment: 'DRY-VAN',
    pickup: 'Aug 20, 2026',
    delivery: 'Aug 20, 2026',
    searchedAt: '4 min ago',
    radius: 150,
    need: 3,
    sources: ['PAST', 'DAT'],
    carriers: decorate(bramptonWoodstock),
  },
  {
    id: 'ls-laredo-sterling',
    capacityId: 'CAP-260820-1038',
    capacityCreatedAt: 'Aug 20 · 08:51',
    origin: 'Laredo, TX',
    destination: 'Sterling Heights, MI',
    equipment: 'REEFER',
    pickup: 'Aug 21, 2026',
    delivery: 'Aug 23, 2026',
    searchedAt: '38 min ago',
    radius: 100,
    need: 2,
    sources: ['PAST', 'DAT', 'HIGHWAY'],
    carriers: decorate(laredoSterling),
  },
  {
    id: 'ls-chicago-detroit',
    capacityId: 'CAP-190820-0987',
    capacityCreatedAt: 'Aug 19 · 16:22',
    origin: 'Chicago, IL',
    destination: 'Detroit, MI',
    equipment: 'DRY-VAN',
    pickup: 'Aug 20, 2026',
    delivery: 'Aug 21, 2026',
    searchedAt: 'Yesterday 16:22',
    radius: 75,
    need: 4,
    sources: ['PAST', 'DAT', 'HIGHWAY'],
    carriers: decorate(chicagoDetroit),
  },
  {
    id: 'ls-toronto-montreal',
    origin: 'Toronto, ON',
    destination: 'Montreal, QC',
    equipment: 'DRY-VAN',
    pickup: 'Aug 22, 2026',
    delivery: 'Aug 23, 2026',
    searchedAt: '12 min ago',
    radius: 100,
    need: 5,
    sources: ['PAST', 'DAT', 'LOADLINK'],
    carriers: scenarioCarriers(0, 1450),
  },
  {
    id: 'ls-mississauga-ottawa',
    origin: 'Mississauga, ON',
    destination: 'Ottawa, ON',
    equipment: 'REEFER',
    pickup: 'Aug 22, 2026',
    delivery: 'Aug 23, 2026',
    searchedAt: '19 min ago',
    radius: 125,
    need: 3,
    sources: ['PAST', 'DAT', 'LOADLINK'],
    carriers: scenarioCarriers(1, 1325),
  },
  {
    id: 'ls-windsor-louisville',
    origin: 'Windsor, ON',
    destination: 'Louisville, KY',
    equipment: 'DRY-VAN',
    pickup: 'Aug 23, 2026',
    delivery: 'Aug 24, 2026',
    searchedAt: '27 min ago',
    radius: 100,
    need: 4,
    sources: ['PAST', 'DAT', 'HIGHWAY'],
    carriers: scenarioCarriers(2, 1680),
  },
  {
    id: 'ls-dallas-houston',
    origin: 'Dallas, TX',
    destination: 'Houston, TX',
    equipment: 'POWER-ONLY',
    pickup: 'Aug 20, 2026',
    delivery: 'Aug 20, 2026',
    searchedAt: '44 min ago',
    radius: 75,
    need: 6,
    sources: ['PAST', 'DAT'],
    carriers: scenarioCarriers(3, 920),
  },
  {
    id: 'ls-atlanta-savannah',
    origin: 'Atlanta, GA',
    destination: 'Savannah, GA',
    equipment: 'DRY-VAN',
    pickup: 'Aug 21, 2026',
    delivery: 'Aug 21, 2026',
    searchedAt: '1 hr ago',
    radius: 75,
    need: 2,
    sources: ['PAST', 'DAT', 'HIGHWAY'],
    carriers: scenarioCarriers(4, 890),
  },
  {
    id: 'ls-memphis-nashville',
    origin: 'Memphis, TN',
    destination: 'Nashville, TN',
    equipment: 'REEFER',
    pickup: 'Aug 22, 2026',
    delivery: 'Aug 22, 2026',
    searchedAt: '1 hr ago',
    radius: 100,
    need: 4,
    sources: ['PAST', 'DAT'],
    carriers: scenarioCarriers(5, 975),
  },
  {
    id: 'ls-columbus-indianapolis',
    origin: 'Columbus, OH',
    destination: 'Indianapolis, IN',
    equipment: 'DRY-VAN',
    pickup: 'Aug 23, 2026',
    delivery: 'Aug 23, 2026',
    searchedAt: '2 hrs ago',
    radius: 125,
    need: 3,
    sources: ['PAST', 'DAT', 'HIGHWAY'],
    carriers: scenarioCarriers(6, 860),
  },
  {
    id: 'ls-monterrey-laredo',
    origin: 'Monterrey, MX',
    destination: 'Laredo, TX',
    equipment: 'DRY-VAN',
    pickup: 'Aug 24, 2026',
    delivery: 'Aug 25, 2026',
    searchedAt: '2 hrs ago',
    radius: 150,
    need: 5,
    sources: ['PAST', 'DAT', 'HIGHWAY'],
    carriers: scenarioCarriers(7, 1580),
  },
  {
    id: 'ls-el-paso-phoenix',
    origin: 'El Paso, TX',
    destination: 'Phoenix, AZ',
    equipment: 'FLATBED',
    pickup: 'Aug 24, 2026',
    delivery: 'Aug 25, 2026',
    searchedAt: 'Yesterday 14:08',
    radius: 100,
    need: 2,
    sources: ['PAST', 'DAT', 'HIGHWAY'],
    carriers: scenarioCarriers(8, 1850),
  },
  {
    id: 'ls-los-angeles-las-vegas',
    origin: 'Los Angeles, CA',
    destination: 'Las Vegas, NV',
    equipment: 'DRY-VAN',
    pickup: 'Aug 25, 2026',
    delivery: 'Aug 25, 2026',
    searchedAt: 'Yesterday 09:36',
    radius: 75,
    need: 4,
    sources: ['PAST', 'DAT'],
    carriers: scenarioCarriers(9, 1120),
  },
]

/* ── confidence ──────────────────────────────────────────────
   A single readable score for "how safe is this carrier on this
   lane", built only from what the board already shows so a rep can
   always trace the number back to a column. */

export type ConfidenceLevel = 'High' | 'Medium' | 'Low'

export type Confidence = {
  score: number
  level: ConfidenceLevel
  reasons: { text: string; good: boolean }[]
}

function agoDays(carrier: SearchCarrier) {
  if (!carrier.lastUsedAgo) return undefined
  if (carrier.lastUsedAgo === 'today') return 0
  const match = carrier.lastUsedAgo.match(/(\d+)d/)
  return match ? Number(match[1]) : undefined
}

export function carrierConfidence(carrier: SearchCarrier): Confidence {
  const reasons: { text: string; good: boolean }[] = []
  let score = 36

  if (carrier.loads > 0) {
    score += Math.min(20, Math.round(carrier.loads * 0.7))
    reasons.push({
      text: `${carrier.loads} loads and ${carrier.legs} legs run with us`,
      good: true,
    })
  } else {
    reasons.push({ text: 'No loads run with us yet', good: false })
  }

  const days = agoDays(carrier)
  if (days !== undefined) {
    if (days === 0) {
      score += 11
      reasons.push({ text: 'Ran for us today', good: true })
    } else if (days <= 7) {
      score += 9
      reasons.push({ text: `Ran for us ${carrier.lastUsedAgo}`, good: true })
    } else if (days <= 30) {
      score += 5
      reasons.push({ text: `Last load ${carrier.lastUsedAgo}`, good: true })
    } else {
      reasons.push({ text: `Quiet since ${carrier.lastUsed}`, good: false })
    }
  }

  if (carrier.dhP <= 25) {
    score += 10
    reasons.push({ text: `Only ${carrier.dhP} mi deadhead to pickup`, good: true })
  } else if (carrier.dhP <= 75) {
    score += 5
  } else if (carrier.dhP <= 125) {
    score += 2
  } else {
    reasons.push({ text: `${carrier.dhP} mi deadhead to pickup`, good: false })
  }

  if (carrier.source === 'PAST') {
    score += 13
    reasons.push({ text: 'Sits in your own carrier book', good: true })
  } else if (carrier.source === 'HIGHWAY') {
    score += 8
    reasons.push({ text: 'Vetted through Highway', good: true })
  } else {
    score += 2
    reasons.push({ text: `Found on the ${carrier.source} board`, good: true })
  }

  if (carrier.contact) score += 4
  if (carrier.email) score += 4
  if (carrier.whatsapp) score += 3
  if (!carrier.contact) {
    reasons.push({ text: 'No phone on file, email only', good: false })
  }

  if (carrier.offer === 'Awarded') score += 5
  else if (carrier.offer === 'Quoted') score += 3

  score = Math.max(12, Math.min(98, score))
  const level: ConfidenceLevel = score >= 75 ? 'High' : score >= 55 ? 'Medium' : 'Low'
  return { score, level, reasons: reasons.slice(0, 4) }
}

/** Pool used to fill a freshly run search. */
const pool: SearchCarrier[] = decorate([...chicagoDetroit, ...bramptonWoodstock])

export function nextCalendarDay(label: string) {
  const parsed = new Date(`${label} 12:00:00`)
  if (Number.isNaN(parsed.getTime())) return label
  parsed.setDate(parsed.getDate() + 1)
  return formatDay(parsed)
}

export function buildLaneSearch(input: {
  origin: string
  destination: string
  equipment: string
  pickup: string
  delivery?: string
  radius: number
  sources: SearchSource[]
}): LaneSearch {
  const allowed = pool.filter((carrier) => input.sources.includes(carrier.source))
  const carriers = (allowed.length ? allowed : pool).slice(0, 9).map((carrier, index) => ({
    ...carrier,
    id: `${carrier.id}-${Date.now()}-${index}`,
    dhP: Math.max(0, carrier.dhP + ((index % 4) * 7 - 6)),
    offer: 'Not sent' as OfferState,
    offerAmount: undefined,
    assignedProbill: undefined,
    updated: undefined,
    updatedTime: undefined,
  }))

  return {
    id: `ls-${Date.now()}`,
    origin: input.origin,
    destination: input.destination,
    equipment: input.equipment,
    pickup: input.pickup,
    delivery: input.delivery || nextCalendarDay(input.pickup),
    searchedAt: 'just now',
    radius: input.radius,
    need: 1,
    sources: input.sources,
    carriers,
  }
}

export function laneStats(lane: LaneSearch) {
  const used = lane.carriers.filter((carrier) => carrier.loads > 0).length
  const contacted = lane.carriers.filter((carrier) => carrier.offer !== 'Not sent').length
  const quoted = lane.carriers.filter(
    (carrier) => carrier.offer === 'Quoted' || carrier.offer === 'Awarded'
  )
  const bestQuote = quoted.reduce<number | undefined>((best, carrier) => {
    if (!carrier.offerAmount) return best
    return best === undefined ? carrier.offerAmount : Math.min(best, carrier.offerAmount)
  }, undefined)
  const strong = lane.carriers.filter(
    (carrier) => carrierConfidence(carrier).level === 'High'
  ).length

  return {
    total: lane.carriers.length,
    past: used,
    contacted,
    quoted: quoted.length,
    bestQuote,
    strong,
    assigned: lane.carriers.find((carrier) => carrier.assignedProbill),
  }
}

export const laneCities = Array.from(
  new Set(laneSearches.flatMap((lane) => [lane.origin, lane.destination]))
).sort()
