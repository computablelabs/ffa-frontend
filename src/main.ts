import Vue from 'vue'
import VueRouter, { Route } from 'vue-router'
import App from './App.vue'
import { routes } from './router'
import store from './store'
import { MetamaskAccountChanged } from './models/Events'
import SharedModule from './functionModules/components/SharedModule'

import Navigation from '@/components/ui/Navigation.vue'
import Drawer from '@/components/ui/Drawer.vue'

import '@/assets/style/ffa.sass'

Vue.component('navigation', Navigation)
Vue.component('drawer', Drawer)
Vue.config.productionTip = false

const ffaRouter = new VueRouter({
  mode: 'history',
  routes,
})

ffaRouter.beforeEach((to: Route, from: Route, next: (val?: any) => void) => {
  SharedModule.isAuthenticated(store)
  if (SharedModule.isAuthenticated(store)) {
    next()
  } else {
    to.path === '/share' ? next() : next('/share')
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
