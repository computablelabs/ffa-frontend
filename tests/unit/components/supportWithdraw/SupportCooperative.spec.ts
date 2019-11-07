import { mount, createLocalVue, Wrapper } from '@vue/test-utils'

import appStore from '../../../../src/store'

import SupportCooperative from '@/components/supportWithdraw/SupportCooperative.vue'

describe('SupportCooperative.vue', () => {

  const ethereumToMarketTokenClass = '.ethereum-to-market-token'
  const buttonClass = '.button'
  const cardClass = 'support-withdraw-card'

  const localVue = createLocalVue()

  let wrapper!: Wrapper<SupportCooperative>

  afterEach(() => {
    if (wrapper !== undefined) {
      wrapper.destroy()
    }
  })

  it('renders title, ethereumToMarketToken, and button', () => {
    wrapper = mount(SupportCooperative, {
      attachToDocument: true,
      store: appStore,
      localVue,
    })

    expect(wrapper.find(`.${cardClass} > h2`)).toBeDefined()
    expect(wrapper.find(`.${cardClass} > h2`).text().length).toBeGreaterThan(0)
    expect(wrapper.find(ethereumToMarketTokenClass)).toBeDefined()
    expect(wrapper.find(buttonClass)).toBeDefined()
  })
})
