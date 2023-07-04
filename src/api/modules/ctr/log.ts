import { post, get } from '@/api/http'
import { PMS } from '../baseUrl'

const BASE = PMS + '/Logs'

const GET_LOGS = BASE + '/GetLogs'
const CLEAR_LOGS = BASE + '/Clear'

export const getLogsApi = () => {
  return get({
    url: GET_LOGS,
  })
}

export const clearLogsApi = () => {
  return post({
    url: CLEAR_LOGS,
  })
}
