export type ActivityAction =
  | 'max_buy'
  | 'stage_move'
  | 'post_dat'
  | 'post_loadlink'
  | 'blast_email'
  | 'blast_whatsapp'
  | 'offer_add'
  | 'offer_accept'
  | 'offer_reject'
  | 'cmt_approve'
  | 'cmt_reject'
  | 'award'
  | 'contract'
  | 'tracking'
  | 'other'

export type ActivityEvent = {
  id: string
  when: string
  who: string
  action: ActivityAction
  text: string
  loadId?: string
}

export const SEED_ACTIVITY: ActivityEvent[] = [
  {
    id: 'a1',
    when: 'Just now',
    who: 'System',
    action: 'other',
    text: 'Readiness checklist evaluated against posting rules',
  },
  {
    id: 'a2',
    when: 'Today · 11:04',
    who: 'Sukhdeep Dhillon',
    action: 'max_buy',
    text: 'Updated max buy threshold',
  },
  {
    id: 'a3',
    when: 'Today · 10:22',
    who: 'Denise Da Costa',
    action: 'blast_email',
    text: 'Blast email sent to 4 carriers (mock)',
  },
  {
    id: 'a4',
    when: 'Yesterday',
    who: 'James Baumer',
    action: 'post_dat',
    text: 'Posted load to DAT marketplace (mock)',
  },
  {
    id: 'a5',
    when: 'Yesterday',
    who: 'Kamaldeep Kalsi',
    action: 'cmt_approve',
    text: 'CMT override approved for LIONHEART EXPRESS',
  },
]

let seq = 100
export function makeActivity(
  partial: Omit<ActivityEvent, 'id'> & { id?: string }
): ActivityEvent {
  seq += 1
  return { id: partial.id ?? `a${seq}`, ...partial }
}
