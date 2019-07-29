import { shallowMount, mount, createLocalVue } from '@vue/test-utils'
import App from '@/App.vue'
import VueRouter from 'vue-router'
import { router } from '../../../src/router' // TODO: figure out why @/router doesn't work
import appStore from '../../../src/store'
import Navigation from '../../../src/components/ui/Navigation.vue'
import Drawer from '../../../src/components/ui/Drawer.vue'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faFile as faFileSolid } from '@fortawesome/free-solid-svg-icons'
import { faFile, faCheckCircle, faPlusSquare } from '@fortawesome/free-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

const localVue = createLocalVue()
library.add(faFileSolid, faFile, faCheckCircle, faPlusSquare)
const listRoute = '/list'

describe('App', () => {

  beforeAll(() => {
    localVue.use(VueRouter)
    localVue.component('navigation', Navigation)
    localVue.component('font-awesome-icon', FontAwesomeIcon)
    localVue.component('drawer', Drawer)
  })

  it('renders a child component via routing', () => {
    const wrapper = mount(App, {
      attachToDocument: true,
      localVue,
      router,
      store: appStore,
    })
    router.push(listRoute)
    expect(wrapper.find('section#list').exists()).toBe(true)
  })
})
