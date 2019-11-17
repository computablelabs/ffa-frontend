import {mount, createLocalVue, Wrapper} from '@vue/test-utils'
import {Store} from 'vuex'

import { getModule } from 'vuex-module-decorators'
import appStore from '../../../../src/store'
import AppModule from '../../../../src/vuexModules/AppModule'
import SupportWithdrawModule from '../../../../src/vuexModules/SupportWithdrawModule'

import MarketTokenContractModule from '../../../../src/functionModules/protocol/MarketTokenContractModule'
import SupportWithdrawProcessModule from '../../../../src/functionModules/components/SupportWithdrawProcessModule'
import EtherTokenContractModule from '../../../../src/functionModules/protocol/EtherTokenContractModule'

import { WithdrawStep } from '../../../../src/models/WithdrawStep'

import WithdrawProcess from '@/components/supportWithdraw/WithdrawProcess.vue'

import flushPromises from 'flush-promises'

describe('WithdrawProcess.vue', () => {

  const withdrawProcessClass = '.withdraw-process'
  const withdrawCollectIncomeClass = '.withdraw-collect-income'
  const withdrawWithdrawalClass = '.withdraw-withdrawal'
  const withdrawUnwrapWETHClass = '.withdraw-unwrap-weth'
  const withdrawProcessCompleteClass = '.withdraw-process-complete'
  const errorMessageClass = '.error-message'
  const drawerMessageContainerClass = '.drawer-message-container'
  const processButtonClass = '.process-button'
  const blockchainExecutingMessageClass = '.blockchain-executing-message'

  const localVue = createLocalVue()

  let wrapper!: Wrapper<WithdrawProcess>

  let appModule!: AppModule
  let supportWithdrawModule!: SupportWithdrawModule

  beforeAll(() => {
    appModule = getModule(AppModule, appStore)
    appModule.initializeWeb3('http://localhost:8545')
    supportWithdrawModule = getModule(SupportWithdrawModule, appStore)

    // SupportWithdrawProcessModule.getSupportPrice = jest.fn(() => {
    //   appModule.setSupportPrice(dummySupportPrice)
    //   return Promise.resolve()
    // })

    // SupportWithdrawProcessModule.getUserListings = jest.fn(() => {
    //   supportWithdrawModule.setListingHashes([])
    //   return Promise.resolve()
    // })

    // MarketTokenContractModule.balanceOf = jest.fn((account: string) => {
    //   return Promise.resolve('1000')
    // })

    // EtherTokenContractModule.balanceOf = jest.fn((account: string) => {
    //   return Promise.resolve('10')
    // })
  })

  afterEach(() => {
    if (wrapper !== undefined) {
      wrapper.destroy()
    }
  })

  it('renders loaded view', async () => {
    supportWithdrawModule.setListingHashes(['0xhash'])
    wrapper = mount(WithdrawProcess, {
      attachToDocument: true,
      store: appStore,
      localVue,
    })

    await flushPromises()

    expect(wrapper.findAll(withdrawProcessClass).length).toBe(1)
    expect(wrapper.findAll(withdrawWithdrawalClass).length).toBe(1)
    expect(wrapper.findAll(withdrawUnwrapWETHClass).length).toBe(1)
  })

  it ('renders collect income when required', async () => {

    wrapper = mount(WithdrawProcess, {
      attachToDocument: true,
      store: appStore,
      localVue,
    })

    await flushPromises()

    expect(wrapper.findAll(withdrawCollectIncomeClass).length).toBe(1)
  })

  it('renders steps correctly', async () => {
    wrapper = mount(WithdrawProcess, {
      attachToDocument: true,
      store: appStore,
      localVue,
    })

    await flushPromises()

    supportWithdrawModule.setWithdrawStep(WithdrawStep.Error)
    expect(wrapper.findAll(errorMessageClass).length).toBe(1)
    supportWithdrawModule.setWithdrawStep(WithdrawStep.CollectIncome)
    expect(wrapper.findAll(errorMessageClass).length).toBe(0)
    expect(wrapper.findAll(`${withdrawCollectIncomeClass} ${processButtonClass}`).length).toBe(1)
    expect(wrapper.findAll(`${withdrawWithdrawalClass} ${drawerMessageContainerClass}`).length).toBe(1)
    expect(wrapper.findAll(`${withdrawUnwrapWETHClass} ${drawerMessageContainerClass}`).length).toBe(1)
    supportWithdrawModule.setWithdrawStep(WithdrawStep.CollectIncomePending)
    expect(wrapper.findAll(`${withdrawCollectIncomeClass} ${blockchainExecutingMessageClass}`).length).toBe(1)
    expect(wrapper.findAll(`${withdrawWithdrawalClass} ${drawerMessageContainerClass}`).length).toBe(1)
    expect(wrapper.findAll(`${withdrawUnwrapWETHClass} ${drawerMessageContainerClass}`).length).toBe(1)
    supportWithdrawModule.setWithdrawStep(WithdrawStep.Withdraw)
    expect(wrapper.findAll(`${withdrawCollectIncomeClass} ${drawerMessageContainerClass}`).length).toBe(1)
    expect(wrapper.findAll(`${withdrawWithdrawalClass} ${processButtonClass}`).length).toBe(1)
    expect(wrapper.findAll(`${withdrawUnwrapWETHClass} ${drawerMessageContainerClass}`).length).toBe(1)
    supportWithdrawModule.setWithdrawStep(WithdrawStep.WithdrawPending)
    expect(wrapper.findAll(`${withdrawCollectIncomeClass} ${drawerMessageContainerClass}`).length).toBe(1)
    expect(wrapper.findAll(`${withdrawWithdrawalClass} ${blockchainExecutingMessageClass}`).length).toBe(1)
    expect(wrapper.findAll(`${withdrawUnwrapWETHClass} ${drawerMessageContainerClass}`).length).toBe(1)
    supportWithdrawModule.setWithdrawStep(WithdrawStep.UnwrapWETH)
    expect(wrapper.findAll(`${withdrawCollectIncomeClass} ${drawerMessageContainerClass}`).length).toBe(1)
    expect(wrapper.findAll(`${withdrawWithdrawalClass} ${drawerMessageContainerClass}`).length).toBe(1)
    expect(wrapper.findAll(`${withdrawUnwrapWETHClass} ${processButtonClass}`).length).toBe(1)
    supportWithdrawModule.setWithdrawStep(WithdrawStep.UnwrapWETHPending)
    expect(wrapper.findAll(`${withdrawCollectIncomeClass} ${drawerMessageContainerClass}`).length).toBe(1)
    expect(wrapper.findAll(`${withdrawWithdrawalClass} ${drawerMessageContainerClass}`).length).toBe(1)
    expect(wrapper.findAll(`${withdrawUnwrapWETHClass} ${blockchainExecutingMessageClass}`).length).toBe(1)
    supportWithdrawModule.setWithdrawStep(WithdrawStep.Complete)
    expect(wrapper.findAll(`${withdrawCollectIncomeClass}`).length).toBe(0)
    expect(wrapper.findAll(`${withdrawWithdrawalClass}`).length).toBe(0)
    expect(wrapper.findAll(`${withdrawUnwrapWETHClass}`).length).toBe(0)
    expect(wrapper.findAll(`${withdrawProcessCompleteClass}`).length).toBe(1)
  })

  it('renders complete view', async () => {
    wrapper = mount(WithdrawProcess, {
      attachToDocument: true,
      store: appStore,
      localVue,
    })

    await flushPromises()

    supportWithdrawModule.setWithdrawStep(WithdrawStep.Complete)

    expect(wrapper.findAll(withdrawProcessClass).length).toBe(1)
    expect(wrapper.findAll(withdrawProcessCompleteClass).length).toBe(1)
  })
})
