import { mount, createLocalVue, Wrapper } from '@vue/test-utils'

import { getModule } from 'vuex-module-decorators'
import appStore from '../../../../src/store'
import AppModule from '../../../../src/vuexModules/AppModule'

import CooperativeInfo from '@/components/supportWithdraw/CooperativeInfo.vue'

import flushPromises from 'flush-promises'

describe('CooperativeInfo.vue', () => {
  const localVue = createLocalVue()

  let appModule!: AppModule
  let wrapper!: Wrapper<CooperativeInfo>

  beforeAll(() => {
    appModule = getModule(AppModule, appStore)
    appModule.initializeWeb3('http://localhost:8545')
  })

  afterEach(() => {
    if (wrapper !== undefined) {
      wrapper.destroy()
    }
  })

  it('renders tokens', async () => {

    appModule.setTotalMarketTokenSupply(8000567462000000000)
    appModule.setTotalReserveEtherTokenSupply(20000567462000000000)

    wrapper = mount(CooperativeInfo, {
      attachToDocument: true,
      store: appStore,
      localVue,
    })

    await flushPromises()
    expect(wrapper.find('[data-total-market-token="true"] .value').text()).toEqual('8.0')
    expect(wrapper.find('[data-reserve-ether="true"] .value').text()).toEqual('20.0')
  })
})
