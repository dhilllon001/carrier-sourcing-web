/* Lane searches a rep has run, each holding the carrier board that search returned. */

export type SearchSource = 'PAST' | 'DAT' | 'HIGHWAY' | 'LOADLINK'
export type OfferState = 'Not sent' | 'Sent' | 'Quoted' | 'Awarded'

export type SearchCarrier = {
  id: string
  name: string
  mc: string
  dot: string
  source: SearchSource
  /** Only carriers we have used before carry a last-used stamp. */
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
}

export type LaneSearch = {
  id: string
  origin: string
  destination: string
  equipment: string
  pickup: string
  searchedAt: string
  radius: number
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
    dhD: 0,
    lastRate: 2600,
    rateCountry: 'US',
    loads: 1,
    legs: 1,
    offer: 'Quoted',
    offerAmount: 2450,
    configRate: 2600,
    updated: 'Aug 19, 2026',
    updatedTime: '09:58',
    contact: '+1 (224) 519-8121',
    email: 'ceo.srsvcorp@gmail.com',
    whatsapp: true,
  },
  {
    id: 'cadence',
    name: 'Cadence Premier Cargo',
    mc: '673246',
    dot: '1861195',
    source: 'DAT',
    dhP: 76,
    dhD: 0,
    loads: 0,
    legs: 0,
    offer: 'Sent',
    updated: 'Aug 19, 2026',
    updatedTime: '09:52',
    contact: '+1 (708) 808-9850 ext. 8122',
    email: 'oliver@cadencepremier.com',
    whatsapp: true,
  },
  {
    id: 'emr',
    name: 'Emr Express Inc',
    mc: '737936',
    dot: '2117041',
    source: 'DAT',
    dhP: 145,
    dhD: 0,
    loads: 0,
    legs: 0,
    offer: 'Not sent',
    contact: '+1 (708) 381-1272',
  },
  {
    id: 'korol',
    name: 'KOROL TRUCKING INC',
    mc: '137600',
    dot: '3192445',
    source: 'DAT',
    dhP: 84,
    dhD: 0,
    loads: 0,
    legs: 0,
    offer: 'Not sent',
    contact: '+1 (708) 713-8306 ext. 321',
  },
  {
    id: 'niceguys',
    name: 'Nice Guys LLC',
    mc: '1003510',
    dot: '3212502',
    source: 'DAT',
    dhP: 122,
    dhD: 0,
    loads: 0,
    legs: 0,
    offer: 'Not sent',
    contact: '+1 (773) 347-3214 ext. 170',
    whatsapp: true,
  },
  {
    id: 'vss',
    name: 'VSS Transportation Group Inc',
    mc: '284464',
    dot: '2545275',
    source: 'DAT',
    dhP: 136,
    dhD: 0,
    loads: 0,
    legs: 0,
    offer: 'Not sent',
    contact: '+1 (469) 568-6380',
  },
  {
    id: 'solid',
    name: 'Solid Transportation Services Inc',
    mc: '780939',
    dot: '2286449',
    source: 'DAT',
    dhP: 79,
    dhD: 0,
    loads: 0,
    legs: 0,
    offer: 'Not sent',
    contact: '+1 (248) 607-7012',
  },
  {
    id: 'ay',
    name: 'Ay Trucking LLC',
    mc: '77701',
    dot: '3706827',
    source: 'DAT',
    dhP: 73,
    dhD: 0,
    loads: 0,
    legs: 0,
    offer: 'Not sent',
    email: 'ian@aytruckingllc.com',
  },
  {
    id: 'vgn',
    name: 'VGN Trucking Inc',
    mc: '529994',
    dot: '1348031',
    source: 'DAT',
    dhP: 105,
    dhD: 0,
    loads: 0,
    legs: 0,
    offer: 'Not sent',
    contact: '+1 (312) 238-9210',
  },
  {
    id: 'roadlegends',
    name: 'Road Legends',
    mc: '598300',
    dot: '1345616',
    source: 'DAT',
    dhP: 95,
    dhD: 0,
    loads: 0,
    legs: 0,
    offer: 'Not sent',
    contact: '+1 (773) 377-8721',
  },
  {
    id: 'mgm',
    name: 'MGM Worldwide Logistics Inc',
    mc: '1035605',
    dot: '3277287',
    source: 'DAT',
    dhP: 95,
    dhD: 0,
    loads: 0,
    legs: 0,
    offer: 'Not sent',
    email: 'chris@mgmwwl.com',
  },
  {
    id: 'dij',
    name: 'DIJ Transco Ltd',
    mc: '115896',
    dot: '3167871',
    source: 'DAT',
    dhP: 105,
    dhD: 0,
    loads: 0,
    legs: 0,
    offer: 'Not sent',
    contact: '+1 (708) 888-9778',
  },
  {
    id: 'roadrunner',
    name: 'Roadrunner Freight Inc',
    mc: '1410643',
    dot: '3861304',
    source: 'DAT',
    dhP: 50,
    dhD: 0,
    loads: 0,
    legs: 0,
    offer: 'Not sent',
    email: 'john@roadrunnerfrt.com',
  },
  {
    id: 'zeez',
    name: 'Zeez Logistics Llc',
    mc: '976175',
    dot: '2901619',
    source: 'DAT',
    dhP: 122,
    dhD: 0,
    loads: 0,
    legs: 0,
    offer: 'Not sent',
    contact: '+1 (612) 206-1848',
  },
]

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
    updated: 'Aug 19, 2026',
    updatedTime: '09:14',
    contact: '+52 472 555 0188',
    email: 'trafico@bajio.example',
    whatsapp: true,
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
    updated: 'Aug 19, 2026',
    updatedTime: '09:40',
    contact: '+1 (416) 555-0110',
    email: 'harjot@smartchoice.example',
    whatsapp: true,
  },
  {
    id: 'laredoline',
    name: 'Laredo Line Haul LLC',
    mc: '882140',
    dot: '2551900',
    source: 'DAT',
    dhP: 41,
    dhD: 0,
    loads: 0,
    legs: 0,
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
    dhD: 0,
    loads: 0,
    legs: 0,
    offer: 'Not sent',
    email: 'dispatch@borderfp.example',
  },
  {
    id: 'reeferpro',
    name: 'ReeferPro Logistics Inc',
    mc: '1420331',
    dot: '3902118',
    source: 'DAT',
    dhP: 88,
    dhD: 0,
    loads: 0,
    legs: 0,
    offer: 'Not sent',
    contact: '+1 (210) 555-0134',
    whatsapp: true,
  },
]

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
    contact: '+1 (313) 555-0155',
    whatsapp: true,
  },
  {
    id: 'lakeshore',
    name: 'Lakeshore Carriers Inc',
    mc: '1188204',
    dot: '3312884',
    source: 'DAT',
    dhP: 62,
    dhD: 0,
    loads: 0,
    legs: 0,
    offer: 'Not sent',
    contact: '+1 (773) 555-0192',
  },
  {
    id: 'windycity',
    name: 'Windy City Van Lines',
    mc: '1339002',
    dot: '3711922',
    source: 'DAT',
    dhP: 47,
    dhD: 0,
    loads: 0,
    legs: 0,
    offer: 'Not sent',
    email: 'load@windycityvan.example',
  },
  {
    id: 'motorcity',
    name: 'Motor City Freightways',
    mc: '801277',
    dot: '2288401',
    source: 'HIGHWAY',
    dhP: 31,
    dhD: 0,
    loads: 0,
    legs: 0,
    offer: 'Not sent',
    contact: '+1 (248) 555-0128',
    whatsapp: true,
  },
]

export const laneSearches: LaneSearch[] = [
  {
    id: 'ls-brampton-woodstock',
    origin: 'Brampton, ON',
    destination: 'Woodstock, ON',
    equipment: 'DRY-VAN',
    pickup: 'Aug 20, 2026',
    searchedAt: '4 min ago',
    radius: 150,
    sources: ['PAST', 'DAT'],
    carriers: bramptonWoodstock,
  },
  {
    id: 'ls-laredo-sterling',
    origin: 'Laredo, TX',
    destination: 'Sterling Heights, MI',
    equipment: 'REEFER',
    pickup: 'Aug 21, 2026',
    searchedAt: '38 min ago',
    radius: 100,
    sources: ['PAST', 'DAT', 'HIGHWAY'],
    carriers: laredoSterling,
  },
  {
    id: 'ls-chicago-detroit',
    origin: 'Chicago, IL',
    destination: 'Detroit, MI',
    equipment: 'DRY-VAN',
    pickup: 'Aug 20, 2026',
    searchedAt: 'Yesterday 16:22',
    radius: 75,
    sources: ['PAST', 'DAT', 'HIGHWAY'],
    carriers: chicagoDetroit,
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
  let score = 38

  if (carrier.source === 'PAST') {
    score += 22
    reasons.push({ text: 'Carrier we have used before', good: true })
  } else if (carrier.source === 'HIGHWAY') {
    score += 9
    reasons.push({ text: 'Vetted through Highway, no loads yet', good: true })
  } else {
    reasons.push({ text: 'Board carrier with no history', good: false })
  }

  if (carrier.loads > 0) {
    score += Math.min(18, Math.round(carrier.loads * 0.6))
    reasons.push({
      text: `${carrier.loads} loads and ${carrier.legs} legs run with us`,
      good: true,
    })
  }

  const days = agoDays(carrier)
  if (days !== undefined) {
    if (days === 0) {
      score += 10
      reasons.push({ text: 'Ran for us today', good: true })
    } else if (days <= 7) {
      score += 8
      reasons.push({ text: `Ran for us ${carrier.lastUsedAgo}`, good: true })
    } else if (days <= 30) {
      score += 4
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

  if (carrier.contact) score += 4
  if (carrier.email) score += 4
  if (carrier.whatsapp) {
    score += 3
    reasons.push({ text: 'Reachable on WhatsApp', good: true })
  }
  if (!carrier.contact && !carrier.email) {
    reasons.push({ text: 'No phone on file, email only', good: false })
  }

  if (carrier.offer === 'Awarded') score += 5
  else if (carrier.offer === 'Quoted') score += 3

  score = Math.max(12, Math.min(98, score))
  const level: ConfidenceLevel = score >= 75 ? 'High' : score >= 55 ? 'Medium' : 'Low'
  return { score, level, reasons: reasons.slice(0, 4) }
}

/** Pool used to fill a freshly run search. */
const pool: SearchCarrier[] = [...chicagoDetroit, ...bramptonWoodstock]

export function buildLaneSearch(input: {
  origin: string
  destination: string
  equipment: string
  pickup: string
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
    searchedAt: 'just now',
    radius: input.radius,
    sources: input.sources,
    carriers,
  }
}

export function laneStats(lane: LaneSearch) {
  const past = lane.carriers.filter((carrier) => carrier.source === 'PAST').length
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
    past,
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
