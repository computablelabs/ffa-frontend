import { shallowMount, mount, createLocalVue, Wrapper } from '@vue/test-utils'

import VueRouter from 'vue-router'

import { getModule } from 'vuex-module-decorators'

import appStore from '../../../../src/store'

import PurchaseModule from '../../../../src/vuexModules/PurchaseModule'
import EventModule from '../../../../src/vuexModules/EventModule'
import FlashesModule from '../../../../src/vuexModules/FlashesModule'

import PurchaseListingStep from '../../../../src/components/purchase/PurchaseListingStep.vue'

import DatatrustModule from '../../../../src/functionModules/datatrust/DatatrustModule'

import { Labels, Errors } from '../../../../src/util/Constants'

import TaskPollerModule from '../../../../src/functionModules/task/TaskPollerModule'

import { ProcessStatus } from '../../../../src/models/ProcessStatus'
import { PurchaseStep } from '../../../../src/models/PurchaseStep'

import DatatrustContractModule from '../../../../src/functionModules/protocol/DatatrustContractModule'

import flushPromises from 'flush-promises'

// TODO: rewrite the specs
describe('PurchaseListingStep.vue', () => {
  const localVue = createLocalVue()
  let purchaseModule!: PurchaseModule
  let eventModule!: EventModule
  let flashesModule!: FlashesModule

  let wrapper!: Wrapper<PurchaseListingStep>

  const processId = '12345'

  beforeAll(() => {
    localVue.use(VueRouter)

    purchaseModule = getModule(PurchaseModule, appStore)
    eventModule = getModule(EventModule, appStore)
    flashesModule = getModule(FlashesModule, appStore)

    purchaseModule = getModule(PurchaseModule, appStore)
    purchaseModule.setStatus(ProcessStatus.Ready)
  })

  afterEach(() => { wrapper.destroy() })

  describe('rendering', () => {
    it('renders subcomponents correctly', () => {
      wrapper = shallowMount(PurchaseListingStep, {
        attachToDocument: true,
        store: appStore,
        localVue,
      })

      expect(wrapper.findAll('drawerblockchainstep-stub').length).toBe(1)
    })
  })

  describe('contract calls', () => {
    it('makes the correct contract call', () => {
      DatatrustContractModule.purchase = jest.fn()
      DatatrustModule.generateDeliveryHash = jest.fn(() => 'hash')

      purchaseModule.setStatus(ProcessStatus.Ready)
      purchaseModule.setPurchaseStep(PurchaseStep.PurchaseListing)

      wrapper = mount(PurchaseListingStep, {
        attachToDocument: true,
        store: appStore,
        localVue,
      })

      wrapper.find(`.process-button .button`).trigger('click')
      expect(DatatrustContractModule.purchase).toHaveBeenCalled()
    })
  })

  describe('vuexSubscriptions processing', () => {
    afterEach(() => { wrapper.destroy() })

    it('handles user signature cancel', async () => {
      TaskPollerModule.createTaskPollerForEthereumTransaction = jest.fn()
      purchaseModule.setPurchaseStep = jest.fn()
      flashesModule.append = jest.fn()

      wrapper = mount(PurchaseListingStep, {
        attachToDocument: true,
        store: appStore,
        localVue,
      })

      wrapper.setData({ purchaseProcessId: processId})

      eventModule.append({
        timestamp: new Date().getTime(),
        processId,
        response: undefined,
        error: new Error(Errors.USER_DENIED_SIGNATURE),
      })

      await flushPromises()

      expect(purchaseModule.setPurchaseStep).toBeCalledWith(PurchaseStep.PurchaseListing)

      expect(TaskPollerModule.createTaskPollerForEthereumTransaction).not.toBeCalled()
      expect(flashesModule.append).not.toBeCalled()
    })

    it('adds the transaction id', async () => {
      const transactionId = '0xtransaction'
      const spy = jest.fn()

      TaskPollerModule.createTaskPollerForEthereumTransaction = spy

      wrapper = mount(PurchaseListingStep, {
        attachToDocument: true,
        store: appStore,
        localVue,
      })

      wrapper.setData({ purchaseProcessId: processId})

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
      wrapper = shallowMount(PurchaseListingStep, {
        attachToDocument: true,
        store: appStore,
        localVue,
      })

      purchaseModule.setPurchaseStep(PurchaseStep.CreateToken)
      let drawerLabel = getDrawerLabel(wrapper)
      expect(drawerLabel).toEqual(Labels.PURCHASE)

      purchaseModule.setPurchaseStep(PurchaseStep.TokenPending)
      drawerLabel = getDrawerLabel(wrapper)
      expect(drawerLabel).toEqual(Labels.PURCHASE)

      purchaseModule.setPurchaseStep(PurchaseStep.ApproveSpending)
      drawerLabel = getDrawerLabel(wrapper)
      expect(drawerLabel).toEqual(Labels.PURCHASE)

      purchaseModule.setPurchaseStep(PurchaseStep.PurchaseListing)
      drawerLabel = getDrawerLabel(wrapper)
      expect(drawerLabel).toEqual(Labels.PURCHASE)

      purchaseModule.setPurchaseStep(PurchaseStep.PurchasePending)
      drawerLabel = getDrawerLabel(wrapper)
      expect(drawerLabel).toEqual(Labels.PURCHASE)

      purchaseModule.setPurchaseStep(PurchaseStep.Complete)
      drawerLabel = getDrawerLabel(wrapper)
      expect(drawerLabel).toEqual(Labels.PURCHASE)

      purchaseModule.setPurchaseStep(PurchaseStep.Error)
      drawerLabel = getDrawerLabel(wrapper)
      expect(drawerLabel).toEqual(Labels.PURCHASE)
    })
  })
})

function getDrawerLabel(wrapper: Wrapper<PurchaseListingStep>): string {
  // @ts-ignore
  return wrapper.vm.drawerLabel
}
