export const NOTIFY_EVENT_MESSAGE = 'notifyEventMessage'
export const NOTIFY_TREND_DATAS_CHANGED = 'notifyTrendDatasChanged' //工程趋势
export const NOTIFY_PRJ_OPERATION_RESULT = 'notifyPrjOperationResult' //工程操作结果通知
export const NOTIFY_PRJ_STATE_CHANGED = 'notifyPrjStateChanged' //工程状态通知
export const NOTIFY_PRJ_OVERVIEW = 'notifyPrjOverview' //总览信息通知
export const NOTIFY_PRJ_ONLINE_DATAS_CHANGED = 'notifyPrjOnlineDatasChanged' //工程在线快照

export type SingleTaskType =
  | typeof NOTIFY_EVENT_MESSAGE
  | typeof NOTIFY_TREND_DATAS_CHANGED
  | typeof NOTIFY_PRJ_OPERATION_RESULT
  | typeof NOTIFY_PRJ_STATE_CHANGED
  | typeof NOTIFY_PRJ_OVERVIEW
  | typeof NOTIFY_PRJ_ONLINE_DATAS_CHANGED
export interface SignalrCls {
  onMessageReceived: (type: SingleTaskType, callback: (res: any, res2?: any) => void) => void
  sendMessage: (message: SingleTaskType) => void
  stop: () => void
  start: () => void
}
