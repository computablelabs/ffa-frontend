import { TransactOpts } from '@computable/computablejs/dist/interfaces'

import { mount, createLocalVue, Wrapper } from '@vue/test-utils'
import VueRouter, { Route } from 'vue-router'
import { router } from '../../../../src/router'

import { getModule } from 'vuex-module-decorators'
import PurchaseModule from '../../../../src/vuexModules/PurchaseModule'
import appStore from '../../../../src/store'

import PurchaseProcess from '../../../../src/components/purchase/PurchaseProcess.vue'
import Erc20TokenStep from '../../../../src/components/purchase/Erc20TokenStep.vue'
import ApproveSpendingStep from '../../../../src/components/purchase/ApproveSpendingStep.vue'
import PurchaseListingStep from '../../../../src/components/purchase/PurchaseListingStep.vue'

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
  let wrapper!: Wrapper<PurchaseProcess>

  beforeAll(() => {
    localVue.use(VueRouter)

    purchaseModule = getModule(PurchaseModule, appStore)
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
})
