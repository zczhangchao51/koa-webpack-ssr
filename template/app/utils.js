import Vue from 'vue'

const noopData = () => ({})

export function applyAsyncData(Component, asyncData) {
  const ComponentData = Component.options.data || noopData
  // Prevent calling this method for each request on SSR context
  // if (!asyncData && Component.options.hasAsyncData) {
  //   return
  // }
  // Component.options.hasAsyncData = true
  Component.options.data = function() {
    const data = ComponentData.call(this)
    // if (this.$ssrContext) {
    //   asyncData = this.$ssrContext.asyncData[Component.cid]
    // }
    return { ...data, ...asyncData }
  }
  if (Component._Ctor && Component._Ctor.options) {
    Component._Ctor.options.data = Component.options.data
  }
}

export function sanitizeComponent(Component) {
  if (!Component.options) {
    Component = Vue.extend(Component) // fix issue #6
    Component._Ctor = Component
  } else {
    Component._Ctor = Component
    Component.extendOptions = Component.options
  }
  // For debugging purpose
  // if (!Component.options.name && Component.options.__file) {
  //   Component.options.name = Component.options.__file
  // }
  return Component
}

export function getMatchedComponents(route) {
  return [].concat.apply(
    [],
    route.matched.map(function(m) {
      return Object.keys(m.components).map(function(key) {
        return m.components[key]
      })
    })
  )
}

export function getMatchedComponentsInstances(route) {
  return [].concat.apply(
    [],
    route.matched.map(function(m) {
      return Object.keys(m.instances).map(function(key) {
        return m.instances[key]
      })
    })
  )
}

export function flatMapComponents(route, fn) {
  return Array.prototype.concat.apply(
    [],
    route.matched.map(function(m, index) {
      return Object.keys(m.components).map(function(key) {
        return fn(m.components[key], m.instances[key], m, key, index)
      })
    })
  )
}

export function middlewareSeries(promises, context) {
  if (!promises.length || context._redirected) {
    return Promise.resolve()
  }
  return promisify(promises[0], context).then(() => {
    return middlewareSeries(promises.slice(1), context)
  })
}

export function promisify(fn, context) {
  let promise
  if (fn.length === 2) {
    // fn(context, callback)
    promise = new Promise(resolve => {
      fn(context, function(err, data) {
        if (err) {
          context.error(err)
        }
        data = data || {}
        resolve(data)
      })
    })
  } else {
    promise = fn(context)
  }
  if (
    !promise ||
    (!(promise instanceof Promise) && typeof promise.then !== 'function')
  ) {
    promise = Promise.resolve(promise)
  }
  return promise
}

// Imported from vue-router
export function getLocation(base, mode) {
  var path = window.location.pathname
  if (mode === 'hash') {
    return window.location.hash.replace(/^#\//, '')
  }
  if (base && path.indexOf(base) === 0) {
    path = path.slice(base.length)
  }
  return (path || '/') + window.location.search + window.location.hash
}

export function urlJoin() {
  return [].slice
    .call(arguments)
    .join('/')
    .replace(/\/+/g, '/')
}
