import { mount, createLocalVue, Wrapper } from '@vue/test-utils'

import appStore from '../../../../src/store'

import WithdrawProcessComplete from '@/components/supportWithdraw/WithdrawProcessComplete.vue'

describe('WithdrawProcessComplete.vue', () => {

  const withdrawProcessCompleteClass = '.withdraw-process-complete'
  const marketTokenToEthereumClass = '.market-token-to-ethereum'

  const localVue = createLocalVue()

  let wrapper!: Wrapper<WithdrawProcessComplete>

  afterEach(() => {
    if (wrapper !== undefined) {
      wrapper.destroy()
    }
  })

  it('renders title, marketTokenToEthereum, and button', () => {
    wrapper = mount(WithdrawProcessComplete, {
      attachToDocument: true,
      store: appStore,
      localVue,
      propsData: {
        supportValue: 1,
      },
    })

    expect(wrapper.findAll(withdrawProcessCompleteClass).length).toBe(1)
    expect(wrapper.findAll(marketTokenToEthereumClass).length).toBe(1)
  })
})
