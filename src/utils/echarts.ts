import * as echarts from 'echarts/core'
//按需引入
import { BarChart, LineChart, PieChart, RadarChart } from 'echarts/charts'

import { CanvasRenderer } from 'echarts/renderers'

import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  MarkLineComponent,
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
  MarkLineComponent,
])

export default echarts
