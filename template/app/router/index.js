import Vue from 'vue'
import Router from 'vue-router'
import Index from '@/views/Index.vue'

Vue.use(Router)

export function createRouter() {
  return new Router({
    mode: 'history',
    fallback: true,
    scrollBehavior: () => ({ y: 0 }),
    routes: [
      {
        path: '/',
        // component: () => import('@/views/Index' /* webpackChunkName: "index" */)
        component: Index
      },
      {
        path: '/asyncdata',
        component: () =>
          import('@/views/AsyncData' /* webpackChunkName: "asyncdata" */)
      },
      {
        path: '/static',
        component: () =>
          import('@/views/Static' /* webpackChunkName: "static" */)
      },
      {
        path: '*',
        name: 'error',
        component: () => import('@/Error' /* webpackChunkName: "error" */),
        meta: { layout: 'noop' }
      }
    ]
  })
}
