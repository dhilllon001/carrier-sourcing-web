export const TAG_PALETTE = [
  { bg: '#eef2ff', fg: '#4338ca', border: '#c7d2fe' }, // indigo
  { bg: '#ecfdf5', fg: '#047857', border: '#a7f3d0' }, // emerald
  { bg: '#fff7ed', fg: '#c2410c', border: '#fed7aa' }, // orange
  { bg: '#fdf2f8', fg: '#be185d', border: '#fbcfe8' }, // pink
  { bg: '#eff6ff', fg: '#1d4ed8', border: '#bfdbfe' }, // blue
  { bg: '#f5f3ff', fg: '#6d28d9', border: '#ddd6fe' }, // violet
  { bg: '#fefce8', fg: '#a16207', border: '#fde68a' }, // amber
  { bg: '#f0fdfa', fg: '#0f766e', border: '#99f6e4' }, // teal
  { bg: '#fef2f2', fg: '#b91c1c', border: '#fecaca' }, // red
  { bg: '#f8fafc', fg: '#334155', border: '#e2e8f0' }, // slate
] as const

const KNOWN: Record<string, (typeof TAG_PALETTE)[number]> = {
  'hot lane': TAG_PALETTE[2],
  priority: TAG_PALETTE[4],
  hazmat: TAG_PALETTE[8],
  'team driver': TAG_PALETTE[5],
  'drop trailer': TAG_PALETTE[7],
  border: TAG_PALETTE[0],
  appointment: TAG_PALETTE[1],
  'high value': TAG_PALETTE[6],
  reefer: TAG_PALETTE[3],
  'power only': TAG_PALETTE[9],
}

export function tagTone(tag: string) {
  const key = tag.trim().toLowerCase()
  if (KNOWN[key]) return KNOWN[key]
  let hash = 0
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) >>> 0
  return TAG_PALETTE[hash % TAG_PALETTE.length]
}
