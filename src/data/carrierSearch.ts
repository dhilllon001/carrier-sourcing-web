import { carrierList, type CarrierListItem } from '@/data/carriers'

export type CarrierLaneHistory = {
  origin: string
  destination: string
  loads: number
  lastRate: number
}

export type SearchCarrier = CarrierListItem & {
  relationship: 'Preferred' | 'Used before' | 'Network'
  source: 'My carriers' | 'Team book' | 'Highway'
  acceptance: number
  responseMinutes: number
  insurance: 'Active' | 'Expiring'
  whatsapp: boolean
  lanes: CarrierLaneHistory[]
}

type SearchProfile = Omit<SearchCarrier, keyof CarrierListItem>

const profiles: Record<string, SearchProfile> = {
  'c-micra': {
    relationship: 'Preferred',
    source: 'My carriers',
    acceptance: 97,
    responseMinutes: 8,
    insurance: 'Active',
    whatsapp: true,
    lanes: [
      { origin: 'Brampton, ON', destination: 'Woodstock, ON', loads: 42, lastRate: 685 },
      { origin: 'Brampton, ON', destination: 'London, ON', loads: 31, lastRate: 740 },
    ],
  },
  'c-roadlink': {
    relationship: 'Preferred',
    source: 'My carriers',
    acceptance: 94,
    responseMinutes: 12,
    insurance: 'Active',
    whatsapp: true,
    lanes: [
      { origin: 'Brampton, ON', destination: 'Woodstock, ON', loads: 36, lastRate: 710 },
      { origin: 'Mississauga, ON', destination: 'Montreal, QC', loads: 24, lastRate: 1325 },
    ],
  },
  'c-ontario': {
    relationship: 'Used before',
    source: 'Team book',
    acceptance: 91,
    responseMinutes: 19,
    insurance: 'Active',
    whatsapp: false,
    lanes: [
      { origin: 'Brampton, ON', destination: 'Woodstock, ON', loads: 18, lastRate: 695 },
      { origin: 'Toronto, ON', destination: 'Detroit, MI', loads: 12, lastRate: 1180 },
    ],
  },
  'c-smart': {
    relationship: 'Used before',
    source: 'Team book',
    acceptance: 93,
    responseMinutes: 14,
    insurance: 'Active',
    whatsapp: true,
    lanes: [
      { origin: 'Nogales, AZ', destination: 'Sedalia, MO', loads: 28, lastRate: 2860 },
      { origin: 'Seabrook, TX', destination: 'Modesto, CA', loads: 16, lastRate: 3190 },
    ],
  },
  'c-midwest': {
    relationship: 'Preferred',
    source: 'My carriers',
    acceptance: 96,
    responseMinutes: 9,
    insurance: 'Active',
    whatsapp: true,
    lanes: [
      { origin: 'Green Bay, WI', destination: 'Morris, IL', loads: 39, lastRate: 920 },
      { origin: 'Chicago, IL', destination: 'Detroit, MI', loads: 22, lastRate: 1050 },
    ],
  },
  'c-uacl': {
    relationship: 'Network',
    source: 'Highway',
    acceptance: 88,
    responseMinutes: 26,
    insurance: 'Expiring',
    whatsapp: false,
    lanes: [
      { origin: 'Chicago, IL', destination: 'Detroit, MI', loads: 11, lastRate: 1095 },
      { origin: 'Columbus, OH', destination: 'Detroit, MI', loads: 8, lastRate: 975 },
    ],
  },
  'c-manney': {
    relationship: 'Preferred',
    source: 'My carriers',
    acceptance: 96,
    responseMinutes: 11,
    insurance: 'Active',
    whatsapp: true,
    lanes: [
      { origin: 'Laredo, TX', destination: 'Sterling Heights, MI', loads: 32, lastRate: 3420 },
      { origin: 'Nogales, AZ', destination: 'Sedalia, MO', loads: 19, lastRate: 2950 },
    ],
  },
  'c-peak': {
    relationship: 'Network',
    source: 'Highway',
    acceptance: 90,
    responseMinutes: 22,
    insurance: 'Active',
    whatsapp: true,
    lanes: [
      { origin: 'Columbus, OH', destination: 'Detroit, MI', loads: 14, lastRate: 990 },
      { origin: 'Marysville, OH', destination: 'Detroit, MI', loads: 9, lastRate: 930 },
    ],
  },
}

export const searchCarriers: SearchCarrier[] = carrierList
  .filter((carrier) => profiles[carrier.id])
  .map((carrier) => ({ ...carrier, ...profiles[carrier.id] }))

export const laneCities = Array.from(
  new Set(searchCarriers.flatMap((carrier) => carrier.lanes.flatMap((lane) => [lane.origin, lane.destination])))
).sort()

function normalizeCity(value: string) {
  return value.trim().toLowerCase().split(',')[0]
}

export function laneMatchScore(carrier: SearchCarrier, origin: string, destination: string) {
  const from = normalizeCity(origin)
  const to = normalizeCity(destination)
  if (!from && !to) return 50

  let best = 0
  for (const lane of carrier.lanes) {
    const originMatch = !from || normalizeCity(lane.origin).includes(from)
    const destinationMatch = !to || normalizeCity(lane.destination).includes(to)
    if (originMatch && destinationMatch) {
      best = Math.max(best, 88 + Math.min(10, Math.round(lane.loads / 6)))
    } else if (originMatch || destinationMatch) {
      best = Math.max(best, 64 + Math.min(12, Math.round(lane.loads / 5)))
    }
  }

  if (best === 0 && carrier.relationship !== 'Network') best = 48
  if (carrier.relationship === 'Preferred') best += 2
  return Math.min(99, best)
}

export function bestLane(carrier: SearchCarrier, origin: string, destination: string) {
  const from = normalizeCity(origin)
  const to = normalizeCity(destination)
  return (
    carrier.lanes.find(
      (lane) =>
        (!from || normalizeCity(lane.origin).includes(from)) &&
        (!to || normalizeCity(lane.destination).includes(to))
    ) ?? carrier.lanes[0]
  )
}
