import Vue from 'vue'
import VueRouter, { Route } from 'vue-router'
import { getModule } from 'vuex-module-decorators'

import { routes } from './router'
import store from './store'

import SharedModule from './functionModules/components/SharedModule'

import App from './App.vue'
import Navigation from '@/components/ui/Navigation.vue'
import Drawer from '@/components/ui/Drawer.vue'

import '@/assets/style/ffa.sass'

import AppModule from '../src/vuexModules/AppModule'

import { NavigationView } from '../src/models/NavigationView'
import { MetamaskAccountChanged } from './models/Events'

Vue.component('navigation', Navigation)
Vue.component('drawer', Drawer)
Vue.config.productionTip = false

const ffaRouter = new VueRouter({
  mode: 'history',
  routes,
})

ffaRouter.beforeEach((to: Route, from: Route, next: (val?: any) => void) => {
  const appModule = getModule(AppModule, store)

  if (SharedModule.isAuthenticated()) {
    appModule.setNavigationView(NavigationView.Full)
    switch (to.path) {
      case '/login':
        return next('/home')
      case '/terms-of-service':
        appModule.setNavigationView(NavigationView.Identity)
        return next()
        // return next('/home')
      default:
        return next()
    }
  }

  switch (to.path) {
    case '/login':
      appModule.setNavigationView(NavigationView.Minimal)
      return next()
    case '/terms-of-service':
      appModule.setNavigationView(NavigationView.Identity)
      return next()
    default:
      appModule.setNavigationView(NavigationView.Minimal)
      return next({
        path: '/login',
        query: { redirectFrom: to.fullPath },
      })
  }
})

const app = new Vue({
  router: ffaRouter,
  store,
  render: (h) => h(App),
}).$mount('#app')

// @ts-ignore
window.ethereum.on('accountsChanged', (accounts) => {
  const address = ethereum.selectedAddress
  const account = accounts[0]
  app.$root.$emit(MetamaskAccountChanged)
})
