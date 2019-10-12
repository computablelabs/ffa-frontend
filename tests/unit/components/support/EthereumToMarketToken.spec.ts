import { mount, createLocalVue, Wrapper } from '@vue/test-utils'

import { getModule } from 'vuex-module-decorators'
import appStore from '../../../../src/store'
import AppModule from '../../../../src/vuexModules/AppModule'

import EthereumToMarketToken from '@/components/support/EthereumToMarketToken.vue'

import flushPromises from 'flush-promises'
import BigNumber from 'bignumber.js'

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
    appModule.setEthereumToUSDRate(314.15)
    appModule.setSupportPrice(new BigNumber(500000000))

    wrapper = mount(EthereumToMarketToken, {
      attachToDocument: true,
      store: appStore,
      localVue,
      propsData: {
        ethEditable: false,
      },
    })

    await flushPromises()
    console.log(wrapper.html())
    expect(wrapper.find(ethereumToMarketTokenClass)).toBeDefined()
    const currencies = wrapper.findAll(`${currencyClass}`)
    expect(currencies.length).toBe(2)
    expect(currencies.at(0).find(`${valueClass}`).text()).toEqual('2.000')
    expect(currencies.at(0).find(`${bottomRowClass}`).text()).toEqual('($USD 628.30)')
    expect(currencies.at(1).find(`${valueClass}`).text()).toEqual('1.0')
    const marketTokenBottomRow = currencies.at(1).find(`${bottomRowClass}`).element as HTMLDivElement
    expect(marketTokenBottomRow.className.indexOf('hidden')).toBeGreaterThan(0)
  })
})
