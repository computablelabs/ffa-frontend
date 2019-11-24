import { shallowMount, mount, createLocalVue, Wrapper } from '@vue/test-utils'

import { getModule } from 'vuex-module-decorators'
import appStore from '../../../../src/store'
import SupportWithdrawModule from '../../../../src/vuexModules/SupportWithdrawModule'
import EventModule from '../../../../src/vuexModules/EventModule'
import FlashesModule from '../../../../src/vuexModules/FlashesModule'

import ReserveContractModule from '../../../../src/functionModules/protocol/ReserveContractModule'

import { SupportStep } from '../../../../src/models/SupportStep'
import { DrawerBlockchainStepState } from '../../../../src/models/DrawerBlockchainStepState'
import Flash from '../../../../src/models/Flash'

import { Labels, Errors } from '../../../../src/util/Constants'

import SupportCooperativeStep from '@/components/supportWithdraw/SupportCooperativeStep.vue'

import flushPromises from 'flush-promises'

// tslint:disable no-shadowed-variable

describe('SupportCooperativeStep.vue', () => {

  const processButtonClass = '.process-button'
  const buttonClass = '.button'
  const processId = '12345'

  const localVue = createLocalVue()

  let wrapper!: Wrapper<SupportCooperativeStep>

  let supportWithdrawModule!: SupportWithdrawModule
  let eventModule!: EventModule
  let flashesModule!: FlashesModule

  beforeAll(() => {
    supportWithdrawModule = getModule(SupportWithdrawModule, appStore)
    eventModule = getModule(EventModule, appStore)
    flashesModule = getModule(FlashesModule, appStore)

    ReserveContractModule.support = jest.fn()
  })


  it ('renders the step', () => {

    supportWithdrawModule.setSupportStep(SupportStep.Support)

    wrapper = shallowMount(SupportCooperativeStep, {
      attachToDocument: true,
      store: appStore,
      localVue,
    })

    expect(wrapper.findAll('drawerblockchainstep-stub').length).toBe(1)
  })

  it('supports', () => {

    supportWithdrawModule.setSupportStep(SupportStep.Support)

    wrapper = mount(SupportCooperativeStep, {
      attachToDocument: true,
      store: appStore,
      localVue,
    })

    expect(wrapper.findAll(buttonClass).length).toBe(1)
    wrapper.find(`${processButtonClass} ${buttonClass}`).trigger('click')
    expect(ReserveContractModule.support).toHaveBeenCalled()
  })

  it ('correctly returns drawerLabel', () => {
    supportWithdrawModule.setSupportStep(SupportStep.Error)

    wrapper = shallowMount(SupportCooperativeStep, {
      attachToDocument: true,
      store: appStore,
      localVue,
    })

    let drawerLabel = getDrawerLabel(wrapper)
    expect(drawerLabel).toEqual(Labels.SUPPORT_COOPERATIVE)
    supportWithdrawModule.setSupportStep(SupportStep.InsufficientETH)
    drawerLabel = getDrawerLabel(wrapper)
    expect(drawerLabel).toEqual(Labels.SUPPORT_COOPERATIVE)
    supportWithdrawModule.setSupportStep(SupportStep.WrapETH)
    drawerLabel = getDrawerLabel(wrapper)
    expect(drawerLabel).toEqual(Labels.SUPPORT_COOPERATIVE)
    supportWithdrawModule.setSupportStep(SupportStep.WrapETHPending)
    drawerLabel = getDrawerLabel(wrapper)
    expect(drawerLabel).toEqual(Labels.SUPPORT_COOPERATIVE)
    supportWithdrawModule.setSupportStep(SupportStep.ApproveSpending)
    drawerLabel = getDrawerLabel(wrapper)
    expect(drawerLabel).toEqual(Labels.SUPPORT_COOPERATIVE)
    supportWithdrawModule.setSupportStep(SupportStep.ApprovalPending)
    drawerLabel = getDrawerLabel(wrapper)
    expect(drawerLabel).toEqual(Labels.SUPPORT_COOPERATIVE)
    supportWithdrawModule.setSupportStep(SupportStep.Support)
    drawerLabel = getDrawerLabel(wrapper)
    expect(drawerLabel).toEqual(Labels.SUPPORT_COOPERATIVE)
    supportWithdrawModule.setSupportStep(SupportStep.SupportPending)
    drawerLabel = getDrawerLabel(wrapper)
    expect(drawerLabel).toEqual(Labels.SUPPORT_COOPERATIVE)
    supportWithdrawModule.setSupportStep(SupportStep.Complete)
    drawerLabel = getDrawerLabel(wrapper)
    expect(drawerLabel).toEqual(Labels.SUPPORT_COOPERATIVE)
  })

  it ('correctly returns drawerStepState', () => {
    supportWithdrawModule.setSupportStep(SupportStep.Error)

    wrapper = shallowMount(SupportCooperativeStep, {
      attachToDocument: true,
      store: appStore,
      localVue,
    })

    let drawerStepState = getDrawerStepState(wrapper)
    expect(drawerStepState).toBe(DrawerBlockchainStepState.ready)
    supportWithdrawModule.setSupportStep(SupportStep.InsufficientETH)
    drawerStepState = getDrawerStepState(wrapper)
    expect(drawerStepState).toBe(DrawerBlockchainStepState.ready)
    supportWithdrawModule.setSupportStep(SupportStep.WrapETH)
    drawerStepState = getDrawerStepState(wrapper)
    expect(drawerStepState).toBe(DrawerBlockchainStepState.upcoming)
    supportWithdrawModule.setSupportStep(SupportStep.WrapETHPending)
    drawerStepState = getDrawerStepState(wrapper)
    expect(drawerStepState).toBe(DrawerBlockchainStepState.upcoming)
    supportWithdrawModule.setSupportStep(SupportStep.ApproveSpending)
    drawerStepState = getDrawerStepState(wrapper)
    expect(drawerStepState).toBe(DrawerBlockchainStepState.upcoming)
    supportWithdrawModule.setSupportStep(SupportStep.ApprovalPending)
    drawerStepState = getDrawerStepState(wrapper)
    expect(drawerStepState).toBe(DrawerBlockchainStepState.upcoming)
    supportWithdrawModule.setSupportStep(SupportStep.Support)
    drawerStepState = getDrawerStepState(wrapper)
    expect(drawerStepState).toBe(DrawerBlockchainStepState.ready)
    supportWithdrawModule.setSupportStep(SupportStep.SupportPending)
    drawerStepState = getDrawerStepState(wrapper)
    expect(drawerStepState).toBe(DrawerBlockchainStepState.processing)
    supportWithdrawModule.setSupportStep(SupportStep.Complete)
    drawerStepState = getDrawerStepState(wrapper)
    expect(drawerStepState).toBe(DrawerBlockchainStepState.completed)
  })

  describe('vuexSubscriptions processing', () => {

    it ('adds the transaction id', async () => {

      const transactionId = '0xtransaction'
      const spy = jest.fn()

      supportWithdrawModule.setSupportCollectiveTransactionId = spy

      supportWithdrawModule.setSupportStep(SupportStep.SupportPending)

      wrapper = mount(SupportCooperativeStep, {
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

      const manInBlack = jest.fn((withdrawStep: SupportStep) => {
        // do nothing
      })

      const manInWhite  = jest.fn((flash: Flash) => {
        // do nothing
      })

      supportWithdrawModule.setSupportStep(SupportStep.SupportPending)

      wrapper = mount(SupportCooperativeStep, {
        attachToDocument: true,
        store: appStore,
        localVue,
      })

      wrapper.setData({
        processId,
      })

      supportWithdrawModule.setSupportStep = manInBlack
      flashesModule.append = manInWhite

      eventModule.append({
        timestamp: new Date().getTime(),
        processId,
        response: undefined,
        error: new Error(Errors.USER_DENIED_SIGNATURE),
      })

      await flushPromises()

      expect(manInBlack).toBeCalledWith(SupportStep.Support)
      expect(manInWhite).not.toBeCalled()
    })

    it ('handles regular error', async () => {

      const manInBlack = jest.fn((withdrawStep: SupportStep) => {
        // do nothing
      })

      const manInWhite  = jest.fn((flash: Flash) => {
        // do nothing
      })

      supportWithdrawModule.setSupportStep(SupportStep.WrapETH)

      wrapper = mount(SupportCooperativeStep, {
        attachToDocument: true,
        store: appStore,
        localVue,
      })

      wrapper.setData({
        processId,
      })

      supportWithdrawModule.setSupportStep = manInBlack
      flashesModule.append = manInWhite

      eventModule.append({
        timestamp: new Date().getTime(),
        processId,
        response: undefined,
        error: new Error('Estimate gas failure.  Likely contract operation error.  Check your params!'),
      })

      await flushPromises()

      expect(manInBlack).toBeCalledWith(SupportStep.Support)
      expect(manInWhite).toBeCalled()
    })
  })

  function getDrawerLabel(wrapper: Wrapper<SupportCooperativeStep>): string {
    // @ts-ignore
    return wrapper.vm.drawerLabel
  }

  function getDrawerStepState(wrapper: Wrapper<SupportCooperativeStep>): DrawerBlockchainStepState {
    // @ts-ignore
    return wrapper.vm.drawerStepState
  }
})
