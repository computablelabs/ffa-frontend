import { mount, createLocalVue, Wrapper } from '@vue/test-utils'

import { getModule } from 'vuex-module-decorators'
import appStore from '../../../../src/store'
import SupportWithdrawModule from '../../../../src/vuexModules/SupportWithdrawModule'

import EtherTokenContractModule from '../../../../src/functionModules/protocol/EtherTokenContractModule'

import { SupportStep } from '../../../../src/models/SupportStep'

import SupportApproveSpendingStep from '@/components/supportWithdraw/SupportApproveSpendingStep.vue'

describe('SupportApproveSpendingStep.vue', () => {

  const processButtonClass = '.process-button'
  const buttonClass = '.button'

  const localVue = createLocalVue()

  let wrapper!: Wrapper<SupportApproveSpendingStep>

  let supportWithdrawModule!: SupportWithdrawModule

  beforeAll(() => {
    supportWithdrawModule = getModule(SupportWithdrawModule, appStore)

    EtherTokenContractModule.approve = jest.fn()
  })

  it('approves spending', () => {

    supportWithdrawModule.setSupportStep(SupportStep.ApproveSpending)

    wrapper = mount(SupportApproveSpendingStep, {
      attachToDocument: true,
      store: appStore,
      localVue,
    })

    expect(wrapper.findAll(buttonClass).length).toBe(1)
    wrapper.find(`${processButtonClass} ${buttonClass}`).trigger('click')
    expect(EtherTokenContractModule.approve).toHaveBeenCalled()
  })
})
