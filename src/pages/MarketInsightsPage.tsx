import { useMemo, useState, type ReactNode } from 'react'
import type { EChartsOption } from 'echarts'
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Gauge,
  Info,
  Map as MapIcon,
  Search,
  Sparkles,
  TrendingUp,
  Truck,
  X,
} from 'lucide-react'
import { cn } from '@/lib/cn'
import { EChart } from '@/components/charts/EChart'
import { MarketFeedPanel } from '@/components/AiAlertsPanel'
import { MarketIntelligencePanel } from '@/components/MarketIntelligencePanel'
import { Tip } from '@/components/Tip'
import {
  CHART_FONT,
  chartTooltip,
  chartTooltipLine,
  tooltipCategory,
} from '@/components/charts/chartTheme'
import { mapRegionView, useGeoMap, type MapName } from '@/components/charts/useGeoMap'
import {
  routeAreaCodes,
  routeMatchesProfile,
  type InsightPreferenceProfile,
} from '@/data/insightPreferences'
import {
  areaRatio,
  areaTone,
  cityMarkets,
  cityRatio,
  cityTone,
  insightRoutes,
  marketAreas,
  nationalRates,
  nationalTrend,
  postingHistory,
  toneColor,
  toneLabel,
  topNationalLanes,
  type EquipmentMarket,
  type InsightRegion,
  type MarketCountry,
  type MarketTone,
} from '@/data/marketInsights'

type Props = {
  search: string
  profile: InsightPreferenceProfile
  onOpenCapacity?: () => void
  onOpenPreferences: () => void
}

const regions: InsightRegion[] = ['North America', 'United States', 'Canada', 'Mexico']

const countryOfRegion: Record<InsightRegion, MarketCountry | null> = {
  'North America': null,
  'United States': 'US',
  Canada: 'CA',
  Mexico: 'MX',
}

const countryLabel: Record<MarketCountry, string> = {
  US: 'United States',
  CA: 'Canada',
  MX: 'Mexico',
}
const equipmentTypes: EquipmentMarket[] = ['Van', 'Reefer', 'Flatbed']
/** Stop code to country, so a lane can be matched to the selected region. */
const countryByCode = new Map(marketAreas.map((area) => [area.code, area.country]))

/** Lane filters match either direction, since a desk works the round trip. */
function onLane(origin: string, destination: string, pair: string[]) {
  const [from, to] = pair
  return (
    (origin === from && destination === to) || (origin === to && destination === from)
  )
}

/** Plain-language read of each national benchmark, shown on hover. */
const rateHints: Record<string, string> = {
  'broker-spot': 'What brokers pay carriers on the open market this week, fuel included.',
  'shipper-contract': 'What shippers pay on committed volume, so the ceiling for a spot buy.',
  'fuel-surcharge': 'Fuel portion already inside both rates above. Flat weeks mean no reprice.',
}

const toneHints: Record<MarketTone, string> = {
  tight: 'Loads per truck above 1.35. Post early, expect to pay over the benchmark.',
  balanced: 'Loads per truck between 0.85 and 1.35. Benchmark rates should cover it.',
  soft: 'Loads per truck under 0.85. Capacity is looking for freight, so push back on price.',
}

const axisLabel = { color: '#64748b', fontSize: 13, fontFamily: CHART_FONT }
const axisLine = { lineStyle: { color: '#dfe4ea' } }
const splitLine = { lineStyle: { color: '#eef1f5' } }

function Signal({ tone }: { tone: MarketTone }) {
  return <span className={cn('mi-signal', `is-${tone}`)}>{toneLabel[tone]}</span>
}

type Sort = { key: string; dir: 'asc' | 'desc' }

/** Numeric column header that toggles the table sort, highest first. */
function SortHead({
  id,
  sort,
  onSort,
  tip,
  children,
}: {
  id: string
  sort: Sort
  onSort: (sort: Sort) => void
  /** One line on what the column measures, shown on hover. */
  tip?: string
  children: ReactNode
}) {
  const active = sort.key === id
  const head = (
    <button
      type="button"
      className={cn('mi-sort', active && 'is-active')}
      onClick={() => onSort({ key: id, dir: active && sort.dir === 'desc' ? 'asc' : 'desc' })}
    >
      {children}
      {active ? sort.dir === 'desc' ? <ChevronDown size={12} /> : <ChevronUp size={12} /> : null}
    </button>
  )

  if (!tip) return head
  return (
    <Tip
      className="mi-head-tip"
      tip={
        <>
          <b>{children}</b>
          <em>{tip}</em>
          <em>Click to sort.</em>
        </>
      }
    >
      {head}
    </Tip>
  )
}

/** Plain (non-sortable) column heading with a hover explanation. */
function Head({ tip, children }: { tip: string; children: ReactNode }) {
  return (
    <Tip
      className="mi-head-tip"
      tip={
        <>
          <b>{children}</b>
          <em>{tip}</em>
        </>
      }
    >
      <span className="mi-head-label">{children}</span>
    </Tip>
  )
}

/** Long tables open collapsed so the page stays scannable. */
const PAGE_ROWS = 12

function MoreRows({
  shown,
  total,
  label,
  onToggle,
}: {
  shown: number
  total: number
  label: string
  onToggle: () => void
}) {
  const open = shown >= total
  return (
    <button type="button" className="mi-more" onClick={onToggle}>
      {open ? (
        <>
          Show top {PAGE_ROWS} {label}
          <ChevronUp size={13} />
        </>
      ) : (
        <>
          Show all {total} {label}
          <ChevronDown size={13} />
        </>
      )}
    </button>
  )
}

/** How the visible rows split across tight, balanced, and soft capacity. */
function ToneMix({ rows }: { rows: MarketTone[] }) {
  const counts = rows.reduce<Record<MarketTone, number>>(
    (acc, tone) => ({ ...acc, [tone]: acc[tone] + 1 }),
    { tight: 0, balanced: 0, soft: 0 }
  )
  return (
    <div className="mi-mix">
      {(['tight', 'balanced', 'soft'] as MarketTone[]).map((tone) => (
        <span key={tone} className={cn('mi-mix__item', `is-${tone}`)}>
          <i />
          {counts[tone]} {toneLabel[tone].toLowerCase()}
        </span>
      ))}
    </div>
  )
}

/** Loads per truck as a number plus a bar scaled against a 2.5× ceiling. */
function Ratio({ value }: { value: number }) {
  const tone: MarketTone = value >= 1.35 ? 'tight' : value >= 0.85 ? 'balanced' : 'soft'
  return (
    <span className={cn('mi-ratio', `is-${tone}`)}>
      <b>{value.toFixed(2)}</b>
      <i>
        <u style={{ width: `${Math.min(100, (value / 2.5) * 100)}%` }} />
      </i>
    </span>
  )
}

/** Inbound headline with the matching outbound count underneath. */
function Pair({ inbound, outbound }: { inbound: number; outbound: number }) {
  return (
    <span className="mi-pair">
      <b>{inbound.toLocaleString()}</b>
      <em>out {outbound.toLocaleString()}</em>
    </span>
  )
}

/** Week-over-week rate move. Rising rates are the cost side for the desk. */
function Move({ value }: { value: number }) {
  return (
    <span className={cn('mi-num', value >= 0 ? 'is-warn' : 'is-good')}>
      {value >= 0 ? '▲' : '▼'} {Math.abs(value).toFixed(1)}%
    </span>
  )
}

function byKey<T extends Record<string, unknown>>(rows: T[], sort: Sort) {
  return [...rows].sort((a, b) => {
    const left = a[sort.key]
    const right = b[sort.key]
    const diff =
      typeof left === 'number' && typeof right === 'number'
        ? left - right
        : String(left).localeCompare(String(right))
    return sort.dir === 'desc' ? -diff : diff
  })
}

const mapNames: Record<InsightRegion, MapName> = {
  'North America': 'north-america',
  'United States': 'usa',
  Canada: 'canada',
  Mexico: 'mexico',
}

export function MarketInsightsPage({
  search,
  profile,
  onOpenCapacity,
  onOpenPreferences,
}: Props) {
  const preferredRoutes = useMemo(
    () => insightRoutes.filter((route) => routeMatchesProfile(route, profile)),
    [profile]
  )
  const [region, setRegion] = useState<InsightRegion>('North America')
  const [equipment, setEquipment] = useState<EquipmentMarket>('Van')
  const [view, setView] = useState<'map' | 'ranking'>('map')
  const [routeId, setRouteId] = useState(preferredRoutes[0]?.id ?? insightRoutes[0].id)
  const [stateSort, setStateSort] = useState<Sort>({ key: 'ratio', dir: 'desc' })
  const [citySort, setCitySort] = useState<Sort>({ key: 'ratio', dir: 'desc' })
  const [statesShown, setStatesShown] = useState(PAGE_ROWS)
  const [citiesShown, setCitiesShown] = useState(PAGE_ROWS)
  /** Market code the board is drilled into, set by clicking the map or a row. */
  const [focusCode, setFocusCode] = useState<string | null>(null)
  /** Preferred lane the board is filtered to, as `origin-destination`. */
  const [laneKey, setLaneKey] = useState<string | null>(null)

  const lanePair = laneKey ? laneKey.split('-') : null

  /** Drilling into a market replaces any lane filter, so the two never fight. */
  const drillTo = (code: string) => {
    setFocusCode(code === focusCode ? null : code)
    setLaneKey(null)
  }

  const mapName = mapNames[region]
  const geo = useGeoMap(mapName)

  const areas = useMemo(() => {
    const country = countryOfRegion[region]
    return marketAreas
      .filter(
        (area) =>
          profile.areaCodes.includes(area.code) && (!country || area.country === country)
      )
      .slice()
      .sort((a, b) => areaRatio(b) - areaRatio(a))
  }, [profile.areaCodes, region])

  const focus = focusCode ? areas.find((area) => area.code === focusCode) ?? null : null
  const focusName = focus?.name ?? null

  /** Each market's share of regional inbound load postings. */
  const shares = useMemo(() => {
    const total = areas.reduce((sum, area) => sum + area.loadsIn, 0) || 1
    return new Map(areas.map((area) => [area.code, (area.loadsIn / total) * 100]))
  }, [areas])

  const mapOption = useMemo<EChartsOption>(() => {
    const byName = new Map(areas.map((area) => [area.name, area]))
    /* Framing the drilled-in market keeps the click and the zoom together. */
    const view = focusName && geo.ready ? mapRegionView(mapName, focusName) : null
    return {
      textStyle: { fontFamily: CHART_FONT, fontSize: 13 },
      tooltip: {
        ...chartTooltip,
        trigger: 'item',
        showDelay: 0,
        transitionDuration: 0.2,
        formatter: (params) => {
          const name = tooltipCategory(params)
          const area = byName.get(name)
          if (!area) {
            return `<div style="font-weight:700">${name}</div>
                    <div style="color:#77828f">No postings in this snapshot</div>`
          }
          const tone = areaTone(area)
          return `
            <div style="font-weight:700;margin-bottom:5px">${area.name} (${area.code})</div>
            <div style="color:${toneColor[tone]};font-weight:650;margin-bottom:6px">
              ${toneLabel[tone]} · ${areaRatio(area).toFixed(2)} loads per truck
            </div>
            <div>Share of regional loads <b>${(shares.get(area.code) ?? 0).toFixed(1)}%</b></div>
            <div>Loads in <b>${area.loadsIn.toLocaleString()}</b> · out ${area.loadsOut.toLocaleString()}</div>
            <div>Trucks in <b>${area.trucksIn.toLocaleString()}</b> · out ${area.trucksOut.toLocaleString()}</div>
            <div style="margin-top:5px">Spot <b>$${area.spot.toFixed(2)}</b> · contract $${area.contract.toFixed(2)}</div>
          `
        },
      },
      visualMap: {
        type: 'piecewise',
        orient: 'horizontal',
        left: 'center',
        bottom: 0,
        itemWidth: 13,
        itemHeight: 13,
        itemGap: 12,
        textStyle: { color: '#64748b', fontSize: 12, fontFamily: CHART_FONT },
        pieces: [
          { min: 2, label: 'Very tight ≥ 2.0×', color: '#dc2626' },
          { min: 1.35, max: 2, label: 'Tight 1.35–2.0×', color: '#f87171' },
          { min: 0.85, max: 1.35, label: 'Balanced 0.85–1.35×', color: '#93c5fd' },
          { min: 0.6, max: 0.85, label: 'Soft 0.6–0.85×', color: '#6ee7b7' },
          { max: 0.6, label: 'Very soft < 0.6×', color: '#10b981' },
        ],
      },
      series: [
        {
          name: 'Loads per truck',
          type: 'map',
          map: mapName,
          roam: 'move',
          /* Sizing by layoutCenter keeps the true shape. Pinning all four edges
             instead makes ECharts stretch the outlines to fill the box. */
          aspectScale: 0.75,
          layoutCenter: ['50%', '47%'],
          layoutSize: '158%',
          ...(view ? { center: view.center, zoom: view.zoom } : {}),
          itemStyle: { areaColor: '#eef1f5', borderColor: '#fff', borderWidth: 0.8 },
          label: {
            show: true,
            fontSize: 10,
            fontFamily: CHART_FONT,
            color: '#3d4756',
            formatter: ({ name }) => byName.get(String(name))?.code ?? '',
          },
          labelLayout: { hideOverlap: true },
          emphasis: {
            label: {
              show: true,
              fontSize: 12,
              fontWeight: 'bold',
              color: '#0f172a',
              formatter: ({ name }) => {
                const area = byName.get(String(name))
                if (!area) return String(name)
                return `${area.code}\n${(shares.get(area.code) ?? 0).toFixed(1)}%`
              },
            },
            itemStyle: { borderColor: '#0f172a', borderWidth: 1.6, shadowBlur: 8, shadowColor: 'rgba(15,23,42,.35)' },
          },
          select: { disabled: true },
          data: areas.map((area) => ({
            name: area.name,
            value: Number(areaRatio(area).toFixed(2)),
            ...(area.code === focusCode || lanePair?.includes(area.code)
              ? { itemStyle: { borderColor: '#0f172a', borderWidth: 1.8 } }
              : {}),
          })),
        },
      ],
    }
  }, [areas, focusCode, focusName, geo.ready, laneKey, mapName, shares])

  const routes = useMemo(() => {
    const q = search.trim().toLowerCase()
    const country = countryOfRegion[region]
    return preferredRoutes.filter((route) => {
      const [from, to] = routeAreaCodes(route)
      const regionMatch =
        !country || routeAreaCodes(route).some((code) => countryByCode.get(code) === country)
      const laneMatch = !lanePair || onLane(from, to, lanePair)
      const textMatch =
        !q ||
        [route.origin, route.destination, route.customer].join(' ').toLowerCase().includes(q)
      return regionMatch && laneMatch && route.equipment === equipment && textMatch
    })
  }, [equipment, laneKey, preferredRoutes, region, search])

  const route =
    preferredRoutes.find((item) => item.id === routeId) ??
    preferredRoutes[0] ??
    insightRoutes[0]
  const averageSpot =
    areas.reduce((sum, area) => sum + area.spot, 0) / Math.max(1, areas.length)
  const averageRatio =
    areas.reduce((sum, area) => sum + areaRatio(area), 0) / Math.max(1, areas.length)
  const hardestMarket = areas.reduce(
    (hardest, area) => (!hardest || areaRatio(area) > areaRatio(hardest) ? area : hardest),
    areas[0]
  )

  /* Capacity balance: loads and trucks for the tightest markets, ratio on a second axis. */
  const capacityOption = useMemo<EChartsOption>(() => {
    const ranked = areas.slice(0, 16)
    const codes = ranked.map((area) => area.code)
    return {
      textStyle: { fontFamily: CHART_FONT, fontSize: 13 },
      grid: { top: 40, right: 40, bottom: 26, left: 48 },
      legend: {
        top: 0,
        left: 0,
        itemWidth: 11,
        itemHeight: 11,
        textStyle: { color: '#64748b', fontSize: 13, fontFamily: CHART_FONT },
      },
      tooltip: {
        ...chartTooltip,
        formatter: (params) => {
          const area = areas.find((item) => item.code === tooltipCategory(params))
          if (!area) return ''
          const tone = areaTone(area)
          return `
            <div style="font-weight:700;margin-bottom:5px">${area.name}</div>
            <div style="color:${toneColor[tone]};font-weight:650;margin-bottom:6px">
              ${toneLabel[tone]} · ${areaRatio(area).toFixed(2)} loads per truck
            </div>
            <div>Loads in <b>${area.loadsIn.toLocaleString()}</b> · out ${area.loadsOut.toLocaleString()}</div>
            <div>Trucks in <b>${area.trucksIn.toLocaleString()}</b> · out ${area.trucksOut.toLocaleString()}</div>
            <div style="margin-top:5px">Spot <b>$${area.spot.toFixed(2)}</b> · contract $${area.contract.toFixed(2)}</div>
          `
        },
      },
      xAxis: {
        type: 'category',
        data: codes,
        axisLabel,
        axisLine,
        axisTick: { show: false },
      },
      yAxis: [
        { type: 'value', axisLabel, splitLine },
        {
          type: 'value',
          axisLabel: { ...axisLabel, formatter: (v: number) => `${v.toFixed(1)}×` },
          splitLine: { show: false },
        },
      ],
      series: [
        {
          name: 'Loads in',
          type: 'bar',
          data: ranked.map((area) => area.loadsIn),
          itemStyle: { color: '#2563eb', borderRadius: [3, 3, 0, 0] },
          barMaxWidth: 18,
        },
        {
          name: 'Trucks in',
          type: 'bar',
          data: ranked.map((area) => area.trucksIn),
          itemStyle: { color: '#a5c4f7', borderRadius: [3, 3, 0, 0] },
          barMaxWidth: 18,
        },
        {
          name: 'Loads per truck',
          type: 'line',
          yAxisIndex: 1,
          smooth: true,
          symbolSize: 6,
          data: ranked.map((area) => Number(areaRatio(area).toFixed(2))),
          lineStyle: { color: '#f97316', width: 2 },
          itemStyle: { color: '#f97316' },
        },
      ],
    }
  }, [areas])

  /* National spot rates by equipment, month over month. */
  const ratesOption = useMemo<EChartsOption>(
    () => ({
      textStyle: { fontFamily: CHART_FONT, fontSize: 13 },
      grid: { top: 34, right: 14, bottom: 24, left: 44 },
      legend: {
        top: 0,
        right: 0,
        itemWidth: 11,
        itemHeight: 11,
        textStyle: { color: '#64748b', fontSize: 13, fontFamily: CHART_FONT },
      },
      tooltip: {
        ...chartTooltip,
        valueFormatter: (value) => `$${Number(value).toFixed(2)}/mi`,
      },
      xAxis: {
        type: 'category',
        data: nationalTrend.labels,
        axisLabel,
        axisLine,
        axisTick: { show: false },
      },
      yAxis: {
        type: 'value',
        min: 2.5,
        axisLabel: { ...axisLabel, formatter: (value: number) => `$${value.toFixed(2)}` },
        splitLine,
      },
      series: [
        { name: 'Van', type: 'bar', data: nationalTrend.van, barMaxWidth: 22, itemStyle: { color: '#f59e0b', borderRadius: [4, 4, 0, 0] } },
        { name: 'Flatbed', type: 'bar', data: nationalTrend.flatbed, barMaxWidth: 22, itemStyle: { color: '#8b5cf6', borderRadius: [4, 4, 0, 0] } },
        { name: 'Reefer', type: 'bar', data: nationalTrend.reefer, barMaxWidth: 22, itemStyle: { color: '#06b6d4', borderRadius: [4, 4, 0, 0] } },
      ],
    }),
    []
  )

  /* Load and truck postings over the last twelve weeks. */
  const postingOption = useMemo<EChartsOption>(
    () => ({
      textStyle: { fontFamily: CHART_FONT, fontSize: 13 },
      grid: { top: 34, right: 46, bottom: 26, left: 46 },
      legend: {
        top: 0,
        right: 0,
        itemWidth: 11,
        itemHeight: 11,
        textStyle: { color: '#64748b', fontSize: 13, fontFamily: CHART_FONT },
      },
      tooltip: chartTooltipLine,
      xAxis: {
        type: 'category',
        data: postingHistory.weeks,
        axisLabel: { ...axisLabel, interval: 1 },
        axisLine,
        axisTick: { show: false },
      },
      yAxis: [
        { type: 'value', axisLabel: { ...axisLabel, formatter: (v: number) => `${v}k` }, splitLine },
        { type: 'value', axisLabel: { ...axisLabel, formatter: (v: number) => `${v}k` }, splitLine: { show: false } },
      ],
      series: [
        {
          name: 'Load posts',
          type: 'line',
          smooth: true,
          showSymbol: false,
          data: postingHistory.loads,
          lineStyle: { color: '#7c3aed', width: 2.5 },
          itemStyle: { color: '#7c3aed' },
          areaStyle: { color: 'rgba(124,58,237,0.08)' },
          z: 3,
        },
        {
          name: 'Truck posts',
          type: 'bar',
          yAxisIndex: 1,
          data: postingHistory.trucks,
          barMaxWidth: 16,
          itemStyle: { color: '#cdeef5', borderRadius: [3, 3, 0, 0] },
          z: 1,
        },
      ],
    }),
    []
  )

  /* Top national lanes with the low-to-high band behind the paid rate. */
  const lanesOption = useMemo<EChartsOption>(() => {
    const rows = topNationalLanes.slice(0, 8).reverse()
    return {
      textStyle: { fontFamily: CHART_FONT, fontSize: 13 },
      grid: { top: 14, right: 26, bottom: 24, left: 84 },
      tooltip: {
        ...chartTooltip,
        formatter: (params) => {
          const row = rows.find((item) => item.short === tooltipCategory(params))
          if (!row) return ''
          return `
            <div style="font-weight:700;margin-bottom:5px">${row.lane}</div>
            <div>Broker spot <b>$${row.rate.toLocaleString()}</b></div>
            <div style="color:#64748b">Range $${row.low.toLocaleString()} – $${row.high.toLocaleString()}</div>
          `
        },
      },
      xAxis: {
        type: 'value',
        axisLabel: { ...axisLabel, formatter: (v: number) => `$${(v / 1000).toFixed(1)}k` },
        splitLine,
      },
      yAxis: {
        type: 'category',
        data: rows.map((row) => row.short),
        axisLabel: { ...axisLabel, fontWeight: 600 },
        axisLine,
        axisTick: { show: false },
      },
      series: [
        {
          name: 'Range',
          type: 'bar',
          stack: 'band',
          data: rows.map((row) => row.low),
          itemStyle: { color: 'transparent' },
          barMaxWidth: 16,
          silent: true,
        },
        {
          name: 'Spread',
          type: 'bar',
          stack: 'band',
          data: rows.map((row) => row.high - row.low),
          itemStyle: { color: '#e4ecfa', borderRadius: 3 },
          barMaxWidth: 16,
        },
        {
          name: 'Broker spot',
          type: 'scatter',
          symbolSize: 13,
          data: rows.map((row) => [row.rate, row.short]),
          itemStyle: { color: '#2563eb', borderColor: '#fff', borderWidth: 2 },
        },
      ],
    }
  }, [])

  /* Metro rows live inside the selected states, so both tables always agree.
     Drilling into a market narrows this to that market's metros. */
  const cityRows = useMemo(() => {
    const q = search.trim().toLowerCase()
    const country = countryOfRegion[region]
    const rows = cityMarkets
      .filter(
        (city) =>
          profile.areaCodes.includes(city.state) &&
          (!country || city.country === country) &&
          (!focusCode || city.state === focusCode) &&
          (!lanePair || lanePair.includes(city.state)) &&
          (!q ||
            [city.city, city.code, city.state, city.topOutbound]
              .join(' ')
              .toLowerCase()
              .includes(q))
      )
      .map((city) => ({ ...city, ratio: cityRatio(city) }))
    return byKey(rows, citySort)
  }, [citySort, focusCode, laneKey, profile.areaCodes, region, search])

  const stateRows = useMemo(() => {
    const q = search.trim().toLowerCase()
    const metros = new Map<string, number>()
    for (const city of cityMarkets) {
      metros.set(city.state, (metros.get(city.state) ?? 0) + 1)
    }
    const rows = areas
      .filter(
        (area) => !q || [area.code, area.name].join(' ').toLowerCase().includes(q)
      )
      .map((area) => ({
        area,
        loadsIn: area.loadsIn,
        loadsOut: area.loadsOut,
        trucksIn: area.trucksIn,
        trucksOut: area.trucksOut,
        net: area.loadsIn - area.loadsOut,
        ratio: areaRatio(area),
        share: shares.get(area.code) ?? 0,
        spot: area.spot,
        contract: area.contract,
        spread: area.spot - area.contract,
        metros: metros.get(area.code) ?? 0,
      }))
    return byKey(rows, stateSort)
  }, [areas, search, shares, stateSort])

  const totals = useMemo(
    () =>
      stateRows.reduce(
        (sum, row) => ({
          loadsIn: sum.loadsIn + row.loadsIn,
          trucksIn: sum.trucksIn + row.trucksIn,
        }),
        { loadsIn: 0, trucksIn: 0 }
      ),
    [stateRows]
  )

  const laneRows = useMemo(() => {
    const q = search.trim().toLowerCase()
    return topNationalLanes.filter(
      (lane) =>
        (!focusCode || lane.origin === focusCode || lane.destination === focusCode) &&
        (!lanePair || onLane(lane.origin, lane.destination, lanePair)) &&
        (!q || [lane.short, lane.lane, lane.equipment].join(' ').toLowerCase().includes(q))
    )
  }, [focusCode, laneKey, search])

  const laneTrendOption = useMemo<EChartsOption>(
    () => ({
      textStyle: { fontFamily: CHART_FONT, fontSize: 13 },
      grid: { top: 14, right: 16, bottom: 24, left: 48 },
      tooltip: { ...chartTooltipLine, valueFormatter: (v) => `$${Number(v).toFixed(2)}/mi` },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7'],
        axisLabel,
        axisLine,
        axisTick: { show: false },
      },
      yAxis: {
        type: 'value',
        scale: true,
        axisLabel: { ...axisLabel, formatter: (v: number) => `$${v.toFixed(2)}` },
        splitLine,
      },
      series: [
        {
          name: 'Spot rate',
          type: 'line',
          smooth: true,
          symbolSize: 7,
          data: route.trend,
          lineStyle: { color: '#2563eb', width: 2.5 },
          itemStyle: { color: '#2563eb' },
          areaStyle: { color: 'rgba(37,99,235,0.10)' },
        },
      ],
    }),
    [route]
  )

  return (
    <main className="mi-page">
      <section className="mi-controls">
        <div className="mi-tabs" role="tablist" aria-label="Region">
          {regions.map((item) => (
            <button
              key={item}
              type="button"
              role="tab"
              aria-selected={region === item}
              className={cn(region === item && 'is-active')}
              onClick={() => setRegion(item)}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="mi-equipment" role="group" aria-label="Equipment">
          {equipmentTypes.map((item) => (
            <button
              key={item}
              type="button"
              className={cn(equipment === item && 'is-active')}
              onClick={() => setEquipment(item)}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="mi-lanes" role="group" aria-label="Preferred lanes">
          <span>Lanes</span>
          <button
            type="button"
            className={cn(!laneKey && 'is-active')}
            onClick={() => setLaneKey(null)}
          >
            All
          </button>
          {profile.lanes.map((lane) => {
            const key = `${lane.origin}-${lane.destination}`
            return (
              <Tip
                key={lane.id}
                className="mi-lane-chip"
                tip={
                  <>
                    <b>
                      {lane.origin} – {lane.destination}
                    </b>
                    <em>
                      {laneKey === key
                        ? 'Showing this lane only. Click again to clear.'
                        : 'Filter lanes, metros and the map to this pair, both directions.'}
                    </em>
                  </>
                }
              >
                <button
                  type="button"
                  className={cn(laneKey === key && 'is-active')}
                  onClick={() => {
                    setLaneKey(laneKey === key ? null : key)
                    setFocusCode(null)
                  }}
                >
                  {lane.origin} <ArrowRight size={11} /> {lane.destination}
                </button>
              </Tip>
            )
          })}
        </div>

        <div className="mi-controls__meta">
          <span>
            {profile.areaCodes.length} markets · {profile.lanes.length} lanes · snapshot Aug 20, 2026
          </span>
          <button type="button" onClick={onOpenPreferences}>
            <Sparkles size={13} /> Personalized for {profile.name}
          </button>
        </div>
      </section>

      <section className="mi-stats">
        <header>
          <div>
            <h3>National rate</h3>
            <span>Updated {nationalRates.updated}</span>
          </div>
          <em>{region} · {equipment}</em>
        </header>

        <div className="mi-stats__row">
          {nationalRates.items.map((item) => (
            <Tip
              key={item.id}
              block
              tip={
                <>
                  <b>{item.label}</b>
                  <em>{rateHints[item.id] ?? 'National benchmark, fuel included.'}</em>
                </>
              }
            >
              <article>
                <span>{item.label}</span>
                <strong>
                  ${item.value.toFixed(2)}
                  <u>
                    ({item.delta < 0 ? '−' : item.delta > 0 ? '+' : ''}$
                    {Math.abs(item.delta).toFixed(2)})
                  </u>
                </strong>
                <em className={item.direction === 'neutral' ? 'is-flat' : 'is-up'}>
                  {item.direction === 'neutral' ? (
                    <>
                      <ArrowRight size={12} /> Rate is neutral
                    </>
                  ) : (
                    <>
                      <TrendingUp size={12} /> Rate is increasing
                    </>
                  )}
                </em>
              </article>
            </Tip>
          ))}

          <Tip
            block
            tip={
              <>
                <b>Average spot across your markets</b>
                <em>
                  Loads-in weighted across the {areas.length} markets in {profile.name}, not the
                  whole country.
                </em>
              </>
            }
          >
            <article className="is-preference">
              <span>Preferred market spot</span>
              <strong>
                ${averageSpot.toFixed(2)}
                <u>/ mi</u>
              </strong>
              <em>
                <Activity size={12} /> {areas.length} selected markets
              </em>
            </article>
          </Tip>

          <Tip
            block
            tip={
              <>
                <b>Loads per truck</b>
                <em>
                  Above 1.35 means more freight than capacity, so expect to pay up. Below 0.85 is a
                  buyer&rsquo;s market.
                </em>
              </>
            }
          >
            <article className="is-preference">
              <span>Average load / truck</span>
              <strong>{averageRatio.toFixed(2)}</strong>
              <em className={averageRatio >= 1.35 ? 'is-warn' : undefined}>
                <Gauge size={12} />{' '}
                {hardestMarket
                  ? `${hardestMarket.code} hardest at ${areaRatio(hardestMarket).toFixed(2)}×`
                  : 'No selected market'}
              </em>
            </article>
          </Tip>
        </div>
      </section>

      <MarketIntelligencePanel
        region={region}
        equipment={equipment}
        selectedMarkets={profile.areaCodes}
      />

      <section className="mi-grid">
        <article className="mi-card">
          <header>
            <div>
              <span>Market conditions</span>
              <h3>
                {focus ? (
                  <span className="mi-crumbs">
                    <button type="button" onClick={() => setFocusCode(null)}>
                      {region}
                    </button>
                    {countryLabel[focus.country] === region ? null : (
                      <>
                        <ChevronRight size={14} />
                        {countryLabel[focus.country]}
                      </>
                    )}
                    <ChevronRight size={14} />
                    <b>{focus.name}</b>
                  </span>
                ) : lanePair ? (
                  <span className="mi-crumbs">
                    <button type="button" onClick={() => setLaneKey(null)}>
                      {region}
                    </button>
                    <ChevronRight size={14} />
                    <b>
                      {lanePair[0]} – {lanePair[1]} lane
                    </b>
                  </span>
                ) : (
                  `${region} capacity balance`
                )}
              </h3>
            </div>
            {focus || lanePair ? (
              <button
                type="button"
                className="mi-clear"
                onClick={() => {
                  setFocusCode(null)
                  setLaneKey(null)
                }}
              >
                <X size={13} /> Back to {region}
              </button>
            ) : null}
            <div className="mi-view" role="group" aria-label="Chart view">
              <button
                type="button"
                className={cn(view === 'map' && 'is-active')}
                onClick={() => setView('map')}
              >
                <MapIcon size={13} /> Map
              </button>
              <button
                type="button"
                className={cn(view === 'ranking' && 'is-active')}
                onClick={() => setView('ranking')}
              >
                <BarChart3 size={13} /> Ranking
              </button>
            </div>
          </header>
          <div className="mi-map-body">
            <div className="mi-map-body__chart">
              {view === 'map' ? (
                geo.ready ? (
                  <EChart
                    option={mapOption}
                    height={500}
                    ariaLabel={`${region} loads per truck by market`}
                    onSelect={(name) => {
                      const clicked = areas.find((area) => area.name === name)
                      if (clicked) drillTo(clicked.code)
                    }}
                  />
                ) : (
                  <div className="mi-chart__state" style={{ height: 500 }}>
                    {geo.failed ? 'Map outline unavailable.' : 'Loading map outline…'}
                  </div>
                )
              ) : (
                <EChart
                  option={capacityOption}
                  height={500}
                  ariaLabel={`${region} loads and trucks by market`}
                />
              )}
            </div>
            <aside className="mi-rail">
              <span>Tightest markets</span>
              {areas.slice(0, 8).map((area) => {
                const ratio = areaRatio(area)
                return (
                  <Tip
                    key={area.code}
                    block
                    tip={
                      <>
                        <b>
                          {area.name} · {toneLabel[areaTone(area)]}
                        </b>
                        <em>
                          {(area.loadsIn + area.loadsOut).toLocaleString()} loads against{' '}
                          {(area.trucksIn + area.trucksOut).toLocaleString()} trucks · spot $
                          {area.spot.toFixed(2)}/mi · contract ${area.contract.toFixed(2)}/mi
                        </em>
                        <em>Click to drill into its metros and lanes.</em>
                      </>
                    }
                  >
                    <button
                      type="button"
                      className={cn('mi-rail__row', area.code === focusCode && 'is-active')}
                      onClick={() => drillTo(area.code)}
                    >
                      <b>{area.code}</b>
                      <span>{area.name}</span>
                      <em>{ratio.toFixed(2)}×</em>
                      <i>
                        <u
                          style={{
                            width: `${Math.min(100, (ratio / 3.2) * 100)}%`,
                            background: toneColor[areaTone(area)],
                          }}
                        />
                      </i>
                      <small>{(shares.get(area.code) ?? 0).toFixed(1)}% of loads</small>
                    </button>
                  </Tip>
                )
              })}
            </aside>
          </div>
          <div className="mi-legend">
            {(['tight', 'balanced', 'soft'] as MarketTone[]).map((tone) => (
              <Tip
                key={tone}
                tip={
                  <>
                    <b>{toneLabel[tone]}</b>
                    <em>{toneHints[tone]}</em>
                  </>
                }
              >
                <span>
                  <i style={{ background: toneColor[tone] }} />
                  {toneLabel[tone]}
                  <b>{areas.filter((area) => areaTone(area) === tone).length}</b>
                </span>
              </Tip>
            ))}
            <span className="mi-legend__hint">
              {view === 'map'
                ? 'Hover for postings and rates · click a market to drill into its metros and lanes'
                : 'Top 16 markets by loads per truck'}
            </span>
          </div>
        </article>

        <MarketFeedPanel profile={profile} />
      </section>

      <section className="mi-card mi-brief">
        <header>
          <div>
            <span>Lane brief</span>
            <h3>
              {route.origin} <ArrowRight size={15} /> {route.destination}
            </h3>
          </div>
          <div className="mi-brief__pick">
            <label className="mi-route-select">
              <Search size={14} />
              <select value={route.id} onChange={(event) => setRouteId(event.target.value)}>
                {(preferredRoutes.length ? preferredRoutes : insightRoutes).map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.origin} → {item.destination}
                  </option>
                ))}
              </select>
            </label>
            {onOpenCapacity && (
              <button type="button" className="mi-primary" onClick={onOpenCapacity}>
                Open carrier capacity <ArrowUpRight size={14} />
              </button>
            )}
          </div>
        </header>

        <div className="mi-brief__signal">
          <Signal tone={route.signal} />
          <strong>{route.summary}</strong>
          <em>
            {route.customer} · {route.equipment} · {route.miles.toLocaleString()} mi ·{' '}
            {route.weeklyLoads} loads a week
          </em>
        </div>

        <div className="mi-brief__kpis">
          {[
            {
              label: 'Spot rate',
              value: `$${route.spot.toFixed(2)}`,
              unit: '/mi',
              hint: 'Seven-day average of what carriers accepted on this lane, fuel included.',
            },
            {
              label: 'Contract',
              value: `$${route.contract.toFixed(2)}`,
              unit: '/mi',
              hint: 'Committed rate on the same lane. Treat it as your ceiling on a spot buy.',
            },
            {
              label: 'Spot vs contract',
              value: `${route.spot - route.contract > 0 ? '+' : '−'}$${Math.abs(
                route.spot - route.contract
              ).toFixed(2)}`,
              tone: route.spot - route.contract > 0 ? 'bad' : 'good',
              hint:
                route.spot - route.contract > 0
                  ? 'Spot is over contract, so covering here eats margin.'
                  : 'Spot is under contract, so there is room in the buy.',
            },
            {
              label: '35-day outlook',
              value: `$${route.forecast.toFixed(2)}`,
              unit: '/mi',
              hint: 'Model forecast five weeks out, based on postings, tender rejects and fuel.',
            },
            {
              label: 'Load / truck',
              value: route.loadToTruck.toFixed(1),
              hint: 'Posted loads per available truck on this lane right now.',
            },
            {
              label: 'Carriers',
              value: String(route.carrierMatches),
              unit: `${route.preferredCarriers} preferred`,
              hint: 'Carriers in your network that have run this lane in the last 90 days.',
            },
          ].map((kpi) => (
            <Tip
              key={kpi.label}
              block
              tip={
                <>
                  <b>{kpi.label}</b>
                  <em>{kpi.hint}</em>
                </>
              }
            >
              <article>
                <span>{kpi.label}</span>
                <strong
                  className={
                    kpi.tone === 'bad' ? 'is-bad' : kpi.tone === 'good' ? 'is-good' : undefined
                  }
                >
                  {kpi.value}
                  {kpi.unit && <small>{kpi.unit}</small>}
                </strong>
              </article>
            </Tip>
          ))}
        </div>

        <div className="mi-brief__split">
          <div>
            <span>7-week rate direction</span>
            <EChart option={laneTrendOption} height={196} ariaLabel="Seven week rate direction" />
          </div>
          <div>
            <span>AI planning recommendation</span>
            <strong>{route.recommendation}</strong>
            <div className="mi-brief__watch">
              <span>Watch on this lane</span>
              {route.watch.map((item) => (
                <div key={item}>
                  <i />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mi-grid">
        <article className="mi-card">
          <header>
            <div>
              <span>National spot rates</span>
              <h3>Equipment trend</h3>
            </div>
            <span className="mi-source">$/mile incl. fuel</span>
          </header>
          <div className="mi-chart">
            <EChart option={ratesOption} height={232} ariaLabel="National spot rates by equipment" />
          </div>
        </article>

        <article className="mi-card">
          <header>
            <div>
              <span>Load and truck postings</span>
              <h3>Last 12 weeks</h3>
            </div>
            <Truck size={17} />
          </header>
          <div className="mi-chart">
            <EChart option={postingOption} height={232} ariaLabel="Load and truck postings by week" />
          </div>
        </article>
      </section>

      <section className="mi-card">
        <header>
          <div>
            <span>Top national lanes</span>
            <h3>
              {lanePair
                ? `Lanes on ${lanePair[0]} – ${lanePair[1]}`
                : focus
                  ? `Lanes touching ${focus.name}`
                  : 'Broker spot versus market range'} · {laneRows.length} lanes
            </h3>
          </div>
          <span className="mi-source">Per load, incl. fuel</span>
        </header>
        <div className="mi-table mi-table--lanes">
          <div className="mi-table__head">
            <span>Lane</span>
            <span>Equipment</span>
            <Head tip="Practical length of haul used for the per-mile math.">Miles</Head>
            <Head tip="Loads moving on this lane in an average week.">Loads / wk</Head>
            <Head tip="What brokers paid per load on this lane in the last seven days.">
              Broker spot
            </Head>
            <Head tip="Broker spot divided by lane miles, fuel included.">$ / mile</Head>
            <Head tip="Gap between the low and high paid rate. A wide spread means the lane is being bought inconsistently.">
              Spread
            </Head>
            <Head tip="Change in the paid rate against last week.">WoW</Head>
            <Head tip="Where the current paid rate sits between the low and high of the market range.">
              Market range and paid position
            </Head>
          </div>
          {laneRows.length ? (
            laneRows.map((lane) => {
              const spread = lane.high - lane.low
              const position = ((lane.rate - lane.low) / Math.max(1, spread)) * 100
              return (
                <div key={lane.short} className="mi-table__row">
                  <span className="mi-cell--name">
                    <strong>{lane.short}</strong>
                    <em>{lane.lane}</em>
                  </span>
                  <span className="mi-tag">{lane.equipment}</span>
                  <span className="mi-num">{lane.miles.toLocaleString()}</span>
                  <span className="mi-num">{lane.weeklyLoads.toLocaleString()}</span>
                  <span className="mi-num is-strong">${lane.rate.toLocaleString()}</span>
                  <span className="mi-num">${(lane.rate / lane.miles).toFixed(2)}</span>
                  <span className="mi-num">${spread.toLocaleString()}</span>
                  <Move value={lane.wow} />
                  <span className="mi-range">
                    <i>
                      <u style={{ left: `${Math.min(96, Math.max(0, position))}%` }} />
                    </i>
                    <em>
                      ${lane.low.toLocaleString()} – ${lane.high.toLocaleString()} ·{' '}
                      {position.toFixed(0)}% of range
                    </em>
                  </span>
                </div>
              )
            })
          ) : (
            <div className="mi-empty">No lanes match this search.</div>
          )}
        </div>
        <div className="mi-chart mi-chart--inset">
          <EChart option={lanesOption} height={210} ariaLabel="Top national lanes broker spot rates" />
        </div>
      </section>

      <section className="mi-card mi-routes">
        <header>
          <div>
            <span>Network intelligence</span>
            <h3>Priority lanes · {equipment}</h3>
          </div>
          <span className="mi-source">Select a lane to update the lane brief above</span>
        </header>
        <div className="mi-routes__scroll">
          <div className="mi-routes__head">
            <span>Lane</span>
            <Head tip="How hard this lane is to cover right now.">Signal</Head>
            <Head tip="Loads tendered on this lane in an average week.">Weekly</Head>
            <Head tip="Seven-day average paid rate per mile, fuel included.">Spot</Head>
            <Head tip="Committed rate per mile on the lane.">Contract</Head>
            <Head tip="Model forecast for the paid rate five weeks out.">Forecast</Head>
            <Head tip="Posted loads per available truck on the lane.">Load / truck</Head>
            <Head tip="Carriers in your network that ran this lane in the last 90 days.">
              Carriers
            </Head>
            <span />
          </div>
          {routes.length ? (
            routes.map((item) => (
              <button
                key={item.id}
                type="button"
                className={cn('mi-route-row', item.id === route.id && 'is-active')}
                onClick={() => setRouteId(item.id)}
              >
                <span>
                  <strong>
                    {item.origin} → {item.destination}
                  </strong>
                  <em>
                    {item.customer} · {item.miles.toLocaleString()} mi
                  </em>
                </span>
                <Signal tone={item.signal} />
                <span className="mi-num">{item.weeklyLoads}</span>
                <span className="mi-num">${item.spot.toFixed(2)}</span>
                <span className="mi-num">${item.contract.toFixed(2)}</span>
                <span className="mi-num">${item.forecast.toFixed(2)}</span>
                <span className="mi-num">{item.loadToTruck.toFixed(1)}</span>
                <span className="mi-num">
                  {item.carrierMatches}
                  <em> · {item.preferredCarriers} pref</em>
                </span>
                <ArrowUpRight size={15} />
              </button>
            ))
          ) : (
            <div className="mi-empty">No lanes match this region, equipment, and search.</div>
          )}
        </div>
      </section>

      <section className="mi-card">
        <header>
          <div>
            <span>Market detail by state and province</span>
            <h3>
              {stateRows.length} markets · {totals.loadsIn.toLocaleString()} loads ·{' '}
              {totals.trucksIn.toLocaleString()} trucks
            </h3>
          </div>
          <ToneMix rows={stateRows.map((row) => areaTone(row.area))} />
        </header>
        <p className="mi-hint">Click a row to drill the board into that market.</p>
        <div className="mi-table mi-table--markets">
          <div className="mi-table__head">
            <span>Market</span>
            <Head tip="Tight, balanced or soft, taken from loads per truck in the market.">
              Signal
            </Head>
            <SortHead
              id="loadsIn"
              sort={stateSort}
              onSort={setStateSort}
              tip="Loads delivering into the market against loads originating from it, this week."
            >
              Loads in / out
            </SortHead>
            <SortHead
              id="trucksIn"
              sort={stateSort}
              onSort={setStateSort}
              tip="Trucks posted inbound against trucks posted outbound."
            >
              Trucks in / out
            </SortHead>
            <SortHead
              id="net"
              sort={stateSort}
              onSort={setStateSort}
              tip="Loads minus trucks. A positive number means freight is chasing capacity."
            >
              Net balance
            </SortHead>
            <SortHead
              id="ratio"
              sort={stateSort}
              onSort={setStateSort}
              tip="Posted loads per available truck. Over 1.35 is a tight market."
            >
              Load / truck
            </SortHead>
            <SortHead
              id="share"
              sort={stateSort}
              onSort={setStateSort}
              tip="This market's share of all loads across the markets you selected."
            >
              Share
            </SortHead>
            <SortHead
              id="spot"
              sort={stateSort}
              onSort={setStateSort}
              tip="Average spot rate per mile inside the market, fuel included."
            >
              Spot
            </SortHead>
            <SortHead
              id="contract"
              sort={stateSort}
              onSort={setStateSort}
              tip="Average committed rate per mile, your ceiling on a spot buy."
            >
              Contract
            </SortHead>
            <SortHead
              id="spread"
              sort={stateSort}
              onSort={setStateSort}
              tip="Spot minus contract. Positive means covering here costs more than the contract rate."
            >
              Spot vs contract
            </SortHead>
            <SortHead
              id="metros"
              sort={stateSort}
              onSort={setStateSort}
              tip="Metro markets we track inside this state or province."
            >
              Metros
            </SortHead>
          </div>
          {stateRows.length ? (
            stateRows.slice(0, statesShown).map((row) => (
              <div
                key={`${row.area.country}-${row.area.code}`}
                role="button"
                tabIndex={0}
                className={cn(
                  'mi-table__row',
                  'is-clickable',
                  row.area.code === focusCode && 'is-active'
                )}
                onClick={() => drillTo(row.area.code)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    drillTo(row.area.code)
                  }
                }}
              >
                <span className="mi-cell--name">
                  <strong>{row.area.name}</strong>
                  <em>
                    {row.area.code} · {countryLabel[row.area.country]}
                  </em>
                </span>
                <Signal tone={areaTone(row.area)} />
                <Pair inbound={row.loadsIn} outbound={row.loadsOut} />
                <Pair inbound={row.trucksIn} outbound={row.trucksOut} />
                <span className={cn('mi-num', row.net >= 0 ? 'is-warn' : 'is-good')}>
                  {row.net >= 0 ? '+' : '−'}
                  {Math.abs(row.net).toLocaleString()}
                </span>
                <Ratio value={row.ratio} />
                <span className="mi-num">{row.share.toFixed(1)}%</span>
                <span className="mi-num">${row.spot.toFixed(2)}</span>
                <span className="mi-num">${row.contract.toFixed(2)}</span>
                <span className={cn('mi-num', row.spread > 0 ? 'is-warn' : 'is-good')}>
                  {row.spread > 0 ? '+' : '−'}${Math.abs(row.spread).toFixed(2)}
                </span>
                <span className="mi-num">{row.metros}</span>
              </div>
            ))
          ) : (
            <div className="mi-empty">
              No markets match this region and search. Add states or provinces in user preferences.
            </div>
          )}
        </div>
        {stateRows.length > PAGE_ROWS ? (
          <MoreRows
            shown={statesShown}
            total={stateRows.length}
            label="markets"
            onToggle={() => setStatesShown(statesShown > PAGE_ROWS ? PAGE_ROWS : stateRows.length)}
          />
        ) : null}
      </section>

      <section className="mi-card">
        <header>
          <div>
            <span>Market detail by city</span>
            <h3>
              {cityRows.length} metro market{cityRows.length === 1 ? '' : 's'}
              {focus ? ` in ${focus.name}` : ''}
            </h3>
          </div>
          <ToneMix rows={cityRows.map((city) => cityTone(city))} />
        </header>
        <div className="mi-table mi-table--cities">
          <div className="mi-table__head">
            <span>Metro market</span>
            <Head tip="Tight, balanced or soft for this metro, from its loads per truck.">
              Signal
            </Head>
            <SortHead
              id="loadsIn"
              sort={citySort}
              onSort={setCitySort}
              tip="Loads delivering into the metro against loads leaving it."
            >
              Loads in / out
            </SortHead>
            <SortHead
              id="trucksIn"
              sort={citySort}
              onSort={setCitySort}
              tip="Trucks posted inbound against trucks posted outbound."
            >
              Trucks in / out
            </SortHead>
            <SortHead
              id="ratio"
              sort={citySort}
              onSort={setCitySort}
              tip="Posted loads per available truck in the metro."
            >
              Load / truck
            </SortHead>
            <SortHead
              id="spot"
              sort={citySort}
              onSort={setCitySort}
              tip="Average outbound spot rate per mile, fuel included."
            >
              Spot
            </SortHead>
            <SortHead
              id="contract"
              sort={citySort}
              onSort={setCitySort}
              tip="Average committed rate per mile out of this metro."
            >
              Contract
            </SortHead>
            <SortHead
              id="wow"
              sort={citySort}
              onSort={setCitySort}
              tip="Change in spot rate against last week."
            >
              WoW
            </SortHead>
            <SortHead
              id="avgMiles"
              sort={citySort}
              onSort={setCitySort}
              tip="Average length of haul on loads leaving the metro."
            >
              Avg haul
            </SortHead>
            <span>Top outbound</span>
          </div>
          {cityRows.length ? (
            cityRows.slice(0, citiesShown).map((city) => (
              <div key={city.code} className="mi-table__row">
                <span className="mi-cell--name">
                  <strong>{city.city}</strong>
                  <em>
                    {city.code} · {city.state} · {city.country}
                  </em>
                </span>
                <Signal tone={cityTone(city)} />
                <Pair inbound={city.loadsIn} outbound={city.loadsOut} />
                <Pair inbound={city.trucksIn} outbound={city.trucksOut} />
                <Ratio value={city.ratio} />
                <span className="mi-num">${city.spot.toFixed(2)}</span>
                <span className="mi-num">${city.contract.toFixed(2)}</span>
                <Move value={city.wow} />
                <span className="mi-num">{city.avgMiles.toLocaleString()} mi</span>
                <span className="mi-cell--muted">{city.topOutbound}</span>
              </div>
            ))
          ) : (
            <div className="mi-empty">
              No metro markets match this region and search.
            </div>
          )}
        </div>
        {cityRows.length > PAGE_ROWS ? (
          <MoreRows
            shown={citiesShown}
            total={cityRows.length}
            label="metros"
            onToggle={() => setCitiesShown(citiesShown > PAGE_ROWS ? PAGE_ROWS : cityRows.length)}
          />
        ) : null}
      </section>

      <div className="mi-footnote">
        <Info size={13} />
        Prototype only. Figures are static examples from the supplied Aug 20 rate matrices and public
        DAT commentary; this screen never requests or refreshes external data.
      </div>
    </main>
  )
}
