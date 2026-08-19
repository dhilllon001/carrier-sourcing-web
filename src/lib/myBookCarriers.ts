import { useCallback, useEffect, useState } from 'react'

const KEY = 'cs-my-book-carriers'
const listeners = new Set<(ids: string[]) => void>()

function seed(): string[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw) as string[]
  } catch {
    /* ignore */
  }
  return []
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

export function useMyBookCarriers() {
  const [ids, setIds] = useState(current)

  useEffect(() => {
    listeners.add(setIds)
    return () => {
      listeners.delete(setIds)
    }
  }, [])

  const add = useCallback((id: string) => {
    if (current.includes(id)) return
    publish([...current, id])
  }, [])

  const isInBook = useCallback((id: string) => ids.includes(id), [ids])

  return { book: ids, isInBook, add }
}
