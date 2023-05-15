import * as echarts from 'echarts/core'

import { BarSeriesOption, LineSeriesOption, RadarSeriesOption } from 'echarts/charts'
import {
  TooltipComponentOption,
  TitleComponentOption,
  GraphicComponentOption,
  DatasetComponentOption,
} from 'echarts/components'
type chartOption = echarts.ComposeOption<
  | BarSeriesOption
  | LineSeriesOption
  | RadarSeriesOption
  | TitleComponentOption
  | TooltipComponentOption
  | GraphicComponentOption
  | DatasetComponentOption
>

export { chartOption }
