import { useMemo, useState } from 'react'
import type { EChartsOption } from 'echarts'
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Clock3,
  ExternalLink,
  Fuel,
  Gauge,
  Info,
  Map as MapIcon,
  Newspaper,
  Search,
  Sparkles,
  TrendingUp,
  Truck,
  X,
} from 'lucide-react'
import { cn } from '@/lib/cn'
import { EChart } from '@/components/charts/EChart'
import { CHART_FONT, chartTooltip, tooltipCategory } from '@/components/charts/chartTheme'
import { useGeoMap, type MapName } from '@/components/charts/useGeoMap'
import {
  areaRatio,
  areaTone,
  datHeadlines,
  insightRoutes,
  marketAreas,
  nationalTrend,
  postingHistory,
  toneColor,
  toneLabel,
  topNationalLanes,
  type EquipmentMarket,
  type InsightRegion,
  type InsightRoute,
  type MarketTone,
} from '@/data/marketInsights'

type Props = { search: string; onOpenCapacity?: () => void }

const regions: InsightRegion[] = ['North America', 'United States', 'Canada']
const equipmentTypes: EquipmentMarket[] = ['Van', 'Reefer', 'Flatbed']
const canadianStop = /, (ON|QC|BC|AB|MB|SK|NB|NS|PE|NL)$/

const axisLabel = { color: '#64748b', fontSize: 13, fontFamily: CHART_FONT }
const axisLine = { lineStyle: { color: '#dfe4ea' } }
const splitLine = { lineStyle: { color: '#eef1f5' } }

function Signal({ tone }: { tone: MarketTone }) {
  return <span className={cn('mi-signal', `is-${tone}`)}>{toneLabel[tone]}</span>
}

const mapNames: Record<InsightRegion, MapName> = {
  'North America': 'north-america',
  'United States': 'usa',
  Canada: 'canada',
}

export function MarketInsightsPage({ search, onOpenCapacity }: Props) {
  const [region, setRegion] = useState<InsightRegion>('North America')
  const [equipment, setEquipment] = useState<EquipmentMarket>('Van')
  const [view, setView] = useState<'map' | 'ranking'>('map')
  const [routeId, setRouteId] = useState(insightRoutes[0].id)
  const [openRoute, setOpenRoute] = useState<InsightRoute | null>(insightRoutes[0])

  const mapName = mapNames[region]
  const geo = useGeoMap(mapName)

  const areas = useMemo(() => {
    const country = region === 'United States' ? 'US' : region === 'Canada' ? 'CA' : null
    return marketAreas
      .filter((area) => !country || area.country === country)
      .slice()
      .sort((a, b) => areaRatio(b) - areaRatio(a))
  }, [region])

  /** Each market's share of regional inbound load postings. */
  const shares = useMemo(() => {
    const total = areas.reduce((sum, area) => sum + area.loadsIn, 0) || 1
    return new Map(areas.map((area) => [area.code, (area.loadsIn / total) * 100]))
  }, [areas])

  const mapOption = useMemo<EChartsOption>(() => {
    const byName = new Map(areas.map((area) => [area.name, area]))
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
          /* The 0.75 default flattens the continent; 1 keeps the outlines true. */
          aspectScale: 1,
          zoom: 1.04,
          left: 8,
          right: 8,
          top: 4,
          bottom: 34,
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
          })),
        },
      ],
    }
  }, [areas, mapName, shares])

  const routes = useMemo(() => {
    const q = search.trim().toLowerCase()
    return insightRoutes.filter((route) => {
      const isCanadian = canadianStop.test(route.origin) || canadianStop.test(route.destination)
      const regionMatch =
        region === 'North America' || (region === 'Canada' ? isCanadian : !isCanadian)
      const textMatch =
        !q ||
        [route.origin, route.destination, route.customer].join(' ').toLowerCase().includes(q)
      return regionMatch && route.equipment === equipment && textMatch
    })
  }, [equipment, region, search])

  const route = insightRoutes.find((item) => item.id === routeId) ?? insightRoutes[0]

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
      tooltip: { ...chartTooltip, axisPointer: { type: 'line' } },
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
    const rows = [...topNationalLanes].reverse()
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

  const trendOption = useMemo<EChartsOption>(
    () => ({
      textStyle: { fontFamily: CHART_FONT, fontSize: 13 },
      grid: { top: 14, right: 14, bottom: 24, left: 46 },
      tooltip: { ...chartTooltip, valueFormatter: (v) => `$${Number(v).toFixed(2)}/mi` },
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
          data: openRoute?.trend ?? [],
          lineStyle: { color: '#2563eb', width: 2.5 },
          itemStyle: { color: '#2563eb' },
          areaStyle: { color: 'rgba(37,99,235,0.10)' },
        },
      ],
    }),
    [openRoute]
  )

  return (
    <main className="mi-page">
      <section className="mi-hero">
        <div>
          <span className="mi-eyebrow">
            <Sparkles size={13} /> AI market brief
          </span>
          <h2>North America freight intelligence</h2>
          <p>
            A static planning view built from public DAT market commentary, the supplied state rate
            matrices, and the sample P&amp;G network. Charts render locally with Apache ECharts.
          </p>
        </div>
        <div className="mi-hero__source">
          <span>Snapshot</span>
          <strong>Aug 20, 2026 · 3:37 PM</strong>
          <em>No live API · no token usage</em>
        </div>
      </section>

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

        <label className="mi-route-select">
          <Search size={14} />
          <select value={routeId} onChange={(event) => setRouteId(event.target.value)}>
            {insightRoutes.map((item) => (
              <option key={item.id} value={item.id}>
                {item.origin} → {item.destination}
              </option>
            ))}
          </select>
        </label>
        <button type="button" className="mi-primary" onClick={() => setOpenRoute(route)}>
          View route insight
          <ArrowRight size={14} />
        </button>
      </section>

      <section className="mi-kpis">
        {[
          { icon: TrendingUp, label: 'Dry van spot linehaul', value: '$2.28', unit: '/ mi', note: '+$0.65 YoY', tone: 'up' },
          { icon: Activity, label: 'July LMI', value: '68.9', note: 'Near 4-year high' },
          { icon: Gauge, label: 'Capacity index', value: '28.4', note: '8th month contracting', tone: 'warn' },
          { icon: Clock3, label: 'Average tender lead', value: '3.74', unit: 'days', note: '+11% YoY', tone: 'up' },
          { icon: Fuel, label: 'DAT fuel assumption', value: '$0.70', unit: '/ mi', note: 'Applied to matrices' },
        ].map((kpi) => {
          const Icon = kpi.icon
          return (
            <article key={kpi.label}>
              <i>
                <Icon size={16} />
              </i>
              <span>{kpi.label}</span>
              <strong>
                {kpi.value}
                {kpi.unit && <small>{kpi.unit}</small>}
              </strong>
              <em className={kpi.tone === 'up' ? 'is-up' : kpi.tone === 'warn' ? 'is-warn' : undefined}>
                {kpi.note}
              </em>
            </article>
          )
        })}
      </section>

      <section className="mi-grid">
        <article className="mi-card">
          <header>
            <div>
              <span>Market conditions</span>
              <h3>{region} capacity balance</h3>
            </div>
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
          <div className="mi-chart">
            {view === 'map' ? (
              geo.ready ? (
                <EChart
                  option={mapOption}
                  height={392}
                  ariaLabel={`${region} loads per truck by market`}
                />
              ) : (
                <div className="mi-chart__state" style={{ height: 392 }}>
                  {geo.failed ? 'Map outline unavailable.' : 'Loading map outline…'}
                </div>
              )
            ) : (
              <EChart
                option={capacityOption}
                height={392}
                ariaLabel={`${region} loads and trucks by market`}
              />
            )}
          </div>
          <div className="mi-legend">
            {(['tight', 'balanced', 'soft'] as MarketTone[]).map((tone) => (
              <span key={tone}>
                <i style={{ background: toneColor[tone] }} />
                {toneLabel[tone]}
                <b>{areas.filter((area) => areaTone(area) === tone).length}</b>
              </span>
            ))}
            <span className="mi-legend__hint">
              {view === 'map'
                ? 'Hover a market for its share of loads, postings, and rates'
                : 'Top 16 markets by loads per truck'}
            </span>
          </div>
        </article>

        <article className="mi-card mi-card--news">
          <header>
            <div>
              <span>Market news</span>
              <h3>What changed this week</h3>
            </div>
            <Newspaper size={17} />
          </header>
          <div className="mi-news-list">
            {datHeadlines.map((headline, index) => (
              <article key={headline.title}>
                <i>{index + 1}</i>
                <div>
                  <span>{headline.date}</span>
                  <strong>{headline.title}</strong>
                  <p>{headline.detail}</p>
                </div>
              </article>
            ))}
          </div>
          <a
            href="https://www.dat.com/blog/dry-van-report-capacity-stays-tight-as-the-july-lmi-holds-near-a-4-year-high"
            target="_blank"
            rel="noreferrer"
          >
            Read source report <ExternalLink size={13} />
          </a>
        </article>
      </section>

      <section className="mi-grid mi-grid--thirds">
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

        <article className="mi-card">
          <header>
            <div>
              <span>Top national lanes</span>
              <h3>Broker spot versus range</h3>
            </div>
            <span className="mi-source">Per load</span>
          </header>
          <div className="mi-chart">
            <EChart option={lanesOption} height={232} ariaLabel="Top national lanes broker spot rates" />
          </div>
        </article>
      </section>

      <section className="mi-card mi-routes">
        <header>
          <div>
            <span>Network intelligence</span>
            <h3>Priority lanes · {equipment}</h3>
          </div>
          <span className="mi-source">Sample P&amp;G network · click a lane for the brief</span>
        </header>
        <div className="mi-routes__scroll">
          <div className="mi-routes__head">
            <span>Lane</span>
            <span>Signal</span>
            <span>Weekly</span>
            <span>Spot</span>
            <span>Contract</span>
            <span>Forecast</span>
            <span>Load / truck</span>
            <span>Carriers</span>
            <span />
          </div>
          {routes.length ? (
            routes.map((item) => (
              <button
                key={item.id}
                type="button"
                className="mi-route-row"
                onClick={() => setOpenRoute(item)}
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

      <div className="mi-footnote">
        <Info size={13} />
        Prototype only. Figures are static examples from the supplied Aug 20 rate matrices and public
        DAT commentary; this screen never requests or refreshes external data.
      </div>

      {openRoute && (
        <RouteInsightModal
          route={openRoute}
          trendOption={trendOption}
          onClose={() => setOpenRoute(null)}
          onOpenCapacity={onOpenCapacity}
        />
      )}
    </main>
  )
}

function RouteInsightModal({
  route,
  trendOption,
  onClose,
  onOpenCapacity,
}: {
  route: InsightRoute
  trendOption: EChartsOption
  onClose: () => void
  onOpenCapacity?: () => void
}) {
  const delta = route.spot - route.contract

  return (
    <div className="mi-modal-root" role="dialog" aria-modal="true" aria-labelledby="mi-route-title">
      <button type="button" className="mi-modal__veil" aria-label="Close route insight" onClick={onClose} />
      <section className="mi-modal">
        <header>
          <div>
            <span>
              <Sparkles size={13} /> Route intelligence
            </span>
            <h2 id="mi-route-title">
              {route.origin} <ArrowRight size={18} /> {route.destination}
            </h2>
            <p>
              {route.customer} · {route.equipment} · {route.miles.toLocaleString()} miles ·{' '}
              {route.weeklyLoads} loads a week
            </p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </header>

        <div className="mi-modal__body">
          <div className="mi-modal__signal">
            <Signal tone={route.signal} />
            <strong>{route.summary}</strong>
          </div>

          <div className="mi-modal__kpis">
            <div>
              <span>Spot rate</span>
              <strong>
                ${route.spot.toFixed(2)}
                <small>/mi</small>
              </strong>
            </div>
            <div>
              <span>Contract</span>
              <strong>
                ${route.contract.toFixed(2)}
                <small>/mi</small>
              </strong>
            </div>
            <div>
              <span>Spot vs contract</span>
              <strong className={delta > 0 ? 'is-bad' : 'is-good'}>
                {delta > 0 ? '+' : '−'}${Math.abs(delta).toFixed(2)}
              </strong>
            </div>
            <div>
              <span>35-day outlook</span>
              <strong>
                ${route.forecast.toFixed(2)}
                <small>/mi</small>
              </strong>
            </div>
            <div>
              <span>Load / truck</span>
              <strong>{route.loadToTruck.toFixed(1)}</strong>
            </div>
            <div>
              <span>Carriers</span>
              <strong>
                {route.carrierMatches}
                <small>{route.preferredCarriers} preferred</small>
              </strong>
            </div>
          </div>

          <div className="mi-modal__split">
            <article>
              <span>7-week rate direction</span>
              <EChart option={trendOption} height={168} ariaLabel="Seven week rate direction" />
            </article>
            <article>
              <span>AI planning recommendation</span>
              <strong>{route.recommendation}</strong>
              <div className="mi-modal__watch">
                <span>Watch on this lane</span>
                {route.watch.map((item) => (
                  <div key={item}>
                    <i />
                    {item}
                  </div>
                ))}
              </div>
            </article>
          </div>
        </div>

        <footer>
          <span>Static snapshot · refreshed Aug 20, 2026</span>
          <button type="button" onClick={onClose}>
            Keep current plan
          </button>
          <button
            type="button"
            className="is-primary"
            onClick={() => {
              onClose()
              onOpenCapacity?.()
            }}
          >
            Open carrier capacity
          </button>
        </footer>
      </section>
    </div>
  )
}
