import { shallowMount, mount, createLocalVue, Wrapper } from '@vue/test-utils'

import { getModule } from 'vuex-module-decorators'
import appStore from '../../../../src/store'
import SupportWithdrawModule from '../../../../src/vuexModules/SupportWithdrawModule'
import EventModule from '../../../../src/vuexModules/EventModule'
import FlashesModule from '../../../../src/vuexModules/FlashesModule'

import ListingContractModule from '../../../../src/functionModules/protocol/ListingContractModule'

import { WithdrawStep } from '../../../../src/models/WithdrawStep'
import { DrawerBlockchainStepState } from '../../../../src/models/DrawerBlockchainStepState'
import Flash from '../../../../src/models/Flash'

import { Labels, Errors } from '../../../../src/util/Constants'

import CollectIncomeStep from '@/components/supportWithdraw/CollectIncomeStep.vue'

import flushPromises from 'flush-promises'

// tslint:disable no-shadowed-variable

describe('CollectIncomeStep.vue', () => {

  const processButtonClass = '.process-button'
  const buttonClass = '.button'
  const processId = '12345'

  const localVue = createLocalVue()

  let wrapper!: Wrapper<CollectIncomeStep>

  let supportWithdrawModule!: SupportWithdrawModule
  let eventModule!: EventModule
  let flashesModule!: FlashesModule

  beforeAll(() => {
    supportWithdrawModule = getModule(SupportWithdrawModule, appStore)
    supportWithdrawModule.setListingHashes(['0xhash1', '0xhash2'])
    eventModule = getModule(EventModule, appStore)
    flashesModule = getModule(FlashesModule, appStore)
    ListingContractModule.claimAccessReward = jest.fn()
  })

  it ('renders the step', () => {

    supportWithdrawModule.setWithdrawStep(WithdrawStep.CollectIncome)

    wrapper = shallowMount(CollectIncomeStep, {
      attachToDocument: true,
      store: appStore,
      localVue,
    })

    expect(wrapper.findAll('drawerblockchainstep-stub').length).toBe(1)
  })

  it ('correctly returns drawerLabel', () => {
    supportWithdrawModule.setWithdrawStep(WithdrawStep.Error)

    wrapper = shallowMount(CollectIncomeStep, {
      attachToDocument: true,
      store: appStore,
      localVue,
    })
    // @ts-ignore
    let drawerLabel = getDrawerLabel(wrapper)
    expect(drawerLabel).toEqual(Labels.COLLECT_INCOME)
    supportWithdrawModule.setWithdrawStep(WithdrawStep.CollectIncome)
    drawerLabel = getDrawerLabel(wrapper)
    expect(drawerLabel).toEqual(Labels.COLLECT_INCOME)
    supportWithdrawModule.setWithdrawStep(WithdrawStep.CollectIncomePending)
    drawerLabel = getDrawerLabel(wrapper)
    expect(drawerLabel).toEqual(Labels.COLLECT_INCOME)
    supportWithdrawModule.setWithdrawStep(WithdrawStep.Withdraw)
    drawerLabel = getDrawerLabel(wrapper)
    expect(drawerLabel).toEqual(Labels.COLLECT_INCOME)
    supportWithdrawModule.setWithdrawStep(WithdrawStep.WithdrawPending)
    drawerLabel = getDrawerLabel(wrapper)
    expect(drawerLabel).toEqual(Labels.COLLECT_INCOME)
    supportWithdrawModule.setWithdrawStep(WithdrawStep.UnwrapWETH)
    drawerLabel = getDrawerLabel(wrapper)
    expect(drawerLabel).toEqual(Labels.COLLECT_INCOME)
    supportWithdrawModule.setWithdrawStep(WithdrawStep.UnwrapWETHPending)
    drawerLabel = getDrawerLabel(wrapper)
    expect(drawerLabel).toEqual(Labels.COLLECT_INCOME)
    supportWithdrawModule.setWithdrawStep(WithdrawStep.Complete)
    drawerLabel = getDrawerLabel(wrapper)
    expect(drawerLabel).toEqual(Labels.COLLECT_INCOME)
  })

  it ('correctly returns drawerStepState', () => {
    supportWithdrawModule.setWithdrawStep(WithdrawStep.Error)

    wrapper = shallowMount(CollectIncomeStep, {
      attachToDocument: true,
      store: appStore,
      localVue,
    })
    // @ts-ignore
    let drawerStepState = getDrawerStepState(wrapper)
    expect(drawerStepState).toBe(DrawerBlockchainStepState.ready)
    supportWithdrawModule.setWithdrawStep(WithdrawStep.CollectIncome)
    drawerStepState = getDrawerStepState(wrapper)
    expect(drawerStepState).toBe(DrawerBlockchainStepState.ready)
    supportWithdrawModule.setWithdrawStep(WithdrawStep.CollectIncomePending)
    drawerStepState = getDrawerStepState(wrapper)
    expect(drawerStepState).toBe(DrawerBlockchainStepState.processing)
    supportWithdrawModule.setWithdrawStep(WithdrawStep.Withdraw)
    drawerStepState = getDrawerStepState(wrapper)
    expect(drawerStepState).toBe(DrawerBlockchainStepState.completed)
    supportWithdrawModule.setWithdrawStep(WithdrawStep.WithdrawPending)
    drawerStepState = getDrawerStepState(wrapper)
    expect(drawerStepState).toBe(DrawerBlockchainStepState.completed)
    supportWithdrawModule.setWithdrawStep(WithdrawStep.UnwrapWETH)
    drawerStepState = getDrawerStepState(wrapper)
    expect(drawerStepState).toBe(DrawerBlockchainStepState.completed)
    supportWithdrawModule.setWithdrawStep(WithdrawStep.UnwrapWETHPending)
    drawerStepState = getDrawerStepState(wrapper)
    expect(drawerStepState).toBe(DrawerBlockchainStepState.completed)
    supportWithdrawModule.setWithdrawStep(WithdrawStep.Complete)
    drawerStepState = getDrawerStepState(wrapper)
    expect(drawerStepState).toBe(DrawerBlockchainStepState.completed)
  })

  it('collects income', () => {

    supportWithdrawModule.setWithdrawStep(WithdrawStep.CollectIncome)

    wrapper = mount(CollectIncomeStep, {
      attachToDocument: true,
      store: appStore,
      localVue,
    })

    expect(wrapper.findAll(buttonClass).length).toBe(1)
    wrapper.find(`${processButtonClass} ${buttonClass}`).trigger('click')
    expect(supportWithdrawModule.withdrawStep).toBe(WithdrawStep.CollectIncomePending)
    expect(ListingContractModule.claimAccessReward).toHaveBeenCalledTimes(2)
  })

  describe('vuexSubscriptions processing', () => {

    it ('adds the transaction id', async () => {

      const transactionId = '0xtransaction'
      const spy = jest.fn()

      supportWithdrawModule.addCollectIncomeTransactionId = spy

      supportWithdrawModule.setWithdrawStep(WithdrawStep.CollectIncome)

      wrapper = mount(CollectIncomeStep, {
        attachToDocument: true,
        store: appStore,
        localVue,
      })

      wrapper.setData({
        processIds: [processId],
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

      supportWithdrawModule.setWithdrawStep(WithdrawStep.CollectIncome)

      wrapper = mount(CollectIncomeStep, {
        attachToDocument: true,
        store: appStore,
        localVue,
      })

      wrapper.setData({
        processIds: [processId],
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

      expect(manInBlack).toBeCalledWith(WithdrawStep.CollectIncome)
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

      wrapper = mount(CollectIncomeStep, {
        attachToDocument: true,
        store: appStore,
        localVue,
      })

      wrapper.setData({
        processIds: [processId],
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

  function getDrawerLabel(wrapper: Wrapper<CollectIncomeStep>): string {
    // @ts-ignore
    return wrapper.vm.drawerLabel
  }

  function getDrawerStepState(wrapper: Wrapper<CollectIncomeStep>): DrawerBlockchainStepState {
    // @ts-ignore
    return wrapper.vm.drawerStepState
  }
})
