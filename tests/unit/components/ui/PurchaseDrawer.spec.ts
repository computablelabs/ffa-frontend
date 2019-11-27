import { mount, createLocalVue, Wrapper } from '@vue/test-utils'
import VueRouter from 'vue-router'
import { getModule } from 'vuex-module-decorators'
import appStore from '../../../../src/store'
import DrawerModule, { DrawerState } from '../../../../src/vuexModules/DrawerModule'

import BaseDrawer from '@/views/drawers/BaseDrawer.vue'

const localVue = createLocalVue()
localVue.use(VueRouter)
const drawerOpenClass = 'open'
const drawerModule = getModule(DrawerModule, appStore)
let wrapper!: Wrapper<BaseDrawer>

describe('BaseDrawer.vue', () => {

  beforeAll(() => {
    localVue.use(VueRouter)
    drawerModule.setDrawerOpenClass(drawerOpenClass)

    wrapper = mount(BaseDrawer, {
      attachToDocument: true,
      store: appStore,
      localVue,
    })
  })

  afterAll(() => { wrapper.destroy() })

  describe('rendering', () => {
    it('renders correctly', () => {
      wrapper = mount(BaseDrawer, {
        attachToDocument: true,
        store: appStore,
        localVue,
      })
    })
  })
})
