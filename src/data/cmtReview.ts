export type CmtRiskFlag = {
  id: string
  code: string
  detail: string
}

export type CmtReviewItem = {
  id: string
  carrier: string
  mc: string
  dot?: string
  loadId: string
  equipment: string
  origin: string
  destination: string
  miles: number
  pickupAt: string
  deliveryAt: string
  proposedRate: string
  currency: string
  flags: CmtRiskFlag[]
  submittedAt: string
  reviewerNote?: string
  status: 'Pending' | 'Approved' | 'Rejected'
}

export const cmtReviewQueue: CmtReviewItem[] = [
  {
    id: 'cmt-1',
    carrier: 'NATIONWIDE FREIGHT SOLUTIONS INC',
    mc: '752841',
    dot: '2144902',
    loadId: 'PB-884201',
    equipment: 'DRY-VAN',
    origin: 'ONTARIO, CA',
    destination: 'ONTARIO, CA',
    miles: 71.8,
    pickupAt: 'Aug 12, 08:00',
    deliveryAt: 'Aug 12, 16:30',
    proposedRate: '$55',
    currency: 'USD',
    submittedAt: '11 min ago',
    status: 'Pending',
    flags: [
      {
        id: 'f1',
        code: 'CARGO',
        detail: 'Cargo limit $100k under required $250k for this commodity.',
      },
      {
        id: 'f2',
        code: 'CARRIERAGE',
        detail: 'Authority age under 24 months · extra review required.',
      },
    ],
  },
  {
    id: 'cmt-2',
    carrier: 'NATIONWIDE FREIGHT SOLUTIONS INC',
    mc: '752841',
    dot: '2144902',
    loadId: 'PB-884218',
    equipment: 'DRY-VAN',
    origin: 'ONTARIO, CA',
    destination: 'FONTANA, CA',
    miles: 12.5,
    pickupAt: 'Aug 12, 10:15',
    deliveryAt: 'Aug 12, 14:00',
    proposedRate: '$9',
    currency: 'USD',
    submittedAt: '24 min ago',
    status: 'Pending',
    flags: [
      {
        id: 'f3',
        code: 'CARGO',
        detail: 'Cargo limit $100k under required $250k for this commodity.',
      },
      {
        id: 'f4',
        code: 'CARRIERAGE',
        detail: 'Authority age under 24 months · extra review required.',
      },
    ],
  },
  {
    id: 'cmt-3',
    carrier: 'LIONHEART EXPRESS LLC',
    mc: '1472636',
    dot: '3988120',
    loadId: 'PB-871104',
    equipment: 'DRY-VAN',
    origin: 'LAREDO, TX',
    destination: 'DALLAS, TX',
    miles: 431.2,
    pickupAt: 'Aug 13, 06:00',
    deliveryAt: 'Aug 14, 18:00',
    proposedRate: '$1,420',
    currency: 'USD',
    submittedAt: '1h ago',
    status: 'Pending',
    flags: [
      {
        id: 'f5',
        code: 'CARGO',
        detail: 'Auto liability meets minimum · cargo endorsement missing Mexico legs.',
      },
      {
        id: 'f6',
        code: 'CARRIERAGE',
        detail: 'New on network · fewer than 3 completed loads.',
      },
      {
        id: 'f7',
        code: 'INSURANCE',
        detail: 'COI expires within 21 days · request renewal before award.',
      },
    ],
  },
  {
    id: 'cmt-4',
    carrier: 'MIDWEST POWER HAUL INC',
    mc: '551002',
    loadId: 'PB-869552',
    equipment: 'POWER ONLY',
    origin: 'BRAMPTON, ON',
    destination: 'CHICAGO, IL',
    miles: 498.4,
    pickupAt: 'Aug 12, 18:00',
    deliveryAt: 'Aug 13, 22:00',
    proposedRate: '$1,865',
    currency: 'USD',
    submittedAt: '2h ago',
    status: 'Pending',
    flags: [
      {
        id: 'f8',
        code: 'INSURANCE',
        detail: 'Cross-border cargo rider not attached to active COI.',
      },
    ],
  },
  {
    id: 'cmt-5',
    carrier: 'UACL LOGISTICS LLC',
    mc: '884120',
    dot: '2551021',
    loadId: 'PB-870991',
    equipment: 'REEFER',
    origin: 'TORONTO, ON',
    destination: 'BUFFALO, NY',
    miles: 96.2,
    pickupAt: 'Aug 12, 14:30',
    deliveryAt: 'Aug 12, 20:00',
    proposedRate: '$420',
    currency: 'USD',
    submittedAt: '3h ago',
    status: 'Pending',
    flags: [
      {
        id: 'f9',
        code: 'TERMS',
        detail: 'Payment terms override requested · Net 15 vs standard Net 30.',
      },
      {
        id: 'f10',
        code: 'CARGO',
        detail: 'Reefer commodity requires continuous temp monitoring clause.',
      },
    ],
  },
]
