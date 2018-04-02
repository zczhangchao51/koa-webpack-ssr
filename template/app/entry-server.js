import Vue from 'vue'
import { createApp } from './app'
import { applyAsyncData, sanitizeComponent, promisify } from './utils'
import request from '@/utils/request.js'

const isDev = process.env.NODE_ENV !== 'production'

const noopApp = () => new Vue({ render: h => h('div') })

// This exported function will be called by `bundleRenderer`.
// This is where we perform data-prefetching to determine the
// state of our application before actually rendering it.
// Since data fetching is async, this function is expected to
// return a Promise that resolves to the app instance.
export default ctx => {
  return new Promise((resolve, reject) => {
    const s = isDev && Date.now()
    const { app, router, store } = createApp()

    const { url } = ctx
    const { fullPath } = router.resolve(url).route

    if (fullPath !== url) {
      return reject({ redirect: fullPath })
    }

    // 设置标签信息
    const meta = app.$meta()
    ctx.meta = meta

    // set router's location
    router.push(url)

    // wait until router has resolved possible async hooks
    router.onReady(() => {
      // 定义服务端vue专用的上下文,以供asyncData使用
      let context = {
        browser: false,
        server: true,
        app,
        router,
        route: router.currentRoute,
        store,
        ctx,
        request: ctx.request,
        response: ctx.response,
        redirect(url) {
          context.redirected = true
          ctx.redirect(url)
        },
        error(code = 500, message = '服务器异常') {
          context.errored = true
          reject({ code, message })
        }
      }
      context.GET = request('get', context)
      context.POST = request('post', context)

      const matchedComponents = router.getMatchedComponents()
      // no matched routes
      if (!matchedComponents.length) {
        return reject({ redirect: '/error' })
      }
      // Call fetchData hooks on components matched by the route.
      // A preFetch hook dispatches a store action and returns a Promise,
      // which is resolved when the action is complete and store state has been
      // updated.
      let storeAsyncData = (store.state.asyncData = {})
      Promise.all(
        matchedComponents.map(async (Component, index) => {
          let { asyncData } = Component
          let asyncDataResult = null
          if (asyncData && typeof asyncData === 'function') {
            asyncDataResult = await promisify(asyncData, context)
          }
          Component = sanitizeComponent(Component)
          if (asyncDataResult) {
            storeAsyncData[index] = asyncDataResult
            applyAsyncData(Component, asyncDataResult)
          }
          if (Component.options.name === 'Error') {
            applyAsyncData(
              Component,
              ctx.vueRenderError ? ctx.vueRenderError : {}
            )
          }
          Component._Ctor = Component
          return Component
        })
      )
        .then(() => {
          isDev && console.log(`data pre-fetch: ${Date.now() - s}ms`)
          if (context.redirected) return resolve(noopApp())
          // After all preFetch hooks are resolved, our store is now
          // filled with the state needed to render the app.
          // Expose the state on the render context, and let the request handler
          // inline the state in the HTML response. This allows the client-side
          // store to pick-up the server-side state without having to duplicate
          // the initial data fetching on the client.
          if (ctx.vueRenderError) {
            store.state.vueRenderError = ctx.vueRenderError
            ctx.state = store.state
            resolve(app)
          } else {
            ctx.state = store.state
            resolve(app)
          }
        })
        .catch(reject)
    }, reject)
  })
}
