import { mount, createLocalVue, Wrapper } from '@vue/test-utils'

import { getModule } from 'vuex-module-decorators'
import appStore from '../../../../src/store'
import SupportWithdrawModule from '../../../../src/vuexModules/SupportWithdrawModule'
import AppModule from '../../../../src/vuexModules/AppModule'

import EtherTokenContractModule from '../../../../src/functionModules/protocol/EtherTokenContractModule'

import { WithdrawStep } from '../../../../src/models/WithdrawStep'

import UnwrapWETHStep from '@/components/supportWithdraw/UnwrapWETHStep.vue'

describe('UnwrapWETHStep.vue', () => {

  const processButtonClass = '.process-button'
  const buttonClass = '.button'

  const localVue = createLocalVue()

  let wrapper!: Wrapper<UnwrapWETHStep>

  let supportWithdrawModule!: SupportWithdrawModule
  let appModule!: AppModule

  beforeAll(() => {
    supportWithdrawModule = getModule(SupportWithdrawModule, appStore)
    appModule = getModule(AppModule, appStore)
    appModule.setEtherTokenBalance(100)
    EtherTokenContractModule.withdraw = jest.fn()
  })

  it('wraps ETH', () => {

    supportWithdrawModule.setWithdrawStep(WithdrawStep.UnwrapWETH)

    wrapper = mount(UnwrapWETHStep, {
      attachToDocument: true,
      store: appStore,
      localVue,
    })

    expect(wrapper.findAll(buttonClass).length).toBe(1)
    wrapper.find(`${processButtonClass} ${buttonClass}`).trigger('click')
    expect(supportWithdrawModule.withdrawStep).toBe(WithdrawStep.UnwrapWETHPending)
    expect(EtherTokenContractModule.withdraw).toHaveBeenCalled()


  })
})
