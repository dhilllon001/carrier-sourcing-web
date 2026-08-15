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
    matches: [
      'Type PureBrokerage',
      'Equipment DRY-VAN',
      'Equipment REEFER',
      'CA → CA',
      'Order cat Spot',
    ],
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
    name: 'Cross-border · Managed Capacity',
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

export type RunState = 'needs-you' | 'running' | 'covered'
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
    id: 'run-4474',
    runNo: 'R-4474',
    workflow: 'Cross-border · Managed Capacity',
    state: 'running',
    clock: '00:27',
    probill: '11440520',
    customer: 'Nova Chemicals',
    order: '11319044',
    po: '944120880',
    origin: 'Sarnia, ON',
    destination: 'Houston, TX',
    miles: 1818,
    equipment: 'FLATBED',
    currency: 'USD',
    bars: ['done', 'done', 'todo', 'todo'],
    footLabel: 'Offers & bids',
    footValue: 'wave 2 in 00:11',
    metrics: {
      maxBuy: 4320,
      maxBuyNote: 'last paid + 8%',
      bookNow: 4104,
      bookNowNote: 'human award required',
      bestBid: 4290,
      bestBidNote: '1 live bid',
      elapsed: '00:27',
      elapsedNote: 'avg cover 58 min',
      reached: 3,
      reachedNote: '1 of 2 waves',
      saved: 30,
      savedNote: 'against Max Buy',
    },
    stagesDone: '3/7 stages',
    trace: [
      {
        title: 'Bidding thresholds',
        at: '+00:03',
        detail: 'Max Buy 4,320.00 USD · Book Now 4,104.00 · Reject Above 4,968.00',
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
        at: '+00:09',
        detail: '1 of 2 waves sent · 3 bonded carriers via Email + WhatsApp',
        state: 'done',
      },
      {
        title: 'Offers & bids',
        at: 'live',
        detail: '1 bid in · wave 2 widens to 6 carriers in 00:11',
        state: 'live',
      },
      { title: 'Award', at: '—', detail: 'Human award on every cross-border run', state: 'todo' },
      { title: 'Booking', at: '—', detail: 'Runs after the award is placed', state: 'todo' },
    ],
    waves: [
      { title: 'Wave 1 · top 3 bonded', note: '', state: 'sent', at: 'sent +00:09' },
      { title: 'Wave 2 · top 6 bonded', note: '', state: 'pending', at: 'in 00:11' },
    ],
    awardRule: 'Human award required on every cross-border run',
    bids: [
      {
        carrier: 'Manney Cross-Border SA',
        mc: 'MC-1941466',
        dot: '2884511',
        at: '+00:21',
        amount: 4290,
        delta: -30,
        outcome: 'live',
      },
    ],
  },
  {
    id: 'run-4471',
    runNo: 'R-4471',
    workflow: 'Spot · US Dry-Van Auto-Cover',
    state: 'covered',
    clock: '00:41',
    probill: '11439801',
    customer: 'Procter & Gamble',
    order: '11318789',
    po: '933502612',
    origin: 'Cincinnati, OH',
    destination: 'Nashville, TN',
    miles: 273,
    equipment: 'DRY-VAN',
    currency: 'USD',
    bars: ['done', 'done', 'done', 'done'],
    footLabel: 'Booked',
    footValue: '559.20 USD',
    metrics: {
      maxBuy: 615,
      maxBuyNote: 'DAT benchmark + 5%',
      bookNow: 568.88,
      bookNowNote: 'auto-award at or below',
      bestBid: 559.2,
      bestBidNote: '3 live bids',
      elapsed: '00:41',
      elapsedNote: 'avg cover 27 min',
      reached: 10,
      reachedNote: '2 of 3 waves',
      saved: 55.8,
      savedNote: 'against Max Buy',
    },
    stagesDone: '7/7 stages',
    trace: [
      {
        title: 'Bidding thresholds',
        at: '+00:04',
        detail: 'Max Buy 615.00 USD · Book Now 568.88 · Reject Above 768.75 — DAT + 5%',
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
        detail: 'DAT at 568.88 USD, refreshing every 30 mins',
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
        detail: '3 bids received · auto-accept at or below 568.88',
        state: 'done',
      },
      {
        title: 'Award',
        at: '+00:36',
        detail: 'DGS Logistics at 559.20 USD — auto-awarded under policy',
        state: 'done',
      },
      {
        title: 'Booking',
        at: '+00:41',
        detail: 'Contract created, rate confirmation sent, load covered',
        state: 'done',
      },
    ],
    waves: [
      { title: 'Wave 1 · top 4 by lane match', note: '', state: 'sent', at: 'sent +00:16' },
      { title: 'Wave 2 · top 6 by lane match', note: '', state: 'sent', at: 'sent +00:38' },
      { title: 'Wave 3 · all carriers', note: '', state: 'pending', at: 'not needed' },
    ],
    awardRule: 'Any bid at or below Book Now · human approval above 4,000.00 USD',
    bids: [
      {
        carrier: 'Smart Choice Transport Ltd',
        mc: 'MC-4483133',
        dot: '4483133',
        at: '+00:22',
        amount: 668,
        delta: 53,
        outcome: 'held',
      },
      {
        carrier: 'Mangat Transhaul Inc',
        mc: 'MC-1180224',
        dot: '3521884',
        at: '+00:31',
        amount: 624.5,
        delta: 9.5,
        outcome: 'held',
      },
      {
        carrier: 'DGS Logistics Inc',
        mc: 'MC-0921455',
        dot: '2884120',
        at: '+00:36',
        amount: 559.2,
        delta: -55.8,
        outcome: 'awarded',
      },
    ],
  },
  {
    id: 'run-4468',
    runNo: 'R-4468',
    workflow: 'Cross-border · Managed Capacity',
    state: 'needs-you',
    clock: '22:48',
    probill: '11445015',
    customer: 'Intel Components',
    order: '11318455',
    po: '900112884',
    origin: 'Laredo, TX',
    destination: 'Monterrey, MX',
    miles: 980,
    equipment: 'DRY-VAN',
    currency: 'USD',
    bars: ['done', 'done', 'blocked', 'todo'],
    footLabel: 'Waiting on you',
    footValue: '2 bids · held',
    metrics: {
      maxBuy: 2540,
      maxBuyNote: 'last paid + 8%',
      bookNow: 2413,
      bookNowNote: 'human award required',
      bestBid: 2475,
      bestBidNote: '2 live bids',
      elapsed: '22:48',
      elapsedNote: 'avg cover 58 min',
      reached: 6,
      reachedNote: '2 of 2 waves',
      saved: 65,
      savedNote: 'against Max Buy',
    },
    stagesDone: '4/7 stages',
    trace: [
      {
        title: 'Bidding thresholds',
        at: '+00:03',
        detail: 'Max Buy 2,540.00 USD · Book Now 2,413.00 · Reject Above 2,921.00',
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
        amount: 2475,
        delta: -65,
        outcome: 'live',
      },
      {
        carrier: 'Bonded Freightways LLC',
        mc: 'MC-6620911',
        dot: '2914777',
        at: '+00:51',
        amount: 2610,
        delta: 70,
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
    probill: '11402376',
    customer: 'Dollar Tree',
    order: '11317990',
    po: '884120553',
    origin: 'Brampton, ON',
    destination: 'Brampton, ON',
    miles: 12,
    equipment: 'DRY-VAN',
    currency: 'CAD',
    bars: ['done', 'done', 'blocked', 'todo'],
    footLabel: 'Waiting on you',
    footValue: '2 bids · held',
    metrics: {
      maxBuy: 240,
      maxBuyNote: 'Loadlink + 4%',
      bookNow: 225.6,
      bookNowNote: 'auto-award at or below',
      bestBid: 255,
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
        detail: 'Max Buy 240.00 CAD · Book Now 225.60 · Reject Above 288.00',
        state: 'done',
      },
      {
        title: 'Posted to load board',
        at: '+00:09',
        detail: 'Loadlink at 225.60 CAD, refreshing every 15 mins',
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
        amount: 255,
        delta: 15,
        outcome: 'held',
      },
      {
        carrier: 'Southwold Freight Systems',
        mc: 'MC-2211840',
        dot: '2110448',
        at: '+01:07',
        amount: 275,
        delta: 35,
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
    probill: '11436778',
    customer: 'Honda North America',
    order: '11316221',
    po: '900338211',
    origin: 'Marysville, OH',
    destination: 'Detroit, MI',
    miles: 186,
    equipment: 'DRY-VAN',
    currency: 'USD',
    bars: ['done', 'done', 'done', 'done'],
    footLabel: 'Booked',
    footValue: '428.40 USD',
    metrics: {
      maxBuy: 470,
      maxBuyNote: 'DAT benchmark + 5%',
      bookNow: 434.75,
      bookNowNote: 'auto-award at or below',
      bestBid: 428.4,
      bestBidNote: '4 live bids',
      elapsed: '00:46',
      elapsedNote: 'avg cover 27 min',
      reached: 8,
      reachedNote: '1 of 3 waves',
      saved: 41.6,
      savedNote: 'against Max Buy',
    },
    stagesDone: '7/7 stages',
    trace: [
      {
        title: 'Bidding thresholds',
        at: '+00:03',
        detail: 'Max Buy 470.00 USD · Book Now 434.75 · Reject Above 587.50',
        state: 'done',
      },
      {
        title: 'Posted to load board',
        at: '+00:08',
        detail: 'DAT at 434.75 USD, refreshing every 30 mins',
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
        detail: 'Midwest Regional at 428.40 USD — auto-awarded under policy',
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
        amount: 428.4,
        delta: -41.6,
        outcome: 'awarded',
      },
      {
        carrier: 'Blue Prairie Trucking',
        mc: 'MC-8830192',
        dot: '3011225',
        at: '+00:33',
        amount: 610,
        delta: 140,
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
    probill: '11442011',
    customer: 'Unilever Canada',
    order: '11315004',
    po: '811230045',
    origin: 'Toronto, ON',
    destination: 'Montreal, QC',
    miles: 337,
    equipment: 'REEFER',
    currency: 'CAD',
    bars: ['done', 'done', 'done', 'done'],
    footLabel: 'Booked',
    footValue: '842.00 CAD',
    metrics: {
      maxBuy: 890,
      maxBuyNote: 'Loadlink + 4%',
      bookNow: 836.6,
      bookNowNote: 'auto-award at or below',
      bestBid: 842,
      bestBidNote: '3 live bids',
      elapsed: '02:12',
      elapsedNote: 'avg cover 34 min',
      reached: 14,
      reachedNote: '2 of 2 waves',
      saved: 48,
      savedNote: 'against Max Buy',
    },
    stagesDone: '7/7 stages',
    trace: [
      {
        title: 'Bidding thresholds',
        at: '+00:02',
        detail: 'Max Buy 890.00 CAD · Book Now 836.60 · Reject Above 1,068.00',
        state: 'done',
      },
      {
        title: 'Posted to load board',
        at: '+00:07',
        detail: 'Loadlink at 836.60 CAD, refreshing every 15 mins',
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
        detail: 'Halton Peel Logistics at 842.00 CAD — awarded by Sukhdeep D.',
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
        amount: 842,
        delta: -48,
        outcome: 'awarded',
      },
      {
        carrier: 'Grand River Transport',
        mc: 'MC-1120884',
        dot: '1880231',
        at: '+01:41',
        amount: 915,
        delta: 25,
        outcome: 'held',
      },
    ],
  },
  {
    id: 'run-4448',
    runNo: 'R-4448',
    workflow: 'Cross-border · Managed Capacity',
    state: 'covered',
    clock: '02:28',
    probill: '11445023',
    customer: 'LG Electronics',
    order: '11314772',
    po: '773100248',
    origin: 'Houston, TX',
    destination: 'Guadalajara, MX',
    miles: 660,
    equipment: 'DRY-VAN',
    currency: 'USD',
    bars: ['done', 'done', 'done', 'done'],
    footLabel: 'Booked',
    footValue: '1,668.50 USD',
    metrics: {
      maxBuy: 1780,
      maxBuyNote: 'last paid + 8%',
      bookNow: 1691,
      bookNowNote: 'human award required',
      bestBid: 1668.5,
      bestBidNote: '5 live bids',
      elapsed: '02:28',
      elapsedNote: 'avg cover 58 min',
      reached: 22,
      reachedNote: '2 of 2 waves',
      saved: 111.5,
      savedNote: 'against Max Buy',
    },
    stagesDone: '7/7 stages',
    trace: [
      {
        title: 'Bidding thresholds',
        at: '+00:04',
        detail: 'Max Buy 1,780.00 USD · Book Now 1,691.00 · Reject Above 2,047.00',
        state: 'done',
      },
      {
        title: 'Posted to load board',
        at: '+00:10',
        detail: "Don't post publicly — bonded carrier list only",
        state: 'done',
      },
      {
        title: 'Broadcast to carriers',
        at: '+00:18',
        detail: '2 of 2 waves sent · 22 bonded carriers via Email + WhatsApp',
        state: 'done',
      },
      { title: 'Offers & bids', at: '+01:12', detail: '5 bids received', state: 'done' },
      {
        title: 'Award',
        at: '+02:19',
        detail: 'Sonora Freight Lines at 1,668.50 USD — awarded by Marc T.',
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
      { title: 'Wave 1 · top 3 bonded', note: '', state: 'sent', at: 'sent +00:18' },
      { title: 'Wave 2 · top 6 bonded', note: '', state: 'sent', at: 'sent +00:38' },
    ],
    awardRule: 'Human award required on every cross-border run',
    bids: [
      {
        carrier: 'Sonora Freight Lines',
        mc: 'MC-9911002',
        dot: '3390221',
        at: '+01:12',
        amount: 1668.5,
        delta: -111.5,
        outcome: 'awarded',
      },
      {
        carrier: 'Border Star Carriers',
        mc: 'MC-5540118',
        dot: '2884001',
        at: '+01:30',
        amount: 1850,
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
    label: 'Cincinnati→Nashville',
    lane: 'Cincinnati, OH → Nashville, TN',
    miles: 273,
    scope: 'US → US',
    reference: 585.5,
    bids: [
      { carrier: 'Smart Choice Transport', amount: 668 },
      { carrier: 'Mangat Transhaul', amount: 624.5 },
      { carrier: 'DGS Logistics', amount: 559.2 },
    ],
    matches: [
      { probill: '11439801', customer: 'Procter & Gamble', lane: 'Cincinnati → Nashville' },
      { probill: '11436778', customer: 'Honda North America', lane: 'Marysville → Detroit' },
    ],
  },
  {
    id: 'lane-2',
    label: 'Toronto→Montreal',
    lane: 'Toronto, ON → Montreal, QC',
    miles: 337,
    scope: 'CA → CA',
    reference: 855.75,
    bids: [
      { carrier: 'Grand River Transport', amount: 915 },
      { carrier: 'Halton Peel Logistics', amount: 842 },
      { carrier: 'Trillium Cartage', amount: 806.4 },
    ],
    matches: [
      { probill: '11442011', customer: 'Unilever Canada', lane: 'Toronto → Montreal' },
      { probill: '11402376', customer: 'Dollar Tree', lane: 'Brampton → Brampton' },
    ],
  },
  {
    id: 'lane-3',
    label: 'Laredo→Monterrey',
    lane: 'Laredo, TX → Monterrey, MX',
    miles: 980,
    scope: 'Cross-border',
    reference: 2351.85,
    bids: [
      { carrier: 'Bonded Freightways', amount: 2610 },
      { carrier: 'Transportes Monterrey', amount: 2475 },
      { carrier: 'Border Star Carriers', amount: 2390 },
    ],
    matches: [
      { probill: '11445015', customer: 'Intel Components', lane: 'Laredo → Monterrey' },
      { probill: '11445023', customer: 'LG Electronics', lane: 'Houston → Guadalajara' },
    ],
  },
]

export const MATCHES_TODAY_TOTAL = 12

/** Optional narrowing beyond equipment, lane and category. */
export const EXTRA_CONDITIONS = [
  'Customer is',
  'Weight over',
  'Hazmat',
  'Team required',
  'Drop trailer',
  'Appointment required',
  'Temperature controlled',
  'Min miles',
  'Max miles',
  'Border crossing',
  'Dedicated capacity',
] as const

export const BUILDER_STEPS = [
  'Basics',
  'When it runs',
  'Pricing',
  'Posting',
  'Broadcast',
  'Award',
] as const

/* ── Carrier preferences ───────────────────────────────────
   Per-carrier overrides the waterfall obeys instead of the
   workflow defaults: who to talk to, on which channel, how
   paperwork moves, and where they actually want to run. */

export const CAPABILITIES = [
  'Tenders',
  'Rate con',
  'Appointments',
  'Tracking',
  'Invoices',
] as const
export type Capability = (typeof CAPABILITIES)[number]

export const CHANNELS = ['WhatsApp', 'Email', 'Phone', 'EDI 204'] as const
export type PrefChannel = (typeof CHANNELS)[number]

export const CHANNEL_NOTE: Record<PrefChannel, string> = {
  WhatsApp: 'fastest reply on this account',
  Email: 'goes to every contact set to receive tenders',
  Phone: 'dispatcher calls manually — no automated call',
  'EDI 204': 'machine tender into their TMS',
}

export const RATE_CON_MODES = ['Email PDF', 'Carrier portal', 'EDI 204 / 990', 'API webhook'] as const
export const PAYMENT_TERMS = ['Net 15', 'Net 30', 'Net 45', 'Quick pay 2%'] as const
export const LANGUAGES = ['English', 'Spanish', 'Punjabi', 'French'] as const
export const QUIET_FROM = ['20:00', '21:00', '22:00'] as const
export const QUIET_TO = ['05:00', '06:00', '07:00'] as const

export type PrefContact = {
  id: string
  name: string
  role: string
  email: string
  phone: string
  tz: string
  caps: Capability[]
  /** Overrides the carrier-level channel order for this one person. */
  channel?: 'WhatsApp' | 'Email'
}

export type CarrierPref = {
  id: string
  name: string
  mc: string
  dot: string
  city: string
  contacts: PrefContact[]
  favouriteId: string
  channels: PrefChannel[]
  fallThrough: number
  quietOn: boolean
  quietFrom: string
  quietTo: string
  language: string
  rateCon: string
  autoTender: boolean
  signedRateCon: boolean
  whatsappConfirm: boolean
  paymentTerms: string
  lanes: string[]
  loadsPerWeek: number
  equipment: string[]
  doNotUse: boolean
  stats: {
    loadsBooked: number
    lastBooked: string
    onTime: string
    onTimeNote: string
    avgResponse: string
    avgResponseNote: string
    insurance: string
    insuranceNote: string
  }
}

export const CARRIER_PREFS: CarrierPref[] = [
  {
    id: 'dgs',
    name: 'DGS Logistics',
    mc: 'MC-771204',
    dot: '771204',
    city: 'Brampton, ON',
    contacts: [
      {
        id: 'ravi',
        name: 'Ravi Sandhu',
        role: 'Dispatch',
        email: 'ravi@dgslogistics.ca',
        phone: '+1 905 555 0142',
        tz: 'ET',
        caps: ['Tenders', 'Rate con', 'Appointments'],
      },
      {
        id: 'night',
        name: 'Night desk',
        role: 'After hours',
        email: 'nights@dgslogistics.ca',
        phone: '+1 905 555 0188',
        tz: 'ET',
        caps: ['Tenders', 'Tracking'],
      },
      {
        id: 'simran',
        name: 'Simran Kaur',
        role: 'Billing',
        email: 'ap@dgslogistics.ca',
        phone: '+1 905 555 0170',
        tz: 'ET',
        caps: ['Invoices'],
      },
    ],
    favouriteId: 'ravi',
    channels: ['WhatsApp', 'Email', 'Phone'],
    fallThrough: 15,
    quietOn: true,
    quietFrom: '21:00',
    quietTo: '06:00',
    language: 'English',
    rateCon: 'Email PDF',
    autoTender: true,
    signedRateCon: true,
    whatsappConfirm: false,
    paymentTerms: 'Net 30',
    lanes: ['Brampton → Chicago', 'Toronto → Detroit'],
    loadsPerWeek: 14,
    equipment: ['DRY-VAN', 'TRI-AXLE'],
    doNotUse: false,
    stats: {
      loadsBooked: 42,
      lastBooked: 'last on Aug 11',
      onTime: '96%',
      onTimeNote: 'rolling 90 days',
      avgResponse: '14 min',
      avgResponseNote: 'to a tender',
      insurance: 'Nov 30, 2026',
      insuranceNote: 'Satisfactory · Approved · C-TPAT · PIP',
    },
  },
  {
    id: 'smart-choice',
    name: 'Smart Choice Transport Ltd',
    mc: 'MC-4483133',
    dot: '4483133',
    city: 'Mississauga, ON',
    contacts: [
      {
        id: 'harjot',
        name: 'Harjot Singh',
        role: 'Dispatch',
        email: 'harjot@smartchoice.ca',
        phone: '+1 416 555 0110',
        tz: 'ET',
        caps: ['Tenders', 'Rate con', 'Tracking'],
      },
      {
        id: 'sct-ap',
        name: 'Accounts',
        role: 'Billing',
        email: 'ap@smartchoice.ca',
        phone: '+1 416 555 0119',
        tz: 'ET',
        caps: ['Invoices'],
      },
    ],
    favouriteId: 'harjot',
    channels: ['Email', 'WhatsApp', 'Phone'],
    fallThrough: 20,
    quietOn: true,
    quietFrom: '22:00',
    quietTo: '06:00',
    language: 'English',
    rateCon: 'Carrier portal',
    autoTender: true,
    signedRateCon: true,
    whatsappConfirm: false,
    paymentTerms: 'Net 30',
    lanes: ['Mississauga → Columbus', 'Toronto → Buffalo'],
    loadsPerWeek: 9,
    equipment: ['DRY-VAN'],
    doNotUse: false,
    stats: {
      loadsBooked: 28,
      lastBooked: 'last on Aug 12',
      onTime: '91%',
      onTimeNote: 'rolling 90 days',
      avgResponse: '22 min',
      avgResponseNote: 'to a tender',
      insurance: 'Mar 14, 2027',
      insuranceNote: 'Satisfactory · Approved',
    },
  },
  {
    id: 'mangat',
    name: 'Mangat Transhaul Inc',
    mc: 'MC-4544786',
    dot: '3521884',
    city: 'Surrey, BC',
    contacts: [
      {
        id: 'gurpreet',
        name: 'Gurpreet Mangat',
        role: 'Owner',
        email: 'gurpreet@mangattranshaul.ca',
        phone: '+1 604 555 0133',
        tz: 'PT',
        caps: ['Tenders', 'Rate con', 'Appointments', 'Invoices'],
      },
    ],
    favouriteId: 'gurpreet',
    channels: ['WhatsApp', 'Phone', 'Email'],
    fallThrough: 10,
    quietOn: false,
    quietFrom: '21:00',
    quietTo: '06:00',
    language: 'Punjabi',
    rateCon: 'Email PDF',
    autoTender: false,
    signedRateCon: true,
    whatsappConfirm: true,
    paymentTerms: 'Quick pay 2%',
    lanes: ['Surrey → Seattle', 'Vancouver → Calgary'],
    loadsPerWeek: 6,
    equipment: ['DRY-VAN', 'REEFER'],
    doNotUse: false,
    stats: {
      loadsBooked: 17,
      lastBooked: 'last on Aug 9',
      onTime: '99%',
      onTimeNote: 'rolling 90 days',
      avgResponse: '6 min',
      avgResponseNote: 'to a tender',
      insurance: 'Jan 22, 2027',
      insuranceNote: 'Satisfactory · Approved',
    },
  },
  {
    id: 'roadlink',
    name: 'Roadlink Carriers',
    mc: 'MC-4212038',
    dot: '2884120',
    city: 'Woodstock, ON',
    contacts: [
      {
        id: 'tanya',
        name: 'Tanya Bell',
        role: 'Dispatch',
        email: 'tanya@roadlink.ca',
        phone: '+1 519 555 0164',
        tz: 'ET',
        caps: ['Tenders', 'Rate con'],
      },
      {
        id: 'rl-track',
        name: 'Track & trace',
        role: 'Operations',
        email: 'ops@roadlink.ca',
        phone: '+1 519 555 0165',
        tz: 'ET',
        caps: ['Tracking', 'Appointments'],
      },
    ],
    favouriteId: 'tanya',
    channels: ['Email', 'Phone'],
    fallThrough: 30,
    quietOn: true,
    quietFrom: '20:00',
    quietTo: '07:00',
    language: 'English',
    rateCon: 'EDI 204 / 990',
    autoTender: true,
    signedRateCon: false,
    whatsappConfirm: false,
    paymentTerms: 'Net 45',
    lanes: ['Woodstock → London', 'Woodstock → Detroit'],
    loadsPerWeek: 11,
    equipment: ['DRY-VAN', 'FLATBED'],
    doNotUse: false,
    stats: {
      loadsBooked: 33,
      lastBooked: 'last on Aug 13',
      onTime: '88%',
      onTimeNote: 'rolling 90 days',
      avgResponse: '41 min',
      avgResponseNote: 'to a tender',
      insurance: 'Sep 02, 2026',
      insuranceNote: 'Satisfactory · renewal due',
    },
  },
  {
    id: 'manney',
    name: 'Manney Cross-Border SA',
    mc: 'MC-1941466',
    dot: '2884511',
    city: 'Nuevo Laredo, TAM',
    contacts: [
      {
        id: 'miguel',
        name: 'Miguel Torres',
        role: 'Dispatch',
        email: 'miguel@manneycb.mx',
        phone: '+52 867 555 0102',
        tz: 'CT',
        caps: ['Tenders', 'Rate con', 'Tracking'],
      },
      {
        id: 'mx-customs',
        name: 'Customs desk',
        role: 'Compliance',
        email: 'aduana@manneycb.mx',
        phone: '+52 867 555 0108',
        tz: 'CT',
        caps: ['Appointments'],
      },
    ],
    favouriteId: 'miguel',
    channels: ['WhatsApp', 'Email'],
    fallThrough: 25,
    quietOn: false,
    quietFrom: '21:00',
    quietTo: '06:00',
    language: 'Spanish',
    rateCon: 'Email PDF',
    autoTender: false,
    signedRateCon: true,
    whatsappConfirm: true,
    paymentTerms: 'Net 30',
    lanes: ['Laredo → Monterrey', 'Monterrey → Houston'],
    loadsPerWeek: 8,
    equipment: ['DRY-VAN'],
    doNotUse: false,
    stats: {
      loadsBooked: 21,
      lastBooked: 'last on Aug 10',
      onTime: '93%',
      onTimeNote: 'rolling 90 days',
      avgResponse: '18 min',
      avgResponseNote: 'to a tender',
      insurance: 'Jun 18, 2027',
      insuranceNote: 'Satisfactory · C-TPAT bonded',
    },
  },
  {
    id: 'edo',
    name: 'E&D Ontario Freight',
    mc: 'MC-508122',
    dot: '1998231',
    city: 'London, ON',
    contacts: [
      {
        id: 'dave',
        name: 'Dave Elliott',
        role: 'Owner',
        email: 'dave@edontario.ca',
        phone: '+1 519 555 0177',
        tz: 'ET',
        caps: ['Tenders'],
      },
    ],
    favouriteId: 'dave',
    channels: ['Phone', 'Email'],
    fallThrough: 45,
    quietOn: true,
    quietFrom: '20:00',
    quietTo: '07:00',
    language: 'English',
    rateCon: 'Email PDF',
    autoTender: false,
    signedRateCon: true,
    whatsappConfirm: false,
    paymentTerms: 'Net 30',
    lanes: ['London → Toronto'],
    loadsPerWeek: 3,
    equipment: ['DRY-VAN'],
    doNotUse: true,
    stats: {
      loadsBooked: 4,
      lastBooked: 'last on Jun 28',
      onTime: '61%',
      onTimeNote: 'rolling 90 days',
      avgResponse: '2 hr',
      avgResponseNote: 'to a tender',
      insurance: 'Expired Jul 31, 2026',
      insuranceNote: 'Certificate needs renewing',
    },
  },
]

/* ── Favourites desk — teams, lanes, business units ── */

export type FavCarrier = {
  id: string
  name: string
  mc: string
  city: string
  channel: 'WhatsApp' | 'Email' | 'Phone'
  contact: string
  loads90: number
  onTime: string
  rank: number
}

export type FavTeam = {
  id: string
  name: string
  lead: string
  bu: string
  carriers: FavCarrier[]
}

export type FavLane = {
  id: string
  origin: string
  destination: string
  miles: number
  equipment: string
  loads30: number
  carriers: { name: string; mc: string; rank: number }[]
}

export type FavBusinessUnit = {
  id: string
  name: string
  code: string
  teams: number
  carriers: FavCarrier[]
}

export const FAV_TEAMS: FavTeam[] = [
  {
    id: 't-spot-east',
    name: 'Spot East',
    lead: 'Mandeep Singh',
    bu: 'Charger Logistics',
    carriers: [
      {
        id: 'dgs',
        name: 'DGS Logistics',
        mc: 'MC-771204',
        city: 'Brampton, ON',
        channel: 'WhatsApp',
        contact: 'Ravi Sandhu',
        loads90: 42,
        onTime: '96%',
        rank: 1,
      },
      {
        id: 'roadlink',
        name: 'Roadlink Carriers',
        mc: 'MC-512890',
        city: 'Woodstock, ON',
        channel: 'Email',
        contact: 'Rohit Sharma',
        loads90: 28,
        onTime: '94%',
        rank: 2,
      },
      {
        id: 'uacl',
        name: 'UACL Logistics LLC',
        mc: 'MC-884120',
        city: 'Mississauga, ON',
        channel: 'WhatsApp',
        contact: 'Dispatch desk',
        loads90: 19,
        onTime: '91%',
        rank: 3,
      },
    ],
  },
  {
    id: 't-power',
    name: 'Power Only',
    lead: 'Gagan Chapadia',
    bu: 'Charger Logistics',
    carriers: [
      {
        id: 'midwest',
        name: 'Midwest Power Haul Inc',
        mc: 'MC-551002',
        city: 'Chicago, IL',
        channel: 'Phone',
        contact: 'Ops desk',
        loads90: 31,
        onTime: '93%',
        rank: 1,
      },
      {
        id: 'kuldip',
        name: 'Kuldip Transport Inc',
        mc: 'MC-712904',
        city: 'Brampton, ON',
        channel: 'WhatsApp',
        contact: 'Jaspreet',
        loads90: 22,
        onTime: '90%',
        rank: 2,
      },
    ],
  },
  {
    id: 't-cross',
    name: 'Cross-border MX',
    lead: 'Priya Nair',
    bu: 'International',
    carriers: [
      {
        id: 'manney',
        name: 'Manney Cross-Border SA',
        mc: 'MX-22041',
        city: 'Nuevo Laredo, TAM',
        channel: 'WhatsApp',
        contact: 'Miguel',
        loads90: 16,
        onTime: '88%',
        rank: 1,
      },
      {
        id: 'mangat',
        name: 'Mangat Transhaul Inc',
        mc: 'MC-903441',
        city: 'Surrey, BC',
        channel: 'WhatsApp',
        contact: 'Mandeep',
        loads90: 11,
        onTime: '95%',
        rank: 2,
      },
    ],
  },
]

export const FAV_LANES: FavLane[] = [
  {
    id: 'l1',
    origin: 'Brampton, ON',
    destination: 'Chicago, IL',
    miles: 512,
    equipment: 'DRY-VAN',
    loads30: 38,
    carriers: [
      { name: 'DGS Logistics', mc: 'MC-771204', rank: 1 },
      { name: 'Roadlink Carriers', mc: 'MC-512890', rank: 2 },
      { name: 'UACL Logistics LLC', mc: 'MC-884120', rank: 3 },
    ],
  },
  {
    id: 'l2',
    origin: 'Toronto, ON',
    destination: 'Detroit, MI',
    miles: 231,
    equipment: 'DRY-VAN',
    loads30: 54,
    carriers: [
      { name: 'Kuldip Transport Inc', mc: 'MC-712904', rank: 1 },
      { name: 'DGS Logistics', mc: 'MC-771204', rank: 2 },
    ],
  },
  {
    id: 'l3',
    origin: 'Laredo, TX',
    destination: 'Monterrey, NL',
    miles: 148,
    equipment: 'DRY-VAN',
    loads30: 22,
    carriers: [
      { name: 'Manney Cross-Border SA', mc: 'MX-22041', rank: 1 },
      { name: 'Mangat Transhaul Inc', mc: 'MC-903441', rank: 2 },
    ],
  },
  {
    id: 'l4',
    origin: 'Marysville, OH',
    destination: 'Detroit, MI',
    miles: 186,
    equipment: 'TRI-AXLE',
    loads30: 17,
    carriers: [
      { name: 'Midwest Power Haul Inc', mc: 'MC-551002', rank: 1 },
      { name: 'UACL Logistics LLC', mc: 'MC-884120', rank: 2 },
    ],
  },
]

export const FAV_BUSINESS_UNITS: FavBusinessUnit[] = [
  {
    id: 'bu-charger',
    name: 'Charger Logistics Inc.',
    code: 'CLI',
    teams: 2,
    carriers: [
      ...FAV_TEAMS[0].carriers,
      ...FAV_TEAMS[1].carriers,
    ].filter((c, i, arr) => arr.findIndex((x) => x.id === c.id) === i),
  },
  {
    id: 'bu-intl',
    name: 'International',
    code: 'INTL',
    teams: 1,
    carriers: FAV_TEAMS[2].carriers,
  },
  {
    id: 'bu-fleet',
    name: 'Fleet Ops',
    code: 'FLEET',
    teams: 1,
    carriers: [
      {
        id: 'smart',
        name: 'Smart Choice Transport Ltd',
        mc: 'MC-4483133',
        city: 'Mississauga, ON',
        channel: 'Email',
        contact: 'Harjot Singh',
        loads90: 14,
        onTime: '92%',
        rank: 1,
      },
    ],
  },
]

/** Flat unique favourites across every team, ordered by rank then loads. */
export const FAV_ALL_CARRIERS: FavCarrier[] = (() => {
  const map = new Map<string, FavCarrier>()
  for (const team of FAV_TEAMS) {
    for (const c of team.carriers) {
      const prev = map.get(c.id)
      if (!prev || c.rank < prev.rank) map.set(c.id, c)
    }
  }
  for (const bu of FAV_BUSINESS_UNITS) {
    for (const c of bu.carriers) {
      if (!map.has(c.id)) map.set(c.id, c)
    }
  }
  return [...map.values()].sort((a, b) => a.rank - b.rank || b.loads90 - a.loads90)
})()
