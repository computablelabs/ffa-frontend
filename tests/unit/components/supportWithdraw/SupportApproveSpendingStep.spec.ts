import { mount, createLocalVue, Wrapper } from '@vue/test-utils'

import { getModule } from 'vuex-module-decorators'
import appStore from '../../../../src/store'
import AppModule from '../../../../src/vuexModules/AppModule'
import Web3Module from '../../../../src/vuexModules/Web3Module'
import SupportWithdrawModule from '../../../../src/vuexModules/SupportWithdrawModule'

import SupportWithdrawProcessModule from '../../../../src/functionModules/components/SupportWithdrawProcessModule'
import EtherTokenContractModule from '../../../../src/functionModules/protocol/EtherTokenContractModule'

import { SupportStep } from '../../../../src/models/SupportStep'

import SupportApproveSpendingStep from '@/components/supportWithdraw/SupportApproveSpendingStep.vue'

import flushPromises from 'flush-promises'

describe('SupportApproveSpendingStep.vue', () => {

  const processButtonClass = '.process-button'
  const buttonClass = '.button'

  const localVue = createLocalVue()

  let wrapper!: Wrapper<SupportApproveSpendingStep>

  let supportWithdrawModule!: SupportWithdrawModule

//  let web3Module!: Web3Module

  beforeAll(() => {
    // appModule = getModule(AppModule, appStore)
    // web3Module = getModule(Web3Module, appStore)
    // web3Module.initialize('http://localhost:8545')
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
