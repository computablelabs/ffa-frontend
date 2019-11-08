import { mount, createLocalVue, Wrapper } from '@vue/test-utils'

import { getModule } from 'vuex-module-decorators'
import appStore from '../../../../src/store'
import AppModule from '../../../../src/vuexModules/AppModule'
import SupportWithdrawModule from '../../../../src/vuexModules/SupportWithdrawModule'

import SupportWithdrawProcessModule from '../../../../src/functionModules/components/SupportWithdrawProcessModule'
import TaskPollerModule from '../../../../src/functionModules/task/TaskPollerModule'

import { SupportStep } from '../../../../src/models/SupportStep'
import FfaListing, { FfaListingStatus } from '../../../../src/models/FfaListing'

import SupportProcess from '@/components/supportWithdraw/SupportProcess.vue'

import flushPromises from 'flush-promises'


describe('SupportProcess.vue', () => {

  const supportProcessClass = '.support-process'
  const supportErc20TokenClass = '.support-erc20-token'
  const supportApproveSpendingClass = '.support-approve-spending'
  const supportCooperativeClass = '.support-cooperative'
  const supportProcessCompleteClass = '.support-process-complete'
  const errorMessageClass = '.error-message'
  const isLoadingClass = '.is-loading'
  const ethereumToMarketTokenClass = '.ethereum-to-market-token'
  const blockchainMessage = '.blockchain-executing-message'
  const drawerMessage = '.drawer-message'

  const dummySupportPrice = 1000000000

  const localVue = createLocalVue()

  const emptyListing = new FfaListing(
    '',
    '',
    '',
    '',
    '',
    '',
    0,
    '',
    [],
    FfaListingStatus.new,
    0,
    0,
  )

  let wrapper!: Wrapper<SupportProcess>

  let appModule!: AppModule
  let supportWithdrawModule!: SupportWithdrawModule

  beforeAll(() => {
    appModule = getModule(AppModule, appStore)
    appModule.setSupportPrice(dummySupportPrice)
    setAppParams()
    appModule.initializeWeb3('http://localhost:8545')
    supportWithdrawModule = getModule(SupportWithdrawModule, appStore)

    SupportWithdrawProcessModule.getSupportPrice = jest.fn(() => {
      return Promise.resolve(appModule.setSupportPrice(dummySupportPrice))
    })

    TaskPollerModule.createTaskPollerForEthereumTransaction = jest.fn(() => {
      return Promise.resolve()
    })
  })

  afterEach(() => {
    if (wrapper !== undefined) {
      wrapper.destroy()
    }
  })

  it('renders steps correctly', async () => {

    supportWithdrawModule.setSupportValue(100000000)
    supportWithdrawModule.setSupportStep(SupportStep.InsufficientETH)
    wrapper = mount(SupportProcess, {
      attachToDocument: true,
      store: appStore,
      localVue,
    })
    expect(wrapper.findAll(errorMessageClass).length).toBe(1)
    wrapper.destroy()

    supportWithdrawModule.setSupportStep(SupportStep.Error)
    wrapper = mount(SupportProcess, {
      attachToDocument: true,
      store: appStore,
      localVue,
    })
    expect(wrapper.findAll(errorMessageClass).length).toBe(1)
    wrapper.destroy()

    supportWithdrawModule.setSupportStep(SupportStep.WrapETH)
    wrapper = mount(SupportProcess, {
      attachToDocument: true,
      store: appStore,
      localVue,
    })
    expect(wrapper.findAll(errorMessageClass).length).toBe(0)
    wrapper.destroy()

    supportWithdrawModule.setSupportStep(SupportStep.WrapETHPending)
    supportWithdrawModule.setErc20TokenTransactionId('0x123')
    wrapper = mount(SupportProcess, {
      attachToDocument: true,
      store: appStore,
      localVue,
    })
    expect(wrapper.findAll(`${supportErc20TokenClass} ${blockchainMessage}`).length).toBe(1)
    expect(wrapper.findAll(`${supportErc20TokenClass} ${drawerMessage}`).length).toBe(0)
    wrapper.destroy()

    supportWithdrawModule.setSupportStep(SupportStep.ApproveSpending)
    wrapper = mount(SupportProcess, {
      attachToDocument: true,
      store: appStore,
      localVue,
    })
    expect(wrapper.findAll(`${supportErc20TokenClass} ${drawerMessage}`).length).toBe(1)
    expect(wrapper.findAll(`${supportApproveSpendingClass} ${blockchainMessage}`).length).toBe(0)
    wrapper.destroy()

    supportWithdrawModule.setSupportStep(SupportStep.ApprovalPending)
    supportWithdrawModule.setApprovePaymentTransactionId('0x234')
    wrapper = mount(SupportProcess, {
      attachToDocument: true,
      store: appStore,
      localVue,
    })
    expect(wrapper.findAll(`${supportApproveSpendingClass} ${blockchainMessage}`).length).toBe(1)
    expect(wrapper.findAll(`${supportApproveSpendingClass} ${drawerMessage}`).length).toBe(0)
    wrapper.destroy()

    supportWithdrawModule.setSupportStep(SupportStep.Support)
    wrapper = mount(SupportProcess, {
      attachToDocument: true,
      store: appStore,
      localVue,
    })
    expect(wrapper.findAll(`${supportApproveSpendingClass} ${drawerMessage}`).length).toBe(1)
    expect(wrapper.findAll(`${supportCooperativeClass} ${blockchainMessage}`).length).toBe(0)
    wrapper.destroy()

    supportWithdrawModule.setSupportStep(SupportStep.SupportPending)
    supportWithdrawModule.setSupportCollectiveTransactionId('0x345')
    wrapper = mount(SupportProcess, {
      attachToDocument: true,
      store: appStore,
      localVue,
    })
    expect(wrapper.findAll(`${supportCooperativeClass} ${blockchainMessage}`).length).toBe(1)
  })

  it('renders complete view', async () => {
    supportWithdrawModule.setSupportStep(SupportStep.Complete)

    wrapper = mount(SupportProcess, {
      attachToDocument: true,
      store: appStore,
      localVue,
    })

    expect(wrapper.findAll(supportProcessClass).length).toBe(1)
    expect(wrapper.findAll(supportProcessCompleteClass).length).toBe(1)
  })

  function setAppParams() {
    appModule.setMakerPayment(1)
    appModule.setCostPerByte(1)
    appModule.setStake(1)
    appModule.setPriceFloor(1)
    appModule.setPlurality(1)
    appModule.setVoteBy(1)
    appModule.setEtherTokenBalance(1)
    appModule.setMarketTokenBalance(1)
    appModule.setEtherTokenDatatrustAllowance(1)
    appModule.setMarketTokenVotingContractAllowance(1)
    appModule.setSupportPrice(dummySupportPrice)
  }
})
