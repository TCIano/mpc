import Axios, { AxiosResponse } from 'axios'
import Cookies from 'js-cookie'
import qs from 'qs'

export const baseURL = import.meta.env.VITE_MPC_BASE_URL

export const CONTENT_TYPE = 'Content-Type'

export const FORM_URLENCODED = 'application/x-www-form-urlencoded; charset=UTF-8'

export const APPLICATION_JSON = 'application/json; charset=UTF-8'

export const TEXT_PLAIN = 'text/plain; charset=UTF-8'

import { USER_TOKEN_KEY } from '@/layouts/setting/keys'

const service = Axios.create({
  // baseURL,
  timeout: 10 * 60 * 1000,
  withCredentials: true, // 跨域请求时发送cookie
  // headers: {
  //   'Access-Control-Allow-Origin': '*',
  // },
})

service.interceptors.request.use(
  (config) => {
    const token = Cookies.get(USER_TOKEN_KEY)
    if (token) {
      !config.headers && (config.headers = {})
      config.headers.Authorization = `Bearer ${token}`
      if (!config.headers[CONTENT_TYPE]) {
        config.headers[CONTENT_TYPE] = APPLICATION_JSON
      }
      if (config.headers[CONTENT_TYPE] === FORM_URLENCODED) {
        config.data = qs.stringify(config.data)
      }
    }
    return config
  },
  (error) => {
    return Promise.reject(error.response)
  }
)

service.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => {
    if (response.status === 200) {
      return response
    } else {
      throw new Error(response.status.toString())
    }
  },
  (error) => {
    if (import.meta.env.MODE === 'development') {
      console.log(error)
    }
    return Promise.reject({ code: 500, msg: '服务器异常，请稍后重试…' })
  }
)

export default service
