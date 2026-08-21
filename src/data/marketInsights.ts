/* Static market intelligence for the AI insights board.
   Figures are transcribed from the Aug 20, 2026 DAT state matrices, the public
   dry van commentary, and the sample P&G network. Nothing here is fetched at
   runtime — the board never calls an API. */

export type InsightRegion = 'North America' | 'United States' | 'Canada' | 'Mexico'
export type EquipmentMarket = 'Van' | 'Reefer' | 'Flatbed'
export type MarketTone = 'tight' | 'balanced' | 'soft'
export type MarketCountry = 'US' | 'CA' | 'MX'

export type MarketArea = {
  code: string
  name: string
  country: MarketCountry
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
  /* Mexican states use the same load and truck posting model. Names match the
     GeoJSON exactly so the map join works without a lookup table. */
  { code: 'NL', name: 'Nuevo León', country: 'MX', loadsIn: 742, loadsOut: 884, trucksIn: 486, trucksOut: 612, spot: 2.86, contract: 3.12 },
  { code: 'TM', name: 'Tamaulipas', country: 'MX', loadsIn: 486, loadsOut: 638, trucksIn: 342, trucksOut: 448, spot: 2.64, contract: 2.94 },
  { code: 'CH', name: 'Chihuahua', country: 'MX', loadsIn: 418, loadsOut: 512, trucksIn: 296, trucksOut: 368, spot: 2.92, contract: 3.24 },
  { code: 'CU', name: 'Coahuila', country: 'MX', loadsIn: 386, loadsOut: 442, trucksIn: 268, trucksOut: 318, spot: 2.78, contract: 3.08 },
  { code: 'JA', name: 'Jalisco', country: 'MX', loadsIn: 348, loadsOut: 312, trucksIn: 286, trucksOut: 264, spot: 2.54, contract: 2.86 },
  { code: 'MX', name: 'México', country: 'MX', loadsIn: 412, loadsOut: 368, trucksIn: 386, trucksOut: 342, spot: 2.42, contract: 2.72 },
  { code: 'DF', name: 'Ciudad de México', country: 'MX', loadsIn: 386, loadsOut: 296, trucksIn: 358, trucksOut: 312, spot: 2.38, contract: 2.68 },
  { code: 'GJ', name: 'Guanajuato', country: 'MX', loadsIn: 296, loadsOut: 342, trucksIn: 224, trucksOut: 268, spot: 2.62, contract: 2.92 },
  { code: 'QE', name: 'Querétaro', country: 'MX', loadsIn: 248, loadsOut: 286, trucksIn: 186, trucksOut: 214, spot: 2.68, contract: 2.98 },
  { code: 'BN', name: 'Baja California', country: 'MX', loadsIn: 268, loadsOut: 318, trucksIn: 212, trucksOut: 248, spot: 3.04, contract: 3.36 },
  { code: 'SO', name: 'Sonora', country: 'MX', loadsIn: 196, loadsOut: 242, trucksIn: 168, trucksOut: 196, spot: 2.88, contract: 3.18 },
  { code: 'SL', name: 'San Luis Potosí', country: 'MX', loadsIn: 224, loadsOut: 268, trucksIn: 176, trucksOut: 206, spot: 2.58, contract: 2.88 },
  { code: 'PU', name: 'Puebla', country: 'MX', loadsIn: 186, loadsOut: 168, trucksIn: 162, trucksOut: 148, spot: 2.44, contract: 2.74 },
  { code: 'AG', name: 'Aguascalientes', country: 'MX', loadsIn: 142, loadsOut: 168, trucksIn: 112, trucksOut: 132, spot: 2.52, contract: 2.82 },
  { code: 'VE', name: 'Veracruz', country: 'MX', loadsIn: 168, loadsOut: 142, trucksIn: 148, trucksOut: 126, spot: 2.72, contract: 3.02 },
  { code: 'SI', name: 'Sinaloa', country: 'MX', loadsIn: 132, loadsOut: 196, trucksIn: 118, trucksOut: 164, spot: 2.96, contract: 3.28 },
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
    id: 'pg-tx-nl',
    origin: 'Laredo, TX',
    destination: 'Monterrey, NL',
    customer: 'P&G',
    equipment: 'Van',
    miles: 148,
    weeklyLoads: 26,
    spot: 4.64,
    contract: 4.28,
    forecast: 4.78,
    loadToTruck: 14.6,
    carrierMatches: 38,
    preferredCarriers: 7,
    trend: [4.18, 4.26, 4.34, 4.42, 4.51, 4.64, 4.78],
    signal: 'tight',
    summary:
      'Southbound crossings at Laredo are backing up, and Monterrey drayage capacity is the constraint.',
    recommendation:
      'Book transfer carriers a day ahead and hold a $4.60–$4.90 band on the Mexican leg.',
    watch: [
      'Laredo bridge wait times above 2 hours',
      'Monterrey outbound ratio at 1.50×',
      'Customs broker backlog into the weekend',
    ],
  },
  {
    id: 'pg-nl-mi',
    origin: 'Monterrey, NL',
    destination: 'Detroit, MI',
    customer: 'Linamar',
    equipment: 'Van',
    miles: 1546,
    weeklyLoads: 14,
    spot: 2.56,
    contract: 2.72,
    forecast: 2.62,
    loadToTruck: 9.2,
    carrierMatches: 29,
    preferredCarriers: 6,
    trend: [2.38, 2.42, 2.47, 2.51, 2.49, 2.56, 2.62],
    signal: 'balanced',
    summary:
      'Northbound automotive volume is steady, with capacity available on the US leg out of Laredo.',
    recommendation:
      'Keep the through-trailer program on contract and spot-buy only the Saltillo overflow.',
    watch: [
      'Plant shutdown week starting Sep 7',
      'Laredo northbound dwell steady at 90 minutes',
      'Detroit inbound trucks up 11%',
    ],
  },
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

/** Headline rate readings, mirroring the published national rate card. */
export const nationalRates = {
  updated: 'Aug 17, 2026',
  items: [
    {
      id: 'broker-spot',
      label: 'Broker spot rate',
      value: 2.24,
      delta: -0.03,
      direction: 'increasing' as const,
    },
    {
      id: 'shipper-contract',
      label: 'Shipper contract rate',
      value: 2.47,
      delta: -0.06,
      direction: 'increasing' as const,
    },
    {
      id: 'fuel-surcharge',
      label: 'Fuel surcharge',
      value: 0.68,
      delta: 0,
      direction: 'neutral' as const,
    },
  ],
}

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

export type NationalLane = {
  short: string
  lane: string
  origin: string
  destination: string
  equipment: EquipmentMarket
  miles: number
  weeklyLoads: number
  rate: number
  low: number
  high: number
  /** Week-over-week move in the paid rate, percent. */
  wow: number
}

export const topNationalLanes: NationalLane[] = [
  { short: 'ATL → PHL', lane: 'Atlanta, GA → Philadelphia, PA', origin: 'GA', destination: 'PA', equipment: 'Van', miles: 763, weeklyLoads: 412, rate: 1743, low: 1546, high: 1903, wow: 1.8 },
  { short: 'CHI → ATL', lane: 'Chicago, IL → Atlanta, GA', origin: 'IL', destination: 'GA', equipment: 'Van', miles: 718, weeklyLoads: 388, rate: 2019, low: 1769, high: 2155, wow: 2.6 },
  { short: 'EWR → ATL', lane: 'Elizabeth, NJ → Atlanta, GA', origin: 'NJ', destination: 'GA', equipment: 'Van', miles: 872, weeklyLoads: 264, rate: 2200, low: 1685, high: 2776, wow: 4.1 },
  { short: 'LRD → DFW', lane: 'Laredo, TX → Dallas, TX', origin: 'TX', destination: 'TX', equipment: 'Van', miles: 431, weeklyLoads: 506, rate: 1431, low: 1253, high: 1549, wow: -0.9 },
  { short: 'LAX → PHX', lane: 'Los Angeles, CA → Phoenix, AZ', origin: 'CA', destination: 'AZ', equipment: 'Van', miles: 372, weeklyLoads: 478, rate: 1358, low: 1183, high: 1466, wow: 3.2 },
  { short: 'ONT → DEN', lane: 'Ontario, CA → Denver, CO', origin: 'CA', destination: 'CO', equipment: 'Van', miles: 1024, weeklyLoads: 196, rate: 2384, low: 2044, high: 2691, wow: 2.2 },
  { short: 'DFW → ATL', lane: 'Dallas, TX → Atlanta, GA', origin: 'TX', destination: 'GA', equipment: 'Van', miles: 795, weeklyLoads: 342, rate: 1866, low: 1602, high: 2058, wow: 1.4 },
  { short: 'HOU → LRD', lane: 'Houston, TX → Laredo, TX', origin: 'TX', destination: 'TX', equipment: 'Van', miles: 316, weeklyLoads: 288, rate: 1102, low: 918, high: 1284, wow: -1.6 },
  { short: 'CHI → DFW', lane: 'Chicago, IL → Dallas, TX', origin: 'IL', destination: 'TX', equipment: 'Van', miles: 968, weeklyLoads: 254, rate: 2246, low: 1948, high: 2492, wow: 2.9 },
  { short: 'YYZ → DTW', lane: 'Toronto, ON → Detroit, MI', origin: 'ON', destination: 'MI', equipment: 'Van', miles: 237, weeklyLoads: 318, rate: 852, low: 712, high: 1008, wow: 3.6 },
  { short: 'YYZ → YUL', lane: 'Toronto, ON → Montreal, QC', origin: 'ON', destination: 'PQ', equipment: 'Van', miles: 336, weeklyLoads: 366, rate: 1055, low: 902, high: 1188, wow: 0.6 },
  { short: 'YVR → SEA', lane: 'Vancouver, BC → Seattle, WA', origin: 'BC', destination: 'WA', equipment: 'Van', miles: 143, weeklyLoads: 172, rate: 684, low: 566, high: 812, wow: -0.4 },
  { short: 'LAK → CHI', lane: 'Lakeland, FL → Chicago, IL', origin: 'FL', destination: 'IL', equipment: 'Reefer', miles: 1181, weeklyLoads: 148, rate: 3520, low: 3042, high: 3944, wow: -2.1 },
  { short: 'SLC → LAX', lane: 'Salt Lake City, UT → Los Angeles, CA', origin: 'UT', destination: 'CA', equipment: 'Reefer', miles: 690, weeklyLoads: 132, rate: 2246, low: 1908, high: 2564, wow: 1.1 },
  { short: 'HOU → DEN', lane: 'Houston, TX → Denver, CO', origin: 'TX', destination: 'CO', equipment: 'Flatbed', miles: 1028, weeklyLoads: 118, rate: 4018, low: 3486, high: 4462, wow: 2.4 },
  { short: 'BHM → ATL', lane: 'Birmingham, AL → Atlanta, GA', origin: 'AL', destination: 'GA', equipment: 'Flatbed', miles: 148, weeklyLoads: 106, rate: 742, low: 618, high: 884, wow: 0.8 },
  { short: 'LRD → MTY', lane: 'Laredo, TX → Monterrey, NL', origin: 'TX', destination: 'NL', equipment: 'Van', miles: 148, weeklyLoads: 486, rate: 686, low: 542, high: 848, wow: 3.4 },
  { short: 'MTY → LRD', lane: 'Monterrey, NL → Laredo, TX', origin: 'NL', destination: 'TX', equipment: 'Van', miles: 148, weeklyLoads: 512, rate: 742, low: 596, high: 902, wow: 4.2 },
  { short: 'ELP → CJS', lane: 'El Paso, TX → Ciudad Juárez, CH', origin: 'TX', destination: 'CH', equipment: 'Van', miles: 22, weeklyLoads: 368, rate: 412, low: 336, high: 508, wow: 3.1 },
  { short: 'DFW → MTY', lane: 'Dallas, TX → Monterrey, NL', origin: 'TX', destination: 'NL', equipment: 'Van', miles: 586, weeklyLoads: 226, rate: 1864, low: 1586, high: 2142, wow: 2.8 },
  { short: 'MTY → CHI', lane: 'Monterrey, NL → Chicago, IL', origin: 'NL', destination: 'IL', equipment: 'Van', miles: 1462, weeklyLoads: 168, rate: 3684, low: 3184, high: 4108, wow: 2.2 },
  { short: 'SLW → DTW', lane: 'Saltillo, CU → Detroit, MI', origin: 'CU', destination: 'MI', equipment: 'Van', miles: 1546, weeklyLoads: 148, rate: 3948, low: 3402, high: 4386, wow: 1.8 },
  { short: 'TIJ → LAX', lane: 'Tijuana, BN → Los Angeles, CA', origin: 'BN', destination: 'CA', equipment: 'Reefer', miles: 148, weeklyLoads: 196, rate: 892, low: 736, high: 1064, wow: 2.2 },
  { short: 'QRO → LRD', lane: 'Querétaro, QE → Laredo, TX', origin: 'QE', destination: 'TX', equipment: 'Van', miles: 624, weeklyLoads: 184, rate: 1968, low: 1682, high: 2246, wow: 2.6 },
]

export type CityMarket = {
  code: string
  city: string
  state: string
  country: MarketCountry
  loadsIn: number
  loadsOut: number
  trucksIn: number
  trucksOut: number
  spot: number
  contract: number
  /** Average length of haul on outbound freight, miles. */
  avgMiles: number
  topOutbound: string
  /** Week-over-week move in the outbound spot rate, percent. */
  wow: number
}

/** Metro-level detail behind each state, for desks that source city to city. */
export const cityMarkets: CityMarket[] = [
  { code: 'LAX', city: 'Los Angeles', state: 'CA', country: 'US', loadsIn: 684, loadsOut: 512, trucksIn: 214, trucksOut: 268, spot: 4.62, contract: 4.48, avgMiles: 486, topOutbound: 'Phoenix, AZ', wow: 3.2 },
  { code: 'ONT', city: 'Ontario / Fontana', state: 'CA', country: 'US', loadsIn: 462, loadsOut: 388, trucksIn: 168, trucksOut: 196, spot: 4.38, contract: 4.31, avgMiles: 624, topOutbound: 'Denver, CO', wow: 2.6 },
  { code: 'SCK', city: 'Stockton', state: 'CA', country: 'US', loadsIn: 286, loadsOut: 241, trucksIn: 126, trucksOut: 148, spot: 4.12, contract: 4.24, avgMiles: 712, topOutbound: 'Salt Lake City, UT', wow: 1.4 },
  { code: 'OAK', city: 'Oakland', state: 'CA', country: 'US', loadsIn: 248, loadsOut: 196, trucksIn: 114, trucksOut: 132, spot: 4.46, contract: 4.52, avgMiles: 538, topOutbound: 'Los Angeles, CA', wow: 2.1 },
  { code: 'DFW', city: 'Dallas / Fort Worth', state: 'TX', country: 'US', loadsIn: 612, loadsOut: 486, trucksIn: 342, trucksOut: 398, spot: 4.08, contract: 4.18, avgMiles: 668, topOutbound: 'Atlanta, GA', wow: 1.8 },
  { code: 'HOU', city: 'Houston', state: 'TX', country: 'US', loadsIn: 468, loadsOut: 392, trucksIn: 286, trucksOut: 324, spot: 3.94, contract: 4.06, avgMiles: 542, topOutbound: 'Laredo, TX', wow: -0.7 },
  { code: 'LRD', city: 'Laredo', state: 'TX', country: 'US', loadsIn: 386, loadsOut: 512, trucksIn: 196, trucksOut: 168, spot: 4.24, contract: 4.02, avgMiles: 398, topOutbound: 'Dallas, TX', wow: 2.9 },
  { code: 'SAT', city: 'San Antonio', state: 'TX', country: 'US', loadsIn: 214, loadsOut: 168, trucksIn: 142, trucksOut: 156, spot: 3.86, contract: 4.01, avgMiles: 486, topOutbound: 'Houston, TX', wow: 0.4 },
  { code: 'ELP', city: 'El Paso', state: 'TX', country: 'US', loadsIn: 186, loadsOut: 148, trucksIn: 98, trucksOut: 112, spot: 4.16, contract: 4.22, avgMiles: 724, topOutbound: 'Phoenix, AZ', wow: 1.2 },
  { code: 'CHI', city: 'Chicago', state: 'IL', country: 'US', loadsIn: 428, loadsOut: 486, trucksIn: 512, trucksOut: 442, spot: 5.24, contract: 5.06, avgMiles: 712, topOutbound: 'Atlanta, GA', wow: 2.6 },
  { code: 'JOT', city: 'Joliet', state: 'IL', country: 'US', loadsIn: 186, loadsOut: 214, trucksIn: 246, trucksOut: 198, spot: 4.98, contract: 4.88, avgMiles: 668, topOutbound: 'Dallas, TX', wow: 1.6 },
  { code: 'ATL', city: 'Atlanta', state: 'GA', country: 'US', loadsIn: 486, loadsOut: 132, trucksIn: 342, trucksOut: 368, spot: 4.68, contract: 4.72, avgMiles: 624, topOutbound: 'Philadelphia, PA', wow: 1.9 },
  { code: 'SAV', city: 'Savannah', state: 'GA', country: 'US', loadsIn: 148, loadsOut: 42, trucksIn: 128, trucksOut: 136, spot: 4.42, contract: 4.58, avgMiles: 486, topOutbound: 'Atlanta, GA', wow: -0.6 },
  { code: 'LAL', city: 'Lakeland', state: 'FL', country: 'US', loadsIn: 268, loadsOut: 96, trucksIn: 112, trucksOut: 118, spot: 3.82, contract: 4.12, avgMiles: 968, topOutbound: 'Chicago, IL', wow: -2.1 },
  { code: 'MIA', city: 'Miami', state: 'FL', country: 'US', loadsIn: 342, loadsOut: 68, trucksIn: 138, trucksOut: 142, spot: 3.94, contract: 4.18, avgMiles: 742, topOutbound: 'Atlanta, GA', wow: 0.8 },
  { code: 'JAX', city: 'Jacksonville', state: 'FL', country: 'US', loadsIn: 186, loadsOut: 72, trucksIn: 96, trucksOut: 104, spot: 3.68, contract: 4.02, avgMiles: 386, topOutbound: 'Atlanta, GA', wow: 1.1 },
  { code: 'YYZ', city: 'Toronto', state: 'ON', country: 'CA', loadsIn: 412, loadsOut: 342, trucksIn: 368, trucksOut: 356, spot: 3.62, contract: 3.98, avgMiles: 486, topOutbound: 'Montreal, QC', wow: 3.6 },
  { code: 'YBR', city: 'Brampton', state: 'ON', country: 'CA', loadsIn: 268, loadsOut: 224, trucksIn: 212, trucksOut: 206, spot: 3.54, contract: 3.92, avgMiles: 968, topOutbound: 'Dallas, TX', wow: 2.8 },
  { code: 'YMI', city: 'Mississauga', state: 'ON', country: 'CA', loadsIn: 196, loadsOut: 168, trucksIn: 178, trucksOut: 172, spot: 3.48, contract: 3.86, avgMiles: 542, topOutbound: 'Detroit, MI', wow: 2.2 },
  { code: 'YWH', city: 'Windsor', state: 'ON', country: 'CA', loadsIn: 118, loadsOut: 142, trucksIn: 96, trucksOut: 88, spot: 3.38, contract: 3.74, avgMiles: 286, topOutbound: 'Detroit, MI', wow: 1.4 },
  { code: 'YUL', city: 'Montreal', state: 'PQ', country: 'CA', loadsIn: 268, loadsOut: 312, trucksIn: 286, trucksOut: 272, spot: 3.92, contract: 3.64, avgMiles: 412, topOutbound: 'Toronto, ON', wow: 0.6 },
  { code: 'YYC', city: 'Calgary', state: 'AB', country: 'CA', loadsIn: 196, loadsOut: 148, trucksIn: 174, trucksOut: 162, spot: 3.48, contract: 4.28, avgMiles: 624, topOutbound: 'Seattle, WA', wow: 1.8 },
  { code: 'YEG', city: 'Edmonton', state: 'AB', country: 'CA', loadsIn: 122, loadsOut: 103, trucksIn: 112, trucksOut: 102, spot: 3.38, contract: 4.36, avgMiles: 712, topOutbound: 'Calgary, AB', wow: 0.9 },
  { code: 'YVR', city: 'Vancouver', state: 'BC', country: 'CA', loadsIn: 186, loadsOut: 142, trucksIn: 212, trucksOut: 198, spot: 5.38, contract: 5.86, avgMiles: 386, topOutbound: 'Seattle, WA', wow: -0.4 },
  { code: 'PHX', city: 'Phoenix', state: 'AZ', country: 'US', loadsIn: 286, loadsOut: 86, trucksIn: 152, trucksOut: 138, spot: 4.52, contract: 4.78, avgMiles: 486, topOutbound: 'Los Angeles, CA', wow: 2.4 },
  { code: 'DTW', city: 'Detroit', state: 'MI', country: 'US', loadsIn: 312, loadsOut: 268, trucksIn: 386, trucksOut: 252, spot: 4.58, contract: 4.74, avgMiles: 542, topOutbound: 'Toronto, ON', wow: 1.6 },
  { code: 'MEM', city: 'Memphis', state: 'TN', country: 'US', loadsIn: 246, loadsOut: 262, trucksIn: 342, trucksOut: 248, spot: 4.98, contract: 5.12, avgMiles: 624, topOutbound: 'Dallas, TX', wow: 1.2 },
  { code: 'BNA', city: 'Nashville', state: 'TN', country: 'US', loadsIn: 152, loadsOut: 144, trucksIn: 206, trucksOut: 141, spot: 5.06, contract: 5.24, avgMiles: 568, topOutbound: 'Atlanta, GA', wow: 0.7 },
  { code: 'IND', city: 'Indianapolis', state: 'IN', country: 'US', loadsIn: 268, loadsOut: 296, trucksIn: 412, trucksOut: 268, spot: 5.42, contract: 5.28, avgMiles: 586, topOutbound: 'Chicago, IL', wow: 2.1 },
  { code: 'CMH', city: 'Columbus', state: 'OH', country: 'US', loadsIn: 286, loadsOut: 268, trucksIn: 386, trucksOut: 286, spot: 4.94, contract: 5.02, avgMiles: 542, topOutbound: 'Chicago, IL', wow: 1.8 },
  { code: 'EWR', city: 'Elizabeth / Newark', state: 'NJ', country: 'US', loadsIn: 386, loadsOut: 168, trucksIn: 286, trucksOut: 224, spot: 6.08, contract: 6.34, avgMiles: 486, topOutbound: 'Atlanta, GA', wow: 4.1 },
  { code: 'MDT', city: 'Harrisburg', state: 'PA', country: 'US', loadsIn: 342, loadsOut: 268, trucksIn: 312, trucksOut: 268, spot: 5.42, contract: 5.48, avgMiles: 412, topOutbound: 'Chicago, IL', wow: 1.4 },
  { code: 'CLT', city: 'Charlotte', state: 'NC', country: 'US', loadsIn: 268, loadsOut: 162, trucksIn: 246, trucksOut: 214, spot: 4.76, contract: 4.92, avgMiles: 486, topOutbound: 'Atlanta, GA', wow: 0.9 },
  { code: 'SEA', city: 'Seattle', state: 'WA', country: 'US', loadsIn: 186, loadsOut: 96, trucksIn: 128, trucksOut: 112, spot: 4.42, contract: 4.78, avgMiles: 624, topOutbound: 'Portland, OR', wow: -0.8 },
  { code: 'DEN', city: 'Denver', state: 'CO', country: 'US', loadsIn: 268, loadsOut: 52, trucksIn: 106, trucksOut: 98, spot: 4.88, contract: 5.28, avgMiles: 742, topOutbound: 'Salt Lake City, UT', wow: 2.2 },
  { code: 'MCI', city: 'Kansas City', state: 'MO', country: 'US', loadsIn: 196, loadsOut: 168, trucksIn: 248, trucksOut: 172, spot: 4.82, contract: 5.06, avgMiles: 624, topOutbound: 'Chicago, IL', wow: 1.1 },
  { code: 'STL', city: 'St. Louis', state: 'MO', country: 'US', loadsIn: 148, loadsOut: 126, trucksIn: 186, trucksOut: 132, spot: 4.74, contract: 5.02, avgMiles: 542, topOutbound: 'Dallas, TX', wow: 0.6 },
  { code: 'SDF', city: 'Louisville', state: 'KY', country: 'US', loadsIn: 168, loadsOut: 186, trucksIn: 268, trucksOut: 164, spot: 5.68, contract: 5.72, avgMiles: 486, topOutbound: 'Atlanta, GA', wow: 1.9 },
  { code: 'CVG', city: 'Cincinnati', state: 'OH', country: 'US', loadsIn: 196, loadsOut: 182, trucksIn: 264, trucksOut: 188, spot: 5.04, contract: 5.12, avgMiles: 512, topOutbound: 'Atlanta, GA', wow: 1.2 },
  { code: 'CLE', city: 'Cleveland', state: 'OH', country: 'US', loadsIn: 168, loadsOut: 152, trucksIn: 228, trucksOut: 172, spot: 4.86, contract: 4.98, avgMiles: 468, topOutbound: 'Chicago, IL', wow: 0.8 },
  { code: 'PIT', city: 'Pittsburgh', state: 'PA', country: 'US', loadsIn: 162, loadsOut: 138, trucksIn: 196, trucksOut: 152, spot: 5.28, contract: 5.36, avgMiles: 486, topOutbound: 'Chicago, IL', wow: 1.1 },
  { code: 'PHL', city: 'Philadelphia', state: 'PA', country: 'US', loadsIn: 268, loadsOut: 168, trucksIn: 246, trucksOut: 196, spot: 5.62, contract: 5.68, avgMiles: 412, topOutbound: 'Chicago, IL', wow: 2.2 },
  { code: 'JFK', city: 'New York / Long Island', state: 'NY', country: 'US', loadsIn: 312, loadsOut: 142, trucksIn: 268, trucksOut: 186, spot: 6.12, contract: 6.24, avgMiles: 386, topOutbound: 'Harrisburg, PA', wow: 3.1 },
  { code: 'BUF', city: 'Buffalo', state: 'NY', country: 'US', loadsIn: 128, loadsOut: 142, trucksIn: 148, trucksOut: 118, spot: 5.42, contract: 5.58, avgMiles: 342, topOutbound: 'Toronto, ON', wow: 1.6 },
  { code: 'BOS', city: 'Boston', state: 'MA', country: 'US', loadsIn: 186, loadsOut: 96, trucksIn: 168, trucksOut: 92, spot: 5.94, contract: 6.42, avgMiles: 412, topOutbound: 'Harrisburg, PA', wow: 2.6 },
  { code: 'RIC', city: 'Richmond', state: 'VA', country: 'US', loadsIn: 132, loadsOut: 108, trucksIn: 156, trucksOut: 98, spot: 5.36, contract: 5.52, avgMiles: 386, topOutbound: 'Atlanta, GA', wow: 0.9 },
  { code: 'GSP', city: 'Greenville / Spartanburg', state: 'SC', country: 'US', loadsIn: 146, loadsOut: 92, trucksIn: 158, trucksOut: 124, spot: 4.64, contract: 4.78, avgMiles: 412, topOutbound: 'Atlanta, GA', wow: 1.3 },
  { code: 'CHS', city: 'Charleston', state: 'SC', country: 'US', loadsIn: 118, loadsOut: 62, trucksIn: 116, trucksOut: 96, spot: 4.72, contract: 4.86, avgMiles: 486, topOutbound: 'Atlanta, GA', wow: -0.5 },
  { code: 'RDU', city: 'Raleigh', state: 'NC', country: 'US', loadsIn: 148, loadsOut: 108, trucksIn: 168, trucksOut: 132, spot: 4.68, contract: 4.88, avgMiles: 412, topOutbound: 'Atlanta, GA', wow: 1.2 },
  { code: 'GSO', city: 'Greensboro', state: 'NC', country: 'US', loadsIn: 112, loadsOut: 86, trucksIn: 128, trucksOut: 98, spot: 4.58, contract: 4.82, avgMiles: 386, topOutbound: 'Charlotte, NC', wow: 0.4 },
  { code: 'BHM', city: 'Birmingham', state: 'AL', country: 'US', loadsIn: 142, loadsOut: 54, trucksIn: 152, trucksOut: 96, spot: 5.24, contract: 5.18, avgMiles: 386, topOutbound: 'Atlanta, GA', wow: 0.8 },
  { code: 'HSV', city: 'Huntsville', state: 'AL', country: 'US', loadsIn: 96, loadsOut: 42, trucksIn: 102, trucksOut: 68, spot: 5.36, contract: 5.32, avgMiles: 412, topOutbound: 'Nashville, TN', wow: 1.4 },
  { code: 'SLC', city: 'Salt Lake City', state: 'UT', country: 'US', loadsIn: 208, loadsOut: 97, trucksIn: 146, trucksOut: 118, spot: 4.51, contract: 4.86, avgMiles: 624, topOutbound: 'Los Angeles, CA', wow: 1.6 },
  { code: 'LAS', city: 'Las Vegas', state: 'NV', country: 'US', loadsIn: 168, loadsOut: 64, trucksIn: 112, trucksOut: 96, spot: 4.46, contract: 4.68, avgMiles: 386, topOutbound: 'Los Angeles, CA', wow: 2.8 },
  { code: 'RNO', city: 'Reno', state: 'NV', country: 'US', loadsIn: 96, loadsOut: 42, trucksIn: 68, trucksOut: 56, spot: 4.38, contract: 4.62, avgMiles: 468, topOutbound: 'Stockton, CA', wow: 1.2 },
  { code: 'PDX', city: 'Portland', state: 'OR', country: 'US', loadsIn: 148, loadsOut: 92, trucksIn: 124, trucksOut: 106, spot: 4.22, contract: 4.58, avgMiles: 486, topOutbound: 'Seattle, WA', wow: -0.6 },
  { code: 'GEG', city: 'Spokane', state: 'WA', country: 'US', loadsIn: 82, loadsOut: 48, trucksIn: 68, trucksOut: 58, spot: 4.28, contract: 4.66, avgMiles: 542, topOutbound: 'Seattle, WA', wow: 0.4 },
  { code: 'MSP', city: 'Minneapolis', state: 'MN', country: 'US', loadsIn: 186, loadsOut: 196, trucksIn: 248, trucksOut: 148, spot: 5.02, contract: 5.24, avgMiles: 568, topOutbound: 'Chicago, IL', wow: 1.4 },
  { code: 'MKE', city: 'Milwaukee', state: 'WI', country: 'US', loadsIn: 152, loadsOut: 168, trucksIn: 212, trucksOut: 128, spot: 4.92, contract: 5.14, avgMiles: 486, topOutbound: 'Chicago, IL', wow: 0.9 },
  { code: 'OKC', city: 'Oklahoma City', state: 'OK', country: 'US', loadsIn: 118, loadsOut: 96, trucksIn: 148, trucksOut: 92, spot: 4.68, contract: 5.08, avgMiles: 542, topOutbound: 'Dallas, TX', wow: 1.1 },
  { code: 'ELK', city: 'Elkhart / Fort Wayne', state: 'IN', country: 'US', loadsIn: 126, loadsOut: 148, trucksIn: 196, trucksOut: 118, spot: 5.32, contract: 5.22, avgMiles: 468, topOutbound: 'Chicago, IL', wow: 1.7 },
  { code: 'GRR', city: 'Grand Rapids', state: 'MI', country: 'US', loadsIn: 132, loadsOut: 118, trucksIn: 178, trucksOut: 112, spot: 4.52, contract: 4.72, avgMiles: 412, topOutbound: 'Chicago, IL', wow: 1.2 },
  { code: 'YQM', city: 'Moncton', state: 'NB', country: 'CA', loadsIn: 62, loadsOut: 78, trucksIn: 74, trucksOut: 62, spot: 3.24, contract: 3.48, avgMiles: 542, topOutbound: 'Montreal, QC', wow: 0.6 },
  { code: 'YHZ', city: 'Halifax', state: 'NS', country: 'CA', loadsIn: 74, loadsOut: 92, trucksIn: 86, trucksOut: 72, spot: 3.36, contract: 3.62, avgMiles: 686, topOutbound: 'Montreal, QC', wow: 1.1 },
  { code: 'YWG', city: 'Winnipeg', state: 'MB', country: 'CA', loadsIn: 146, loadsOut: 178, trucksIn: 122, trucksOut: 137, spot: 2.82, contract: 2.95, avgMiles: 742, topOutbound: 'Toronto, ON', wow: -0.8 },
  { code: 'YXE', city: 'Saskatoon', state: 'SK', country: 'CA', loadsIn: 89, loadsOut: 97, trucksIn: 116, trucksOut: 108, spot: 2.18, contract: 2.33, avgMiles: 624, topOutbound: 'Calgary, AB', wow: -1.2 },
  { code: 'YQB', city: 'Quebec City', state: 'PQ', country: 'CA', loadsIn: 118, loadsOut: 132, trucksIn: 126, trucksOut: 118, spot: 3.84, contract: 3.58, avgMiles: 386, topOutbound: 'Montreal, QC', wow: 0.4 },
  { code: 'MTY', city: 'Monterrey', state: 'NL', country: 'MX', loadsIn: 512, loadsOut: 624, trucksIn: 342, trucksOut: 428, spot: 2.88, contract: 3.14, avgMiles: 486, topOutbound: 'Laredo, TX', wow: 3.4 },
  { code: 'SLW', city: 'Saltillo', state: 'CU', country: 'MX', loadsIn: 268, loadsOut: 324, trucksIn: 186, trucksOut: 232, spot: 2.82, contract: 3.08, avgMiles: 542, topOutbound: 'Laredo, TX', wow: 2.8 },
  { code: 'NLD', city: 'Nuevo Laredo', state: 'TM', country: 'MX', loadsIn: 342, loadsOut: 468, trucksIn: 224, trucksOut: 312, spot: 2.68, contract: 2.96, avgMiles: 286, topOutbound: 'Laredo, TX', wow: 4.2 },
  { code: 'REX', city: 'Reynosa', state: 'TM', country: 'MX', loadsIn: 224, loadsOut: 286, trucksIn: 148, trucksOut: 196, spot: 2.62, contract: 2.92, avgMiles: 312, topOutbound: 'McAllen, TX', wow: 2.4 },
  { code: 'CJS', city: 'Ciudad Juárez', state: 'CH', country: 'MX', loadsIn: 312, loadsOut: 396, trucksIn: 212, trucksOut: 276, spot: 2.96, contract: 3.26, avgMiles: 342, topOutbound: 'El Paso, TX', wow: 3.1 },
  { code: 'CUU', city: 'Chihuahua', state: 'CH', country: 'MX', loadsIn: 148, loadsOut: 186, trucksIn: 112, trucksOut: 138, spot: 2.88, contract: 3.18, avgMiles: 486, topOutbound: 'Ciudad Juárez, CH', wow: 1.6 },
  { code: 'TIJ', city: 'Tijuana', state: 'BN', country: 'MX', loadsIn: 224, loadsOut: 286, trucksIn: 168, trucksOut: 212, spot: 3.08, contract: 3.38, avgMiles: 268, topOutbound: 'Otay Mesa, CA', wow: 2.2 },
  { code: 'GDL', city: 'Guadalajara', state: 'JA', country: 'MX', loadsIn: 286, loadsOut: 262, trucksIn: 232, trucksOut: 218, spot: 2.56, contract: 2.88, avgMiles: 624, topOutbound: 'Monterrey, NL', wow: 1.2 },
  { code: 'MEX', city: 'Mexico City', state: 'DF', country: 'MX', loadsIn: 386, loadsOut: 296, trucksIn: 358, trucksOut: 312, spot: 2.38, contract: 2.68, avgMiles: 568, topOutbound: 'Monterrey, NL', wow: 0.8 },
  { code: 'TLC', city: 'Toluca', state: 'MX', country: 'MX', loadsIn: 248, loadsOut: 224, trucksIn: 226, trucksOut: 204, spot: 2.44, contract: 2.74, avgMiles: 542, topOutbound: 'Mexico City, DF', wow: 0.6 },
  { code: 'SIL', city: 'Silao / León', state: 'GJ', country: 'MX', loadsIn: 224, loadsOut: 268, trucksIn: 168, trucksOut: 204, spot: 2.64, contract: 2.94, avgMiles: 586, topOutbound: 'Laredo, TX', wow: 1.9 },
  { code: 'QRO', city: 'Querétaro', state: 'QE', country: 'MX', loadsIn: 248, loadsOut: 286, trucksIn: 186, trucksOut: 214, spot: 2.68, contract: 2.98, avgMiles: 624, topOutbound: 'Laredo, TX', wow: 2.6 },
  { code: 'SLP', city: 'San Luis Potosí', state: 'SL', country: 'MX', loadsIn: 224, loadsOut: 268, trucksIn: 176, trucksOut: 206, spot: 2.58, contract: 2.88, avgMiles: 568, topOutbound: 'Monterrey, NL', wow: 2.1 },
  { code: 'HMO', city: 'Hermosillo', state: 'SO', country: 'MX', loadsIn: 142, loadsOut: 186, trucksIn: 118, trucksOut: 148, spot: 2.92, contract: 3.22, avgMiles: 412, topOutbound: 'Nogales, AZ', wow: 1.4 },
  { code: 'PBC', city: 'Puebla', state: 'PU', country: 'MX', loadsIn: 186, loadsOut: 168, trucksIn: 162, trucksOut: 148, spot: 2.44, contract: 2.74, avgMiles: 486, topOutbound: 'Mexico City, DF', wow: 0.4 },
]

/** Loads per truck for a metro market. */
export function cityRatio(city: CityMarket) {
  return city.loadsIn / Math.max(1, city.trucksIn)
}

export function cityTone(city: CityMarket): MarketTone {
  const ratio = cityRatio(city)
  if (ratio >= 1.35) return 'tight'
  if (ratio >= 0.85) return 'balanced'
  return 'soft'
}

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
