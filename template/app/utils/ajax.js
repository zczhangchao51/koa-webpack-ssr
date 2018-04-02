// 专供客户端ajax请求使用
import axios from 'axios'
import qs from 'qs'
import Vue from 'vue'

const app = new Vue()

axios.defaults.headers.post['Content-Type'] =
  'application/x-www-form-urlencoded'
const ajax = type => (
  url,
  data = {},
  { ignoreErr = false, loading = false, noTimeStamp = false } = {},
  param = { timeout: 10000 }
) => {
  let config = Object.assign({}, param)
  config.url = url
  config.method = type
  if (type === 'post') {
    config.data = qs.stringify(data)
    // loading = true
  }
  if (type === 'get') {
    config.params = Object.assign({}, data)
    if (!noTimeStamp) config.params.TIME = +new Date() // 因为pwa的原因部分请求暂时不加时间戳来保证最新请求，而是交给nginx层进行处理
  }
  if (loading && app) app.$loading(loading)
  return axios(config)
    .then(({ data: json, status, headers, config, request }) => {
      if (app) app.$loading.close()
      if (!json) json = { rtn: 'x', error_msg: 'Parse data format error' }
      if (json.rtn != 0) {
        // 错误上报
        if (process.env.NODE_ENV === 'production') {
          new Image().src = `/pc_main_http_error?${qs.stringify({
            api: url,
            request: data,
            response: json,
            client: true
          })}`
        }
        return Promise.reject(json)
      } else {
        return json
      }
    })
    .catch(res => {
      if (loading && app) app.$loading.close()
      if (res instanceof Error) res = { url, rtn: 'x', error_msg: res.message }
      if (!ignoreErr) app.$message.warning(res.error_msg)
      return Promise.reject(res)
    })
}

export const get = ajax('get')
export const post = ajax('post')
