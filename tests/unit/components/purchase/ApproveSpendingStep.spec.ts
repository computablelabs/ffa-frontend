import { mount, createLocalVue, Wrapper } from '@vue/test-utils'
import VueRouter from 'vue-router'
import { router } from '../../../../src/router'
import flushPromises from 'flush-promises'

import { getModule } from 'vuex-module-decorators'
import appStore from '../../../../src/store'
import PurchaseModule from '../../../../src/vuexModules/PurchaseModule'
import AppModule from '../../../../src/vuexModules/AppModule'
import EventModule from '../../../../src/vuexModules/EventModule'

import ApproveSpendingStep from '@/components/purchase/ApproveSpendingStep.vue'

import { ProcessStatus } from '../../../../src/models/ProcessStatus'
import { PurchaseStep } from '../../../../src/models/PurchaseStep'


import PurchaseProcessModule from '../../../../src/functionModules/components/PurchaseProcessModule'
import EventableModule from '../../../../src/functionModules/eventable/EventableModule'
import EtherTokenContractModule from '../../../../src/functionModules/protocol/EtherTokenContractModule'


import { library } from '@fortawesome/fontawesome-svg-core'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

describe('ApproveSpendingStep.vue', () => {

  const purchaseProcessClass = 'purchase-process'
  const approveSpendingClass = 'approve-spending'
  const approveDatatrustClass = 'approve-datatrust'
  const datatrustAllowanceClass = 'datatrust-allowance'
  const buttonIsClickableData = 'data-is-clickable'
  const spinnerClass = 'is-loading'
  const allowance = 99999

  const localVue = createLocalVue()

  let purchaseModule!: PurchaseModule
  let appModule!: AppModule
  let eventModule!: EventModule
  let wrapper!: Wrapper<ApproveSpendingStep>

  beforeAll(() => {
    library.add(faSpinner)

    localVue.use(VueRouter)
    localVue.component('font-awesome-icon', FontAwesomeIcon)

    appModule = getModule(AppModule, appStore)
    purchaseModule = getModule(PurchaseModule, appStore)

    eventModule = getModule(EventModule, appStore)

    appModule.setDatatrustContractAllowance(allowance)
    purchaseModule.setStatus(ProcessStatus.Ready)
  })

  afterEach(() => {
    if (wrapper !== undefined) {
      wrapper.destroy()
    }
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

  // NOTE: Removed conditional rendering for now, instead made conditionally clickable
  // NOTE: Will interface with Reid moving forward

  // it('conditionally renders the datatrust allowance', () => {

  //   wrapper = mount(ApproveSpendingStep, {
  //     attachToDocument: true,
  //     store: appStore,
  //     localVue,
  //   })

  //   expect(wrapper.findAll(`.${approveSpendingClass}`).length).toBe(1)
  //   expect(wrapper.findAll(`.${approveDatatrustClass}`).length).toBe(0)
  //   expect(wrapper.findAll(`.${datatrustAllowanceClass}`).length).toBe(1)
  //   expect(wrapper.find(`.${datatrustAllowanceClass} .label`).text()).toEqual(allowance.toString())

  //   purchaseModule.setPurchaseStep(PurchaseStep.CreateToken)
  //   expect(wrapper.findAll(`.${approveDatatrustClass}`).length).toBe(0)
  //   expect(wrapper.findAll(`.${datatrustAllowanceClass}`).length).toBe(1)

  //   purchaseModule.setPurchaseStep(PurchaseStep.TokenPending)
  //   expect(wrapper.findAll(`.${approveDatatrustClass}`).length).toBe(0)
  //   expect(wrapper.findAll(`.${datatrustAllowanceClass}`).length).toBe(1)

  //   purchaseModule.setPurchaseStep(PurchaseStep.PurchaseListing)
  //   expect(wrapper.findAll(`.${approveDatatrustClass}`).length).toBe(0)
  //   expect(wrapper.findAll(`.${datatrustAllowanceClass}`).length).toBe(1)

  //   purchaseModule.setPurchaseStep(PurchaseStep.PurchasePending)
  //   expect(wrapper.findAll(`.${approveDatatrustClass}`).length).toBe(0)
  //   expect(wrapper.findAll(`.${datatrustAllowanceClass}`).length).toBe(1)
  //   expect(wrapper.findAll(`.${datatrustAllowanceClass}`).length).toBe(1)

  //   purchaseModule.setPurchaseStep(PurchaseStep.Complete)
  //   expect(wrapper.findAll(`.${approveDatatrustClass}`).length).toBe(0)
  //   expect(wrapper.findAll(`.${datatrustAllowanceClass}`).length).toBe(1)
  // })

  it('conditionally renders the approval step', () => {

    wrapper = mount(ApproveSpendingStep, {
      attachToDocument: true,
      store: appStore,
      localVue,
    })

    expect(wrapper.findAll(`.${approveSpendingClass}`).length).toBe(1)

    purchaseModule.setPurchaseStep(PurchaseStep.ApproveSpending)
    expect(wrapper.findAll(`.${approveDatatrustClass}`).length).toBe(1)
    expect(wrapper.findAll(`.${datatrustAllowanceClass}`).length).toBe(0)

    purchaseModule.setPurchaseStep(PurchaseStep.ApprovalPending)
    expect(wrapper.findAll(`.${approveDatatrustClass}`).length).toBe(1)
    expect(wrapper.findAll(`.${datatrustAllowanceClass}`).length).toBe(0)
  })

  it('correctly passes processing prop to the button', () => {

    wrapper = mount(ApproveSpendingStep, {
      attachToDocument: true,
      store: appStore,
      localVue,
    })
    purchaseModule.setPurchaseStep(PurchaseStep.ApprovalPending)
    expect(wrapper.findAll(`.${approveDatatrustClass}`).length).toBe(1)
    expect(wrapper.findAll(`.${datatrustAllowanceClass}`).length).toBe(0)
    expect(wrapper.contains(buttonIsClickableData)).toBe(false)
    expect(wrapper.findAll(`.${spinnerClass}`).length).toBe(1)
  })
})
