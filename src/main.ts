import Vue from 'vue'
import App from './App.vue'
import { router } from './router'
import store from './store'
import { library } from '@fortawesome/fontawesome-svg-core'
import {
  faFile as faFileSolid,
  faCheck as faCheckSolid,
  faCameraRetro as faCameraRetroSolid,
  faVideo as faVideoSolid,
  faHeadphonesAlt } from '@fortawesome/free-solid-svg-icons'
import {
  faFile,
  faFileArchive,
  faFilePdf} from '@fortawesome/free-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import Navigation from '@/components/ui/Navigation.vue'
import Drawer from '@/components/ui/Drawer.vue'
import '@/assets/style/ffa.sass'

library.add(
  faFileSolid,
  faFile,
  faCheckSolid,
  faCameraRetroSolid,
  faVideoSolid,
  faHeadphonesAlt,
  faFileArchive,
  faFilePdf,
)
Vue.component('font-awesome-icon', FontAwesomeIcon)
Vue.component('navigation', Navigation)
Vue.component('drawer', Drawer)
Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount('#app')
