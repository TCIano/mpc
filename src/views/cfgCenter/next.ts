import * as echarts from 'echarts/core'
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  MarkLineComponent,
} from 'echarts/components'
import { ScatterChart } from 'echarts/charts'
import { UniversalTransition } from 'echarts/features'
import { CanvasRenderer } from 'echarts/renderers'

echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  MarkLineComponent,
  ScatterChart,
  CanvasRenderer,
  UniversalTransition,
])

var chartDom = document.getElementById('main')
var myChart = echarts.init(chartDom)
var option

const dataAll = [
  [
    [10.0, 8.04],
    [8.0, 6.95],
    [13.0, 7.58],
    [9.0, 8.81],
    [11.0, 8.33],
    [14.0, 9.96],
    [6.0, 7.24],
    [4.0, 4.26],
    [12.0, 10.84],
    [7.0, 4.82],
    [5.0, 5.68],
  ],
  [
    [10.0, 9.14],
    [8.0, 8.14],
    [13.0, 8.74],
    [9.0, 8.77],
    [11.0, 9.26],
    [14.0, 8.1],
    [6.0, 6.13],
    [4.0, 3.1],
    [12.0, 9.13],
    [7.0, 7.26],
    [5.0, 4.74],
  ],
  [
    [10.0, 7.46],
    [8.0, 6.77],
    [13.0, 12.74],
    [9.0, 7.11],
    [11.0, 7.81],
    [14.0, 8.84],
    [6.0, 6.08],
    [4.0, 5.39],
    [12.0, 8.15],
    [7.0, 6.42],
    [5.0, 5.73],
  ],
  [
    [8.0, 6.58],
    [8.0, 5.76],
    [8.0, 7.71],
    [8.0, 8.84],
    [8.0, 8.47],
    [8.0, 7.04],
    [8.0, 5.25],
    [19.0, 12.5],
    [8.0, 5.56],
    [8.0, 7.91],
    [8.0, 6.89],
  ],
  [
    [12.0, 6.58],
    [25.0, 5.76],
    [8.0, 7.71],
    [8.0, 8.84],
    [8.0, 8.47],
    [8.0, 7.04],
    [8.0, 5.25],
    [19.0, 12.5],
    [8.0, 5.56],
    [8.0, 7.91],
    [8.0, 6.89],
  ],
  [
    [8.0, 6.58],
    [8.0, 5.76],
    [8.0, 7.71],
    [8.0, 8.84],
    [8.0, 8.47],
    [6.0, 7.04],
    [5.0, 5.25],
    [9.0, 12.5],
    [8.0, 5.56],
    [8.0, 7.91],
    [8.0, 6.89],
  ],
  [
    [18.0, 6.58],
    [8.0, 5.76],
    [8.3, 7.71],
    [10.0, 8.4],
    [8.0, 8.47],
    [6.0, 7.04],
    [5.0, 5.25],
    [10.0, 12.5],
    [3.0, 5.56],
    [3.5, 7.91],
    [8.0, 6.89],
  ],
  [
    [10.0, 7.46],
    [8.0, 6.77],
    [13.0, 12.74],
    [9.0, 7.11],
    [11.0, 7.81],
    [14.0, 8.84],
    [6.0, 6.08],
    [4.0, 5.39],
    [12.0, 8.15],
    [7.0, 6.42],
    [5.0, 5.73],
  ],
]
const markLineOpt = {
  animation: false,
  label: {
    formatter: 'y = 0.5 * x + 3',
    align: 'right',
  },
  lineStyle: {
    type: 'solid',
  },
  tooltip: {
    formatter: 'y = 0.5 * x + 3',
  },
  data: [
    [
      {
        coord: [0, 3],
        symbol: 'none',
      },
      {
        coord: [20, 13],
        symbol: 'none',
      },
    ],
  ],
}
const row = 3
const col = 3
const GAP = 5
const BASE_LEFT = 5
const BASE_TOP = 5
const GRID_WIDTH = (100 - BASE_LEFT - GAP) / col - GAP / 2
const GRID_HEIGHT = (100 - BASE_TOP - GAP) / row - GAP / 2
const gridD = []
for (var i = 0; i < row; i++) {
  for (var j = 0; j < col; j++) {
    gridD.push({
      left: BASE_LEFT + j * (GRID_WIDTH + GAP) + '%',
      top: BASE_TOP + i * (GRID_HEIGHT + GAP) + '%',
      width: GRID_WIDTH + '%',
      height: GRID_HEIGHT + '%',
    })
  }
}
const xAxisD = []
const yAxisD = []
const seriesD = []
for (var i = 0; i < dataAll.length; i++) {
  xAxisD.push({
    gridIndex: i,
    min: 0,
    max: 20,
  })
  yAxisD.push({
    gridIndex: i,
    min: 0,
    max: 15,
  })
  seriesD.push({
    name: i,
    type: 'scatter',
    xAxisIndex: i,
    yAxisIndex: i,
    data: dataAll[i],
    markLine: markLineOpt,
  })
}
option = {
  title: {
    text: "Anscombe's quartet",
    left: 'center',
    top: 0,
  },
  grid: gridD,
  tooltip: {
    formatter: 'Group {a}: ({c})',
  },
  xAxis: xAxisD,
  yAxis: yAxisD,
  series: seriesD,
}

option && myChart.setOption(option)
