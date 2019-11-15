import { mount, createLocalVue, Wrapper } from '@vue/test-utils'

import { getModule } from 'vuex-module-decorators'
import appStore from '../../../../src/store'
import AppModule from '../../../../src/vuexModules/AppModule'

import EthereumToMarketToken from '@/components/supportWithdraw/EthereumToMarketToken.vue'

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
    appModule.initializeWeb3('http://localhost:8545')
  })

  afterEach(() => {
    if (wrapper !== undefined) {
      wrapper.destroy()
    }
  })

  it('renders tokens', async () => {

    appModule.setMarketTokenBalance(8000567462000000000)
    appModule.setEthereumBalance(99)
    appModule.setEtherTokenBalance(1)
    appModule.setEthereumToUSDRate(177.205022488)
    appModule.setSupportPrice(4847543)

    wrapper = mount(EthereumToMarketToken, {
      attachToDocument: true,
      store: appStore,
      localVue,
      propsData: {
        ethEditable: false,
        marketTokens: 1,
      },
    })

    await flushPromises()

    expect(wrapper.find(ethereumToMarketTokenClass)).toBeDefined()
    const currencies = wrapper.findAll(`${currencyClass}`)
    expect(currencies.length).toBe(2)
    expect(currencies.at(0).find(`${valueClass}`).text()).toEqual('0.0048')
    expect(currencies.at(0).find(`${bottomRowClass}`).text()).toEqual('($USD 0.85)')
    expect(currencies.at(1).find(`${valueClass}`).text()).toEqual('0.99')
    const marketTokenBottomRow = currencies.at(1).find(`${bottomRowClass}`).element as HTMLDivElement
    expect(marketTokenBottomRow.className.indexOf('hidden')).toBeGreaterThan(0)
  })
})
