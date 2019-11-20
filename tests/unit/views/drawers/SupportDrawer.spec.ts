import { shallowMount, createLocalVue, Wrapper } from '@vue/test-utils'

import appStore from '../../../../src/store'
import { getModule } from 'vuex-module-decorators'
import AppModule from '../../../../src/vuexModules/AppModule'

import SupportDrawer from '@/views/drawers/SupportDrawer.vue'

import VueRouter from 'vue-router'

// tslint:disable no-shadowed-variable

let appModule!: AppModule

describe('SupportDrawer.vue', () => {

  const localVue = createLocalVue()
  let wrapper!: Wrapper<SupportDrawer>

  const wrapperClass = 'support-drawer-wrapper'

  beforeAll(() => {
    localVue.use(VueRouter)
    appModule = getModule(AppModule, appStore)
    appModule.initializeWeb3('http://localhost:8545')
  })

  afterEach(() => {
    if (wrapper !== undefined) {
      wrapper.destroy()
    }
  })

  it('renders renders the support drawer view', () => {
    wrapper = shallowMount(SupportDrawer, {
      attachToDocument: true,
      store: appStore,
      localVue,
    })

    expect(wrapper.findAll(`.${wrapperClass}`).length).toBe(1)
    expect(wrapper.find('supportprocess-stub').exists()).toBeTruthy()
 })
})
