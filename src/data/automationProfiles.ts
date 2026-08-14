export type ChannelId = 'internal' | 'highway' | 'email' | 'whatsapp' | 'dat' | 'loadlink'

export type ScoreWeights = {
  rate: number
  highway: number
  onboarding: number
  monitoring: number
  internalRating: number
}

export type AwardCondition = 'maxbuy' | 'cmt' | 'highway' | 'board' | 'customer' | 'lane'

export type SourcingProfile = {
  id: string
  name: string
  description: string
  channels: ChannelId[]
}

export type TenderProfile = {
  id: string
  name: string
  description: string
  weights: ScoreWeights
  threshold: number
}

export type AwardProfile = {
  id: string
  name: string
  description: string
  weights: ScoreWeights
  threshold: number
  conditions: AwardCondition[]
}

export type ProfileStore = {
  sourcing: SourcingProfile[]
  tender: TenderProfile[]
  award: AwardProfile[]
}

const KEY = 'cs-auto-profiles'

export const SEED_PROFILES: ProfileStore = {
  sourcing: [
    {
      id: 'internal-only',
      name: 'Internal only',
      description: 'Blast the approved carrier base. No public boards.',
      channels: ['internal', 'email', 'whatsapp'],
    },
    {
      id: 'internal-dat',
      name: 'Internal + DAT',
      description: 'Internal base plus a DAT posting.',
      channels: ['internal', 'email', 'dat'],
    },
    {
      id: 'max-reach',
      name: 'Maximum reach',
      description: 'Internal, Highway, DAT and Loadlink.',
      channels: ['internal', 'highway', 'email', 'whatsapp', 'dat', 'loadlink'],
    },
  ],
  tender: [
    {
      id: 'lowest-rate',
      name: 'Lowest rate',
      description: 'Weight the all-in price first. Still never the only factor.',
      weights: { rate: 50, highway: 15, onboarding: 10, monitoring: 10, internalRating: 15 },
      threshold: 55,
    },
    {
      id: 'balanced',
      name: 'Balanced',
      description: 'Even mix of rate, Highway, monitoring and internal rating.',
      weights: { rate: 25, highway: 25, onboarding: 15, monitoring: 15, internalRating: 20 },
      threshold: 60,
    },
    {
      id: 'trusted',
      name: 'Trusted carriers first',
      description: 'Internal rating and Highway scorecard lead.',
      weights: { rate: 15, highway: 25, onboarding: 15, monitoring: 15, internalRating: 30 },
      threshold: 65,
    },
  ],
  award: [
    {
      id: 'strict',
      name: 'Strict auto-award',
      description: 'All entry conditions must match. Confirmation goes to the verified email.',
      weights: { rate: 20, highway: 25, onboarding: 15, monitoring: 15, internalRating: 25 },
      threshold: 70,
      conditions: ['maxbuy', 'cmt', 'highway', 'board', 'customer', 'lane'],
    },
    {
      id: 'recommend',
      name: 'Recommend only',
      description: 'Score and stop — the broker always decides.',
      weights: { rate: 25, highway: 25, onboarding: 15, monitoring: 15, internalRating: 20 },
      threshold: 95,
      conditions: ['maxbuy'],
    },
  ],
}

function readStore(): ProfileStore {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return SEED_PROFILES
    const parsed = JSON.parse(raw) as ProfileStore
    if (!parsed.sourcing?.length || !parsed.tender?.length || !parsed.award?.length) return SEED_PROFILES
    return parsed
  } catch {
    return SEED_PROFILES
  }
}

export function loadProfiles(): ProfileStore {
  return readStore()
}

export function saveProfiles(next: ProfileStore) {
  localStorage.setItem(KEY, JSON.stringify(next))
}

export function saveSourcingProfile(profile: SourcingProfile) {
  const store = readStore()
  const i = store.sourcing.findIndex((p) => p.id === profile.id)
  if (i >= 0) store.sourcing[i] = profile
  else store.sourcing.push(profile)
  saveProfiles(store)
  return store
}
