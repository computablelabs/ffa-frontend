import { mount, createLocalVue, Wrapper } from '@vue/test-utils'

import { getModule } from 'vuex-module-decorators'
import appStore from '../../../../src/store'
import AppModule from '../../../../src/vuexModules/AppModule'

import YourTokens from '@/components/supportWithdraw/YourTokens.vue'

import flushPromises from 'flush-promises'

describe('YourTokens.vue', () => {

  const currencyClass = '.currency'
  const marketTokenRowClass = '.market-token-row'
  const ethereumRowClass = '.ethereum-row'
  const ethTokenRowClass = '.eth-token-row'
  const valueClass = '.value'
  const bottomRowClass = '.bottom-row'

  const localVue = createLocalVue()

  let appModule!: AppModule
  let wrapper!: Wrapper<YourTokens>

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
    appModule.setSupportPrice(2000000000)

    wrapper = mount(YourTokens, {
      attachToDocument: true,
      store: appStore,
      localVue,
    })

    await flushPromises()

    expect(wrapper.findAll(currencyClass).length).toBe(3)
    expect(wrapper.find(marketTokenRowClass)).toBeDefined()
    expect(wrapper.find(`${marketTokenRowClass} ${valueClass}`).text()).toEqual('42')
    expect(wrapper.find(`${marketTokenRowClass} ${bottomRowClass}`).text()).toEqual('($USD 6597.15)')
    expect(wrapper.find(ethereumRowClass)).toBeDefined()
    expect(wrapper.find(`${ethereumRowClass} ${valueClass}`).text()).toEqual('99.000')
    expect(wrapper.find(`${ethereumRowClass} ${bottomRowClass}`).text()).toEqual('($USD 31100.85)')
    expect(wrapper.find(ethTokenRowClass)).toBeDefined()
    expect(wrapper.find(`${ethTokenRowClass} ${valueClass}`).text()).toEqual('1.000')
    expect(wrapper.find(`${ethTokenRowClass} ${bottomRowClass}`).text()).toEqual('($USD 314.15)')
  })
})
