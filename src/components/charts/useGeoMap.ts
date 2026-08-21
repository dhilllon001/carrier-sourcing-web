import { useEffect, useState } from 'react'
import * as echarts from 'echarts'

type GeoJson = Parameters<typeof echarts.registerMap>[1] & { features: unknown[] }

const files = {
  usa: 'geo/usa.json',
  canada: 'geo/canada.json',
  mexico: 'geo/mexico.json',
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
    if (mapName === 'mexico') {
      echarts.registerMap('mexico', await source('mexico'))
      return
    }
    const [usa, canada, mexico] = await Promise.all([
      source('usa'),
      source('canada'),
      source('mexico'),
    ])
    echarts.registerMap(
      'north-america',
      {
        type: 'FeatureCollection',
        features: [...usa.features, ...canada.features, ...mexico.features],
      } as GeoJson,
      usaLayout
    )
  })()

  registered.set(mapName, pending)
  return pending
}

export type MapName = 'north-america' | 'usa' | 'canada' | 'mexico'

type Ring = number[][]
type Feature = { properties?: { name?: string }; geometry?: { type: string; coordinates: unknown } }
type Box = { minX: number; minY: number; maxX: number; maxY: number }

function rings(feature: Feature): Ring[] {
  if (!feature.geometry) return []
  return feature.geometry.type === 'Polygon'
    ? (feature.geometry.coordinates as Ring[])
    : (feature.geometry.coordinates as Ring[][]).flat()
}

function boxOf(features: Feature[]): Box | null {
  const box: Box = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity }
  for (const feature of features) {
    for (const ring of rings(feature)) {
      for (const [x, y] of ring) {
        if (x < box.minX) box.minX = x
        if (x > box.maxX) box.maxX = x
        if (y < box.minY) box.minY = y
        if (y > box.maxY) box.maxY = y
      }
    }
  }
  return Number.isFinite(box.minX) ? box : null
}

/** Bounding-box centre and a zoom that frames one named region on a map, used
    when the board drills into a single market. The zoom is measured against the
    whole map's extent so it works the same on a country or the continent. */
export function mapRegionView(mapName: MapName, regionName: string) {
  const features = (echarts.getMap(mapName)?.geoJSON as GeoJson | undefined)?.features as
    | Feature[]
    | undefined
  const feature = features?.find((item) => item.properties?.name === regionName)
  if (!feature || !features) return null

  const region = boxOf([feature])
  const whole = boxOf(features)
  if (!region || !whole) return null

  const regionSpan = Math.max(region.maxX - region.minX, (region.maxY - region.minY) * 1.4, 0.5)
  const wholeSpan = Math.max(whole.maxX - whole.minX, 1)
  return {
    center: [(region.minX + region.maxX) / 2, (region.minY + region.maxY) / 2] as [number, number],
    /* Leaving the region at roughly a third of the frame keeps its neighbours
       visible, which is what makes the drill-down readable. */
    zoom: Math.min(7, Math.max(1.5, (wholeSpan / regionSpan) * 0.34)),
  }
}

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
