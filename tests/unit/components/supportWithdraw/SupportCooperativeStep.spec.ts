import { mount, createLocalVue, Wrapper } from '@vue/test-utils'

import { getModule } from 'vuex-module-decorators'
import appStore from '../../../../src/store'
import AppModule from '../../../../src/vuexModules/AppModule'
import Web3Module from '../../../../src/vuexModules/Web3Module'
import SupportWithdrawModule from '../../../../src/vuexModules/SupportWithdrawModule'

import SupportWithdrawProcessModule from '../../../../src/functionModules/components/SupportWithdrawProcessModule'
import ReserveContractModule from '../../../../src/functionModules/protocol/ReserveContractModule'

import { SupportStep } from '../../../../src/models/SupportStep'

import SupportCooperativeStep from '@/components/supportWithdraw/SupportCooperativeStep.vue'

import flushPromises from 'flush-promises'

describe('SupportCooperativeStep.vue', () => {

  const processButtonClass = '.process-button'
  const buttonClass = '.button'

  const localVue = createLocalVue()

  let wrapper!: Wrapper<SupportCooperativeStep>

  let supportWithdrawModule!: SupportWithdrawModule

//  let web3Module!: Web3Module

  beforeAll(() => {
    // appModule = getModule(AppModule, appStore)
    // web3Module = getModule(Web3Module, appStore)
    // web3Module.initialize('http://localhost:8545')
    supportWithdrawModule = getModule(SupportWithdrawModule, appStore)

    ReserveContractModule.support = jest.fn()
  })

  it('approves spending', () => {

    supportWithdrawModule.setSupportStep(SupportStep.ApproveSpending)

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
