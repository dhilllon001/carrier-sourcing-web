/* One-off helper: shrink the source GeoJSON used by the market insights map.
   Coordinates are rounded to ~100 m and repeated points dropped, which keeps the
   province outlines readable while cutting the payload by roughly two thirds.
   Run with: node scripts/build-geo.mjs <source.geojson> <target.json> */
import { readFileSync, writeFileSync } from 'node:fs'

const [source, target, precision = '3'] = process.argv.slice(2)
const factor = 10 ** Number(precision)
const round = (n) => Math.round(n * factor) / factor

function thin(ring) {
  const out = []
  for (const point of ring) {
    const next = [round(point[0]), round(point[1])]
    const last = out[out.length - 1]
    if (!last || last[0] !== next[0] || last[1] !== next[1]) out.push(next)
  }
  if (out.length < 4) return null
  const first = out[0]
  const last = out[out.length - 1]
  if (first[0] !== last[0] || first[1] !== last[1]) out.push(first)
  return out
}

function bboxSpan(ring) {
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  for (const [x, y] of ring) {
    if (x < minX) minX = x
    if (x > maxX) maxX = x
    if (y < minY) minY = y
    if (y > maxY) maxY = y
  }
  return (maxX - minX) * (maxY - minY)
}

function walk(geometry) {
  if (geometry.type === 'Polygon') {
    const rings = geometry.coordinates.map(thin).filter(Boolean)
    return rings.length ? { type: 'Polygon', coordinates: rings } : null
  }
  if (geometry.type === 'MultiPolygon') {
    const polygons = geometry.coordinates
      .map((polygon) => polygon.map(thin).filter(Boolean))
      .filter((polygon) => polygon.length)
      .map((polygon) => ({ polygon, span: bboxSpan(polygon[0]) }))
      .sort((a, b) => b.span - a.span)
    /* Keep the landmass and any island big enough to read at board size. */
    const kept = polygons.filter((item, index) => index === 0 || item.span > 0.35)
    return kept.length ? { type: 'MultiPolygon', coordinates: kept.map((item) => item.polygon) } : null
  }
  return geometry
}

/* The northern territories carry no freight postings and stretch the map to 83°N,
   which squeezes the corridor everyone actually ships in. */
const skip = new Set(['Nunavut', 'Northwest Territories', 'Yukon Territory'])

const geo = JSON.parse(readFileSync(source, 'utf8'))
const features = geo.features
  .filter((feature) => !skip.has(feature.properties.name))
  .map((feature) => {
    const geometry = walk(feature.geometry)
    return geometry ? { type: 'Feature', properties: { name: feature.properties.name }, geometry } : null
  })
  .filter(Boolean)

writeFileSync(target, JSON.stringify({ type: 'FeatureCollection', features }))
console.log(`${target}: ${features.length} features, ${(readFileSync(target).length / 1024).toFixed(0)} kB`)
