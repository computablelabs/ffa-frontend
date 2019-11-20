import { shallowMount, createLocalVue, Wrapper } from '@vue/test-utils'

import appStore from '../../../../src/store'
import { getModule } from 'vuex-module-decorators'
import AppModule from '../../../../src/vuexModules/AppModule'

import WithdrawDrawer from '@/views/drawers/WithdrawDrawer.vue'

import VueRouter from 'vue-router'

// tslint:disable no-shadowed-variable

let appModule!: AppModule

describe('WithdrawDrawer.vue', () => {

  const localVue = createLocalVue()
  let wrapper!: Wrapper<WithdrawDrawer>

  const wrapperClass = 'withdraw-drawer-wrapper'

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
    wrapper = shallowMount(WithdrawDrawer, {
      attachToDocument: true,
      store: appStore,
      localVue,
    })

    expect(wrapper.findAll(`.${wrapperClass}`).length).toBe(1)
    expect(wrapper.find('withdrawprocess-stub').exists()).toBeTruthy()
 })
})
