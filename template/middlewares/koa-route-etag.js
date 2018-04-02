const LRU = require('lru-cache')
const createHash = require('crypto').createHash
const md5 = input => {
  return createHash('md5')
    .update(input)
    .digest('hex')
}

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
    // 检测是否为需要缓存etag的url
    if (isCacheable) {
      // 检测缓存中是否存在url对应的hash
      let hash = cache.get(originalUrl)
      if (hash) {
        // 设置状态码以及Etag方便ctx.fresh进行判断是否匹配
        ctx.status = 200
        ctx.set('ETag', `W/${hash}`)
        // 检测是否还需要下游中间件处理，不需要将进行缓存协商判断
        if (defer) {
          await next()
          // 处理后再更新缓存一次
          cacheHash()
        }
        // 判断缓存协商
        if (ctx.fresh) {
          ctx.status = 304
          return
        }
      }
    }
    // 不是需要缓存的页面则跳过中间件
    await next()
    // 下游中间件处理后进行缓存
    cacheHash()
    function cacheHash() {
      if (isCacheable) {
        if (ctx.body && ctx.status === 200 && ctx.type === 'text/html') {
          let md5Hash = md5(ctx.body)
          ctx.set('ETag', `W/${md5Hash}`)
          cache.set(originalUrl, md5Hash)
        }
      }
    }
  }
}
