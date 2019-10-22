import { mount, createLocalVue, Wrapper } from '@vue/test-utils'

import { getModule } from 'vuex-module-decorators'
import appStore from '../../../../src/store'
import AppModule from '../../../../src/vuexModules/AppModule'
import SupportWithdrawModule from '../../../../src/vuexModules/SupportWithdrawModule'
import PurchaseModule from '../../../../src/vuexModules/PurchaseModule'

import SupportWithdrawProcessModule from '../../../../src/functionModules/components/SupportWithdrawProcessModule'

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
  let purchaseModule!: PurchaseModule
  let supportWithdrawModule!: SupportWithdrawModule

  beforeAll(() => {
    appModule = getModule(AppModule, appStore)
    appModule.setSupportPrice(dummySupportPrice)
    purchaseModule = getModule(PurchaseModule, appStore)
    appModule.initializeWeb3('http://localhost:8545')
    supportWithdrawModule = getModule(SupportWithdrawModule, appStore)

    SupportWithdrawProcessModule.getSupportPrice = jest.fn(() => {
      return Promise.resolve(appModule.setSupportPrice(dummySupportPrice))
    })
  })

  afterEach(() => {
    if (wrapper !== undefined) {
      wrapper.destroy()
    }
  })

  it('renders loaded view', async () => {
    wrapper = mount(SupportProcess, {
      attachToDocument: true,
      store: appStore,
      localVue,
    })

    await flushPromises()

    expect(appModule.supportPrice).toEqual(dummySupportPrice)
    expect(wrapper.findAll(supportProcessClass).length).toBe(1)
    expect(wrapper.findAll(supportErc20TokenClass).length).toBe(1)
    expect(wrapper.findAll(supportApproveSpendingClass).length).toBe(1)
    expect(wrapper.findAll(supportCooperativeClass).length).toBe(1)
  })

  it('renders steps correctly', async () => {
    wrapper = mount(SupportProcess, {
      attachToDocument: true,
      store: appStore,
      localVue,
    })

    await flushPromises()

    supportWithdrawModule.setSupportStep(SupportStep.InsufficientETH)
    expect(wrapper.findAll(errorMessageClass).length).toBe(1)
    supportWithdrawModule.setSupportStep(SupportStep.Error)
    expect(wrapper.findAll(errorMessageClass).length).toBe(1)
    supportWithdrawModule.setSupportStep(SupportStep.WrapETH)
    expect(wrapper.findAll(errorMessageClass).length).toBe(0)
    supportWithdrawModule.setSupportStep(SupportStep.WrapETHPending)
    expect(wrapper.findAll(`${supportErc20TokenClass} ${isLoadingClass}`).length).toBe(1)
    supportWithdrawModule.setSupportStep(SupportStep.ApproveSpending)
    expect(wrapper.findAll(`${supportErc20TokenClass} ${isLoadingClass}`).length).toBe(0)
    supportWithdrawModule.setSupportStep(SupportStep.ApprovalPending)
    expect(wrapper.findAll(`${supportApproveSpendingClass} ${isLoadingClass}`).length).toBe(1)
    supportWithdrawModule.setSupportStep(SupportStep.Support)
    expect(wrapper.findAll(`${supportApproveSpendingClass} ${isLoadingClass}`).length).toBe(0)
    supportWithdrawModule.setSupportStep(SupportStep.SupportPending)
    expect(wrapper.findAll(`${supportCooperativeClass} ${isLoadingClass}`).length).toBe(1)
    supportWithdrawModule.setSupportStep(SupportStep.Complete)
    expect(wrapper.findAll(`${supportCooperativeClass} ${isLoadingClass}`).length).toBe(0)
  })

  it('renders complete view', async () => {

    wrapper = mount(SupportProcess, {
      attachToDocument: true,
      store: appStore,
      localVue,
    })

    purchaseModule.setListing(emptyListing)
    supportWithdrawModule.setSupportStep(SupportStep.Complete)
    await flushPromises()

    expect(wrapper.findAll(supportProcessClass).length).toBe(1)
    expect(wrapper.findAll(supportProcessCompleteClass).length).toBe(1)
  })
})
