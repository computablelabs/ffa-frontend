import { mount, createLocalVue, Wrapper } from '@vue/test-utils'
import VueRouter from 'vue-router'

import { getModule } from 'vuex-module-decorators'
import PurchaseModule from '../../../../src/vuexModules/PurchaseModule'
import appStore from '../../../../src/store'

import PurchaseListingStep from '../../../../src/components/purchase/PurchaseListingStep.vue'

import { ProcessStatus } from '../../../../src/models/ProcessStatus'
import { PurchaseStep } from '../../../../src/models/PurchaseStep'

describe('PurchaseListingStep.vue', () => {

  const purchaseListingClass = 'purchase-listing'
  const purchaseClass = 'purchase'
  const buttonIsClickableData = 'data-is-clickable'
  const spinnerClass = 'is-loading'

  const localVue = createLocalVue()
  let purchaseModule!: PurchaseModule
  let wrapper!: Wrapper<PurchaseListingStep>

  beforeAll(() => {
    localVue.use(VueRouter)

    purchaseModule = getModule(PurchaseModule, appStore)
    purchaseModule.setStatus(ProcessStatus.Ready)
  })

  afterEach(() => {
    if (wrapper !== undefined) {
      wrapper.destroy()
    }
  })

  it('renders the purchase step for all steps', () => {

    wrapper = mount(PurchaseListingStep, {
      attachToDocument: true,
      store: appStore,
      localVue,
    })

    expect(wrapper.findAll(`.${purchaseListingClass}`).length).toBe(1)

    purchaseModule.setPurchaseStep(PurchaseStep.CreateToken)
    expect(wrapper.findAll(`.${purchaseClass}`).length).toBe(1)

    purchaseModule.setPurchaseStep(PurchaseStep.TokenPending)
    expect(wrapper.findAll(`.${purchaseClass}`).length).toBe(1)

    purchaseModule.setPurchaseStep(PurchaseStep.ApproveSpending)
    expect(wrapper.findAll(`.${purchaseClass}`).length).toBe(1)

    purchaseModule.setPurchaseStep(PurchaseStep.ApprovalPending)
    expect(wrapper.findAll(`.${purchaseClass}`).length).toBe(1)

    purchaseModule.setPurchaseStep(PurchaseStep.PurchaseListing)
    expect(wrapper.findAll(`.${purchaseClass}`).length).toBe(1)

    purchaseModule.setPurchaseStep(PurchaseStep.PurchasePending)
    expect(wrapper.findAll(`.${purchaseClass}`).length).toBe(1)

    purchaseModule.setPurchaseStep(PurchaseStep.Complete)
    expect(wrapper.findAll(`.${purchaseClass}`).length).toBe(1)
  })

  it('correctly passes processing prop to the button', () => {

    wrapper = mount(PurchaseListingStep, {
      attachToDocument: true,
      store: appStore,
      localVue,
    })
    purchaseModule.setPurchaseStep(PurchaseStep.PurchasePending)
    expect(wrapper.findAll(`.${purchaseClass}`).length).toBe(1)
    expect(wrapper.contains(buttonIsClickableData)).toBe(false)
    expect(wrapper.findAll(`.${spinnerClass}`).length).toBe(1)
  })
})
