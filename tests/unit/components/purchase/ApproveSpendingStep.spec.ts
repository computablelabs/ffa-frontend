import { mount, createLocalVue, Wrapper } from '@vue/test-utils'
import VueRouter from 'vue-router'

import { getModule } from 'vuex-module-decorators'
import appStore from '../../../../src/store'
import PurchaseModule from '../../../../src/vuexModules/PurchaseModule'
import AppModule from '../../../../src/vuexModules/AppModule'

import ApproveSpendingStep from '@/components/purchase/ApproveSpendingStep.vue'

import { ProcessStatus } from '../../../../src/models/ProcessStatus'
import { PurchaseStep } from '../../../../src/models/PurchaseStep'

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

  let appModule!: AppModule
  let purchaseModule!: PurchaseModule
  let wrapper!: Wrapper<ApproveSpendingStep>

  beforeAll(() => {
    library.add(faSpinner)

    localVue.use(VueRouter)
    localVue.component('font-awesome-icon', FontAwesomeIcon)

    appModule = getModule(AppModule, appStore)
    purchaseModule = getModule(PurchaseModule, appStore)

    appModule.setDatatrustContractAllowance(allowance)
    purchaseModule.setStatus(ProcessStatus.Ready)
  })

  afterEach(() => {
    if (wrapper !== undefined) {
      wrapper.destroy()
    }
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
