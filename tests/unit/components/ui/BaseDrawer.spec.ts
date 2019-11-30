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

  describe('computed properties', () => {
    it('computes isBeforeProcessing properly', () => {
      drawerModule.setDrawerState(DrawerState.processing)
      // @ts-ignore
      expect(wrapper.vm.isBeforeProcessing).toBeFalsy()

      drawerModule.setDrawerState(DrawerState.beforeProcessing)
      // @ts-ignore
      expect(wrapper.vm.isBeforeProcessing).toBeTruthy()
    })

    it('computes isProcessing properly', () => {
      drawerModule.setDrawerState(DrawerState.processing)
      // @ts-ignore
      expect(wrapper.vm.isProcessing).toBeTruthy()

      drawerModule.setDrawerState(DrawerState.beforeProcessing)
      // @ts-ignore
      expect(wrapper.vm.isProcessing).toBeFalsy()
    })

    it('computes isAfterProcessing properly', () => {
      drawerModule.setDrawerState(DrawerState.processing)
      // @ts-ignore
      expect(wrapper.vm.isAfterProcessing).toBeFalsy()

      drawerModule.setDrawerState(DrawerState.afterProcessing)
      // @ts-ignore
      expect(wrapper.vm.isAfterProcessing).toBeTruthy()
    })

  })
})
