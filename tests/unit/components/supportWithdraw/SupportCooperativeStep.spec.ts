import { mount, createLocalVue, Wrapper } from '@vue/test-utils'

import { getModule } from 'vuex-module-decorators'
import appStore from '../../../../src/store'
import SupportWithdrawModule from '../../../../src/vuexModules/SupportWithdrawModule'

import ReserveContractModule from '../../../../src/functionModules/protocol/ReserveContractModule'

import { SupportStep } from '../../../../src/models/SupportStep'

import SupportCooperativeStep from '@/components/supportWithdraw/SupportCooperativeStep.vue'

describe('SupportCooperativeStep.vue', () => {

  const processButtonClass = '.process-button'
  const buttonClass = '.button'

  const localVue = createLocalVue()

  let wrapper!: Wrapper<SupportCooperativeStep>

  let supportWithdrawModule!: SupportWithdrawModule

  beforeAll(() => {
    supportWithdrawModule = getModule(SupportWithdrawModule, appStore)
    ReserveContractModule.support = jest.fn()
  })

  it('approves spending', () => {

    supportWithdrawModule.setSupportStep(SupportStep.Support)

    wrapper = mount(SupportCooperativeStep, {
      attachToDocument: true,
      store: appStore,
      localVue,
    })

    expect(wrapper.findAll(buttonClass).length).toBe(1)
    wrapper.find(`${processButtonClass} ${buttonClass}`).trigger('click')
    expect(ReserveContractModule.support).toHaveBeenCalled()
  })
})
