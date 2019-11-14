import { mount, createLocalVue, Wrapper } from '@vue/test-utils'
import VueRouter from 'vue-router'
import { router } from '../../../../src/router'

import { getModule } from 'vuex-module-decorators'
import appStore from '../../../../src/store'
import PurchaseModule from '../../../../src/vuexModules/PurchaseModule'
import AppModule from '../../../../src/vuexModules/AppModule'
import EventModule from '../../../../src/vuexModules/EventModule'

import PurchaseApproveSpendingStep from '@/components/purchase/PurchaseApproveSpendingStep.vue'

import { ProcessStatus } from '../../../../src/models/ProcessStatus'
import { PurchaseStep } from '../../../../src/models/PurchaseStep'

import PurchaseProcessModule from '../../../../src/functionModules/components/PurchaseProcessModule'
import EtherTokenContractModule from '../../../../src/functionModules/protocol/EtherTokenContractModule'

// TODO: rewrite the specs
describe('PurchaseApproveSpendingStep.vue', () => {

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
  // let wrapper!: Wrapper<PurchaseApproveSpendingStep>

  beforeAll(() => {
    localVue.use(VueRouter)

    appModule = getModule(AppModule, appStore)
    purchaseModule = getModule(PurchaseModule, appStore)

    eventModule = getModule(EventModule, appStore)

    appModule.setEtherTokenDatatrustAllowance(allowance)
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
