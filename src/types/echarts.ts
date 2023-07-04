import * as echarts from 'echarts/core'

import { BarSeriesOption, LineSeriesOption, RadarSeriesOption } from 'echarts/charts'
import {
  TooltipComponentOption,
  TitleComponentOption,
  GraphicComponentOption,
  DatasetComponentOption,
  MarkLineComponentOption,
} from 'echarts/components'
type chartOption = echarts.ComposeOption<
  | BarSeriesOption
  | LineSeriesOption
  | RadarSeriesOption
  | TitleComponentOption
  | TooltipComponentOption
  | GraphicComponentOption
  | DatasetComponentOption
  | MarkLineComponentOption
>

export { chartOption }
