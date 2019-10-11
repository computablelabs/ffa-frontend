import { mount, createLocalVue, Wrapper } from '@vue/test-utils'

import { getModule } from 'vuex-module-decorators'
import appStore from '../../../../src/store'
import AppModule from '../../../../src/vuexModules/AppModule'

import EthereumToMarketToken from '@/components/support/EthereumToMarketToken.vue'

import flushPromises from 'flush-promises'

describe('EthereumToMarketToken.vue', () => {

  const ethereumToMarketTokenClass = '.ethereum-to-market-token'
  const currencyClass = '.currency'
  const valueClass = '.value'
  const bottomRowClass = '.bottom-row'

  const localVue = createLocalVue()

  let appModule!: AppModule
  let wrapper!: Wrapper<EthereumToMarketToken>

  beforeAll(() => {
    appModule = getModule(AppModule, appStore)
  })

  afterEach(() => {
    if (wrapper !== undefined) {
      wrapper.destroy()
    }
  })

  it('renders tokens', async () => {

    appModule.setMarketTokenBalance(42)
    appModule.setEthereumBalance(99)
    appModule.setEtherTokenBalance(1)
    appModule.setMarketTokenToUSDRate(314.15 * 0.5)
    appModule.setEthereumToUSDRate(314.15)
    appModule.setMarketTokenToEthereumRate(0.5)

    wrapper = mount(EthereumToMarketToken, {
      attachToDocument: true,
      store: appStore,
      localVue,
      propsData: {
        ethEditable: false,
      },
    })

    await flushPromises()

    expect(wrapper.find(ethereumToMarketTokenClass)).toBeDefined()
    const currencies = wrapper.findAll(`${currencyClass}`)
    expect(currencies.length).toBe(2)
    expect(currencies.at(0).find(`${valueClass}`).text()).toEqual('0.500')
    expect(currencies.at(0).find(`${bottomRowClass}`).text()).toEqual('($USD 157.07)')
    expect(currencies.at(1).find(`${valueClass}`).text()).toEqual('1.0')
    const marketTokenBottomRow = currencies.at(1).find(`${bottomRowClass}`).element as HTMLDivElement
    expect(marketTokenBottomRow.className.indexOf('hidden')).toBeGreaterThan(0)
  })
})
