import { useEffect, useRef } from 'react'
import * as echarts from 'echarts'

type Props = {
  option: echarts.EChartsOption
  /** Fixed pixel height; the chart always fills the width of its card. */
  height: number
  className?: string
  ariaLabel: string
}

export function EChart({ option, height, className, ariaLabel }: Props) {
  const host = useRef<HTMLDivElement>(null)
  const chart = useRef<echarts.ECharts | null>(null)

  useEffect(() => {
    if (!host.current) return
    const instance = echarts.init(host.current, undefined, { renderer: 'canvas' })
    chart.current = instance
    const observer = new ResizeObserver(() => instance.resize())
    observer.observe(host.current)
    return () => {
      observer.disconnect()
      instance.dispose()
      chart.current = null
    }
  }, [])

  useEffect(() => {
    chart.current?.setOption(option, true)
  }, [option])

  return (
    <div
      ref={host}
      className={className}
      style={{ height, width: '100%' }}
      role="img"
      aria-label={ariaLabel}
    />
  )
}
