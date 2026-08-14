/* Auto-sourcing workflows — mock configuration + run data.
   Feeds the Configuration tab on the sourcing grid. */

export type Currency = 'USD' | 'CAD' | 'MXN'

export type WorkflowStep = {
  n: number
  label: string
  value: string
  note: string
}

export type Workflow = {
  id: string
  name: string
  enabled: boolean
  blurb: string
  currency: Currency
  summary: string
  matches: string[]
  entryPoints: string[]
  steps: WorkflowStep[]
  guardrails: { label: string; value: string }[]
  stats: {
    runsToday: number
    cover: string
    auto: string
    inFlight: number
    underMaxBuy: string
  }
}

export const WORKFLOWS: Workflow[] = [
  {
    id: 'wf-spot-us',
    name: 'Spot · US Dry-Van Auto-Cover',
    enabled: true,
    currency: 'USD',
    blurb:
      'Covers domestic US spot dry-van without a human, escalating the waterfall every 20 minutes until it books.',
    summary:
      'Covers domestic US spot dry-van without a human, escalating the waterfall every 20 minutes until it books.',
    matches: [
      'Type PureBrokerage',
      'Equipment DRY-VAN',
      'US → US',
      'Order cat Spot',
      'Brokerage board accepted',
    ],
    entryPoints: [
      'Order Board — ⋮ menu → Post to Sourcing → run this workflow',
      'Sourcing portal — Overview → Find & Post → run workflow',
      'Automatic — fires when a brokerage planning board accepts a matching leg',
    ],
    steps: [
      {
        n: 1,
        label: 'Thresholds',
        value: 'Max Buy = DAT benchmark + 5%',
        note: 'rounded up to the nearest $5 · falls back to last paid on this lane if DAT has no quote\nBook Now −7.5% of Max Buy · Reject Above +25% of Max Buy',
      },
      {
        n: 2,
        label: 'Sourcing',
        value: 'Post leg to Carrier Sourcing',
        note: 'Marks Overview and Find & Post complete on the lifecycle rail',
      },
      {
        n: 3,
        label: 'Load board',
        value: 'DAT',
        note: 'Posted at Book Now, every 30 mins',
      },
      {
        n: 4,
        label: 'Broadcast',
        value: 'wave 1: top 4 immediately → wave 2: top 6 at +20 min → wave 3: all at +45 min',
        note: 'Channels: Email + WhatsApp',
      },
      {
        n: 5,
        label: 'Award',
        value: 'Any bid at or below Book Now',
        note: 'Anything above 4,000.00 USD is escalated to a human',
      },
      {
        n: 6,
        label: 'Booking',
        value: 'Create contract, send rate confirmation',
        note: 'Then the run closes and the load leaves the monitor',
      },
    ],
    guardrails: [
      { label: 'Human approval', value: 'Above 4,000.00 USD' },
      {
        label: 'Above Max Buy',
        value: 'Run halts and escalates — never auto-books over the ceiling',
      },
      { label: 'Above Reject', value: 'Bid auto-rejected, carrier notified, waterfall continues' },
      {
        label: 'Take over',
        value: 'Any user can seize a run mid-flight; automation stops and hands off state',
      },
    ],
    stats: { runsToday: 38, cover: '27 min', auto: '71%', inFlight: 0, underMaxBuy: '6.4%' },
  },
  {
    id: 'wf-canada',
    name: 'Canada Intra · Loadlink First',
    enabled: true,
    currency: 'CAD',
    blurb:
      'Loadlink-first for domestic Canadian lanes, adding DAT only if the load is still uncovered after 30 minutes.',
    summary:
      'Loadlink-first for domestic Canadian lanes, adding DAT only if the load is still uncovered after 30 minutes.',
    matches: ['Type PureBrokerage', 'Equipment DRY-VAN', 'CA → CA', 'Order cat Spot'],
    entryPoints: [
      'Order Board — ⋮ menu → Post to Sourcing → run this workflow',
      'Sourcing portal — Overview → Find & Post → run workflow',
    ],
    steps: [
      {
        n: 1,
        label: 'Thresholds',
        value: 'Max Buy = Loadlink benchmark + 4%',
        note: 'Book Now −6% of Max Buy · Reject Above +20% of Max Buy',
      },
      {
        n: 2,
        label: 'Sourcing',
        value: 'Post leg to Carrier Sourcing',
        note: 'Marks Overview and Find & Post complete on the lifecycle rail',
      },
      {
        n: 3,
        label: 'Load board',
        value: 'Loadlink, then DAT after 30 mins',
        note: 'Posted at Book Now, refreshed every 15 mins',
      },
      {
        n: 4,
        label: 'Broadcast',
        value: 'wave 1: top 6 immediately → wave 2: all at +30 min',
        note: 'Channels: Email',
      },
      {
        n: 5,
        label: 'Award',
        value: 'Any bid at or below Book Now',
        note: 'Anything above 5,000.00 CAD is escalated to a human',
      },
      {
        n: 6,
        label: 'Booking',
        value: 'Create contract, send rate confirmation',
        note: 'Then the run closes and the load leaves the monitor',
      },
    ],
    guardrails: [
      { label: 'Human approval', value: 'Above 5,000.00 CAD' },
      { label: 'Above Max Buy', value: 'Run halts and escalates' },
      { label: 'Above Reject', value: 'Bid auto-rejected, waterfall continues' },
      { label: 'Take over', value: 'Any user can seize a run mid-flight' },
    ],
    stats: { runsToday: 21, cover: '34 min', auto: '62%', inFlight: 1, underMaxBuy: '4.1%' },
  },
  {
    id: 'wf-mx',
    name: 'MX Cross-border · Managed Capacity',
    enabled: true,
    currency: 'USD',
    blurb:
      'Bonded carriers only, no public board. Always ends with a human award — cross-border exposure is never auto-booked.',
    summary:
      'Bonded carriers only, no public board. Always ends with a human award — cross-border exposure is never auto-booked.',
    matches: ['Type Managed', 'Cross-border', 'Bonded carriers only', 'Order cat Regular'],
    entryPoints: [
      'Order Board — ⋮ menu → Post to Sourcing → run this workflow',
      'Sourcing portal — Overview → Find & Post → run workflow',
    ],
    steps: [
      {
        n: 1,
        label: 'Thresholds',
        value: 'Max Buy = last paid on lane + 8%',
        note: 'Book Now −5% of Max Buy · Reject Above +15% of Max Buy',
      },
      {
        n: 2,
        label: 'Sourcing',
        value: 'Post leg to Carrier Sourcing',
        note: 'Managed capacity list only — no public marketplace',
      },
      { n: 3, label: 'Load board', value: "Don't post publicly", note: 'Private broadcast only' },
      {
        n: 4,
        label: 'Broadcast',
        value: 'wave 1: top 3 immediately → wave 2: top 6 at +25 min',
        note: 'Channels: Email + WhatsApp',
      },
      {
        n: 5,
        label: 'Award',
        value: 'Always a human award',
        note: 'Automation ranks the bids and stops for review',
      },
      {
        n: 6,
        label: 'Booking',
        value: 'Create contract after human award',
        note: 'Customs packet attached to the confirmation',
      },
    ],
    guardrails: [
      { label: 'Human approval', value: 'Every award on this workflow' },
      { label: 'Above Max Buy', value: 'Run halts and escalates' },
      { label: 'Carrier scope', value: 'Bonded and CTPAT carriers only' },
      { label: 'Take over', value: 'Any user can seize a run mid-flight' },
    ],
    stats: { runsToday: 12, cover: '58 min', auto: '0%', inFlight: 1, underMaxBuy: '2.0%' },
  },
  {
    id: 'wf-reefer',
    name: 'Reefer · Premium Carriers Only',
    enabled: false,
    currency: 'USD',
    blurb:
      'Paused. Temperature-controlled loads to a vetted premium list, wider ceiling and no public posting.',
    summary:
      'Paused. Temperature-controlled loads to a vetted premium list, wider ceiling and no public posting.',
    matches: ['Equipment REEFER', 'US → US', 'Premium carrier list'],
    entryPoints: ['Sourcing portal — Overview → Find & Post → run workflow'],
    steps: [
      {
        n: 1,
        label: 'Thresholds',
        value: 'Max Buy = DAT benchmark + 12%',
        note: 'Book Now −4% of Max Buy · Reject Above +30% of Max Buy',
      },
      { n: 2, label: 'Sourcing', value: 'Post leg to Carrier Sourcing', note: 'Premium list only' },
      { n: 3, label: 'Load board', value: "Don't post publicly", note: 'Private broadcast only' },
      {
        n: 4,
        label: 'Broadcast',
        value: 'wave 1: top 3 immediately → wave 2: top 6 at +30 min',
        note: 'Channels: Email',
      },
      { n: 5, label: 'Award', value: 'Always a human award', note: 'Reefer breakdown risk review' },
      {
        n: 6,
        label: 'Booking',
        value: 'Create contract, send rate confirmation',
        note: 'Temp log requirement attached',
      },
    ],
    guardrails: [
      { label: 'Human approval', value: 'Every award on this workflow' },
      { label: 'Above Max Buy', value: 'Run halts and escalates' },
      { label: 'Carrier scope', value: 'Premium reefer list only' },
      { label: 'Take over', value: 'Any user can seize a run mid-flight' },
    ],
    stats: { runsToday: 0, cover: '—', auto: '—', inFlight: 0, underMaxBuy: '—' },
  },
]

/* ── Live runs ─────────────────────────────────────────────── */

export type RunState = 'needs-you' | 'covered'
export type TraceState = 'done' | 'live' | 'todo'

export type RunBid = {
  carrier: string
  mc: string
  dot: string
  at: string
  amount: number
  delta: number
  outcome: 'held' | 'awarded' | 'rejected' | 'live'
}

export type Run = {
  id: string
  runNo: string
  workflow: string
  state: RunState
  clock: string
  probill: string
  customer: string
  order: string
  po: string
  origin: string
  destination: string
  miles: number
  equipment: string
  currency: Currency
  bars: ('done' | 'blocked' | 'todo')[]
  footLabel: string
  footValue: string
  metrics: {
    maxBuy: number
    maxBuyNote: string
    bookNow: number
    bookNowNote: string
    bestBid: number
    bestBidNote: string
    elapsed: string
    elapsedNote: string
    reached: number
    reachedNote: string
    saved: number
    savedNote: string
  }
  stagesDone: string
  trace: { title: string; at: string; detail: string; state: TraceState }[]
  waves: { title: string; note: string; state: 'sent' | 'pending'; at: string }[]
  awardRule: string
  bids: RunBid[]
}

export const RUNS: Run[] = [
  {
    id: 'run-4471',
    runNo: 'R-4471',
    workflow: 'Spot · US Dry-Van Auto-Cover',
    state: 'covered',
    clock: '00:59',
    probill: '11483813',
    customer: 'STORA-ENSO',
    order: '11318789',
    po: '933502612',
    origin: 'Seabrook, TX',
    destination: 'Modesto, CA',
    miles: 1583.17,
    equipment: 'DRY-VAN',
    currency: 'USD',
    bars: ['done', 'done', 'done', 'done'],
    footLabel: 'Booked',
    footValue: '3,190.05 USD',
    metrics: {
      maxBuy: 3475,
      maxBuyNote: 'DAT benchmark + 5%',
      bookNow: 3214.38,
      bookNowNote: 'auto-award at or below',
      bestBid: 3190.05,
      bestBidNote: '3 live bids',
      elapsed: '00:59',
      elapsedNote: 'avg cover 27 min',
      reached: 10,
      reachedNote: '2 of 3 waves',
      saved: 284.95,
      savedNote: 'against Max Buy',
    },
    stagesDone: '6/7 stages',
    trace: [
      {
        title: 'Bidding thresholds',
        at: '+00:04',
        detail: 'Max Buy 3,475.00 USD · Book Now 3,214.38 · Reject Above 4,343.75 — DAT + 5%',
        state: 'done',
      },
      {
        title: 'Posted to Sourcing',
        at: '+00:07',
        detail: 'Leg moved into the Sourcing stage · Overview and Find & Post marked complete',
        state: 'done',
      },
      {
        title: 'Posted to load board',
        at: '+00:12',
        detail: 'DAT at 3,214.38 USD, refreshing every 30 mins',
        state: 'done',
      },
      {
        title: 'Broadcast to carriers',
        at: '+00:16',
        detail: '2 of 3 waves sent · 4 → 6 carriers via Email + WhatsApp',
        state: 'done',
      },
      {
        title: 'Offers & bids',
        at: '+00:22',
        detail: '3 bids received · auto-accept at or below 3,214.38',
        state: 'done',
      },
      {
        title: 'Award',
        at: '+00:52',
        detail: 'DGS Logistics at 3,190.05 USD — auto-awarded under policy',
        state: 'done',
      },
      {
        title: 'Booking',
        at: '+00:56',
        detail: 'Contract created, rate confirmation sent, load covered',
        state: 'done',
      },
    ],
    waves: [
      { title: 'Wave 1 · top 4 by lane match', note: '', state: 'sent', at: 'sent +00:16' },
      { title: 'Wave 2 · top 6 by lane match', note: '', state: 'sent', at: 'sent +00:38' },
      { title: 'Wave 3 · all carriers', note: '', state: 'pending', at: 'in 00:01' },
    ],
    awardRule: 'Any bid at or below Book Now · human approval above 4,000.00 USD',
    bids: [
      {
        carrier: 'Smart Choice Transport Ltd',
        mc: 'MC-4483133',
        dot: '4483133',
        at: '+00:22',
        amount: 3683.5,
        delta: 208.5,
        outcome: 'held',
      },
      {
        carrier: 'Mangat Transhaul Inc',
        mc: 'MC-1180224',
        dot: '3521884',
        at: '+00:31',
        amount: 3544.5,
        delta: 69.5,
        outcome: 'held',
      },
      {
        carrier: 'DGS Logistics Inc',
        mc: 'MC-0921455',
        dot: '2884120',
        at: '+00:52',
        amount: 3190.05,
        delta: -284.95,
        outcome: 'awarded',
      },
    ],
  },
  {
    id: 'run-4468',
    runNo: 'R-4468',
    workflow: 'MX Cross-border · Managed Capacity',
    state: 'needs-you',
    clock: '22:48',
    probill: '11193453',
    customer: 'FIAT CHRYSLER AUTOMOBILES',
    order: '11318455',
    po: '900112884',
    origin: 'Laredo, TX',
    destination: 'Sterling Heights, MI',
    miles: 1612.8,
    equipment: 'DRY-VAN',
    currency: 'USD',
    bars: ['done', 'done', 'blocked', 'todo'],
    footLabel: 'Waiting on you',
    footValue: '2 bids · held',
    metrics: {
      maxBuy: 4180,
      maxBuyNote: 'last paid + 8%',
      bookNow: 3971,
      bookNowNote: 'human award required',
      bestBid: 4055,
      bestBidNote: '2 live bids',
      elapsed: '22:48',
      elapsedNote: 'avg cover 58 min',
      reached: 6,
      reachedNote: '2 of 2 waves',
      saved: 125,
      savedNote: 'against Max Buy',
    },
    stagesDone: '4/7 stages',
    trace: [
      {
        title: 'Bidding thresholds',
        at: '+00:03',
        detail: 'Max Buy 4,180.00 USD · Book Now 3,971.00 · Reject Above 4,807.00',
        state: 'done',
      },
      {
        title: 'Posted to Sourcing',
        at: '+00:06',
        detail: 'Managed capacity list only — no public marketplace',
        state: 'done',
      },
      {
        title: 'Broadcast to carriers',
        at: '+00:11',
        detail: '2 of 2 waves sent · 3 → 6 bonded carriers via Email + WhatsApp',
        state: 'done',
      },
      {
        title: 'Offers & bids',
        at: '+00:44',
        detail: '2 bids received · both above Book Now',
        state: 'done',
      },
      {
        title: 'Award',
        at: 'waiting',
        detail: 'This workflow always stops for a human award — pick a bid to continue',
        state: 'live',
      },
      { title: 'Booking', at: '—', detail: 'Runs after the award is placed', state: 'todo' },
    ],
    waves: [
      { title: 'Wave 1 · top 3 bonded', note: '', state: 'sent', at: 'sent +00:11' },
      { title: 'Wave 2 · top 6 bonded', note: '', state: 'sent', at: 'sent +00:36' },
    ],
    awardRule: 'Human award required on every cross-border run',
    bids: [
      {
        carrier: 'Transportes Monterrey SA',
        mc: 'MC-7712004',
        dot: '3188402',
        at: '+00:44',
        amount: 4055,
        delta: -125,
        outcome: 'live',
      },
      {
        carrier: 'Bonded Freightways LLC',
        mc: 'MC-6620911',
        dot: '2914777',
        at: '+00:51',
        amount: 4240,
        delta: 60,
        outcome: 'held',
      },
    ],
  },
  {
    id: 'run-4465',
    runNo: 'R-4465',
    workflow: 'Canada Intra · Loadlink First',
    state: 'needs-you',
    clock: '23:45',
    probill: '11481345',
    customer: 'UNILEVER C/O CASS INFO',
    order: '11317990',
    po: '884120553',
    origin: 'Mississauga, ON',
    destination: 'London, ON',
    miles: 118.9,
    equipment: 'DRY-VAN',
    currency: 'CAD',
    bars: ['done', 'done', 'blocked', 'todo'],
    footLabel: 'Waiting on you',
    footValue: '2 bids · held',
    metrics: {
      maxBuy: 640,
      maxBuyNote: 'Loadlink + 4%',
      bookNow: 601.6,
      bookNowNote: 'auto-award at or below',
      bestBid: 655,
      bestBidNote: '2 live bids',
      elapsed: '23:45',
      elapsedNote: 'avg cover 34 min',
      reached: 12,
      reachedNote: '2 of 2 waves',
      saved: -15,
      savedNote: 'against Max Buy',
    },
    stagesDone: '4/7 stages',
    trace: [
      {
        title: 'Bidding thresholds',
        at: '+00:02',
        detail: 'Max Buy 640.00 CAD · Book Now 601.60 · Reject Above 768.00',
        state: 'done',
      },
      {
        title: 'Posted to load board',
        at: '+00:09',
        detail: 'Loadlink at 601.60 CAD, refreshing every 15 mins',
        state: 'done',
      },
      {
        title: 'Broadcast to carriers',
        at: '+00:14',
        detail: '2 of 2 waves sent · 6 → 12 carriers via Email',
        state: 'done',
      },
      {
        title: 'Offers & bids',
        at: '+01:02',
        detail: '2 bids received · best is 15.00 CAD over Max Buy',
        state: 'done',
      },
      {
        title: 'Award',
        at: 'waiting',
        detail: 'Every bid is above Max Buy — automation halted and escalated',
        state: 'live',
      },
      { title: 'Booking', at: '—', detail: 'Runs after the award is placed', state: 'todo' },
    ],
    waves: [
      { title: 'Wave 1 · top 6 by lane match', note: '', state: 'sent', at: 'sent +00:14' },
      { title: 'Wave 2 · all carriers', note: '', state: 'sent', at: 'sent +00:44' },
    ],
    awardRule: 'Any bid at or below Book Now · human approval above 5,000.00 CAD',
    bids: [
      {
        carrier: 'Trillium Cartage Ltd',
        mc: 'MC-3390117',
        dot: '1998231',
        at: '+01:02',
        amount: 655,
        delta: 15,
        outcome: 'held',
      },
      {
        carrier: 'Southwold Freight Systems',
        mc: 'MC-2211840',
        dot: '2110448',
        at: '+01:07',
        amount: 690,
        delta: 50,
        outcome: 'held',
      },
    ],
  },
  {
    id: 'run-4460',
    runNo: 'R-4460',
    workflow: 'Spot · US Dry-Van Auto-Cover',
    state: 'covered',
    clock: '00:46',
    probill: '11447805',
    customer: 'PROCTER & GAMBLE MANUFACTURING',
    order: '11316221',
    po: '900338211',
    origin: 'Fox River, WI',
    destination: 'Morris, IL',
    miles: 214.4,
    equipment: 'DRY-VAN',
    currency: 'USD',
    bars: ['done', 'done', 'done', 'done'],
    footLabel: 'Booked',
    footValue: '473.80 USD',
    metrics: {
      maxBuy: 512,
      maxBuyNote: 'DAT benchmark + 5%',
      bookNow: 473.6,
      bookNowNote: 'auto-award at or below',
      bestBid: 473.8,
      bestBidNote: '4 live bids',
      elapsed: '00:46',
      elapsedNote: 'avg cover 27 min',
      reached: 8,
      reachedNote: '1 of 3 waves',
      saved: 38.2,
      savedNote: 'against Max Buy',
    },
    stagesDone: '7/7 stages',
    trace: [
      {
        title: 'Bidding thresholds',
        at: '+00:03',
        detail: 'Max Buy 512.00 USD · Book Now 473.60 · Reject Above 640.00',
        state: 'done',
      },
      {
        title: 'Posted to load board',
        at: '+00:08',
        detail: 'DAT at 473.60 USD, refreshing every 30 mins',
        state: 'done',
      },
      {
        title: 'Broadcast to carriers',
        at: '+00:11',
        detail: '1 of 3 waves sent · 8 carriers via Email + WhatsApp',
        state: 'done',
      },
      { title: 'Offers & bids', at: '+00:29', detail: '4 bids received', state: 'done' },
      {
        title: 'Award',
        at: '+00:41',
        detail: 'Midwest Regional at 473.80 USD — auto-awarded under policy',
        state: 'done',
      },
      {
        title: 'Booking',
        at: '+00:46',
        detail: 'Contract created, rate confirmation sent, load covered',
        state: 'done',
      },
    ],
    waves: [{ title: 'Wave 1 · top 4 by lane match', note: '', state: 'sent', at: 'sent +00:11' }],
    awardRule: 'Any bid at or below Book Now · human approval above 4,000.00 USD',
    bids: [
      {
        carrier: 'Midwest Regional Carriers',
        mc: 'MC-5510223',
        dot: '2660118',
        at: '+00:29',
        amount: 473.8,
        delta: -38.2,
        outcome: 'awarded',
      },
      {
        carrier: 'Blue Prairie Trucking',
        mc: 'MC-8830192',
        dot: '3011225',
        at: '+00:33',
        amount: 505,
        delta: -7,
        outcome: 'rejected',
      },
    ],
  },
  {
    id: 'run-4452',
    runNo: 'R-4452',
    workflow: 'Canada Intra · Loadlink First',
    state: 'covered',
    clock: '02:12',
    probill: '11450051',
    customer: 'TEST_12SEPT',
    order: '11315004',
    po: '811230045',
    origin: 'Brampton, ON',
    destination: 'Woodstock, ON',
    miles: 66.7,
    equipment: 'DRY-VAN',
    currency: 'CAD',
    bars: ['done', 'done', 'done', 'done'],
    footLabel: 'Booked',
    footValue: '477.00 CAD',
    metrics: {
      maxBuy: 505,
      maxBuyNote: 'Loadlink + 4%',
      bookNow: 474.7,
      bookNowNote: 'auto-award at or below',
      bestBid: 477,
      bestBidNote: '3 live bids',
      elapsed: '02:12',
      elapsedNote: 'avg cover 34 min',
      reached: 14,
      reachedNote: '2 of 2 waves',
      saved: 28,
      savedNote: 'against Max Buy',
    },
    stagesDone: '7/7 stages',
    trace: [
      {
        title: 'Bidding thresholds',
        at: '+00:02',
        detail: 'Max Buy 505.00 CAD · Book Now 474.70 · Reject Above 606.00',
        state: 'done',
      },
      {
        title: 'Posted to load board',
        at: '+00:07',
        detail: 'Loadlink at 474.70 CAD, refreshing every 15 mins',
        state: 'done',
      },
      {
        title: 'Broadcast to carriers',
        at: '+00:15',
        detail: '2 of 2 waves sent · 14 carriers via Email',
        state: 'done',
      },
      { title: 'Offers & bids', at: '+01:20', detail: '3 bids received', state: 'done' },
      {
        title: 'Award',
        at: '+02:04',
        detail: 'Halton Peel Logistics at 477.00 CAD — awarded by Sukhdeep D.',
        state: 'done',
      },
      {
        title: 'Booking',
        at: '+02:12',
        detail: 'Contract created, rate confirmation sent, load covered',
        state: 'done',
      },
    ],
    waves: [
      { title: 'Wave 1 · top 6 by lane match', note: '', state: 'sent', at: 'sent +00:15' },
      { title: 'Wave 2 · all carriers', note: '', state: 'sent', at: 'sent +00:45' },
    ],
    awardRule: 'Any bid at or below Book Now · human approval above 5,000.00 CAD',
    bids: [
      {
        carrier: 'Halton Peel Logistics',
        mc: 'MC-4410992',
        dot: '2004411',
        at: '+01:20',
        amount: 477,
        delta: -28,
        outcome: 'awarded',
      },
      {
        carrier: 'Grand River Transport',
        mc: 'MC-1120884',
        dot: '1880231',
        at: '+01:41',
        amount: 520,
        delta: 15,
        outcome: 'held',
      },
    ],
  },
  {
    id: 'run-4448',
    runNo: 'R-4448',
    workflow: 'Spot · US Dry-Van Auto-Cover',
    state: 'covered',
    clock: '02:28',
    probill: '11285310',
    customer: 'PENSKE (FORD) CL USA',
    order: '11314772',
    po: '773100248',
    origin: 'Nogales, SO',
    destination: 'Sedalia, MO',
    miles: 1433.1,
    equipment: 'DRY-VAN',
    currency: 'USD',
    bars: ['done', 'done', 'done', 'done'],
    footLabel: 'Booked',
    footValue: '2,547.58 USD',
    metrics: {
      maxBuy: 2740,
      maxBuyNote: 'DAT benchmark + 5%',
      bookNow: 2534.5,
      bookNowNote: 'auto-award at or below',
      bestBid: 2547.58,
      bestBidNote: '5 live bids',
      elapsed: '02:28',
      elapsedNote: 'avg cover 27 min',
      reached: 22,
      reachedNote: '3 of 3 waves',
      saved: 192.42,
      savedNote: 'against Max Buy',
    },
    stagesDone: '7/7 stages',
    trace: [
      {
        title: 'Bidding thresholds',
        at: '+00:04',
        detail: 'Max Buy 2,740.00 USD · Book Now 2,534.50 · Reject Above 3,425.00',
        state: 'done',
      },
      {
        title: 'Posted to load board',
        at: '+00:10',
        detail: 'DAT at 2,534.50 USD, refreshing every 30 mins',
        state: 'done',
      },
      {
        title: 'Broadcast to carriers',
        at: '+00:18',
        detail: '3 of 3 waves sent · 22 carriers via Email + WhatsApp',
        state: 'done',
      },
      { title: 'Offers & bids', at: '+01:12', detail: '5 bids received', state: 'done' },
      {
        title: 'Award',
        at: '+02:19',
        detail: 'Sonora Freight Lines at 2,547.58 USD — awarded by Marc T.',
        state: 'done',
      },
      {
        title: 'Booking',
        at: '+02:28',
        detail: 'Contract created, rate confirmation sent, load covered',
        state: 'done',
      },
    ],
    waves: [
      { title: 'Wave 1 · top 4 by lane match', note: '', state: 'sent', at: 'sent +00:18' },
      { title: 'Wave 2 · top 6 by lane match', note: '', state: 'sent', at: 'sent +00:38' },
      { title: 'Wave 3 · all carriers', note: '', state: 'sent', at: 'sent +01:03' },
    ],
    awardRule: 'Any bid at or below Book Now · human approval above 4,000.00 USD',
    bids: [
      {
        carrier: 'Sonora Freight Lines',
        mc: 'MC-9911002',
        dot: '3390221',
        at: '+01:12',
        amount: 2547.58,
        delta: -192.42,
        outcome: 'awarded',
      },
      {
        carrier: 'Border Star Carriers',
        mc: 'MC-5540118',
        dot: '2884001',
        at: '+01:30',
        amount: 2810,
        delta: 70,
        outcome: 'held',
      },
    ],
  },
]

/* ── Builder options ───────────────────────────────────────── */

export const EQUIPMENT_OPTIONS = ['DRY-VAN', 'REEFER', 'FLATBED', 'TRI-AXLE'] as const
export const LANE_OPTIONS = ['US → US', 'CA → CA', 'Cross-border', 'MX domestic'] as const
export const CATEGORY_OPTIONS = ['Regular', 'Spot', 'LTL', 'Expedite'] as const
export const REFERENCE_OPTIONS = [
  { id: 'dat', label: 'DAT benchmark', note: 'best reference on US domestic lanes' },
  { id: 'loadlink', label: 'Loadlink benchmark', note: 'best reference on Canadian domestic lanes' },
  { id: 'lastpaid', label: 'Last paid on lane', note: 'uses your own history on this exact lane' },
  { id: 'rpm', label: 'Fixed rate per mile', note: 'ignores the market and prices off distance' },
] as const
export const BOARD_OPTIONS = ['DAT', 'Loadlink', "Don't post publicly"] as const
export const REFRESH_OPTIONS = ['15 mins', '30 mins', '1 hour'] as const
export const WAVE_SIZES = ['top 3', 'top 4', 'top 6', 'all carriers'] as const
export const CHANNEL_OPTIONS = ['Email', 'WhatsApp', 'SMS'] as const

export type PreviewLane = {
  id: string
  label: string
  lane: string
  miles: number
  scope: string
  reference: number
  bids: { carrier: string; amount: number }[]
  matches: { probill: string; customer: string; lane: string }[]
}

export const PREVIEW_LANES: PreviewLane[] = [
  {
    id: 'lane-1',
    label: 'Seabrook→Modesto',
    lane: 'Seabrook, TX → Modesto, CA',
    miles: 1583.2,
    scope: 'US → US',
    reference: 3305.75,
    bids: [
      { carrier: 'Smart Choice Transport', amount: 3683.5 },
      { carrier: 'Mangat Transhaul', amount: 3544.5 },
      { carrier: 'DGS Logistics', amount: 3190.4 },
    ],
    matches: [
      { probill: '11447805', customer: 'PROCTER & GAMBLE', lane: 'Fox River → Morris' },
      { probill: '11483813', customer: 'STORA-ENSO', lane: 'Seabrook → Modesto' },
    ],
  },
  {
    id: 'lane-2',
    label: 'Brampton→Woodstock',
    lane: 'Brampton, ON → Woodstock, ON',
    miles: 66.7,
    scope: 'CA → CA',
    reference: 468.4,
    bids: [
      { carrier: 'Grand River Transport', amount: 520 },
      { carrier: 'Halton Peel Logistics', amount: 477 },
      { carrier: 'Trillium Cartage', amount: 455.2 },
    ],
    matches: [
      { probill: '11450051', customer: 'TEST_12SEPT', lane: 'Brampton → Woodstock' },
      { probill: '11481345', customer: 'UNILEVER', lane: 'Mississauga → London' },
    ],
  },
  {
    id: 'lane-3',
    label: 'Laredo→Sterling Heights',
    lane: 'Laredo, TX → Sterling Heights, MI',
    miles: 1612.8,
    scope: 'Cross-border',
    reference: 3872.0,
    bids: [
      { carrier: 'Bonded Freightways', amount: 4240 },
      { carrier: 'Transportes Monterrey', amount: 4055 },
      { carrier: 'Border Star Carriers', amount: 3910 },
    ],
    matches: [
      { probill: '11193453', customer: 'FIAT CHRYSLER', lane: 'Laredo → Sterling Heights' },
      { probill: '11285310', customer: 'PENSKE (FORD)', lane: 'Nogales → Sedalia' },
    ],
  },
]

export const MATCHES_TODAY_TOTAL = 12
