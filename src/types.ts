export type LoadMode = 'Spot' | 'Expedited' | 'Managed'
export type LoadStatus = 'NeedCarrier' | 'Posted' | 'Covered'
export type Stage =
  | 'Sourcing'
  | 'Tender'
  | 'Award'
  | 'Booking'

export type SubStage =
  | 'Overview'
  | 'Find & Post'
  | 'Offers & Bids'
  | 'Finalize Tender'
  | 'CMT'
  | 'Finalize Carrier Award'
  | 'Create Contract'
  | 'Send Confirmation'
  | 'Signed Confirmation'
  | 'Resources'

export interface Load {
  id: string
  po: string
  mode: LoadMode
  modeDetail: string
  status: LoadStatus
  stage: Stage
  subStage: SubStage
  customer: string
  equipment: string
  origin: string
  destination: string
  miles: number
  pickup: string
  delivery: string
  team?: string
  rate?: string
  broker?: string
}

export interface CarrierOffer {
  id: string
  name: string
  mc: string
  dot: string
  bid: string
  vsTarget: string
  vsTargetTone: 'good' | 'warn' | 'neutral'
  rank?: 'BEST' | 'HIGH' | 'LOW'
  status: 'PENDING' | 'EXPIRED' | 'OFFERED' | 'ACCEPTED' | 'REJECTED'
}
