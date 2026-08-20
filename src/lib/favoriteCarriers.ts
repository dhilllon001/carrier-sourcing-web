import { useCallback, useEffect, useState } from 'react'
import { carrierList } from '@/data/carriers'

/* bump the suffix whenever the seeded favourites below change */
const KEY = 'cs-favorite-carriers-v2'
/* one store shared by every mounted hook, so the grid and the detail page stay in sync */
const listeners = new Set<(ids: string[]) => void>()

/** Carriers a rep would realistically have starred, spread across the sourcing lanes. */
export const SEED_FAVORITES = [
  'srsv',
  'korol',
  'vgn',
  'roadlegends',
  'manney',
  'bajio',
  'reeferpro',
  'midwest',
  'greatlakes',
  'motorcity',
]

function seed(): string[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw) as string[]
  } catch {
    /* ignore */
  }
  return [...carrierList.filter((c) => c.favorite).map((c) => c.id), ...SEED_FAVORITES]
}

let current = seed()

function publish(next: string[]) {
  current = next
  try {
    localStorage.setItem(KEY, JSON.stringify(next))
  } catch {
    /* ignore */
  }
  for (const fn of listeners) fn(next)
}

export function useFavoriteCarriers() {
  const [ids, setIds] = useState(current)

  useEffect(() => {
    listeners.add(setIds)
    return () => {
      listeners.delete(setIds)
    }
  }, [])

  const toggle = useCallback((id: string) => {
    publish(current.includes(id) ? current.filter((x) => x !== id) : [...current, id])
  }, [])

  const isFavorite = useCallback((id: string) => ids.includes(id), [ids])

  return { favorites: ids, isFavorite, toggle }
}
