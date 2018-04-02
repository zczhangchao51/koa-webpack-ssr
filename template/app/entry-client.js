import Vue from 'vue'
import '@/utils/shim'
import { createApp } from './app'
import {
  applyAsyncData,
  sanitizeComponent,
  flatMapComponents,
  getMatchedComponents,
  promisify,
  getLocation
} from './utils'
import request from '@/utils/request.js'
import ProgressBar from './components/ProgressBar.vue'

const noopData = () => {
  return {}
}

// global progress bar
const bar = (Vue.prototype.$bar = new Vue(ProgressBar).$mount())
document.body.appendChild(bar.$el)

// a global mixin that calls `asyncData` when a route component's params change
// Vue.mixin({
//   beforeRouteUpdate(to, from, next) {
//     const { asyncData } = this.$options
//     if (asyncData) {
//       asyncData({
//         store: this.$store,
//         route: to
//       })
//         .then(next)
//         .catch(next)
//     } else {
//       next()
//     }
//   }
// })

if (module.hot) {
  module.hot.accept()
}

const { app, router, store } = createApp()

// prime the store with server-initialized state.
// the state is determined during SSR and inlined in the page markup.
let storeAsyncData
let vueRenderError
if (window.__INITIAL_STATE__) {
  storeAsyncData = window.__INITIAL_STATE__.asyncData
  if (window.__INITIAL_STATE__.vueRenderError) {
    vueRenderError = window.__INITIAL_STATE__.vueRenderError
    delete window.__INITIAL_STATE__.vueRenderError
  }
  delete window.__INITIAL_STATE__.asyncData
  store.replaceState(window.__INITIAL_STATE__)
}

// wait until router has resolved all async before hooks
// and async components...
if (vueRenderError) router.push('/error')
router.onReady(async () => {
  // Add router hook for handling asyncData.
  // Doing it after initial route is resolved so that we don't double-fetch
  // the data that we already have. Using router.beforeResolve() so that all
  // async components are resolved.
  await Promise.all(resolveComponents(router))

  router.beforeResolve(async (to, from, next) => {
    let redirectd

    // 定义客户端vue专用的上下文,以供asyncData使用
    let context = {
      browser: true,
      server: false,
      app,
      router,
      route: to,
      store,
      redirect(url) {
        redirectd = url
      },
      error(code = 500, message = '服务器异常') {
        redirectd = '/error'
        vueRenderError = { code, message }
      }
    }
    context.GET = request('get', context)
    context.POST = request('post', context)

    const matched = router.getMatchedComponents(to)
    const prevMatched = router.getMatchedComponents(from)
    let diffed = false
    const activated = matched.filter((c, i) => {
      return diffed || (diffed = prevMatched[i] !== c)
    })
    if (!activated.length) {
      return next()
    }
    bar.start()
    try {
      await Promise.all(
        activated.map(async (Component, index) => {
          let asyncData = Component.options
            ? Component.options.asyncData
            : Component.asyncData
          let asyncDataResult = null
          if (asyncData && typeof asyncData === 'function') {
            asyncDataResult = await promisify(asyncData, context)
          }
          Component = sanitizeComponent(Component)
          if (Component.options.name === 'Error' && vueRenderError) {
            applyAsyncData(Component, vueRenderError)
          }
          if (asyncDataResult) {
            applyAsyncData(Component, asyncDataResult)
          }
          Component._Ctor = Component
        })
      )
      bar.finish()
      if (redirectd) return next(redirectd)
      next()
    } catch (error) {
      next(error)
    }
  })

  // actually mount to DOM
  app.$mount('#app')
  // Listen for first Vue update
  Vue.nextTick(() => {
    // Enable hot reloading
    if (process.env.NODE_ENV !== 'production') {
      hotReloadAPI(app)
    }
  })
})

function applySSRData(Component, ssrData) {
  if (Component.options.name === 'Error' && vueRenderError) {
    applyAsyncData(Component, vueRenderError)
  }
  if (ssrData) {
    applyAsyncData(Component, ssrData)
  }
  Component._Ctor = Component
  return Component
}

// Get matched components
function resolveComponents(router) {
  const path = getLocation(router.options.base, router.options.mode)

  return flatMapComponents(
    router.match(path),
    async (Component, _, match, key, index) => {
      // If component is not resolved yet, resolve it
      if (typeof Component === 'function' && !Component.options) {
        Component = await Component()
      }
      // Sanitize it and save it
      const _Component = applySSRData(
        sanitizeComponent(Component),
        storeAsyncData ? storeAsyncData[index] : null
      )
      match.components[key] = _Component
      return _Component
    }
  )
}

// Special hot reload with asyncData(context)
function hotReloadAPI(_app) {
  if (process.env.NODE_ENV !== 'production') {
    if (!module.hot) return

    let $components = []

    while (_app && _app.$children && _app.$children.length) {
      _app.$children.forEach((child, i) => {
        if (child.$vnode.data.routerView) {
          let hasAlready = false
          $components.forEach(component => {
            if (component.$options.__file === child.$options.__file) {
              hasAlready = true
            }
          })
          if (!hasAlready) {
            $components.push(child)
          }
        }
        _app = child
      })
    }

    $components.forEach(addHotReload.bind(_app))
  }
}

function addHotReload($component, depth) {
  if (process.env.NODE_ENV !== 'production') {
    if ($component.$vnode.data._hasHotReload) return
    $component.$vnode.data._hasHotReload = true

    var _forceUpdate = $component.$forceUpdate.bind($component.$parent)

    $component.$vnode.context.$forceUpdate = () => {
      let Components = getMatchedComponents(router.currentRoute)
      let Component = Components[depth]
      if (!Component) return _forceUpdate()
      if (typeof Component === 'object' && !Component.options) {
        // Updated via vue-router resolveAsyncComponents()
        Component = Vue.extend(Component)
        Component._Ctor = Component
      }
      // let context = getContext(
      //   {
      //     route: router.currentRoute,
      //     store,
      //     isClient: true,
      //     isHMR: true,
      //     next: next.bind(this),
      //     error: this.error
      //   },
      //   app
      // )
      let context = {
        route: router.currentRoute,
        store
      }
      // this.$loading.start && this.$loading.start()
      // Call asyncData(context)
      promisify(Component.options.asyncData || noopData, context)
        .then(asyncDataResult => {
          applyAsyncData(Component, asyncDataResult)
          // this.$loading.increase && this.$loading.increase(30)
        })
        .then(() => {
          // this.$loading.finish && this.$loading.finish()
          _forceUpdate()
          // setTimeout(() => hotReloadAPI(app), 100)
        })
    }
  }
}

// service worker
// 在国产浏览器上有bug，暂不开启
// if (process.env.NODE_ENV === 'production') {
//   if (
//     location.protocol === 'https:' &&
//     navigator.serviceWorker &&
//     osBower.bower === 'Chrome'
//   ) {
//     window.addEventListener('load', async function() {
//       try {
//         let registration = await navigator.serviceWorker.register(
//           `/sw.js?timestamp=${+new Date()}`
//         )
//         // 注册成功
//         console.log(
//           'ServiceWorker registration successful with scope: ',
//           registration.scope
//         )
//       } catch (error) {
//         // 注册失败:(
//         console.log('ServiceWorker registration failed: ', error)
//       }
//     })
//   }
// }

export { app, router, store }
