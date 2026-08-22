import { useMemo, useState } from 'react'
import type { EChartsOption } from 'echarts'
import { CalendarDays, Info, RotateCcw, SlidersHorizontal, TrendingDown, TrendingUp } from 'lucide-react'
import { EChart } from '@/components/charts/EChart'
import { CHART_FONT, chartTooltip, chartTooltipLine } from '@/components/charts/chartTheme'
import { Tip } from '@/components/Tip'
import {
  marketAreas,
  marketIntelligence,
  type EquipmentMarket,
  type InsightRegion,
} from '@/data/marketInsights'
import { cn } from '@/lib/cn'

type View = 'overview' | 'contracts'
type Mileage = 'all' | '0-250' | '251-750' | '751-1500' | '1500+'

type Props = {
  region: InsightRegion
  equipment: EquipmentMarket
  selectedMarkets: string[]
}

const equipmentTypes: EquipmentMarket[] = ['Van', 'Reefer', 'Flatbed']
const axisLabel = { color: '#64748b', fontSize: 11, fontFamily: CHART_FONT }
const axisLine = { lineStyle: { color: '#dfe4ea' } }
const splitLine = { lineStyle: { color: '#eef1f5' } }

const regionCountry = {
  'North America': null,
  'United States': 'US',
  Canada: 'CA',
  Mexico: 'MX',
} as const

/**
 * Contract and index analytics inspired by the supplied screens, but shaped for
 * a sourcing desk: every filter changes the displayed mock benchmark.
 */
export function MarketIntelligencePanel({ region, equipment, selectedMarkets }: Props) {
  const [view, setView] = useState<View>('overview')
  const [pickup, setPickup] = useState('all')
  const [drop, setDrop] = useState('all')
  const [mileage, setMileage] = useState<Mileage>('all')

  const marketOptions = useMemo(() => {
    const country = regionCountry[region]
    return marketAreas
      .filter(
        (area) =>
          selectedMarkets.includes(area.code) && (!country || area.country === country)
      )
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [region, selectedMarkets])

  const activeFilters = Number(pickup !== 'all') + Number(drop !== 'all') + Number(mileage !== 'all')
  const scopeFactor =
    (pickup === 'all' ? 0 : marketOptions.findIndex((area) => area.code === pickup) % 4) * 0.008 +
    (drop === 'all' ? 0 : marketOptions.findIndex((area) => area.code === drop) % 3) * 0.006 +
    ({ all: 0, '0-250': 0.025, '251-750': 0.012, '751-1500': -0.006, '1500+': -0.018 } as const)[
      mileage
    ]

  const reset = () => {
    setPickup('all')
    setDrop('all')
    setMileage('all')
  }

  return (
    <section className="mi-intel mi-card">
      <header className="mi-intel__head">
        <div>
          <span>Market intelligence</span>
          <h3>Benchmark your sourcing plan against the market</h3>
          <p>
            Compare market direction, contract exposure and realized margin before you source.
          </p>
        </div>
        <div className="mi-intel__head-actions">
          <span>
            <CalendarDays size={13} /> Sep 2025 – Aug 2026
          </span>
          <div className="mi-view" role="tablist" aria-label="Intelligence view">
            <button
              type="button"
              role="tab"
              aria-selected={view === 'overview'}
              className={cn(view === 'overview' && 'is-active')}
              onClick={() => setView('overview')}
            >
              Market overview
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={view === 'contracts'}
              className={cn(view === 'contracts' && 'is-active')}
              onClick={() => setView('contracts')}
            >
              Contract intelligence
            </button>
          </div>
        </div>
      </header>

      <div className="mi-intel__note">
        <Info size={14} />
        <span>
          {view === 'overview'
            ? 'See where each equipment market has been and where momentum is moving.'
            : 'Compare spot versus contract, your realized margin and forecast accuracy.'}
        </span>
      </div>

      <div className="mi-intel__filters">
        <SlidersHorizontal size={14} />
        <label>
          <span>Pickup market</span>
          <select value={pickup} onChange={(event) => setPickup(event.target.value)}>
            <option value="all">All selected markets</option>
            {marketOptions.map((area) => (
              <option key={area.code} value={area.code}>
                {area.name} ({area.code})
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Drop market</span>
          <select value={drop} onChange={(event) => setDrop(event.target.value)}>
            <option value="all">All selected markets</option>
            {marketOptions.map((area) => (
              <option key={area.code} value={area.code}>
                {area.name} ({area.code})
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Mileage band</span>
          <select value={mileage} onChange={(event) => setMileage(event.target.value as Mileage)}>
            <option value="all">All mileage</option>
            <option value="0-250">0–250 mi</option>
            <option value="251-750">251–750 mi</option>
            <option value="751-1500">751–1,500 mi</option>
            <option value="1500+">1,500+ mi</option>
          </select>
        </label>
        <em>
          {activeFilters
            ? `${activeFilters} filter${activeFilters === 1 ? '' : 's'} applied`
            : `${marketOptions.length} preferred markets in scope`}
        </em>
        <button type="button" disabled={!activeFilters} onClick={reset}>
          <RotateCcw size={12} /> Reset filters
        </button>
      </div>

      {view === 'overview' ? (
        <MarketOverview factor={scopeFactor} />
      ) : (
        <ContractIntelligence equipment={equipment} factor={scopeFactor} />
      )}
    </section>
  )
}

function MarketOverview({ factor }: { factor: number }) {
  return (
    <div className="mi-index-grid">
      {equipmentTypes.map((equipment) => {
        const values = marketIntelligence.index[equipment].map((value) =>
          Number((value * (1 + factor)).toFixed(1))
        )
        const mom = ((values.at(-1)! / values.at(-2)!) - 1) * 100
        const yoy = ((values.at(-1)! / values[0]) - 1) * 100
        return (
          <article key={equipment} className="mi-index">
            <header>
              <Tip
                block
                tip={
                  <>
                    <b>{equipment} market index</b>
                    <em>
                      Rate level against a Jan 2025 base of 100, so {values.at(-1)!.toFixed(1)} means
                      the market sits {(values.at(-1)! - 100).toFixed(1)} points{' '}
                      {values.at(-1)! >= 100 ? 'above' : 'below'} that base.
                    </em>
                  </>
                }
              >
                <div className="mi-index__value">
                  <span>{equipment}</span>
                  <strong>{values.at(-1)!.toFixed(1)}</strong>
                </div>
              </Tip>
              <div className="mi-index__moves">
                <Move
                  label="MoM"
                  value={mom}
                  hint="Change against last month. Watch this for turning points."
                />
                <Move label="12 mo" value={yoy} hint="Change across the full 12-month window." />
              </div>
            </header>
            <EChart
              option={indexOption(values)}
              height={172}
              ariaLabel={`${equipment} market index over twelve months`}
            />
            <footer>
              <span>Jan 2025 = 100</span>
              <b>{mom >= 0 ? 'Capacity tightening' : 'Pressure easing'}</b>
            </footer>
          </article>
        )
      })}
    </div>
  )
}

function ContractIntelligence({
  equipment,
  factor,
}: {
  equipment: EquipmentMarket
  factor: number
}) {
  const spot = marketIntelligence.spot[equipment].map((value) =>
    Number((value * (1 + factor)).toFixed(2))
  )
  const contract = marketIntelligence.contract[equipment].map((value) =>
    Number((value * (1 + factor / 3)).toFixed(2))
  )
  const companyMargin = marketIntelligence.margin[equipment].company.map((value) =>
    Number((value + factor * 30).toFixed(1))
  )
  const marketMargin = marketIntelligence.margin[equipment].market
  const bias = marketIntelligence.forecastBias[equipment].map((value) =>
    Number((value + factor * 3).toFixed(1))
  )
  const gap = spot.at(-1)! - contract.at(-1)!
  const marginLead = companyMargin.at(-1)! - marketMargin.at(-1)!
  const avgBias = bias.reduce((sum, value) => sum + Math.abs(value), 0) / bias.length

  return (
    <div className="mi-contract">
      <div className="mi-contract__kpis">
        <Tip
          block
          tip={
            <>
              <b>Current spot</b>
              <em>
                Latest month of the {equipment.toLowerCase()} spot benchmark, fuel included.{' '}
                {gap >= 0
                  ? 'It sits over contract, so covering on the spot market costs you margin.'
                  : 'It sits under contract, so there is room in the buy.'}
              </em>
            </>
          }
        >
          <article>
            <span>Current spot</span>
            <strong>${spot.at(-1)!.toFixed(2)}<small>/mi</small></strong>
            <em className={gap >= 0 ? 'is-warn' : 'is-good'}>
              {gap >= 0 ? '+' : '−'}${Math.abs(gap).toFixed(2)} vs contract
            </em>
          </article>
        </Tip>
        <Tip
          block
          tip={
            <>
              <b>Contract index</b>
              <em>
                Committed rate per mile across the 12-month window. Use it as the ceiling when you
                price a spot cover.
              </em>
            </>
          }
        >
          <article>
            <span>Contract index</span>
            <strong>${contract.at(-1)!.toFixed(2)}<small>/mi</small></strong>
            <em>12-month committed benchmark</em>
          </article>
        </Tip>
        <Tip
          block
          tip={
            <>
              <b>Our spot margin</b>
              <em>
                Margin we realized on spot covers this month, next to what the market averaged. A
                positive lead means we are buying better than peers.
              </em>
            </>
          }
        >
          <article>
            <span>Our spot margin</span>
            <strong>{companyMargin.at(-1)!.toFixed(1)}%</strong>
            <em className={marginLead >= 0 ? 'is-good' : 'is-warn'}>
              {marginLead >= 0 ? '+' : '−'}{Math.abs(marginLead).toFixed(1)} pts vs market
            </em>
          </article>
        </Tip>
        <Tip
          block
          tip={
            <>
              <b>Forecast error</b>
              <em>
                Average gap between the forecast and what the market actually did. Under 0.5 points
                is close enough to plan on.
              </em>
            </>
          }
        >
          <article>
            <span>Forecast error</span>
            <strong>{avgBias.toFixed(1)}<small> pts</small></strong>
            <em>{avgBias <= 0.5 ? 'Inside planning tolerance' : 'Review model assumptions'}</em>
          </article>
        </Tip>
      </div>

      <div className="mi-contract__charts">
        <article>
          <header>
            <div>
              <span>Market contract vs spot rate</span>
              <h4>{equipment} · fuel included</h4>
            </div>
            <ChartLegend labels={[['Contract', '#2b4fd3'], ['Spot', '#06a7b8']]} />
          </header>
          <EChart
            option={rateCompareOption(contract, spot)}
            height={242}
            ariaLabel={`${equipment} contract versus spot rate`}
          />
        </article>

        <article>
          <header>
            <div>
              <span>Spot margin benchmark</span>
              <h4>Our performance versus market</h4>
            </div>
            <ChartLegend labels={[['Company', '#2b4fd3'], ['Market', '#06a7b8']]} />
          </header>
          <EChart
            option={marginOption(companyMargin, marketMargin)}
            height={242}
            ariaLabel={`${equipment} company versus market margin`}
          />
        </article>
      </div>

      <article className="mi-bias">
        <header>
          <div>
            <span>Market prediction bias</span>
            <h4>Forecast minus actual movement · closer to zero is better</h4>
          </div>
          <em>Positive = forecast ran high · negative = forecast lagged</em>
        </header>
        <EChart
          option={biasOption(bias)}
          height={190}
          ariaLabel={`${equipment} forecast prediction bias`}
        />
      </article>
    </div>
  )
}

function Move({ label, value, hint }: { label: string; value: number; hint?: string }) {
  const up = value >= 0
  const chip = (
    <span className={cn(up ? 'is-up' : 'is-down')}>
      {up ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
      <b>{Math.abs(value).toFixed(1)}%</b> {label}
    </span>
  )

  if (!hint) return chip
  return (
    <Tip
      tip={
        <>
          <b>
            {label} {up ? 'up' : 'down'} {Math.abs(value).toFixed(1)}%
          </b>
          <em>{hint}</em>
        </>
      }
    >
      {chip}
    </Tip>
  )
}

function ChartLegend({ labels }: { labels: Array<[string, string]> }) {
  return (
    <div className="mi-chart-legend">
      {labels.map(([label, color]) => (
        <span key={label}>
          <i style={{ background: color }} /> {label}
        </span>
      ))}
    </div>
  )
}

function indexOption(values: number[]): EChartsOption {
  const min = Math.floor(Math.min(...values) - 4)
  const max = Math.ceil(Math.max(...values) + 4)
  return {
    animationDuration: 450,
    textStyle: { fontFamily: CHART_FONT },
    grid: { top: 12, right: 10, bottom: 24, left: 34 },
    tooltip: {
      ...chartTooltipLine,
      valueFormatter: (value) => `${Number(value).toFixed(1)} index`,
    },
    xAxis: {
      type: 'category',
      data: marketIntelligence.labels,
      axisLabel: { ...axisLabel, interval: 3 },
      axisLine,
      axisTick: { show: false },
    },
    yAxis: { type: 'value', min, max, axisLabel, splitLine },
    series: [
      {
        name: 'Market index',
        type: 'line',
        data: values,
        smooth: true,
        showSymbol: false,
        lineStyle: { color: '#10b981', width: 2.4 },
        itemStyle: { color: '#10b981' },
        areaStyle: { color: 'rgba(16,185,129,.10)' },
        markLine: {
          silent: true,
          symbol: 'none',
          lineStyle: { color: '#cbd5e1', type: 'dashed' },
          label: { show: false },
          data: [{ yAxis: 100 }],
        },
      },
    ],
  }
}

function rateCompareOption(contract: number[], spot: number[]): EChartsOption {
  return lineCompareOption(
    contract,
    spot,
    ['Contract', 'Spot'],
    ['#2b4fd3', '#06a7b8'],
    (value) => `$${value.toFixed(2)}`
  )
}

function marginOption(company: number[], market: number[]): EChartsOption {
  return lineCompareOption(
    company,
    market,
    ['Company', 'Market'],
    ['#2b4fd3', '#06a7b8'],
    (value) => `${value.toFixed(0)}%`
  )
}

function lineCompareOption(
  first: number[],
  second: number[],
  names: [string, string],
  colors: [string, string],
  format: (value: number) => string
): EChartsOption {
  const values = [...first, ...second]
  const min = Math.floor(Math.min(...values) * 0.94 * 10) / 10
  const max = Math.ceil(Math.max(...values) * 1.04 * 10) / 10
  return {
    animationDuration: 450,
    textStyle: { fontFamily: CHART_FONT },
    grid: { top: 15, right: 16, bottom: 28, left: 44 },
    tooltip: chartTooltipLine,
    xAxis: {
      type: 'category',
      data: marketIntelligence.labels,
      axisLabel: { ...axisLabel, interval: 2 },
      axisLine,
      axisTick: { show: false },
    },
    yAxis: {
      type: 'value',
      min,
      max,
      axisLabel: { ...axisLabel, formatter: (value: number) => format(value) },
      splitLine,
    },
    series: [
      {
        name: names[0],
        type: 'line',
        data: first,
        smooth: true,
        showSymbol: false,
        lineStyle: { color: colors[0], width: 2.2 },
        itemStyle: { color: colors[0] },
      },
      {
        name: names[1],
        type: 'line',
        data: second,
        smooth: true,
        showSymbol: false,
        lineStyle: { color: colors[1], width: 2.2 },
        itemStyle: { color: colors[1] },
      },
    ],
  }
}

function biasOption(values: number[]): EChartsOption {
  return {
    animationDuration: 450,
    textStyle: { fontFamily: CHART_FONT },
    grid: { top: 12, right: 18, bottom: 28, left: 42 },
    tooltip: {
      ...chartTooltip,
      valueFormatter: (value) => `${Number(value) >= 0 ? '+' : ''}${Number(value).toFixed(1)} pts`,
    },
    xAxis: {
      type: 'category',
      data: marketIntelligence.labels,
      axisLabel: { ...axisLabel, interval: 1 },
      axisLine,
      axisTick: { show: false },
    },
    yAxis: {
      type: 'value',
      min: -1.5,
      max: 1.5,
      axisLabel: { ...axisLabel, formatter: (value: number) => `${value.toFixed(1)}` },
      splitLine,
    },
    series: [
      {
        name: 'Forecast bias',
        type: 'bar',
        data: values.map((value) => ({
          value,
          itemStyle: { color: value >= 0 ? '#06a7b8' : '#2b4fd3', borderRadius: 2 },
        })),
        barMaxWidth: 24,
      },
    ],
  }
}
