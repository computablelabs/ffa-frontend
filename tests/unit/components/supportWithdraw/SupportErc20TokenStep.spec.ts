import { mount, createLocalVue, Wrapper } from '@vue/test-utils'

import { getModule } from 'vuex-module-decorators'
import appStore from '../../../../src/store'
import AppModule from '../../../../src/vuexModules/AppModule'
import Web3Module from '../../../../src/vuexModules/Web3Module'
import SupportWithdrawModule from '../../../../src/vuexModules/SupportWithdrawModule'

import SupportWithdrawProcessModule from '../../../../src/functionModules/components/SupportWithdrawProcessModule'
import EtherTokenContractModule from '../../../../src/functionModules/protocol/EtherTokenContractModule'

import { SupportStep } from '../../../../src/models/SupportStep'

import SupportErc20TokenStep from '@/components/supportWithdraw/SupportErc20TokenStep.vue'

import flushPromises from 'flush-promises'

describe('SupportErc20TokenStep.vue', () => {

  const processButtonClass = '.process-button'
  const buttonClass = '.button'

  const localVue = createLocalVue()

  let wrapper!: Wrapper<SupportErc20TokenStep>

  let supportWithdrawModule!: SupportWithdrawModule

//  let web3Module!: Web3Module

  beforeAll(() => {
    // appModule = getModule(AppModule, appStore)
    // web3Module = getModule(Web3Module, appStore)
    // web3Module.initialize('http://localhost:8545')
    supportWithdrawModule = getModule(SupportWithdrawModule, appStore)

    EtherTokenContractModule.deposit = jest.fn()
  })

  it('wraps ETH', () => {

    supportWithdrawModule.setSupportStep(SupportStep.WrapETH)

    wrapper = mount(SupportErc20TokenStep, {
      attachToDocument: true,
      store: appStore,
      localVue,
    })

    expect(wrapper.findAll(buttonClass).length).toBe(1)
    wrapper.find(`${processButtonClass} ${buttonClass}`).trigger('click')
    expect(EtherTokenContractModule.deposit).toHaveBeenCalled()

  })
})
