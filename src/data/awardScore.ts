import type { BidOffer, LoadDetail } from '@/data/loadDetail'
import type { AwardProfile, ScoreWeights } from '@/data/automationProfiles'

export type BidTrust = {
  highwayOnboarded: boolean
  highwayVerifiedEmail: boolean
  highwayWatchlist: boolean
  tmsOnTime: number
  tmsClaims: number
  genlogsAlerts: number
  internalRating: number
}

export type ScoredBid = {
  bid: BidOffer
  trust: BidTrust
  allIn: number
  score: number
  overLimit: boolean
  suggested: boolean
  confirmTo: string
  reasons: string[]
}

export type EligibilityItem = { id: string; label: string; ok: boolean }

const toNum = (v?: string) => Number((v ?? '').replace(/[^0-9.]/g, '')) || 0

function seedOf(s: string) {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return h
}

export function trustFor(bid: BidOffer): BidTrust {
  if (bid.internalRating != null) {
    return {
      highwayOnboarded: bid.highwayOnboarded ?? false,
      highwayVerifiedEmail: bid.highwayVerifiedEmail ?? false,
      highwayWatchlist: bid.highwayWatchlist ?? false,
      tmsOnTime: bid.tmsOnTime ?? 90,
      tmsClaims: bid.tmsClaims ?? 0,
      genlogsAlerts: bid.genlogsAlerts ?? 0,
      internalRating: bid.internalRating,
    }
  }
  const seed = seedOf(bid.carrier + bid.mc)
  return {
    highwayOnboarded: seed % 3 !== 0,
    highwayVerifiedEmail: seed % 4 !== 0,
    highwayWatchlist: seed % 11 === 0,
    tmsOnTime: 82 + (seed % 17),
    tmsClaims: seed % 7 === 0 ? 1 : 0,
    genlogsAlerts: seed % 5 === 0 ? 1 : 0,
    internalRating: 2 + (seed % 4),
  }
}

export function scoreBids(
  bids: BidOffer[],
  maxBuy: string,
  weights: ScoreWeights = { rate: 25, highway: 25, onboarding: 15, monitoring: 15, internalRating: 20 }
): ScoredBid[] {
  const limit = toNum(maxBuy)
  const limitOn = limit > 0
  const totalW = Math.max(1, weights.rate + weights.highway + weights.onboarding + weights.monitoring + weights.internalRating)
  const under = bids
    .map((bid) => toNum(bid.allIn ?? bid.amount))
    .filter((n) => n > 0 && (!limitOn || n <= limit))
  const cheapest = under.length ? Math.min(...under) : 0

  const scored = bids.map((bid) => {
    const trust = trustFor(bid)
    const allIn = toNum(bid.allIn ?? bid.amount)
    const overLimit = limitOn && allIn > limit
    const ratePts = overLimit || cheapest === 0 ? 0 : Math.max(0, 100 - ((allIn - cheapest) / cheapest) * 80)
    const hwyPts = (trust.highwayOnboarded ? 50 : 0) + (trust.highwayVerifiedEmail ? 50 : 0) - (trust.highwayWatchlist ? 40 : 0)
    const onboardPts = trust.highwayOnboarded ? 100 : 35
    const monPts = Math.max(0, 100 - trust.genlogsAlerts * 40 - trust.tmsClaims * 25)
    const rateNorm = Math.min(100, ratePts)
    const hwyNorm = Math.max(0, Math.min(100, hwyPts))
    const score = overLimit
      ? 0
      : Math.round(
          (rateNorm * weights.rate +
            hwyNorm * weights.highway +
            onboardPts * weights.onboarding +
            monPts * weights.monitoring +
            (trust.internalRating / 5) * 100 * weights.internalRating) /
            totalW
        )
    const confirmTo = trust.highwayVerifiedEmail && bid.email ? bid.email : bid.email ?? 'dispatch@carrier.example'
    const reasons: string[] = []
    if (overLimit) reasons.push(`Over the $${limit.toFixed(2)} hard limit`)
    else {
      if (allIn === cheapest) reasons.push('Lowest all-in under the hard limit')
      if (trust.internalRating >= 4) reasons.push(`Internal rating ${trust.internalRating}/5`)
      if (trust.highwayOnboarded && trust.highwayVerifiedEmail) reasons.push('Highway onboarded · verified email')
      if (trust.tmsOnTime >= 92) reasons.push(`TMS on-time ${trust.tmsOnTime}%`)
      if (trust.genlogsAlerts === 0) reasons.push('GenLogs clear')
      if (trust.highwayWatchlist) reasons.push('Highway watchlist — review')
    }
    return { bid, trust, allIn, score, overLimit, suggested: false, confirmTo, reasons }
  })

  const eligible = scored.filter((s) => !s.overLimit).sort((a, b) => b.score - a.score || a.allIn - b.allIn)
  if (eligible[0]) eligible[0].suggested = true
  const order = new Map(scored.map((s) => [s.bid.id, s]))
  return [...eligible, ...scored.filter((s) => s.overLimit)].map((s) => order.get(s.bid.id)!)
}

export function awardEligibility(detail: LoadDetail, profile: AwardProfile): EligibilityItem[] {
  const maxSet = Boolean(detail.maxBuy) && detail.maxBuy !== '—' && detail.maxBuy !== '$0.00'
  const scored = scoreBids(detail.bids, detail.maxBuy, profile.weights)
  const top = scored.find((s) => s.suggested)
  const boardOk = detail.autoEligible.board || !profile.conditions.includes('board')
  const customerOk = detail.autoEligible.customer || !profile.conditions.includes('customer')
  const laneOk = detail.autoEligible.lane || !profile.conditions.includes('lane')
  const items: EligibilityItem[] = []
  if (profile.conditions.includes('maxbuy'))
    items.push({ id: 'maxbuy', label: 'Max buy set', ok: maxSet })
  if (profile.conditions.includes('cmt'))
    items.push({ id: 'cmt', label: 'CMT checks clear', ok: Boolean(detail.cmtCleared) })
  if (profile.conditions.includes('highway'))
    items.push({
      id: 'highway',
      label: 'Highway verified email on the recommended carrier',
      ok: Boolean(top?.trust.highwayVerifiedEmail),
    })
  if (profile.conditions.includes('board'))
    items.push({ id: 'board', label: 'Planning board opted into auto', ok: boardOk })
  if (profile.conditions.includes('customer'))
    items.push({ id: 'customer', label: 'Customer opted into auto', ok: customerOk })
  if (profile.conditions.includes('lane'))
    items.push({ id: 'lane', label: 'Lane opted into auto', ok: laneOk })
  return items
}

export function canAutoAward(detail: LoadDetail, profile: AwardProfile) {
  const items = awardEligibility(detail, profile)
  const scored = scoreBids(detail.bids, detail.maxBuy, profile.weights)
  const top = scored.find((s) => s.suggested)
  return {
    ok: items.every((i) => i.ok) && Boolean(top) && (top?.score ?? 0) >= profile.threshold,
    items,
    top,
  }
}

export const OVERRIDE_REASONS = [
  'Customer requested',
  'Lane history',
  'Equipment fit',
  'Service recovery',
  'Other',
] as const
