import { mount, createLocalVue, Wrapper } from '@vue/test-utils'

import { getModule } from 'vuex-module-decorators'
import appStore from '../../../../src/store'
import SupportWithdrawModule from '../../../../src/vuexModules/SupportWithdrawModule'
import AppModule from '../../../../src/vuexModules/AppModule'

import ReserveContractModule from '../../../../src/functionModules/protocol/ReserveContractModule'

import { WithdrawStep } from '../../../../src/models/WithdrawStep'

import WithdrawalStep from '@/components/supportWithdraw/WithdrawalStep.vue'

describe('WithdrawalStep.vue', () => {

  const processButtonClass = '.process-button'
  const buttonClass = '.button'
  const marketTokenBalance = 42
  const localVue = createLocalVue()

  let wrapper!: Wrapper<WithdrawalStep>

  let supportWithdrawModule!: SupportWithdrawModule
  let appModule!: AppModule

  beforeAll(() => {
    supportWithdrawModule = getModule(SupportWithdrawModule, appStore)
    appModule = getModule(AppModule, appStore)
    appModule.setMarketTokenBalance(marketTokenBalance)
    ReserveContractModule.withdraw = jest.fn()
  })

  it('wraps ETH', () => {

    supportWithdrawModule.setWithdrawStep(WithdrawStep.Withdraw)

    wrapper = mount(WithdrawalStep, {
      attachToDocument: true,
      store: appStore,
      localVue,
    })

    expect(wrapper.findAll(buttonClass).length).toBe(1)
    wrapper.find(`${processButtonClass} ${buttonClass}`).trigger('click')
    expect(supportWithdrawModule.withdrawStep).toBe(WithdrawStep.WithdrawPending)
    expect(supportWithdrawModule.withdrawValue).toBe(marketTokenBalance)
    expect(ReserveContractModule.withdraw).toHaveBeenCalled()


  })
})
