import type { InsightRoute } from '@/data/marketInsights'

export type InsightSubscription = 'load-truck' | 'coverage' | 'rate' | 'fuel'

export type PreferredLane = {
  id: string
  origin: string
  destination: string
}

export type InsightPreferenceProfile = {
  id: string
  name: string
  ownerType: 'user' | 'team'
  description: string
  areaCodes: string[]
  lanes: PreferredLane[]
  deliveryTimes: string[]
  subscriptions: InsightSubscription[]
}

export type InsightPreferences = {
  activeProfileId: string
  profiles: InsightPreferenceProfile[]
}

export const subscriptionDetails: Record<
  InsightSubscription,
  { label: string; description: string }
> = {
  'load-truck': {
    label: 'Load-to-truck ratio',
    description: 'Capacity pressure and truck availability changes in selected markets.',
  },
  coverage: {
    label: 'State & province coverage',
    description: 'Hard-to-cover and easy-to-cover signals for each preferred region.',
  },
  rate: {
    label: 'Lane rate movement',
    description: 'Alerts when spot or contract rates increase or decrease on a preferred lane.',
  },
  fuel: {
    label: 'Fuel surcharge changes',
    description: 'Material fuel surcharge movements affecting selected regions and lanes.',
  },
}

export const defaultInsightPreferences: InsightPreferences = {
  activeProfileId: 'personal',
  profiles: [
    {
      id: 'personal',
      name: 'My market watch',
      ownerType: 'user',
      description: 'Sukhdeep Dhillon · personal sourcing coverage',
      areaCodes: [
        'CA',
        'TX',
        'IL',
        'GA',
        'FL',
        'AZ',
        'TN',
        'OH',
        'PA',
        'NJ',
        'IN',
        'MI',
        'NC',
        'CO',
        'ON',
        'PQ',
        'NL',
        'TM',
        'CH',
        'CU',
      ],
      lanes: [
        { id: 'ca-tx', origin: 'CA', destination: 'TX' },
        { id: 'tx-nl', origin: 'TX', destination: 'NL' },
        { id: 'on-tx', origin: 'ON', destination: 'TX' },
        { id: 'il-ga', origin: 'IL', destination: 'GA' },
        { id: 'tx-ga', origin: 'TX', destination: 'GA' },
        { id: 'ca-az', origin: 'CA', destination: 'AZ' },
      ],
      deliveryTimes: ['09:00', '14:00'],
      subscriptions: ['load-truck', 'coverage', 'rate', 'fuel'],
    },
    {
      id: 'north-america-team',
      name: 'North America brokerage',
      ownerType: 'team',
      description: 'Shared with 18 brokerage team members',
      areaCodes: [
        'CA',
        'TX',
        'IL',
        'GA',
        'FL',
        'AZ',
        'TN',
        'OH',
        'PA',
        'NJ',
        'NY',
        'IN',
        'MI',
        'NC',
        'SC',
        'CO',
        'WA',
        'UT',
        'MO',
        'AL',
        'ON',
        'PQ',
        'AB',
        'BC',
        'NL',
        'TM',
        'CH',
        'CU',
        'BN',
        'QE',
        'GJ',
        'JA',
      ],
      lanes: [
        { id: 'on-tx-team', origin: 'ON', destination: 'TX' },
        { id: 'tx-nl-team', origin: 'TX', destination: 'NL' },
        { id: 'nl-mi-team', origin: 'NL', destination: 'MI' },
        { id: 'il-ga-team', origin: 'IL', destination: 'GA' },
        { id: 'ca-az-team', origin: 'CA', destination: 'AZ' },
        { id: 'tx-co-team', origin: 'TX', destination: 'CO' },
        { id: 'nj-ga-team', origin: 'NJ', destination: 'GA' },
        { id: 'bc-wa-team', origin: 'BC', destination: 'WA' },
      ],
      deliveryTimes: ['08:30', '13:30'],
      subscriptions: ['load-truck', 'coverage', 'rate'],
    },
  ],
}

const stopCode = /,\s([A-Z]{2})$/

export function routeAreaCodes(route: InsightRoute) {
  return [route.origin.match(stopCode)?.[1], route.destination.match(stopCode)?.[1]]
    .filter((code): code is string => Boolean(code))
    .map((code) => (code === 'QC' ? 'PQ' : code))
}

export function routeMatchesProfile(route: InsightRoute, profile: InsightPreferenceProfile) {
  const [origin, destination] = routeAreaCodes(route)
  if (!origin || !destination) return false
  const exactLane = profile.lanes.some(
    (lane) => lane.origin === origin && lane.destination === destination
  )
  return exactLane || (profile.areaCodes.includes(origin) && profile.areaCodes.includes(destination))
}

export type InsightAlert = {
  id: string
  sentAt: string
  type: InsightSubscription
  title: string
  detail: string
  market: string
  severity: 'critical' | 'warning' | 'info' | 'success'
  profileId: string
  read: boolean
}

export const insightAlerts: InsightAlert[] = [
  {
    id: 'alert-0821-1400',
    sentAt: 'Aug 21, 2026 · 2:00 PM',
    type: 'rate',
    title: 'California → Texas spot rate increased 8.2%',
    detail: 'The preferred lane moved above your 5% change threshold. Current modeled spot is $4.21/mi.',
    market: 'CA → TX',
    severity: 'critical',
    profileId: 'personal',
    read: false,
  },
  {
    id: 'alert-0821-0900',
    sentAt: 'Aug 21, 2026 · 9:00 AM',
    type: 'load-truck',
    title: 'Ontario capacity tightened before the morning tender window',
    detail: 'Inbound load-to-truck ratio rose to 1.16× with outbound Texas demand also strengthening.',
    market: 'ON → TX',
    severity: 'warning',
    profileId: 'personal',
    read: false,
  },
  {
    id: 'alert-0820-1400',
    sentAt: 'Aug 20, 2026 · 2:00 PM',
    type: 'coverage',
    title: 'Texas moved to hard-to-cover',
    detail: 'Carrier acceptance softened while inbound postings increased across your selected Texas markets.',
    market: 'TX',
    severity: 'warning',
    profileId: 'personal',
    read: true,
  },
  {
    id: 'alert-0820-0900',
    sentAt: 'Aug 20, 2026 · 9:00 AM',
    type: 'fuel',
    title: 'Fuel surcharge changed on two preferred lanes',
    detail: 'The modeled surcharge increased $0.04/mi for California–Texas and $0.03/mi for Ontario–Texas.',
    market: '2 lanes',
    severity: 'info',
    profileId: 'personal',
    read: true,
  },
  {
    id: 'alert-0819-1400',
    sentAt: 'Aug 19, 2026 · 2:00 PM',
    type: 'coverage',
    title: 'Georgia coverage returned to balanced',
    detail: 'Available trucks recovered through the afternoon and the market moved out of hard-to-cover status.',
    market: 'GA',
    severity: 'success',
    profileId: 'personal',
    read: true,
  },
  {
    id: 'alert-0819-0900',
    sentAt: 'Aug 19, 2026 · 9:00 AM',
    type: 'load-truck',
    title: 'Chicago outbound ratio climbed to 1.10×',
    detail: 'Outbound postings rose 6% overnight while available trucks in the metro fell by 42.',
    market: 'IL',
    severity: 'warning',
    profileId: 'personal',
    read: true,
  },
  {
    id: 'alert-0818-1400',
    sentAt: 'Aug 18, 2026 · 2:00 PM',
    type: 'rate',
    title: 'Elizabeth, NJ → Atlanta, GA up 4.1% week over week',
    detail: 'Paid spot reached $2,200 per load against a $1,685–$2,776 market range.',
    market: 'NJ → GA',
    severity: 'warning',
    profileId: 'personal',
    read: true,
  },
  {
    id: 'alert-0818-0900',
    sentAt: 'Aug 18, 2026 · 9:00 AM',
    type: 'coverage',
    title: 'Phoenix and Denver flagged hard to cover',
    detail: 'Both markets are running above 2.5 loads per truck on inbound van freight.',
    market: 'AZ · CO',
    severity: 'critical',
    profileId: 'personal',
    read: true,
  },
  {
    id: 'alert-0817-1400',
    sentAt: 'Aug 17, 2026 · 2:00 PM',
    type: 'fuel',
    title: 'National fuel surcharge held at $0.68/mi',
    detail: 'No change for a second week. Lane pricing models were left untouched.',
    market: 'National',
    severity: 'info',
    profileId: 'personal',
    read: true,
  },
  {
    id: 'alert-0817-0900',
    sentAt: 'Aug 17, 2026 · 9:00 AM',
    type: 'rate',
    title: 'Lakeland, FL → Chicago, IL reefer softened 2.1%',
    detail: 'Produce volume eased out of central Florida, opening room to re-bid the lane.',
    market: 'FL → IL',
    severity: 'success',
    profileId: 'personal',
    read: true,
  },
  {
    id: 'alert-0816-0900',
    sentAt: 'Aug 16, 2026 · 9:00 AM',
    type: 'load-truck',
    title: 'Ontario truck postings recovered over the weekend',
    detail: 'Inbound ratio fell back to 0.94×, and cross-border tenders cleared without escalation.',
    market: 'ON',
    severity: 'success',
    profileId: 'personal',
    read: true,
  },
  {
    id: 'team-alert-0821',
    sentAt: 'Aug 21, 2026 · 1:30 PM',
    type: 'rate',
    title: 'Chicago → Atlanta crossed the team escalation trigger',
    detail: 'Spot pricing reached $3.46/mi. Preferred carrier outreach is recommended before broad release.',
    market: 'IL → GA',
    severity: 'critical',
    profileId: 'north-america-team',
    read: false,
  },
  {
    id: 'team-alert-0821-0830',
    sentAt: 'Aug 21, 2026 · 8:30 AM',
    type: 'coverage',
    title: 'Vancouver, BC is the softest market in the team footprint',
    detail: 'Inbound ratio sits at 0.88× with spot $0.48/mi below contract. Good week to bid capacity.',
    market: 'BC',
    severity: 'success',
    profileId: 'north-america-team',
    read: false,
  },
  {
    id: 'team-alert-0820-1330',
    sentAt: 'Aug 20, 2026 · 1:30 PM',
    type: 'load-truck',
    title: 'Southeast capacity tightened across three team markets',
    detail: 'Georgia, South Carolina, and Alabama all moved above 1.35 loads per truck on van freight.',
    market: 'GA · SC · AL',
    severity: 'warning',
    profileId: 'north-america-team',
    read: true,
  },
  {
    id: 'team-alert-0819-0830',
    sentAt: 'Aug 19, 2026 · 8:30 AM',
    type: 'rate',
    title: 'Houston → Denver flatbed up 2.4%',
    detail: 'Paid spot moved to $4,018 per load. Two dedicated carriers were asked to hold committed capacity.',
    market: 'TX → CO',
    severity: 'warning',
    profileId: 'north-america-team',
    read: true,
  },
  {
    id: 'team-alert-0818-1330',
    sentAt: 'Aug 18, 2026 · 1:30 PM',
    type: 'coverage',
    title: 'Alberta inbound coverage improved after rail congestion cleared',
    detail: 'Calgary and Edmonton both returned to balanced with truck postings up 11%.',
    market: 'AB',
    severity: 'success',
    profileId: 'north-america-team',
    read: true,
  },
]
