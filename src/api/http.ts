import { AxiosResponse } from 'axios'
import type { App } from 'vue'
import request from './axios.config'
import { message } from 'ant-design-vue'
export interface HttpOption {
  url: string
  data?: any
  method?: string
  headers?: any
  beforeRequest?: () => void
  afterRequest?: () => void
}

export interface Response {
  totalSize: number | 0
  result: boolean
  errMsg: string
  data: any
}
/**
 * 拦截器
 * @param
 * @returns Promise
 */
function http({ url, data, method, headers, beforeRequest, afterRequest }: HttpOption) {
  const successHandler = (res: AxiosResponse<Response>) => {
    if (res.data.result) {
      return res.data.data
    } else {
      message.warning(res.data.errMsg || '请求失败，未知异常')
      return res.data
      throw new Error(res.data.errMsg || '请求失败，未知异常')
    }
  }
  const failHandler = (error: Response) => {
    afterRequest && afterRequest()
    throw new Error(error.errMsg || '请求失败，未知异常')
  }
  beforeRequest && beforeRequest()
  method = method || 'GET'
  const params = Object.assign(typeof data === 'function' ? data() : data || {}, {})
  return method === 'GET'
    ? request.get(url, { params }).then(successHandler, failHandler)
    : request.post(url, params, { headers: headers }).then(successHandler, failHandler)
}

export function get({
  url,
  data,
  method = 'GET',
  beforeRequest,
  afterRequest,
}: HttpOption): Promise<Response | any> {
  return http({
    url,
    method,
    data,
    beforeRequest,
    afterRequest,
  })
}

export function post({
  url,
  data,
  method = 'POST',
  headers,
  beforeRequest,
  afterRequest,
}: HttpOption): Promise<Response | any> {
  return http({
    url,
    method,
    data,
    headers,
    beforeRequest,
    afterRequest,
  })
}

function install(app: App): void {
  app.config.globalProperties.$http = http

  app.config.globalProperties.$get = get

  app.config.globalProperties.$post = post
}

export default {
  install,
  get,
  post,
}

declare module '@vue/runtime-core' {
  // 为 `this.$` 提供类型声明
  interface ComponentCustomProperties {
    $get: (options: HttpOption) => Promise<Response>
    $post: (options: HttpOption) => Promise<Response>
  }
}
