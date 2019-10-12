
import { mount, createLocalVue, Wrapper } from '@vue/test-utils'
import VueRouter, { Route } from 'vue-router'
import { router } from '../../../../src/router'

import { getModule } from 'vuex-module-decorators'
import PurchaseModule from '../../../../src/vuexModules/PurchaseModule'
import AppModule from '../../../../src/vuexModules/AppModule'

import appStore from '../../../../src/store'

import PurchaseProcess from '../../../../src/components/purchase/PurchaseProcess.vue'
import Erc20TokenStep from '../../../../src/components/purchase/Erc20TokenStep.vue'
import ApproveSpendingStep from '../../../../src/components/purchase/ApproveSpendingStep.vue'
import PurchaseListingStep from '../../../../src/components/purchase/PurchaseListingStep.vue'

import PurchaseProcessModule from '../../../../src/functionModules/components/PurchaseProcessModule'

import FfaProcessModule from '../../../../src/interfaces/vuex/FfaProcessModule'
import { ProcessStatus } from '../../../../src/models/ProcessStatus'
import { PurchaseStep } from '../../../../src/models/PurchaseStep'
import FfaListing, { FfaListingStatus } from '../../../../src/models/FfaListing'
import EtherTokenContractModule from '../../../../src/functionModules/protocol/EtherTokenContractModule'

describe('PurchaseProcess.ts', () => {

  const purchaseProcessClass = 'purchase-process'
  const purchaseButtonsClass = 'purchase-buttons'
  const erc20TokenClass = 'erc20-token'
  const approveSpendingClass = 'approve-spending'
  const purchaseListingClass = 'purchase-listing'

  const localVue = createLocalVue()
  let purchaseModule!: PurchaseModule
  let appModule!: AppModule
  let wrapper!: Wrapper<PurchaseProcess>

  beforeAll(() => {
    localVue.use(VueRouter)

    purchaseModule = getModule(PurchaseModule, appStore)
    appModule = getModule(AppModule, appStore)
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
    it ('wraps ETH, if needed', () => {
      purchaseModule.setPurchaseStep(PurchaseStep.CreateToken)
      wrapper = mount(PurchaseProcess, {
        attachToDocument: true,
        store: appStore,
        localVue,
        router,
      })

      const wrapTokenButton = wrapper.find('.erc20-token .process-button')
      expect(wrapTokenButton.exists()).toBeTruthy()
      expect(wrapTokenButton.vm.$props.clickable).toBeTruthy()

      purchaseModule.setPurchaseStep(PurchaseStep.Complete)
      expect(wrapTokenButton.vm.$props.clickable).toBeFalsy()
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
