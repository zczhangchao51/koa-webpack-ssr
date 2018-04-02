import axios from 'axios'
import qs from 'qs'

axios.defaults.headers.post['Content-Type'] =
  'application/x-www-form-urlencoded'
axios.defaults.timeout = 10000
export default (type, context) => (
  url,
  data = {},
  { ignoreErr = false, loading = ' ', noTimeStamp = false } = {},
  param = {}
) => {
  let {
    request,
    response,
    server,
    browser,
    store,
    route,
    redirect,
    app,
    ctx
  } = context
  if (server) {
    url = ctx.origin + url
  }
  // if (server) {
  //   if (!/lang/.test(req.headers.cookie)) {
  //     req.headers.cookie += `; lang=${store.state.locale}`
  //   }
  // }
  // let config = Object.assign(
  //   {},
  //   isServer && req.headers.cookie
  //     ? {
  //       headers: {
  //         cookie: req.headers.cookie
  //       }
  //     }
  //     : {},
  //   param
  // )
  let config = { param }
  config.url = url
  config.method = type
  if (type === 'post') config.data = qs.stringify(data)
  if (type === 'get') {
    config.params = Object.assign({}, data)
    if (browser && !noTimeStamp) config.params.TIME = +new Date() // 因为pwa的原因部分请求暂时不加时间戳来保证最新请求，而是交给nginx层进行处理
  }
  return axios(config)
    .then(({ data: json, status, headers }) => {
      // let setCookie = headers['set-cookie']
      // if (setCookie) res.setHeader('Set-Cookie', setCookie)
      if (!json) json = { rtn: 'x', error_msg: 'Parse data format error' }
      if (json.rtn != 0) {
        // 错误处理
        if (process.env.NODE_ENV === 'production') {
          // 客户端错误上报
          if (process.browser) {
            let logUrl = `/pc_main_http_error?${qs.stringify({
              api: url,
              request: data,
              response: json,
              client: true
            })}`
            new Image().src = logUrl
          }
          // 服务端错误记录
          // if (process.server) {
          //   let logger = require('assets/js/log')(context, 'http_error')
          //   logger.error(
          //     url,
          //     JSON.stringify({
          //       request: data,
          //       response: json
          //     })
          //   )
          // }
        }
        return Promise.reject(json)
      } else {
        return json
      }
    })
    .catch(res => {
      if (res instanceof Error) {
        res = { url, code: 'x', message: res.message }
      } else if (res.response && res.response.status) {
        let statusCode = res.response.status
        res = { url, code: statusCode, message: statusCode }
      } else if (res.code) {
        res = { url, rtn: 'x', message: 'Time out' }
      } else {
        res.code = res.rtn
        res.url = url
        res.message = res.error_msg
      }
      if (!ignoreErr && browser) {
        app.$message(res.error_msg)
      }
      return Promise.reject(res)
    })
}
