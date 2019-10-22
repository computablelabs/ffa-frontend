import { mount, createLocalVue, Wrapper } from '@vue/test-utils'

import { getModule } from 'vuex-module-decorators'
import appStore from '../../../../src/store'
import AppModule from '../../../../src/vuexModules/AppModule'
import Web3Module from '../../../../src/vuexModules/Web3Module'

import MarketTokenToEthereum from '@/components/supportWithdraw/MarketTokenToEthereum.vue'

import flushPromises from 'flush-promises'

describe('MarketTokenToEthereum.vue', () => {

  const ethereumToMarketTokenClass = '.ethereum-to-market-token'
  const currencyClass = '.currency'
  const valueClass = '.value'
  const bottomRowClass = '.bottom-row'
  const hiddenClass = '.hidden'

  const localVue = createLocalVue()

  let appModule!: AppModule
  let web3Module!: Web3Module
  let wrapper!: Wrapper<MarketTokenToEthereum>

  beforeAll(() => {
    appModule = getModule(AppModule, appStore)
    web3Module = getModule(Web3Module, appStore)
    web3Module.initialize('http://localhost:8545')
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
    appModule.setSupportPrice(4597851)

    wrapper = mount(MarketTokenToEthereum, {
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
    expect(currencies.at(0).find(`${valueClass}`).text()).toEqual('1.0')
    const marketTokenBottomRow = currencies.at(0).find(`${bottomRowClass}`).element as HTMLDivElement
    expect(marketTokenBottomRow.className.indexOf('hidden')).toBeGreaterThan(0)
    expect(currencies.at(1).find(`${valueClass}`).text()).toEqual('0.004598')
    expect(currencies.at(1).find(`${bottomRowClass}`).text()).toEqual('($USD 0.81)')
  })
})
