import { shallowMount, mount, createLocalVue, Wrapper } from '@vue/test-utils'
import VueRouter from 'vue-router'
import flushPromises from 'flush-promises'

import { getModule } from 'vuex-module-decorators'
import appStore from '../../../../src/store'

import PurchaseModule from '../../../../src/vuexModules/PurchaseModule'
import AppModule from '../../../../src/vuexModules/AppModule'
import EventModule from '../../../../src/vuexModules/EventModule'
import FlashesModule from '../../../../src/vuexModules/FlashesModule'

import PurchaseApproveSpendingStep from '@/components/purchase/PurchaseApproveSpendingStep.vue'

import TaskPollerModule from '../../../../src/functionModules/task/TaskPollerModule'

import { Labels, Errors } from '../../../../src/util/Constants'

import { ProcessStatus } from '../../../../src/models/ProcessStatus'
import { PurchaseStep } from '../../../../src/models/PurchaseStep'

import EtherTokenContractModule from '../../../../src/functionModules/protocol/EtherTokenContractModule'

// TODO: rewrite the specs
describe('PurchaseApproveSpendingStep.vue', () => {
  const allowance = 99999

  const processId = '12345'

  const localVue = createLocalVue()

  let purchaseModule!: PurchaseModule
  let appModule!: AppModule
  let eventModule!: EventModule
  let wrapper!: Wrapper<PurchaseApproveSpendingStep>
  let flashesModule!: FlashesModule

  beforeAll(() => {
    localVue.use(VueRouter)

    appModule = getModule(AppModule, appStore)
    purchaseModule = getModule(PurchaseModule, appStore)
    flashesModule = getModule(FlashesModule, appStore)

    eventModule = getModule(EventModule, appStore)

    appModule.setEtherTokenDatatrustAllowance(allowance)
    purchaseModule.setStatus(ProcessStatus.Ready)
  })

  afterEach(() => { wrapper.destroy() })

  describe('rendering', () => {
    it('renders subcomponents correctly', () => {
      wrapper = shallowMount(PurchaseApproveSpendingStep, {
        attachToDocument: true,
        store: appStore,
        localVue,
      })

      expect(wrapper.findAll('drawerblockchainstep-stub').length).toBe(1)
    })
  })

  describe('contract calls', () => {
    it('makes the correct contract call', () => {
      EtherTokenContractModule.approve = jest.fn()

      purchaseModule.setStatus(ProcessStatus.Ready)
      purchaseModule.setPurchaseStep(PurchaseStep.ApproveSpending)

      wrapper = mount(PurchaseApproveSpendingStep, {
        attachToDocument: true,
        store: appStore,
        localVue,
      })

      wrapper.find(`.process-button .button`).trigger('click')
      expect(EtherTokenContractModule.approve).toHaveBeenCalled()
    })
  })

  describe('vuexSubscriptions processing', () => {
    afterEach(() => { wrapper.destroy() })

    it('handles user signature cancel', async () => {
      TaskPollerModule.createTaskPollerForEthereumTransaction = jest.fn()
      purchaseModule.setPurchaseStep = jest.fn()
      flashesModule.append = jest.fn()

      wrapper = mount(PurchaseApproveSpendingStep, {
        attachToDocument: true,
        store: appStore,
        localVue,
      })

      wrapper.setData({ approvalProcessId: processId})

      eventModule.append({
        timestamp: new Date().getTime(),
        processId,
        response: undefined,
        error: new Error(Errors.USER_DENIED_SIGNATURE),
      })

      await flushPromises()

      expect(purchaseModule.setPurchaseStep).toBeCalledWith(PurchaseStep.ApproveSpending)

      expect(TaskPollerModule.createTaskPollerForEthereumTransaction).not.toBeCalled()
      expect(flashesModule.append).not.toBeCalled()
    })

    it('adds the transaction id', async () => {
      const transactionId = '0xtransaction'
      const spy = jest.fn()

      TaskPollerModule.createTaskPollerForEthereumTransaction = spy

      wrapper = mount(PurchaseApproveSpendingStep, {
        attachToDocument: true,
        store: appStore,
        localVue,
      })

      wrapper.setData({ approvalProcessId: processId})

      eventModule.append({
        timestamp: new Date().getTime(),
        processId,
        response: {
          result: transactionId,
        },
        error: undefined,
      })

      await flushPromises()

      expect(spy).toBeCalled()
    })
  })

  describe('computed properties', () => {
    it('correctly computes drawerLabel', () => {
      wrapper = shallowMount(PurchaseApproveSpendingStep, {
        attachToDocument: true,
        store: appStore,
        localVue,
      })

      purchaseModule.setPurchaseStep(PurchaseStep.CreateToken)
      let drawerLabel = getDrawerLabel(wrapper)
      expect(drawerLabel).toEqual(Labels.APPROVE_SPENDING)

      purchaseModule.setPurchaseStep(PurchaseStep.TokenPending)
      drawerLabel = getDrawerLabel(wrapper)
      expect(drawerLabel).toEqual(Labels.APPROVE_SPENDING)

      purchaseModule.setPurchaseStep(PurchaseStep.ApproveSpending)
      drawerLabel = getDrawerLabel(wrapper)
      expect(drawerLabel).toEqual(Labels.APPROVE_SPENDING)

      purchaseModule.setPurchaseStep(PurchaseStep.PurchaseListing)
      drawerLabel = getDrawerLabel(wrapper)
      expect(drawerLabel).toEqual(Labels.APPROVE_SPENDING)

      purchaseModule.setPurchaseStep(PurchaseStep.PurchasePending)
      drawerLabel = getDrawerLabel(wrapper)
      expect(drawerLabel).toEqual(Labels.APPROVE_SPENDING)

      purchaseModule.setPurchaseStep(PurchaseStep.Complete)
      drawerLabel = getDrawerLabel(wrapper)
      expect(drawerLabel).toEqual(Labels.APPROVE_SPENDING)

      purchaseModule.setPurchaseStep(PurchaseStep.Error)
      drawerLabel = getDrawerLabel(wrapper)
      expect(drawerLabel).toEqual(Labels.APPROVE_SPENDING)
    })
  })
})

function getDrawerLabel(wrapper: Wrapper<PurchaseApproveSpendingStep>): string {
  // @ts-ignore
  return wrapper.vm.drawerLabel
}
