import { useCallback, useEffect, useState } from 'react'
import { carrierList } from '@/data/carriers'

const KEY = 'cs-favorite-carriers'
/* one store shared by every mounted hook, so the grid and the detail page stay in sync */
const listeners = new Set<(ids: string[]) => void>()

function seed(): string[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw) as string[]
  } catch {
    /* ignore */
  }
  return carrierList.filter((c) => c.favorite).map((c) => c.id)
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
