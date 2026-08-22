import type { EChartsOption } from 'echarts'

export const CHART_FONT =
  "Inter, 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif"

/** Shared tooltip shell so every chart on the board hovers the same way. */
export const chartTooltip: EChartsOption['tooltip'] = {
  trigger: 'axis',
  confine: true,
  transitionDuration: 0.16,
  backgroundColor: 'rgba(255, 255, 255, 0.97)',
  borderColor: '#dbe2ea',
  borderWidth: 1,
  padding: [9, 11],
  extraCssText: 'border-radius:10px;box-shadow:0 12px 30px rgba(15,23,42,.16);',
  textStyle: { color: '#17202b', fontSize: 13, fontFamily: CHART_FONT },
  axisPointer: { type: 'shadow', shadowStyle: { color: 'rgba(59,130,246,.07)' } },
}

/** Same shell, but a snapped crosshair that reads better on trend lines. */
export const chartTooltipLine: EChartsOption['tooltip'] = {
  ...chartTooltip,
  axisPointer: {
    type: 'line',
    snap: true,
    lineStyle: { color: '#9db4d8', width: 1, type: [4, 4] },
    label: { show: false },
  },
}

/** Category label read off a tooltip callback, whatever shape ECharts hands back. */
export function tooltipCategory(params: unknown): string {
  const first = Array.isArray(params) ? params[0] : params
  const row = first as { axisValue?: string; name?: string } | undefined
  return String(row?.axisValue ?? row?.name ?? '')
}
