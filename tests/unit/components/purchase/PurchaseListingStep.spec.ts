import { mount, createLocalVue, Wrapper } from '@vue/test-utils'
import VueRouter from 'vue-router'

import { getModule } from 'vuex-module-decorators'
import PurchaseModule from '../../../../src/vuexModules/PurchaseModule'
import appStore from '../../../../src/store'

import PurchaseListingStep from '../../../../src/components/purchase/PurchaseListingStep.vue'

import { ProcessStatus } from '../../../../src/models/ProcessStatus'
import { PurchaseStep } from '../../../../src/models/PurchaseStep'

// TODO: rewrite the specs
describe('PurchaseListingStep.vue', () => {

  const purchaseListingClass = 'purchase-listing'
  const purchaseClass = 'purchase'
  const buttonIsClickableData = 'data-is-clickable'
  const spinnerClass = 'is-loading'

  const localVue = createLocalVue()
  let purchaseModule!: PurchaseModule
  // let wrapper!: Wrapper<PurchaseListingStep>

  beforeAll(() => {
    localVue.use(VueRouter)

    purchaseModule = getModule(PurchaseModule, appStore)
    purchaseModule.setStatus(ProcessStatus.Ready)
  })

  afterEach(() => {
    // if (wrapper !== undefined) {
    //   wrapper.destroy()
    // }
  })

  it ('whatever', () => {
    expect(1).toBe(1)
  })

})
