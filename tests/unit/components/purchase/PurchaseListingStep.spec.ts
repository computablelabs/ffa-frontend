import { mount, createLocalVue, Wrapper } from '@vue/test-utils'
import VueRouter from 'vue-router'

import { getModule } from 'vuex-module-decorators'
import PurchaseModule from '../../../../src/vuexModules/PurchaseModule'
import appStore from '../../../../src/store'

import PurchaseListingStep from '../../../../src/components/purchase/PurchaseListingStep.vue'

import { ProcessStatus } from '../../../../src/models/ProcessStatus'
import { PurchaseStep } from '../../../../src/models/PurchaseStep'

import { library } from '@fortawesome/fontawesome-svg-core'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

describe('PurchaseListingStep.vue', () => {

  const purchaseProcessClass = 'purchase-process'
  const purchaseListingClass = 'purchase-listing'
  const purchaseClass = 'purchase'
  const buttonIsClickableData = 'data-is-clickable'
  const spinnerClass = 'is-loading'

  const localVue = createLocalVue()
  let purchaseModule!: PurchaseModule
  let wrapper!: Wrapper<PurchaseListingStep>

  beforeAll(() => {
    library.add(faSpinner)

    localVue.use(VueRouter)
    localVue.component('font-awesome-icon', FontAwesomeIcon)

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
