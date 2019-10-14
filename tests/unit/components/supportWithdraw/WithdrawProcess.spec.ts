import {mount, createLocalVue, Wrapper} from '@vue/test-utils'
import {Store} from 'vuex'

import { getModule } from 'vuex-module-decorators'
import appStore from '../../../../src/store'
import AppModule from '../../../../src/vuexModules/AppModule'
import Web3Module from '../../../../src/vuexModules/Web3Module'
import SupportWithdrawModule from '../../../../src/vuexModules/SupportWithdrawModule'

import MarketTokenContractModule from '../../../../src/functionModules/protocol/MarketTokenContractModule'
import SupportWithdrawProcessModule from '../../../../src/functionModules/components/SupportWithdrawProcessModule'
import EtherTokenContractModule from '../../../../src/functionModules/protocol/EtherTokenContractModule'

import { WithdrawStep } from '../../../../src/models/WithdrawStep'

import WithdrawProcess from '@/components/supportWithdraw/WithdrawProcess.vue'

import flushPromises from 'flush-promises'

describe('WithdrawProcess.vue', () => {

  const withdrawProcessClass = '.withdraw-process'
  const withdrawProcessInitializeClass = '.withdraw-process-initialize'
  const withdrawProcessLoadedClass = '.withdraw-process-loaded'
  const withdrawCollectIncomeClass = '.withdraw-collect-income'
  const withdrawWithdrawalClass = '.withdraw-withdrawal'
  const withdrawUnwrapWETHClass = '.withdraw-unwrap-weth'
  const withdrawProcessCompleteClass = '.withdraw-process-complete'
  const errorMessageClass = '.error-message'
  const isLoadingClass = '.is-loading'
  const marketTokenToEthereumClass = '.market-token-to-ethereum'

  const initialSupportPrice = -1
  const dummySupportPrice = 1000000000

  const localVue = createLocalVue()

  let wrapper!: Wrapper<WithdrawProcess>

  let appModule!: AppModule
  let web3Module!: Web3Module
  let supportWithdrawModule!: SupportWithdrawModule

  beforeAll(() => {
    appModule = getModule(AppModule, appStore)
    web3Module = getModule(Web3Module, appStore)
    web3Module.initialize('http://localhost:8545')
    supportWithdrawModule = getModule(SupportWithdrawModule, appStore)

    SupportWithdrawProcessModule.getSupportPrice = jest.fn(() => {
      appModule.setSupportPrice(dummySupportPrice)
      return Promise.resolve()
    })

    SupportWithdrawProcessModule.getUserListings = jest.fn(() => {
      supportWithdrawModule.setListingHashes([])
      return Promise.resolve()
    })

    MarketTokenContractModule.getBalance = jest.fn((account: string) => {
      return Promise.resolve('1000')
    })

    EtherTokenContractModule.balanceOf = jest.fn((account: string) => {
      return Promise.resolve('10')
    })
  })

  afterEach(() => {
    if (wrapper !== undefined) {
      wrapper.destroy()
    }
  })

  it('renders initialize view', () => {

    expect(appModule.supportPrice).toEqual(initialSupportPrice)

    wrapper = mount(WithdrawProcess, {
      attachToDocument: true,
      store: appStore,
      localVue,
    })

    expect(wrapper.findAll(withdrawProcessClass).length).toBe(1)
    expect(wrapper.findAll(withdrawProcessInitializeClass).length).toBe(1)
    expect(wrapper.findAll(withdrawProcessLoadedClass).length).toBe(0)
  })


  it('renders loaded view', async () => {

    wrapper = mount(WithdrawProcess, {
      attachToDocument: true,
      store: appStore,
      localVue,
    })

    await flushPromises()

    expect(appModule.supportPrice).toEqual(dummySupportPrice)
    expect(wrapper.findAll(withdrawProcessClass).length).toBe(1)
    expect(wrapper.findAll(withdrawProcessInitializeClass).length).toBe(0)
    expect(wrapper.findAll(withdrawProcessLoadedClass).length).toBe(1)
    expect(wrapper.findAll(withdrawWithdrawalClass).length).toBe(1)
    expect(wrapper.findAll(withdrawUnwrapWETHClass).length).toBe(1)
  })

  it ('renders collect income when required', async () => {

    SupportWithdrawProcessModule.getUserListings = jest.fn(() => {
      supportWithdrawModule.setListingHashes(['0xhash'])
      return Promise.resolve()
    })

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
    supportWithdrawModule.setWithdrawStep(WithdrawStep.CollectIncomePending)
    expect(wrapper.findAll(`${withdrawCollectIncomeClass} ${isLoadingClass}`).length).toBe(1)
    supportWithdrawModule.setWithdrawStep(WithdrawStep.Withdraw)
    expect(wrapper.findAll(`${withdrawCollectIncomeClass} ${isLoadingClass}`).length).toBe(0)
    supportWithdrawModule.setWithdrawStep(WithdrawStep.WithdrawPending)
    expect(wrapper.findAll(`${withdrawWithdrawalClass} ${isLoadingClass}`).length).toBe(1)
    supportWithdrawModule.setWithdrawStep(WithdrawStep.UnwrapWETH)
    expect(wrapper.findAll(`${withdrawWithdrawalClass} ${isLoadingClass}`).length).toBe(0)
    supportWithdrawModule.setWithdrawStep(WithdrawStep.UnwrapWETHPending)
    expect(wrapper.findAll(`${withdrawUnwrapWETHClass} ${isLoadingClass}`).length).toBe(1)
    supportWithdrawModule.setWithdrawStep(WithdrawStep.Complete)
    expect(wrapper.findAll(`${withdrawUnwrapWETHClass} ${isLoadingClass}`).length).toBe(0)
  })

  it('renders complete view', async () => {
    wrapper = mount(WithdrawProcess, {
      attachToDocument: true,
      store: appStore,
      localVue,
    })

    await flushPromises()

    supportWithdrawModule.setWithdrawStep(WithdrawStep.Complete)

    expect(appModule.supportPrice).toEqual(dummySupportPrice)
    expect(wrapper.findAll(withdrawProcessClass).length).toBe(1)
    expect(wrapper.findAll(withdrawProcessInitializeClass).length).toBe(0)
    expect(wrapper.findAll(withdrawProcessCompleteClass).length).toBe(1)
    expect(wrapper.findAll(marketTokenToEthereumClass).length).toBe(1)
  })
})
