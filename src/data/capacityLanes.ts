/* Dedicated capacity: what each team promised on a lane vs what carriers actually run. */

export type CarrierStanding = 'Primary' | 'Backup' | 'Trial'

export type LaneCarrier = {
  id: string
  name: string
  mc: string
  lastRan: string
  standing: CarrierStanding
  /** Loads a week the carrier is committed to. */
  committed: number
  /** Loads a week they actually ran, 4-week average. */
  runPerWk: number
  accept: number
  onTime: number
  rate: number
  favourite?: boolean
  paused?: boolean
}

export type CapacityTeam = {
  id: string
  name: string
  lead: string
  initials: string
  myTeam?: boolean
}

export type CapacityLane = {
  id: string
  teamId: string
  origin: string
  destination: string
  equipment: string
  customer: string
  miles: number
  corridor: 'Cross-border' | 'CA → CA' | 'US → US' | 'MX domestic' | 'CA → US'
  /** Forecast loads a week from the customer. */
  loadsPerWk: number
  /** 4-week average of loads actually moved by dedicated carriers. */
  actuallyRun: number
  weightedRate: number
  marketRate: number
  /**
   * Per weekday: loads the customer forecasts, and how much of the dedicated
   * fleet is held for that day. Capacity is never spread evenly across the
   * week, so the two shapes have to be declared separately.
   */
  week: { day: string; forecast: number; hold: number }[]
  carriers: LaneCarrier[]
}

export const capacityTeams: CapacityTeam[] = [
  {
    id: 't-naz',
    name: 'B1 NAZ NorthBound DED',
    lead: 'Mandeep Singh',
    initials: 'MS',
    myTeam: true,
  },
  { id: 't-cdn', name: 'CDN East Coast Inbound', lead: 'Rohit Kumar', initials: 'RK' },
  { id: 't-fca', name: 'FCA MX NorthBound', lead: 'Kuldeep Ghuman', initials: 'KG' },
  { id: 't-ts', name: 'TS Highway Expedite', lead: 'Gagan Chapadia', initials: 'GC' },
]

export const capacityLanes: CapacityLane[] = [
  {
    id: 'l-laredo-sterling',
    teamId: 't-naz',
    origin: 'Laredo, TX',
    destination: 'Sterling Heights, MI',
    equipment: 'DRY-VAN',
    customer: 'FIAT CHRYSLER',
    miles: 1612,
    corridor: 'Cross-border',
    loadsPerWk: 18,
    actuallyRun: 12.9,
    weightedRate: 2409,
    marketRate: 2410,
    week: [
      { day: 'Mon', forecast: 5, hold: 4 },
      { day: 'Tue', forecast: 4, hold: 4 },
      { day: 'Wed', forecast: 4, hold: 3 },
      { day: 'Thu', forecast: 3, hold: 2 },
      { day: 'Fri', forecast: 2, hold: 2 },
    ],
    carriers: [
      {
        id: 'lc-manney',
        name: 'Manney Cross-Border SA',
        mc: '1941466',
        lastRan: '2d ago',
        standing: 'Primary',
        committed: 8,
        runPerWk: 7.6,
        accept: 96,
        onTime: 97,
        rate: 2380,
        favourite: true,
      },
      {
        id: 'lc-transnorte',
        name: 'TransNorte Bonded',
        mc: '3390112',
        lastRan: '4d ago',
        standing: 'Backup',
        committed: 5,
        runPerWk: 4.2,
        accept: 88,
        onTime: 92,
        rate: 2420,
      },
      {
        id: 'lc-laredolink',
        name: 'Laredo Link Freight',
        mc: '2277910',
        lastRan: '16d ago',
        standing: 'Trial',
        committed: 2,
        runPerWk: 1.1,
        accept: 64,
        onTime: 81,
        rate: 2495,
      },
    ],
  },
  {
    id: 'l-nogales-sedalia',
    teamId: 't-naz',
    origin: 'Nogales, AZ',
    destination: 'Sedalia, MO',
    equipment: 'DRY-VAN',
    customer: 'PENSKE (FORD) CL USA',
    miles: 1433,
    corridor: 'Cross-border',
    loadsPerWk: 12,
    actuallyRun: 9.4,
    weightedRate: 2180,
    marketRate: 2240,
    week: [
      { day: 'Mon', forecast: 3, hold: 3 },
      { day: 'Tue', forecast: 3, hold: 2 },
      { day: 'Wed', forecast: 2, hold: 2 },
      { day: 'Thu', forecast: 2, hold: 2 },
      { day: 'Fri', forecast: 2, hold: 1 },
    ],
    carriers: [
      {
        id: 'lc-smart',
        name: 'Smart Choice Transport',
        mc: '4483133',
        lastRan: '3d ago',
        standing: 'Primary',
        committed: 6,
        runPerWk: 5.5,
        accept: 92,
        onTime: 94,
        rate: 2150,
        favourite: true,
      },
      {
        id: 'lc-sonora',
        name: 'Sonora Freight Lines',
        mc: '2884120',
        lastRan: '8d ago',
        standing: 'Backup',
        committed: 4,
        runPerWk: 3.1,
        accept: 79,
        onTime: 88,
        rate: 2230,
      },
    ],
  },
  {
    id: 'l-brampton-woodstock',
    teamId: 't-cdn',
    origin: 'Brampton, ON',
    destination: 'Woodstock, ON',
    equipment: 'DRY-VAN',
    customer: 'TEST_12SEPT',
    miles: 67,
    corridor: 'CA → CA',
    loadsPerWk: 24,
    actuallyRun: 23.6,
    weightedRate: 410,
    marketRate: 425,
    week: [
      { day: 'Mon', forecast: 6, hold: 6 },
      { day: 'Tue', forecast: 5, hold: 5 },
      { day: 'Wed', forecast: 5, hold: 5 },
      { day: 'Thu', forecast: 4, hold: 4 },
      { day: 'Fri', forecast: 4, hold: 4 },
    ],
    carriers: [
      {
        id: 'lc-dgs',
        name: 'DGS Cartage Ltd',
        mc: '5512099',
        lastRan: 'Today',
        standing: 'Primary',
        committed: 14,
        runPerWk: 13.8,
        accept: 98,
        onTime: 96,
        rate: 400,
        favourite: true,
      },
      {
        id: 'lc-roadlink',
        name: 'Roadlink Carriers Limited',
        mc: '512890',
        lastRan: '1d ago',
        standing: 'Backup',
        committed: 10,
        runPerWk: 9.8,
        accept: 94,
        onTime: 95,
        rate: 424,
      },
    ],
  },
  {
    id: 'l-mississauga-montreal',
    teamId: 't-cdn',
    origin: 'Mississauga, ON',
    destination: 'Montréal, QC',
    equipment: 'DRY-VAN',
    customer: 'UNILEVER C/O CASS',
    miles: 336,
    corridor: 'CA → CA',
    loadsPerWk: 16,
    actuallyRun: 6.2,
    weightedRate: 1173,
    marketRate: 1095,
    week: [
      { day: 'Mon', forecast: 4, hold: 3 },
      { day: 'Tue', forecast: 4, hold: 2 },
      { day: 'Wed', forecast: 3, hold: 2 },
      { day: 'Thu', forecast: 3, hold: 1 },
      { day: 'Fri', forecast: 2, hold: 1 },
    ],
    carriers: [
      {
        id: 'lc-kruger',
        name: 'Kruger Haul Ltd',
        mc: '2277341',
        lastRan: '2d ago',
        standing: 'Primary',
        committed: 6,
        runPerWk: 4.8,
        accept: 82,
        onTime: 89,
        rate: 1150,
      },
      {
        id: 'lc-edontario',
        name: 'E & D Ontario Inc.',
        mc: '4282695',
        lastRan: '18d ago',
        standing: 'Backup',
        committed: 3,
        runPerWk: 1.4,
        accept: 58,
        onTime: 74,
        rate: 1220,
      },
    ],
  },
  {
    id: 'l-silao-monterrey',
    teamId: 't-fca',
    origin: 'Silao, GTO',
    destination: 'Monterrey, NL',
    equipment: 'DRY-VAN',
    customer: 'PIRELLI NEUMATICOS',
    miles: 512,
    corridor: 'MX domestic',
    loadsPerWk: 14,
    actuallyRun: 10.1,
    weightedRate: 1490,
    marketRate: 1520,
    week: [
      { day: 'Mon', forecast: 3, hold: 3 },
      { day: 'Tue', forecast: 3, hold: 2 },
      { day: 'Wed', forecast: 3, hold: 2 },
      { day: 'Thu', forecast: 3, hold: 2 },
      { day: 'Fri', forecast: 2, hold: 2 },
    ],
    carriers: [
      {
        id: 'lc-transportes',
        name: 'Transportes del Bajío',
        mc: '1904455',
        lastRan: '1d ago',
        standing: 'Primary',
        committed: 7,
        runPerWk: 6.4,
        accept: 91,
        onTime: 90,
        rate: 1460,
        favourite: true,
      },
      {
        id: 'lc-mangat',
        name: 'Mangat Transhaul MX',
        mc: '903441',
        lastRan: '6d ago',
        standing: 'Trial',
        committed: 4,
        runPerWk: 2.9,
        accept: 76,
        onTime: 85,
        rate: 1545,
      },
    ],
  },
  {
    id: 'l-nuevolaredo-celaya',
    teamId: 't-fca',
    origin: 'Nuevo Laredo, TAM',
    destination: 'Celaya, GTO',
    equipment: 'FLATBED',
    customer: 'HONDA NORTH AMERICA',
    miles: 602,
    corridor: 'MX domestic',
    loadsPerWk: 8,
    actuallyRun: 3.0,
    weightedRate: 1210,
    marketRate: 1190,
    week: [
      { day: 'Mon', forecast: 2, hold: 1 },
      { day: 'Tue', forecast: 2, hold: 1 },
      { day: 'Wed', forecast: 2, hold: 1 },
      { day: 'Thu', forecast: 1, hold: 0 },
      { day: 'Fri', forecast: 1, hold: 0 },
    ],
    carriers: [
      {
        id: 'lc-borderbridge',
        name: 'Border Bridge Logistics',
        mc: '884120',
        lastRan: '9d ago',
        standing: 'Primary',
        committed: 3,
        runPerWk: 2.2,
        accept: 71,
        onTime: 84,
        rate: 1195,
      },
    ],
  },
  {
    id: 'l-foxriver-morris',
    teamId: 't-ts',
    origin: 'Fox River, IL',
    destination: 'Morris, IL',
    equipment: 'DRY-VAN',
    customer: 'PROCTER & GAMBLE',
    miles: 214,
    corridor: 'US → US',
    loadsPerWk: 30,
    actuallyRun: 27.8,
    weightedRate: 473,
    marketRate: 470,
    week: [
      { day: 'Mon', forecast: 7, hold: 6 },
      { day: 'Tue', forecast: 6, hold: 6 },
      { day: 'Wed', forecast: 6, hold: 6 },
      { day: 'Thu', forecast: 6, hold: 5 },
      { day: 'Fri', forecast: 5, hold: 5 },
    ],
    carriers: [
      {
        id: 'lc-midwestvan',
        name: 'Midwest Van Lines',
        mc: '339811',
        lastRan: 'Today',
        standing: 'Primary',
        committed: 18,
        runPerWk: 17.4,
        accept: 97,
        onTime: 96,
        rate: 462,
        favourite: true,
      },
      {
        id: 'lc-northstar',
        name: 'Northstar Van Lines',
        mc: '730118',
        lastRan: '2d ago',
        standing: 'Backup',
        committed: 10,
        runPerWk: 9.6,
        accept: 90,
        onTime: 95,
        rate: 486,
      },
    ],
  },
  {
    id: 'l-normal-paloalto',
    teamId: 't-ts',
    origin: 'Normal, IL',
    destination: 'Palo Alto, CA',
    equipment: 'REEFER',
    customer: 'RIVIAN AUTOMOTIVE',
    miles: 2104,
    corridor: 'US → US',
    loadsPerWk: 9,
    actuallyRun: 5.8,
    weightedRate: 4347,
    marketRate: 4170,
    week: [
      { day: 'Mon', forecast: 2, hold: 2 },
      { day: 'Tue', forecast: 2, hold: 1 },
      { day: 'Wed', forecast: 2, hold: 1 },
      { day: 'Thu', forecast: 2, hold: 1 },
      { day: 'Fri', forecast: 1, hold: 1 },
    ],
    carriers: [
      {
        id: 'lc-peak',
        name: 'Peak Cold Chain',
        mc: '2298117',
        lastRan: '5d ago',
        standing: 'Primary',
        committed: 4,
        runPerWk: 3.4,
        accept: 84,
        onTime: 88,
        rate: 4290,
      },
      {
        id: 'lc-greatlakes',
        name: 'Great Lakes Reefer Co',
        mc: '448290',
        lastRan: '11d ago',
        standing: 'Trial',
        committed: 2,
        runPerWk: 1.2,
        accept: 68,
        onTime: 79,
        rate: 4460,
      },
    ],
  },
]

/* ── weekly coverage ── */

export type WeekDayCoverage = {
  day: string
  forecast: number
  /** Loads a carrier is holding for this day. */
  covered: number
  /** Forecast loads with nobody on them — these fall to spot. */
  short: number
  /** Trucks held beyond what the customer forecasts for the day. */
  spare: number
  byCarrier: { id: string; name: string; standing: CarrierStanding; loads: number }[]
}

/**
 * Hands out `total` whole loads across the week following `weights`, never
 * exceeding `caps`. Largest-remainder so the parts always add back to the
 * total the metrics strip shows.
 */
function spread(weights: number[], total: number, caps: number[]): number[] {
  const out = weights.map(() => 0)
  if (total <= 0) return out
  const sum = weights.reduce((a, b) => a + b, 0)
  const share = sum > 0 ? weights.map((w) => w / sum) : weights.map(() => 1 / weights.length)
  const ideal = share.map((s) => s * total)

  ideal.forEach((v, i) => {
    out[i] = Math.min(caps[i], Math.floor(v))
  })

  const order = ideal
    .map((v, i) => ({ i, frac: v - Math.floor(v) }))
    .sort((a, b) => b.frac - a.frac || weights[b.i] - weights[a.i])

  let left = total - out.reduce((a, b) => a + b, 0)
  let placed = true
  while (left > 0 && placed) {
    placed = false
    for (const { i } of order) {
      if (left === 0) break
      if (out[i] < caps[i]) {
        out[i] += 1
        left -= 1
        placed = true
      }
    }
  }
  return out
}

const standingOrder: CarrierStanding[] = ['Primary', 'Backup', 'Trial']

/** Day-by-day picture of who is covering what, and where the week falls short. */
export function weekCoverage(lane: CapacityLane): WeekDayCoverage[] {
  const weights = lane.week.map((d) => d.hold)
  const covered = lane.week.map(() => 0)
  const spare = lane.week.map(() => 0)
  const byCarrier: WeekDayCoverage['byCarrier'][] = lane.week.map(() => [])

  const live = [...lane.carriers]
    .filter((c) => !c.paused)
    .sort((a, b) => standingOrder.indexOf(a.standing) - standingOrder.indexOf(b.standing))

  for (const carrier of live) {
    const room = lane.week.map((d, i) => Math.max(0, d.forecast - covered[i]))
    const take = spread(weights, carrier.committed, room)
    take.forEach((loads, i) => {
      if (!loads) return
      covered[i] += loads
      byCarrier[i].push({
        id: carrier.id,
        name: carrier.name,
        standing: carrier.standing,
        loads,
      })
    })

    /* Anything left has no load to sit on — held capacity going to waste. */
    const over = carrier.committed - take.reduce((a, b) => a + b, 0)
    if (over > 0) {
      const extra = spread(weights, over, weights.map(() => over))
      extra.forEach((loads, i) => {
        spare[i] += loads
      })
    }
  }

  return lane.week.map((d, i) => ({
    day: d.day,
    forecast: d.forecast,
    covered: covered[i],
    short: Math.max(0, d.forecast - covered[i]),
    spare: spare[i],
    byCarrier: byCarrier[i],
  }))
}

/* ── derived reads ── */

export type LaneMetrics = {
  committed: number
  gap: number
  coverage: number
  /** Weekday carrying the largest share of the shortfall. */
  worstDay: string | null
  vsMarketPct: number
  accept: number
  onTime: number
  activeCarriers: number
}

export function laneMetrics(lane: CapacityLane): LaneMetrics {
  const live = lane.carriers.filter((c) => !c.paused)
  const committed = live.reduce((sum, c) => sum + c.committed, 0)
  const gap = Math.max(0, lane.loadsPerWk - committed)
  const coverage = lane.loadsPerWk ? Math.round((committed / lane.loadsPerWk) * 100) : 100
  const worst = [...weekCoverage(lane)].sort((a, b) => b.short - a.short)[0]
  const weight = live.reduce((sum, c) => sum + c.committed, 0) || 1

  return {
    committed,
    gap,
    coverage: Math.min(coverage, 100),
    worstDay: worst && worst.short > 0 ? worst.day : null,
    vsMarketPct: ((lane.weightedRate - lane.marketRate) / lane.marketRate) * 100,
    accept: Math.round(live.reduce((sum, c) => sum + c.accept * c.committed, 0) / weight),
    onTime: Math.round(live.reduce((sum, c) => sum + c.onTime * c.committed, 0) / weight),
    activeCarriers: live.length,
  }
}

export type InsightLevel = 'critical' | 'warn' | 'good'

export type LaneInsight = {
  id: string
  level: InsightLevel
  title: string
  detail: string
  action?: string
  /** Carrier the action applies to, when the insight is about one. */
  carrierId?: string
}

/** Reads a lane's own numbers — every claim here is checkable on screen. */
export function laneInsights(lane: CapacityLane): LaneInsight[] {
  const m = laneMetrics(lane)
  const out: LaneInsight[] = []
  const money = (n: number) => `$${Math.round(n).toLocaleString()}`

  if (m.gap > 0) {
    out.push({
      id: 'gap',
      level: m.coverage < 70 ? 'critical' : 'warn',
      title: `${m.gap} ${m.gap === 1 ? 'load' : 'loads'} a week fall to spot`,
      detail: `Committed capacity is ${m.committed} against ${lane.loadsPerWk} loads, so coverage sits at ${m.coverage}%.${
        m.worstDay ? ` The shortfall lands hardest on ${m.worstDay} — see the weekly chart below.` : ''
      }`,
      action: 'Fill the gap',
    })
  }

  const grower = lane.carriers.find(
    (c) => !c.paused && c.accept >= 90 && c.onTime >= 90 && c.runPerWk >= c.committed * 0.9
  )
  if (grower && m.gap > 0) {
    const raise = Math.min(m.gap, 3)
    out.push({
      id: `grow-${grower.id}`,
      level: 'good',
      title: `${grower.name} can take more`,
      detail: `They accept ${grower.accept}% of tenders here and run ${grower.onTime}% on time, but are only committed to ${grower.committed} of ${lane.loadsPerWk} loads. Raising them by ${raise} would close most of the gap at ${money(grower.rate)}.`,
      action: `Raise to ${grower.committed + raise}/wk`,
      carrierId: grower.id,
    })
  }

  const refusing = lane.carriers.find((c) => !c.paused && c.accept < 70)
  if (refusing) {
    out.push({
      id: `refuse-${refusing.id}`,
      level: 'critical',
      title: `${refusing.name} is refusing most tenders`,
      detail: `Acceptance is ${refusing.accept}% with ${refusing.onTime}% on time, and they last ran this lane ${refusing.lastRan}. Their ${refusing.committed} committed loads are effectively uncovered.`,
      action: 'Pause on this lane',
      carrierId: refusing.id,
    })
  }

  if (m.vsMarketPct > 2) {
    out.push({
      id: 'above-market',
      level: 'warn',
      title: `Paying ${m.vsMarketPct.toFixed(1)}% above market`,
      detail: `Weighted average is ${money(lane.weightedRate)} against a market reference of ${money(
        lane.marketRate
      )}. Across ${lane.loadsPerWk} loads a week that is about ${money(
        (lane.weightedRate - lane.marketRate) * lane.loadsPerWk
      )} of extra spend.`,
      action: 'Open negotiation',
    })
  }

  if (m.gap === 0 && m.vsMarketPct <= 0) {
    out.push({
      id: 'healthy',
      level: 'good',
      title: 'Lane is fully covered and under market',
      detail: `All ${lane.loadsPerWk} loads are committed at ${money(lane.weightedRate)}, ${Math.abs(
        m.vsMarketPct
      ).toFixed(1)}% below the ${money(lane.marketRate)} reference. Renew before the commitments lapse.`,
      action: 'Renew commitments',
    })
  }

  return out
}

/** 0–100 health score used by the team rings in the rail. */
export function teamScore(lanes: CapacityLane[]): number {
  if (!lanes.length) return 0
  const scores = lanes.map((lane) => {
    const m = laneMetrics(lane)
    const ratePenalty = Math.max(0, m.vsMarketPct) * 2
    return Math.max(0, Math.min(100, m.coverage * 0.6 + m.accept * 0.25 + m.onTime * 0.15 - ratePenalty))
  })
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
}
