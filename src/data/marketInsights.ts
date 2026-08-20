/* Static market intelligence for the AI insights board.
   Figures are transcribed from the Aug 20, 2026 DAT state matrices, the public
   dry van commentary, and the sample P&G network. Nothing here is fetched at
   runtime — the board never calls an API. */

export type InsightRegion = 'North America' | 'United States' | 'Canada'
export type EquipmentMarket = 'Van' | 'Reefer' | 'Flatbed'
export type MarketTone = 'tight' | 'balanced' | 'soft'

export type MarketArea = {
  code: string
  name: string
  country: 'US' | 'CA'
  loadsIn: number
  loadsOut: number
  trucksIn: number
  trucksOut: number
  /** Intra-state spot and contract van rates, fuel included. */
  spot: number
  contract: number
}

export type InsightRoute = {
  id: string
  origin: string
  destination: string
  customer: string
  equipment: EquipmentMarket
  miles: number
  weeklyLoads: number
  spot: number
  contract: number
  forecast: number
  loadToTruck: number
  carrierMatches: number
  preferredCarriers: number
  trend: number[]
  signal: MarketTone
  summary: string
  recommendation: string
  watch: string[]
}

export const marketAreas: MarketArea[] = [
  { code: 'CA', name: 'California', country: 'US', loadsIn: 2223, loadsOut: 1498, trucksIn: 707, trucksOut: 898, spot: 4.41, contract: 4.4 },
  { code: 'FL', name: 'Florida', country: 'US', loadsIn: 943, loadsOut: 271, trucksIn: 373, trucksOut: 370, spot: 3.77, contract: 4.09 },
  { code: 'IL', name: 'Illinois', country: 'US', loadsIn: 695, loadsOut: 761, trucksIn: 901, trucksOut: 734, spot: 5.12, contract: 4.97 },
  { code: 'GA', name: 'Georgia', country: 'US', loadsIn: 681, loadsOut: 184, trucksIn: 506, trucksOut: 522, spot: 4.61, contract: 4.67 },
  { code: 'MI', name: 'Michigan', country: 'US', loadsIn: 442, loadsOut: 393, trucksIn: 581, trucksOut: 377, spot: 4.62, contract: 4.77 },
  { code: 'AZ', name: 'Arizona', country: 'US', loadsIn: 402, loadsOut: 117, trucksIn: 221, trucksOut: 201, spot: 4.58, contract: 4.81 },
  { code: 'IN', name: 'Indiana', country: 'US', loadsIn: 394, loadsOut: 442, trucksIn: 629, trucksOut: 406, spot: 5.45, contract: 5.3 },
  { code: 'CO', name: 'Colorado', country: 'US', loadsIn: 349, loadsOut: 71, trucksIn: 150, trucksOut: 133, spot: 4.82, contract: 5.22 },
  { code: 'IA', name: 'Iowa', country: 'US', loadsIn: 247, loadsOut: 117, trucksIn: 329, trucksOut: 127, spot: 4.46, contract: 5.0 },
  { code: 'AL', name: 'Alabama', country: 'US', loadsIn: 239, loadsOut: 83, trucksIn: 255, trucksOut: 150, spot: 5.32, contract: 5.26 },
  { code: 'KY', name: 'Kentucky', country: 'US', loadsIn: 235, loadsOut: 313, trucksIn: 462, trucksOut: 232, spot: 5.87, contract: 5.81 },
  { code: 'KS', name: 'Kansas', country: 'US', loadsIn: 232, loadsOut: 45, trucksIn: 293, trucksOut: 134, spot: 4.65, contract: 5.28 },
  { code: 'MN', name: 'Minnesota', country: 'US', loadsIn: 227, loadsOut: 248, trucksIn: 334, trucksOut: 192, spot: 5.05, contract: 5.22 },
  { code: 'MA', name: 'Massachusetts', country: 'US', loadsIn: 242, loadsOut: 303, trucksIn: 225, trucksOut: 110, spot: 5.83, contract: 6.37 },
  { code: 'MD', name: 'Maryland', country: 'US', loadsIn: 201, loadsOut: 227, trucksIn: 237, trucksOut: 100, spot: 6.53, contract: 6.3 },
  { code: 'ID', name: 'Idaho', country: 'US', loadsIn: 159, loadsOut: 93, trucksIn: 82, trucksOut: 51, spot: 4.29, contract: 5.2 },
  { code: 'AR', name: 'Arkansas', country: 'US', loadsIn: 125, loadsOut: 166, trucksIn: 241, trucksOut: 153, spot: 5.43, contract: 5.65 },
  { code: 'CT', name: 'Connecticut', country: 'US', loadsIn: 114, loadsOut: 157, trucksIn: 170, trucksOut: 77, spot: 8.23, contract: 10.59 },
  { code: 'LA', name: 'Louisiana', country: 'US', loadsIn: 96, loadsOut: 177, trucksIn: 230, trucksOut: 74, spot: 5.88, contract: 5.59 },
  { code: 'ME', name: 'Maine', country: 'US', loadsIn: 34, loadsOut: 136, trucksIn: 150, trucksOut: 32, spot: 7.4, contract: 5.74 },
  { code: 'TX', name: 'Texas', country: 'US', loadsIn: 1620, loadsOut: 1180, trucksIn: 980, trucksOut: 1130, spot: 4.02, contract: 4.15 },
  { code: 'PA', name: 'Pennsylvania', country: 'US', loadsIn: 604, loadsOut: 398, trucksIn: 512, trucksOut: 430, spot: 5.36, contract: 5.44 },
  { code: 'OH', name: 'Ohio', country: 'US', loadsIn: 520, loadsOut: 486, trucksIn: 690, trucksOut: 512, spot: 4.98, contract: 5.05 },
  { code: 'NJ', name: 'New Jersey', country: 'US', loadsIn: 512, loadsOut: 236, trucksIn: 388, trucksOut: 301, spot: 6.02, contract: 6.31 },
  { code: 'NY', name: 'New York', country: 'US', loadsIn: 486, loadsOut: 318, trucksIn: 421, trucksOut: 286, spot: 5.94, contract: 6.05 },
  { code: 'NC', name: 'North Carolina', country: 'US', loadsIn: 438, loadsOut: 262, trucksIn: 402, trucksOut: 357, spot: 4.72, contract: 4.9 },
  { code: 'TN', name: 'Tennessee', country: 'US', loadsIn: 398, loadsOut: 406, trucksIn: 548, trucksOut: 389, spot: 5.02, contract: 5.18 },
  { code: 'MO', name: 'Missouri', country: 'US', loadsIn: 286, loadsOut: 243, trucksIn: 361, trucksOut: 248, spot: 4.88, contract: 5.1 },
  { code: 'WA', name: 'Washington', country: 'US', loadsIn: 268, loadsOut: 141, trucksIn: 187, trucksOut: 163, spot: 4.36, contract: 4.72 },
  { code: 'SC', name: 'South Carolina', country: 'US', loadsIn: 246, loadsOut: 148, trucksIn: 268, trucksOut: 214, spot: 4.68, contract: 4.82 },
  { code: 'WI', name: 'Wisconsin', country: 'US', loadsIn: 241, loadsOut: 268, trucksIn: 318, trucksOut: 196, spot: 4.94, contract: 5.16 },
  { code: 'VA', name: 'Virginia', country: 'US', loadsIn: 224, loadsOut: 186, trucksIn: 262, trucksOut: 152, spot: 5.42, contract: 5.56 },
  { code: 'NV', name: 'Nevada', country: 'US', loadsIn: 224, loadsOut: 86, trucksIn: 138, trucksOut: 121, spot: 4.44, contract: 4.68 },
  { code: 'UT', name: 'Utah', country: 'US', loadsIn: 208, loadsOut: 97, trucksIn: 146, trucksOut: 118, spot: 4.51, contract: 4.86 },
  { code: 'OR', name: 'Oregon', country: 'US', loadsIn: 196, loadsOut: 128, trucksIn: 152, trucksOut: 141, spot: 4.18, contract: 4.55 },
  { code: 'OK', name: 'Oklahoma', country: 'US', loadsIn: 168, loadsOut: 132, trucksIn: 214, trucksOut: 126, spot: 4.7, contract: 5.12 },
  { code: 'NE', name: 'Nebraska', country: 'US', loadsIn: 118, loadsOut: 86, trucksIn: 162, trucksOut: 74, spot: 4.55, contract: 5.02 },
  { code: 'MS', name: 'Mississippi', country: 'US', loadsIn: 108, loadsOut: 126, trucksIn: 186, trucksOut: 98, spot: 5.24, contract: 5.38 },
  { code: 'NM', name: 'New Mexico', country: 'US', loadsIn: 96, loadsOut: 74, trucksIn: 92, trucksOut: 68, spot: 4.62, contract: 5.04 },
  { code: 'WV', name: 'West Virginia', country: 'US', loadsIn: 46, loadsOut: 68, trucksIn: 88, trucksOut: 34, spot: 6.12, contract: 5.94 },
  { code: 'MT', name: 'Montana', country: 'US', loadsIn: 44, loadsOut: 36, trucksIn: 47, trucksOut: 33, spot: 4.28, contract: 5.12 },
  { code: 'SD', name: 'South Dakota', country: 'US', loadsIn: 42, loadsOut: 38, trucksIn: 68, trucksOut: 29, spot: 4.4, contract: 4.98 },
  { code: 'ND', name: 'North Dakota', country: 'US', loadsIn: 38, loadsOut: 31, trucksIn: 54, trucksOut: 24, spot: 4.32, contract: 4.9 },
  { code: 'NH', name: 'New Hampshire', country: 'US', loadsIn: 38, loadsOut: 72, trucksIn: 82, trucksOut: 26, spot: 6.86, contract: 6.24 },
  { code: 'RI', name: 'Rhode Island', country: 'US', loadsIn: 34, loadsOut: 58, trucksIn: 62, trucksOut: 21, spot: 7.24, contract: 7.86 },
  { code: 'WY', name: 'Wyoming', country: 'US', loadsIn: 32, loadsOut: 24, trucksIn: 38, trucksOut: 22, spot: 4.24, contract: 5.06 },
  { code: 'DE', name: 'Delaware', country: 'US', loadsIn: 24, loadsOut: 119, trucksIn: 178, trucksOut: 18, spot: 6.74, contract: 6.58 },
  { code: 'VT', name: 'Vermont', country: 'US', loadsIn: 22, loadsOut: 48, trucksIn: 54, trucksOut: 18, spot: 7.12, contract: 6.42 },
  { code: 'AK', name: 'Alaska', country: 'US', loadsIn: 13, loadsOut: 5, trucksIn: 76, trucksOut: 6, spot: 5.6, contract: 6.2 },
  { code: 'HI', name: 'Hawaii', country: 'US', loadsIn: 12, loadsOut: 6, trucksIn: 21, trucksOut: 9, spot: 6.4, contract: 6.9 },
  { code: 'DC', name: 'District of Columbia', country: 'US', loadsIn: 11, loadsOut: 18, trucksIn: 112, trucksOut: 5, spot: 7.02, contract: 6.88 },
  { code: 'ON', name: 'Ontario', country: 'CA', loadsIn: 862, loadsOut: 694, trucksIn: 746, trucksOut: 718, spot: 3.55, contract: 3.94 },
  { code: 'PQ', name: 'Quebec', country: 'CA', loadsIn: 388, loadsOut: 441, trucksIn: 414, trucksOut: 395, spot: 3.88, contract: 3.6 },
  { code: 'AB', name: 'Alberta', country: 'CA', loadsIn: 318, loadsOut: 251, trucksIn: 286, trucksOut: 264, spot: 3.44, contract: 4.34 },
  { code: 'BC', name: 'British Columbia', country: 'CA', loadsIn: 276, loadsOut: 214, trucksIn: 331, trucksOut: 307, spot: 5.44, contract: 5.97 },
  { code: 'MB', name: 'Manitoba', country: 'CA', loadsIn: 146, loadsOut: 178, trucksIn: 122, trucksOut: 137, spot: 2.82, contract: 2.95 },
  { code: 'SK', name: 'Saskatchewan', country: 'CA', loadsIn: 89, loadsOut: 97, trucksIn: 116, trucksOut: 108, spot: 2.18, contract: 2.33 },
]

/** Loads per truck on the board. The single number a rep reads first. */
export function areaRatio(area: MarketArea) {
  return area.loadsIn / Math.max(1, area.trucksIn)
}

export function areaTone(area: MarketArea): MarketTone {
  const ratio = areaRatio(area)
  if (ratio >= 1.35) return 'tight'
  if (ratio >= 0.85) return 'balanced'
  return 'soft'
}

export const toneLabel: Record<MarketTone, string> = {
  tight: 'Carrier market',
  balanced: 'Balanced',
  soft: 'Shipper market',
}

export const toneColor: Record<MarketTone, string> = {
  tight: '#ef4444',
  balanced: '#3b82f6',
  soft: '#10b981',
}

export const insightRoutes: InsightRoute[] = [
  {
    id: 'pg-on-tx',
    origin: 'Brampton, ON',
    destination: 'Dallas, TX',
    customer: 'P&G',
    equipment: 'Van',
    miles: 1382,
    weeklyLoads: 18,
    spot: 1.84,
    contract: 1.96,
    forecast: 1.92,
    loadToTruck: 11.8,
    carrierMatches: 42,
    preferredCarriers: 9,
    trend: [1.72, 1.76, 1.79, 1.83, 1.88, 1.84, 1.92],
    signal: 'tight',
    summary:
      'Outbound Ontario capacity is tightening into Texas while cross-border lead times are extending.',
    recommendation:
      'Start outreach 4 days before pickup and protect the first tender with a $1.92–$2.02 target band.',
    watch: [
      'Ontario capacity index below neutral',
      'Texas inbound demand rising',
      'Cross-border dwell adds 3–5 hours',
    ],
  },
  {
    id: 'pg-il-ga',
    origin: 'Chicago, IL',
    destination: 'Atlanta, GA',
    customer: 'P&G',
    equipment: 'Van',
    miles: 718,
    weeklyLoads: 24,
    spot: 3.4,
    contract: 3.6,
    forecast: 3.46,
    loadToTruck: 9.6,
    carrierMatches: 58,
    preferredCarriers: 14,
    trend: [3.18, 3.21, 3.28, 3.35, 3.42, 3.4, 3.46],
    signal: 'tight',
    summary:
      'Chicago remains carrier-favorable, but strong P&G history gives this lane a deeper-than-market carrier pool.',
    recommendation:
      'Tender preferred carriers first; use $3.45 as the escalation trigger before broad market release.',
    watch: ['Friday outbound premium', 'Georgia reload strength', 'Spot-to-contract gap narrowing'],
  },
  {
    id: 'pg-ca-az',
    origin: 'Los Angeles, CA',
    destination: 'Phoenix, AZ',
    customer: 'P&G',
    equipment: 'Van',
    miles: 372,
    weeklyLoads: 12,
    spot: 4.48,
    contract: 4.17,
    forecast: 4.36,
    loadToTruck: 13.2,
    carrierMatches: 31,
    preferredCarriers: 6,
    trend: [4.02, 4.12, 4.24, 4.31, 4.45, 4.48, 4.36],
    signal: 'tight',
    summary:
      'Southern California has the strongest load pressure in the network and spot is trading above contract.',
    recommendation:
      'Lock capacity early. Use favourite carriers before DAT and cap the buy at $4.50 per mile.',
    watch: ['California load posts elevated', 'Short-haul minimums apply', 'Weekend pickup premium'],
  },
  {
    id: 'pg-fl-ga',
    origin: 'Jacksonville, FL',
    destination: 'Atlanta, GA',
    customer: 'P&G',
    equipment: 'Van',
    miles: 346,
    weeklyLoads: 9,
    spot: 2.33,
    contract: 2.67,
    forecast: 2.38,
    loadToTruck: 4.7,
    carrierMatches: 64,
    preferredCarriers: 18,
    trend: [2.52, 2.47, 2.42, 2.36, 2.31, 2.33, 2.38],
    signal: 'soft',
    summary: 'Florida outbound remains shipper-favorable with more trucks than reload demand.',
    recommendation:
      'Hold the buy near $2.35 and release to the wider carrier pool only 24 hours before pickup.',
    watch: [
      'Seasonal produce demand muted',
      'Strong Atlanta reload options',
      'Contract premium remains wide',
    ],
  },
  {
    id: 'pg-on-pq',
    origin: 'Toronto, ON',
    destination: 'Montreal, QC',
    customer: 'P&G',
    equipment: 'Van',
    miles: 336,
    weeklyLoads: 31,
    spot: 3.14,
    contract: 3.12,
    forecast: 3.18,
    loadToTruck: 8.4,
    carrierMatches: 76,
    preferredCarriers: 22,
    trend: [3.02, 3.05, 3.08, 3.11, 3.16, 3.14, 3.18],
    signal: 'balanced',
    summary:
      'The core Ontario–Quebec corridor is balanced, with stable rates and strong incumbent coverage.',
    recommendation: 'Keep the current routing guide and use $3.20 as the threshold for spot escalation.',
    watch: [
      'Monday volume concentration',
      'Montreal appointments tightening',
      'Incumbent acceptance stable',
    ],
  },
  {
    id: 'pg-on-ga-reefer',
    origin: 'Toronto, ON',
    destination: 'Atlanta, GA',
    customer: 'P&G',
    equipment: 'Reefer',
    miles: 956,
    weeklyLoads: 11,
    spot: 3.58,
    contract: 3.63,
    forecast: 3.61,
    loadToTruck: 10.3,
    carrierMatches: 28,
    preferredCarriers: 7,
    trend: [3.31, 3.37, 3.42, 3.51, 3.57, 3.58, 3.61],
    signal: 'tight',
    summary:
      'Temperature-controlled cross-border capacity is tightening faster than standard van availability.',
    recommendation:
      'Confirm reefer breakdown coverage before tender and begin preferred-carrier outreach four days out.',
    watch: [
      'Reefer pool is 33% smaller',
      'Border inspection exposure',
      'Southeast reload demand strengthening',
    ],
  },
  {
    id: 'pg-fl-il-reefer',
    origin: 'Lakeland, FL',
    destination: 'Chicago, IL',
    customer: 'P&G',
    equipment: 'Reefer',
    miles: 1181,
    weeklyLoads: 8,
    spot: 2.98,
    contract: 3.18,
    forecast: 3.04,
    loadToTruck: 6.2,
    carrierMatches: 39,
    preferredCarriers: 10,
    trend: [3.16, 3.12, 3.08, 3.01, 2.96, 2.98, 3.04],
    signal: 'balanced',
    summary:
      'Florida outbound capacity remains available, offset by firmer refrigerated demand into the Midwest.',
    recommendation:
      'Keep the first tender near $3.00 and preserve a $0.12 per mile contingency for late-week pickups.',
    watch: ['Produce season transition', 'Chicago weekend appointments', 'Fuel sensitivity on long haul'],
  },
  {
    id: 'pg-tx-co-flatbed',
    origin: 'Houston, TX',
    destination: 'Denver, CO',
    customer: 'P&G',
    equipment: 'Flatbed',
    miles: 1028,
    weeklyLoads: 7,
    spot: 3.91,
    contract: 3.5,
    forecast: 3.84,
    loadToTruck: 12.7,
    carrierMatches: 23,
    preferredCarriers: 5,
    trend: [3.52, 3.59, 3.67, 3.78, 3.86, 3.91, 3.84],
    signal: 'tight',
    summary: 'Open-deck demand remains elevated from industrial and infrastructure freight across Texas.',
    recommendation:
      'Protect capacity with an early tender and validate securement capability before rate negotiation.',
    watch: [
      'Industrial demand elevated',
      'Colorado backhaul imbalance',
      'Specialized equipment premium',
    ],
  },
  {
    id: 'pg-ab-wa-flatbed',
    origin: 'Calgary, AB',
    destination: 'Seattle, WA',
    customer: 'P&G',
    equipment: 'Flatbed',
    miles: 674,
    weeklyLoads: 5,
    spot: 2.82,
    contract: 2.76,
    forecast: 2.88,
    loadToTruck: 8.8,
    carrierMatches: 19,
    preferredCarriers: 4,
    trend: [2.68, 2.71, 2.75, 2.8, 2.84, 2.82, 2.88],
    signal: 'balanced',
    summary: 'Western Canada supply is balanced, but cross-border flatbed choice remains limited.',
    recommendation:
      'Use a narrow preferred list and confirm customs capability before opening the tender broadly.',
    watch: ['Cross-border paperwork', 'Pacific Northwest reloads', 'Weather-sensitive securement'],
  },
]

export const nationalTrend = {
  labels: ['May', 'Jun', 'Jul', 'Aug'],
  van: [2.89, 3.0, 3.0, 2.9],
  flatbed: [3.66, 3.7, 3.66, 3.55],
  reefer: [3.36, 3.4, 3.41, 3.35],
}

/** Weekly load and truck posting counts, thousands, last 12 weeks. */
export const postingHistory = {
  weeks: [
    'Jun 01', 'Jun 08', 'Jun 15', 'Jun 22', 'Jun 29', 'Jul 06',
    'Jul 13', 'Jul 20', 'Jul 27', 'Aug 03', 'Aug 10', 'Aug 17',
  ],
  loads: [268, 254, 191, 262, 273, 208, 281, 288, 214, 292, 286, 279],
  trucks: [27.4, 26.8, 22.1, 26.2, 27.1, 21.6, 27.9, 28.4, 22.4, 28.8, 28.2, 27.9],
}

export const topNationalLanes = [
  { short: 'ATL → PHL', lane: 'Atlanta, GA → Philadelphia, PA', rate: 1743, low: 1546, high: 1903 },
  { short: 'CHI → ATL', lane: 'Chicago, IL → Atlanta, GA', rate: 2019, low: 1769, high: 2155 },
  { short: 'EWR → ATL', lane: 'Elizabeth, NJ → Atlanta, GA', rate: 2200, low: 1685, high: 2776 },
  { short: 'LRD → DFW', lane: 'Laredo, TX → Dallas, TX', rate: 1431, low: 1253, high: 1549 },
  { short: 'LAX → PHX', lane: 'Los Angeles, CA → Phoenix, AZ', rate: 1358, low: 1183, high: 1466 },
]

export const datHeadlines = [
  {
    date: 'Aug 20, 2026',
    title: 'Capacity stays tight as July LMI holds near a four-year high',
    detail:
      'Transportation capacity contracted for the eighth straight month; tender lead time reached 3.74 days.',
  },
  {
    date: 'This week',
    title: 'Dry van spot linehaul averages $2.28 per mile',
    detail:
      'Minus fuel, rates are 40.5% above last year and 27.5% above the nine-year seasonal average.',
  },
  {
    date: 'Week of Aug 17',
    title: 'Van load-to-truck ratio holds near the summer high',
    detail:
      'Load posts eased 2% week over week while truck posts fell 1%, so the balance barely moved.',
  },
  {
    date: '12-month outlook',
    title: 'Shippers should plan for continued capacity pressure',
    detail:
      'The forward capacity reading remains in contraction at 40.4, favoring earlier carrier engagement.',
  },
]
