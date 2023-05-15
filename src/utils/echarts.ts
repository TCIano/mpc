import * as echarts from 'echarts/core'

import {
  BarChart,
  LineChart,
  PieChart,
  RadarChart,
  BarSeriesOption,
  LineSeriesOption,
  RadarSeriesOption,
} from 'echarts/charts'

import { CanvasRenderer } from 'echarts/renderers'

import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  TitleComponentOption,
} from 'echarts/components'

echarts.use([
  BarChart,
  LineChart,
  PieChart,
  RadarChart,
  CanvasRenderer,
  TooltipComponent,
  GridComponent,
  TitleComponent,
  LegendComponent,
])

export default echarts
