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
  faHeadphonesAlt,
  faTimes,
  faExclamationCircle,
  faDotCircle} from '@fortawesome/free-solid-svg-icons'
import {
  faFile,
  faFileArchive,
  faFilePdf,
  faPlusSquare} from '@fortawesome/free-regular-svg-icons'
import { faEthereum } from '@fortawesome/free-brands-svg-icons'
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
  faTimes,
  faFileArchive,
  faFilePdf,
  faPlusSquare,
  faEthereum,
  faExclamationCircle,
  faDotCircle,
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
