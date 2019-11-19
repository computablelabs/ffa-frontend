import { shallowMount, mount, createLocalVue, Wrapper } from '@vue/test-utils'

import { getModule } from 'vuex-module-decorators'
import appStore from '../../../../src/store'
import SupportWithdrawModule from '../../../../src/vuexModules/SupportWithdrawModule'
import AppModule from '../../../../src/vuexModules/AppModule'
import EventModule from '../../../../src/vuexModules/EventModule'
import FlashesModule from '../../../../src/vuexModules/FlashesModule'

import EtherTokenContractModule from '../../../../src/functionModules/protocol/EtherTokenContractModule'

import { WithdrawStep } from '../../../../src/models/WithdrawStep'
import { DrawerBlockchainStepState } from '../../../../src/models/DrawerBlockchainStepState'
import Flash from '../../../../src/models/Flash'

import { Labels, Errors } from '../../../../src/util/Constants'

import UnwrapWETHStep from '@/components/supportWithdraw/UnwrapWETHStep.vue'

import flushPromises from 'flush-promises'

// tslint:disable no-shadowed-variable

describe('UnwrapWETHStep.vue', () => {

  const processButtonClass = '.process-button'
  const buttonClass = '.button'
  const marketTokenBalance = 42
  const processId = '12345'

  const localVue = createLocalVue()

  let wrapper!: Wrapper<UnwrapWETHStep>

  let supportWithdrawModule!: SupportWithdrawModule
  let appModule!: AppModule
  let eventModule!: EventModule
  let flashesModule!: FlashesModule

  beforeAll(() => {
    supportWithdrawModule = getModule(SupportWithdrawModule, appStore)
    appModule = getModule(AppModule, appStore)
    appModule.setEtherTokenBalance(100)
    eventModule = getModule(EventModule, appStore)
    flashesModule = getModule(FlashesModule, appStore)

    EtherTokenContractModule.withdraw = jest.fn()
  })

  it ('renders the step', () => {

    supportWithdrawModule.setWithdrawStep(WithdrawStep.CollectIncome)

    wrapper = shallowMount(UnwrapWETHStep, {
      attachToDocument: true,
      store: appStore,
      localVue,
    })

    expect(wrapper.findAll('drawerblockchainstep-stub').length).toBe(1)
  })

  it ('correctly returns drawerLabel', () => {
    supportWithdrawModule.setWithdrawStep(WithdrawStep.Error)

    wrapper = shallowMount(UnwrapWETHStep, {
      attachToDocument: true,
      store: appStore,
      localVue,
    })

    let drawerLabel = getDrawerLabel(wrapper)
    expect(drawerLabel).toEqual(Labels.UNWRAP_WETH)
    supportWithdrawModule.setWithdrawStep(WithdrawStep.CollectIncome)
    drawerLabel = getDrawerLabel(wrapper)
    expect(drawerLabel).toEqual(Labels.UNWRAP_WETH)
    supportWithdrawModule.setWithdrawStep(WithdrawStep.CollectIncomePending)
    drawerLabel = getDrawerLabel(wrapper)
    expect(drawerLabel).toEqual(Labels.UNWRAP_WETH)
    supportWithdrawModule.setWithdrawStep(WithdrawStep.Withdraw)
    drawerLabel = getDrawerLabel(wrapper)
    expect(drawerLabel).toEqual(Labels.UNWRAP_WETH)
    supportWithdrawModule.setWithdrawStep(WithdrawStep.WithdrawPending)
    drawerLabel = getDrawerLabel(wrapper)
    expect(drawerLabel).toEqual(Labels.UNWRAP_WETH)
    supportWithdrawModule.setWithdrawStep(WithdrawStep.UnwrapWETH)
    drawerLabel = getDrawerLabel(wrapper)
    expect(drawerLabel).toEqual(Labels.UNWRAP_WETH)
    supportWithdrawModule.setWithdrawStep(WithdrawStep.UnwrapWETHPending)
    drawerLabel = getDrawerLabel(wrapper)
    expect(drawerLabel).toEqual(Labels.UNWRAP_WETH)
    supportWithdrawModule.setWithdrawStep(WithdrawStep.Complete)
    drawerLabel = getDrawerLabel(wrapper)
    expect(drawerLabel).toEqual(Labels.UNWRAP_WETH)
  })

  it ('correctly returns drawerStepState', () => {
    supportWithdrawModule.setWithdrawStep(WithdrawStep.Error)

    wrapper = shallowMount(UnwrapWETHStep, {
      attachToDocument: true,
      store: appStore,
      localVue,
    })

    let drawerStepState = getDrawerStepState(wrapper)
    expect(drawerStepState).toBe(DrawerBlockchainStepState.ready)
    supportWithdrawModule.setWithdrawStep(WithdrawStep.CollectIncome)
    drawerStepState = getDrawerStepState(wrapper)
    expect(drawerStepState).toBe(DrawerBlockchainStepState.upcoming)
    supportWithdrawModule.setWithdrawStep(WithdrawStep.CollectIncomePending)
    drawerStepState = getDrawerStepState(wrapper)
    expect(drawerStepState).toBe(DrawerBlockchainStepState.upcoming)
    supportWithdrawModule.setWithdrawStep(WithdrawStep.Withdraw)
    drawerStepState = getDrawerStepState(wrapper)
    expect(drawerStepState).toBe(DrawerBlockchainStepState.upcoming)
    supportWithdrawModule.setWithdrawStep(WithdrawStep.WithdrawPending)
    drawerStepState = getDrawerStepState(wrapper)
    expect(drawerStepState).toBe(DrawerBlockchainStepState.upcoming)
    supportWithdrawModule.setWithdrawStep(WithdrawStep.UnwrapWETH)
    drawerStepState = getDrawerStepState(wrapper)
    expect(drawerStepState).toBe(DrawerBlockchainStepState.ready)
    supportWithdrawModule.setWithdrawStep(WithdrawStep.UnwrapWETHPending)
    drawerStepState = getDrawerStepState(wrapper)
    expect(drawerStepState).toBe(DrawerBlockchainStepState.processing)
    supportWithdrawModule.setWithdrawStep(WithdrawStep.Complete)
    drawerStepState = getDrawerStepState(wrapper)
    expect(drawerStepState).toBe(DrawerBlockchainStepState.completed)
  })


  it('unwraps ETH', () => {

    supportWithdrawModule.setWithdrawStep(WithdrawStep.UnwrapWETH)

    wrapper = mount(UnwrapWETHStep, {
      attachToDocument: true,
      store: appStore,
      localVue,
    })

    expect(wrapper.findAll(buttonClass).length).toBe(1)
    wrapper.find(`${processButtonClass} ${buttonClass}`).trigger('click')
    expect(supportWithdrawModule.withdrawStep).toBe(WithdrawStep.UnwrapWETHPending)
    expect(EtherTokenContractModule.withdraw).toHaveBeenCalled()
  })

  describe('vuexSubscriptions processing', () => {

    it ('adds the transaction id', async () => {

      const transactionId = '0xtransaction'
      const spy = jest.fn()

      supportWithdrawModule.setUnwrapWETHTransactionId = spy

      supportWithdrawModule.setWithdrawStep(WithdrawStep.CollectIncome)

      wrapper = mount(UnwrapWETHStep, {
        attachToDocument: true,
        store: appStore,
        localVue,
      })

      wrapper.setData({
        processId,
      })

      eventModule.append({
        timestamp: new Date().getTime(),
        processId,
        response: {
          result: transactionId,
        },
        error: undefined,
      })

      await flushPromises()

      expect(spy).toBeCalledWith(transactionId)
    })

    it ('handles user signature cancel', async () => {

      const manInBlack = jest.fn((withdrawStep: WithdrawStep) => {
        // do nothing
      })

      const manInWhite  = jest.fn((flash: Flash) => {
        // do nothing
      })

      supportWithdrawModule.setWithdrawStep(WithdrawStep.UnwrapWETH)

      wrapper = mount(UnwrapWETHStep, {
        attachToDocument: true,
        store: appStore,
        localVue,
      })

      wrapper.setData({
        processId,
      })

      supportWithdrawModule.setWithdrawStep = manInBlack
      flashesModule.append = manInWhite

      eventModule.append({
        timestamp: new Date().getTime(),
        processId,
        response: undefined,
        error: new Error(Errors.USER_DENIED_SIGNATURE),
      })

      await flushPromises()

      expect(manInBlack).toBeCalledWith(WithdrawStep.UnwrapWETH)
      expect(manInWhite).not.toBeCalled()
    })

    it ('handles regular error', async () => {

      const manInBlack = jest.fn((withdrawStep: WithdrawStep) => {
        // do nothing
      })

      const manInWhite  = jest.fn((flash: Flash) => {
        // do nothing
      })

      supportWithdrawModule.setWithdrawStep(WithdrawStep.CollectIncome)

      wrapper = mount(UnwrapWETHStep, {
        attachToDocument: true,
        store: appStore,
        localVue,
      })

      wrapper.setData({
        processId,
      })

      supportWithdrawModule.setWithdrawStep = manInBlack
      flashesModule.append = manInWhite

      eventModule.append({
        timestamp: new Date().getTime(),
        processId,
        response: undefined,
        error: new Error('Estimate gas failure.  Likely contract operation error.  Check your params!'),
      })

      await flushPromises()

      expect(manInBlack).toBeCalledWith(WithdrawStep.Error)
      expect(manInWhite).toBeCalled()
    })
  })

  function getDrawerLabel(wrapper: Wrapper<UnwrapWETHStep>): string {
    // @ts-ignore
    return wrapper.vm.drawerLabel
  }

  function getDrawerStepState(wrapper: Wrapper<UnwrapWETHStep>): DrawerBlockchainStepState {
    // @ts-ignore
    return wrapper.vm.drawerStepState
  }
})
