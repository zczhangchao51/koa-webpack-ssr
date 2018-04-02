const LRU = require('lru-cache')

module.exports = function(option, cacheable, defer = false) {
  if (typeof option === 'function') {
    defer = cacheable || false
    cacheable = option
    option = void 0
  }
  const cache = LRU(option)
  return async function(ctx, next) {
    let { originalUrl } = ctx
    let isCacheable = cacheable(ctx)
    // 检测是否为需要缓存的url
    if (isCacheable) {
      // 检测缓存中是否存在url对应的页面
      let html = cache.get(originalUrl)
      if (html) {
        ctx.body = html
        // 检测是否要将页面结果透传进行下一步处理
        if (defer) {
          await next()
          // 处理后再更新缓存一次
          return cachePage()
        }
        // 不需要透传则不进行下游中间件
        return
      }
    }
    // 不是需要缓存的页面则跳过中间件
    await next()
    // 下游中间件处理后进行缓存
    cachePage()
    function cachePage() {
      if (isCacheable) {
        if (ctx.body && ctx.status === 200 && ctx.type === 'text/html') {
          cache.set(originalUrl, ctx.body)
        }
      }
    }
  }
}
