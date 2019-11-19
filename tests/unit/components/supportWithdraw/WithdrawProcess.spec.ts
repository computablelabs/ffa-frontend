import {shallowMount, createLocalVue, Wrapper} from '@vue/test-utils'

import { getModule } from 'vuex-module-decorators'
import appStore from '../../../../src/store'
import AppModule from '../../../../src/vuexModules/AppModule'
import SupportWithdrawModule from '../../../../src/vuexModules/SupportWithdrawModule'

import { WithdrawStep } from '../../../../src/models/WithdrawStep'

import WithdrawProcess from '@/components/supportWithdraw/WithdrawProcess.vue'

import flushPromises from 'flush-promises'

describe('WithdrawProcess.vue', () => {

  const withdrawProcessClass = '.withdraw-process'
  const errorMessageClass = '.error-message'

  const localVue = createLocalVue()

  let wrapper!: Wrapper<WithdrawProcess>

  let appModule!: AppModule
  let supportWithdrawModule!: SupportWithdrawModule

  beforeAll(() => {
    appModule = getModule(AppModule, appStore)
    appModule.initializeWeb3('http://localhost:8545')
    supportWithdrawModule = getModule(SupportWithdrawModule, appStore)
  })

  afterEach(() => {
    if (wrapper !== undefined) {
      wrapper.destroy()
    }
  })

  it('renders loaded view', async () => {
    wrapper = shallowMount(WithdrawProcess, {
      attachToDocument: true,
      store: appStore,
      localVue,
    })

    await flushPromises()

    expect(wrapper.findAll(withdrawProcessClass).length).toBe(1)
    expect(wrapper.findAll('markettokentoethereum-stub').length).toBe(1)
    expect(wrapper.findAll('withdrawalstep-stub').length).toBe(1)
    expect(wrapper.findAll('unwrapwethstep-stub').length).toBe(1)
  })

  it ('renders collect income when required', async () => {
    supportWithdrawModule.setListingHashes(['0xhash'])
    wrapper = shallowMount(WithdrawProcess, {
      attachToDocument: true,
      store: appStore,
      localVue,
    })

    await flushPromises()

    expect(wrapper.findAll(withdrawProcessClass).length).toBe(1)
    expect(wrapper.findAll('markettokentoethereum-stub').length).toBe(1)
    expect(wrapper.findAll('collectincomestep-stub').length).toBe(1)
    expect(wrapper.findAll('withdrawalstep-stub').length).toBe(1)
    expect(wrapper.findAll('unwrapwethstep-stub').length).toBe(1)
  })

  it('renders steps correctly', async () => {
    wrapper = shallowMount(WithdrawProcess, {
      attachToDocument: true,
      store: appStore,
      localVue,
    })

    await flushPromises()

    supportWithdrawModule.setWithdrawStep(WithdrawStep.Error)
    expect(wrapper.findAll(errorMessageClass).length).toBe(1)
    supportWithdrawModule.setWithdrawStep(WithdrawStep.CollectIncome)
    expect(wrapper.findAll(errorMessageClass).length).toBe(0)
    expect(wrapper.findAll('markettokentoethereum-stub').length).toBe(1)
    expect(wrapper.findAll('withdrawalstep-stub').length).toBe(1)
    expect(wrapper.findAll('unwrapwethstep-stub').length).toBe(1)
    supportWithdrawModule.setWithdrawStep(WithdrawStep.CollectIncomePending)
    expect(wrapper.findAll('markettokentoethereum-stub').length).toBe(1)
    expect(wrapper.findAll('withdrawalstep-stub').length).toBe(1)
    expect(wrapper.findAll('unwrapwethstep-stub').length).toBe(1)
    supportWithdrawModule.setWithdrawStep(WithdrawStep.Withdraw)
    expect(wrapper.findAll('markettokentoethereum-stub').length).toBe(1)
    expect(wrapper.findAll('withdrawalstep-stub').length).toBe(1)
    expect(wrapper.findAll('unwrapwethstep-stub').length).toBe(1)
    supportWithdrawModule.setWithdrawStep(WithdrawStep.WithdrawPending)
    expect(wrapper.findAll('markettokentoethereum-stub').length).toBe(1)
    expect(wrapper.findAll('withdrawalstep-stub').length).toBe(1)
    expect(wrapper.findAll('unwrapwethstep-stub').length).toBe(1)
    supportWithdrawModule.setWithdrawStep(WithdrawStep.UnwrapWETH)
    expect(wrapper.findAll('markettokentoethereum-stub').length).toBe(1)
    expect(wrapper.findAll('withdrawalstep-stub').length).toBe(1)
    expect(wrapper.findAll('unwrapwethstep-stub').length).toBe(1)
    supportWithdrawModule.setWithdrawStep(WithdrawStep.UnwrapWETHPending)
    expect(wrapper.findAll('markettokentoethereum-stub').length).toBe(1)
    expect(wrapper.findAll('withdrawalstep-stub').length).toBe(1)
    expect(wrapper.findAll('unwrapwethstep-stub').length).toBe(1)
    supportWithdrawModule.setWithdrawStep(WithdrawStep.Complete)
    expect(wrapper.findAll('markettokentoethereum-stub').length).toBe(0)
    expect(wrapper.findAll('withdrawalstep-stub').length).toBe(0)
    expect(wrapper.findAll('unwrapwethstep-stub').length).toBe(0)
    expect(wrapper.findAll('withdrawprocesscomplete-stub').length).toBe(1)
  })
})
