import { useEffect, useState } from 'react'
import * as echarts from 'echarts'

type GeoJson = Parameters<typeof echarts.registerMap>[1] & { features: unknown[] }

const files = {
  usa: 'geo/usa.json',
  canada: 'geo/canada.json',
} as const

/* Alaska and Hawaii are relocated the same way the ECharts USA sample does, so
   the lower 48 stay large enough to read. */
const usaLayout = {
  Alaska: { left: -131, top: 25, width: 15 },
  Hawaii: { left: -110, top: 28, width: 5 },
  'Puerto Rico': { left: -76, top: 26, width: 2 },
}

const sources = new Map<string, Promise<GeoJson>>()
const registered = new Map<string, Promise<void>>()
/** Maps ECharts can already draw, so a region switch renders without a flash. */
const drawable = new Set<MapName>()

function source(key: keyof typeof files) {
  let pending = sources.get(key)
  if (!pending) {
    pending = fetch(`${import.meta.env.BASE_URL}${files[key]}`).then(
      (response) => response.json() as Promise<GeoJson>
    )
    sources.set(key, pending)
  }
  return pending
}

function register(mapName: MapName) {
  let pending = registered.get(mapName)
  if (pending) return pending

  pending = (async () => {
    if (mapName === 'usa') {
      echarts.registerMap('usa', await source('usa'), usaLayout)
      return
    }
    if (mapName === 'canada') {
      echarts.registerMap('canada', await source('canada'))
      return
    }
    const [usa, canada] = await Promise.all([source('usa'), source('canada')])
    echarts.registerMap(
      'north-america',
      { type: 'FeatureCollection', features: [...usa.features, ...canada.features] } as GeoJson,
      usaLayout
    )
  })()

  registered.set(mapName, pending)
  return pending
}

export type MapName = 'north-america' | 'usa' | 'canada'

/** Loads the GeoJSON for a map once and reports when ECharts can draw it.
    Readiness is keyed by map name so a region switch never hands ECharts an
    option pointing at geometry it has not registered yet. */
export function useGeoMap(mapName: MapName) {
  const [, bump] = useState(0)
  const [failed, setFailed] = useState<MapName | null>(null)

  useEffect(() => {
    if (drawable.has(mapName)) return
    let active = true
    register(mapName)
      .then(() => {
        drawable.add(mapName)
        if (active) bump((n) => n + 1)
      })
      .catch(() => {
        registered.delete(mapName)
        if (active) setFailed(mapName)
      })
    return () => {
      active = false
    }
  }, [mapName])

  return { ready: drawable.has(mapName), failed: failed === mapName }
}
