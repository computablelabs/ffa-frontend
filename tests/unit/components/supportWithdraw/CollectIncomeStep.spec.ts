import { mount, createLocalVue, Wrapper } from '@vue/test-utils'

import { getModule } from 'vuex-module-decorators'
import appStore from '../../../../src/store'
import SupportWithdrawModule from '../../../../src/vuexModules/SupportWithdrawModule'

import ListingContractModule from '../../../../src/functionModules/protocol/ListingContractModule'

import { WithdrawStep } from '../../../../src/models/WithdrawStep'

import CollectIncomeStep from '@/components/supportWithdraw/CollectIncomeStep.vue'

describe('CollectIncomeStep.vue', () => {

  const processButtonClass = '.process-button'
  const buttonClass = '.button'

  const localVue = createLocalVue()

  let wrapper!: Wrapper<CollectIncomeStep>

  let supportWithdrawModule!: SupportWithdrawModule

  beforeAll(() => {
    supportWithdrawModule = getModule(SupportWithdrawModule, appStore)
    supportWithdrawModule.setListingHashes(['0xhash1', '0xhash2'])
    ListingContractModule.claimBytesAccessed = jest.fn()
  })

  it('wraps ETH', () => {

    supportWithdrawModule.setWithdrawStep(WithdrawStep.CollectIncome)

    wrapper = mount(CollectIncomeStep, {
      attachToDocument: true,
      store: appStore,
      localVue,
    })

    expect(wrapper.findAll(buttonClass).length).toBe(1)
    wrapper.find(`${processButtonClass} ${buttonClass}`).trigger('click')
    expect(supportWithdrawModule.withdrawStep).toBe(WithdrawStep.CollectIncomePending)
    expect(ListingContractModule.claimBytesAccessed).toHaveBeenCalledTimes(2)


  })
})
