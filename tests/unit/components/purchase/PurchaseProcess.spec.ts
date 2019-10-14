
import { mount, createLocalVue, Wrapper } from '@vue/test-utils'
import VueRouter, { Route } from 'vue-router'
import { router } from '../../../../src/router'
import flushPromises from 'flush-promises'

import { getModule } from 'vuex-module-decorators'
import PurchaseModule from '../../../../src/vuexModules/PurchaseModule'
import AppModule from '../../../../src/vuexModules/AppModule'
import EventModule from '../../../../src/vuexModules/EventModule'

import appStore from '../../../../src/store'

import PurchaseProcess from '../../../../src/components/purchase/PurchaseProcess.vue'
import Erc20TokenStep from '../../../../src/components/purchase/Erc20TokenStep.vue'
import ApproveSpendingStep from '../../../../src/components/purchase/ApproveSpendingStep.vue'
import PurchaseListingStep from '../../../../src/components/purchase/PurchaseListingStep.vue'

import PurchaseProcessModule from '../../../../src/functionModules/components/PurchaseProcessModule'
import EventableModule from '../../../../src/functionModules/eventable/EventableModule'
import EtherTokenContractModule from '../../../../src/functionModules/protocol/EtherTokenContractModule'

import FfaProcessModule from '../../../../src/interfaces/vuex/FfaProcessModule'
import { ProcessStatus } from '../../../../src/models/ProcessStatus'
import { PurchaseStep } from '../../../../src/models/PurchaseStep'
import FfaListing, { FfaListingStatus } from '../../../../src/models/FfaListing'

describe('PurchaseProcess.ts', () => {

  const purchaseProcessClass = 'purchase-process'
  const purchaseButtonsClass = 'purchase-buttons'
  const erc20TokenClass = 'erc20-token'
  const approveSpendingClass = 'approve-spending'
  const purchaseListingClass = 'purchase-listing'

  const localVue = createLocalVue()
  let purchaseModule!: PurchaseModule
  let appModule!: AppModule
  let eventModule!: EventModule
  let wrapper!: Wrapper<PurchaseProcess>

  beforeAll(() => {
    localVue.use(VueRouter)

    purchaseModule = getModule(PurchaseModule, appStore)
    appModule = getModule(AppModule, appStore)
    eventModule = getModule(EventModule, appStore)
  })

  afterEach(() => {
    if (wrapper !== undefined) {
      wrapper.destroy()
    }
  })

  it('renders the steps', () => {

    purchaseModule.setStatus(ProcessStatus.Ready)

    wrapper = mount(PurchaseProcess, {
      attachToDocument: true,
      store: appStore,
      localVue,
      router,
    })

    expect(wrapper.findAll(`.${purchaseProcessClass}`).length).toBe(1)
    expect(wrapper.findAll(`.${purchaseProcessClass} .${erc20TokenClass}`).length).toBe(1)
    expect(wrapper.findAll(`.${purchaseProcessClass} .${approveSpendingClass}`).length).toBe(1)
    expect(wrapper.findAll(`.${purchaseProcessClass} .${purchaseListingClass}`).length).toBe(1)
  })

  describe('Erc20TokenStep.vue', () => {
    it ('wraps ETH, if needed', async () => {
      EtherTokenContractModule.deposit = () => Promise.resolve()
      EtherTokenContractModule.balanceOf = () => Promise.resolve('1000000000')
      PurchaseProcessModule.getPurchasePrice = () => 0

      wrapper = mount(Erc20TokenStep, {
        attachToDocument: true,
        store: appStore,
        localVue,
        router,
      })

      const wrapTokenButtonDiv = wrapper.find('.erc20-token .process-button')
      const wrapTokenButton = wrapper.find('a[data-is-clickable="true"]')

      // Initiate wrapping transaction
      wrapTokenButton.trigger('click')
      expect(purchaseModule.purchaseStep).toBe(PurchaseStep.TokenPending)
      expect(wrapTokenButtonDiv.vm.$props.clickable).toBeTruthy()

      const minedProcessId = purchaseModule.erc20TokenMinedProcessId

      // create an event signifying mining finsihed
      eventModule.append(EventableModule.createEvent(minedProcessId, true , undefined))
      await flushPromises()

      // purchase step is now to approve, button is no longer clickable
      expect(purchaseModule.purchaseStep).toBe(PurchaseStep.ApproveSpending)
      expect(wrapTokenButtonDiv.vm.$props.clickable).toBeFalsy()
    })

    it ('wraps ETH, if needed', async () => {
      purchaseModule.setPurchaseStep(PurchaseStep.CreateToken)
      EtherTokenContractModule.deposit = () => Promise.resolve()

      wrapper = mount(PurchaseProcess, {
        attachToDocument: true,
        store: appStore,
        localVue,
        router,
      })

      const wrapTokenButtonDiv = wrapper.find('.erc20-token .process-button')
      const wrapTokenButton = wrapper.find('.erc20-token .process-button .button')


      expect(wrapTokenButtonDiv.exists()).toBeTruthy()
      expect(wrapTokenButtonDiv.vm.$props.clickable).toBeTruthy()

      wrapTokenButton.trigger('click')
      const minedProcessId = wrapper.vm.$children[0].$data.erc20TokenMinedProcessId

      await flushPromises()
      purchaseModule.setPurchaseStep(PurchaseStep.Complete)
      expect(wrapTokenButtonDiv.vm.$props.clickable).toBeFalsy()
    })
  })

  describe('ApproveSpendingStep.vue', () => {

    it ('reacts correctly to needing approval', () => {
      purchaseModule.setPurchaseStep(PurchaseStep.ApproveSpending)

      wrapper = mount(PurchaseProcess, {
        attachToDocument: true,
        store: appStore,
        localVue,
        router,
      })

      const approveButton = wrapper.find('.approve-spending .process-button')
      expect(approveButton.exists()).toBeTruthy()
      expect(approveButton.vm.$props.clickable).toBeTruthy()

      purchaseModule.setPurchaseStep(PurchaseStep.Complete)
      expect(approveButton.vm.$props.clickable).toBeFalsy()
    })
  })

  it('Approves the datatrust, if needed', async () => {
    purchaseModule.setPurchaseStep(PurchaseStep.ApproveSpending)

    EtherTokenContractModule.allowance = () => Promise.resolve('10')
    EtherTokenContractModule.approve = () => Promise.resolve()
    EtherTokenContractModule.balanceOf = () => Promise.resolve('1000000000')
    PurchaseProcessModule.getPurchasePrice = () => 100

    wrapper = mount(ApproveSpendingStep, {
      attachToDocument: true,
      store: appStore,
      localVue,
      router,
    })

    const wrapTokenButtonDiv = wrapper.find('.approve-spending .process-button')
    const wrapTokenButton = wrapper.find('.process-button .button')


    // Initiate wrapping transaction
    wrapTokenButton.trigger('click')
    expect(purchaseModule.purchaseStep).toBe(PurchaseStep.ApprovalPending)
    expect(wrapTokenButtonDiv.vm.$props.clickable).toBeTruthy()

    const minedProcessId = purchaseModule.approvalMinedProcessId

    // Update new allowance amount
    EtherTokenContractModule.allowance = () => Promise.resolve('1000')

    // create an event signifying mining finsihed
    eventModule.append(EventableModule.createEvent(minedProcessId, true , undefined))

    await flushPromises()

    // purchase step is now to approve, button is no longer clickable
    expect(purchaseModule.purchaseStep).toBe(PurchaseStep.PurchaseListing)
    expect(wrapTokenButtonDiv.vm.$props.clickable).toBeFalsy()
  })

  describe('PurchaseListingStep.vue', () => {
    it ('exists', () => {
      purchaseModule.setPurchaseStep(PurchaseStep.ApproveSpending)
      PurchaseProcessModule.getPurchasePrice = () => 0
      EtherTokenContractModule.balanceOf = () =>  Promise.resolve('100')
      EtherTokenContractModule.deposit = () =>  Promise.resolve()

      wrapper = mount(PurchaseProcess, {
        attachToDocument: true,
        store: appStore,
        localVue,
        router,
      })

      const approveButton = wrapper.find('.purchase-listing .process-button')
      expect(approveButton.exists()).toBeTruthy()
    })
  })
})
