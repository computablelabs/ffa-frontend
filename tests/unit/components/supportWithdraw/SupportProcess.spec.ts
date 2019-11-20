import { shallowMount, createLocalVue, Wrapper } from '@vue/test-utils'

import { getModule } from 'vuex-module-decorators'
import appStore from '../../../../src/store'
import AppModule from '../../../../src/vuexModules/AppModule'
import SupportWithdrawModule from '../../../../src/vuexModules/SupportWithdrawModule'

import SupportWithdrawProcessModule from '../../../../src/functionModules/components/SupportWithdrawProcessModule'
import TaskPollerModule from '../../../../src/functionModules/task/TaskPollerModule'

import { SupportStep } from '../../../../src/models/SupportStep'

import SupportProcess from '@/components/supportWithdraw/SupportProcess.vue'

describe('SupportProcess.vue', () => {

  const errorMessageClass = '.error-message'
  const dummySupportPrice = 1000000000
  const localVue = createLocalVue()

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
    wrapper = shallowMount(SupportProcess, {
      attachToDocument: true,
      store: appStore,
      localVue,
    })
    expect(wrapper.findAll(errorMessageClass).length).toBe(1)
    wrapper.destroy()

    supportWithdrawModule.setSupportStep(SupportStep.Error)
    wrapper = shallowMount(SupportProcess, {
      attachToDocument: true,
      store: appStore,
      localVue,
    })
    expect(wrapper.findAll(errorMessageClass).length).toBe(1)
    wrapper.destroy()

    supportWithdrawModule.setSupportStep(SupportStep.WrapETH)
    wrapper = shallowMount(SupportProcess, {
      attachToDocument: true,
      store: appStore,
      localVue,
    })
    expect(wrapper.findAll(errorMessageClass).length).toBe(0)
    expect(wrapper.findAll('supporterc20tokenstep-stub').length).toBe(1)
    expect(wrapper.findAll('supportapprovespendingstep-stub').length).toBe(1)
    expect(wrapper.findAll('supportcooperativestep-stub').length).toBe(1)
    wrapper.destroy()

    supportWithdrawModule.setSupportStep(SupportStep.WrapETHPending)
    supportWithdrawModule.setErc20TokenTransactionId('0x123')
    wrapper = shallowMount(SupportProcess, {
      attachToDocument: true,
      store: appStore,
      localVue,
    })
    expect(wrapper.findAll(errorMessageClass).length).toBe(0)
    expect(wrapper.findAll('supporterc20tokenstep-stub').length).toBe(1)
    expect(wrapper.findAll('supportapprovespendingstep-stub').length).toBe(1)
    expect(wrapper.findAll('supportcooperativestep-stub').length).toBe(1)
    wrapper.destroy()

    supportWithdrawModule.setSupportStep(SupportStep.ApproveSpending)
    wrapper = shallowMount(SupportProcess, {
      attachToDocument: true,
      store: appStore,
      localVue,
    })
    expect(wrapper.findAll(errorMessageClass).length).toBe(0)
    expect(wrapper.findAll('supporterc20tokenstep-stub').length).toBe(1)
    expect(wrapper.findAll('supportapprovespendingstep-stub').length).toBe(1)
    expect(wrapper.findAll('supportcooperativestep-stub').length).toBe(1)
    wrapper.destroy()

    supportWithdrawModule.setSupportStep(SupportStep.ApprovalPending)
    supportWithdrawModule.setApprovePaymentTransactionId('0x234')
    wrapper = shallowMount(SupportProcess, {
      attachToDocument: true,
      store: appStore,
      localVue,
    })
    expect(wrapper.findAll(errorMessageClass).length).toBe(0)
    expect(wrapper.findAll('supporterc20tokenstep-stub').length).toBe(1)
    expect(wrapper.findAll('supportapprovespendingstep-stub').length).toBe(1)
    expect(wrapper.findAll('supportcooperativestep-stub').length).toBe(1)
    wrapper.destroy()

    supportWithdrawModule.setSupportStep(SupportStep.Support)
    wrapper = shallowMount(SupportProcess, {
      attachToDocument: true,
      store: appStore,
      localVue,
    })
    expect(wrapper.findAll(errorMessageClass).length).toBe(0)
    expect(wrapper.findAll('supporterc20tokenstep-stub').length).toBe(1)
    expect(wrapper.findAll('supportapprovespendingstep-stub').length).toBe(1)
    expect(wrapper.findAll('supportcooperativestep-stub').length).toBe(1)
    wrapper.destroy()

    supportWithdrawModule.setSupportStep(SupportStep.SupportPending)
    supportWithdrawModule.setSupportCollectiveTransactionId('0x345')
    wrapper = shallowMount(SupportProcess, {
      attachToDocument: true,
      store: appStore,
      localVue,
    })
    expect(wrapper.findAll(errorMessageClass).length).toBe(0)
    expect(wrapper.findAll('supporterc20tokenstep-stub').length).toBe(1)
    expect(wrapper.findAll('supportapprovespendingstep-stub').length).toBe(1)
    expect(wrapper.findAll('supportcooperativestep-stub').length).toBe(1)
  })

  it('renders complete view', async () => {
    supportWithdrawModule.setSupportStep(SupportStep.Complete)

    wrapper = shallowMount(SupportProcess, {
      attachToDocument: true,
      store: appStore,
      localVue,
    })

    expect(wrapper.findAll(errorMessageClass).length).toBe(0)
    expect(wrapper.findAll('supporterc20tokenstep-stub').length).toBe(0)
    expect(wrapper.findAll('supportapprovespendingstep-stub').length).toBe(0)
    expect(wrapper.findAll('supportcooperativestep-stub').length).toBe(0)
    expect(wrapper.findAll('supportprocesscomplete-stub').length).toBe(1)
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
    appModule.setEtherTokenReserveAllowance(1)
    appModule.setTotalMarketTokenSupply(1)
    appModule.setTotalReserveEtherTokenSupply(1)
    appModule.setMarketTokenVotingContractAllowance(1)
    appModule.setSupportPrice(dummySupportPrice)
  }
})
