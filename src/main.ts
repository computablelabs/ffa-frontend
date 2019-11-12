import Vue from 'vue'
import VueRouter from 'vue-router'
import App from './App.vue'
import { routes } from './router'
import store from './store'
import { MetamaskAccountChanged } from './models/Events'

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
