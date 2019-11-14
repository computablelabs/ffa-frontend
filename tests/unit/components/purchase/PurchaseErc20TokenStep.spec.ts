import { mount, createLocalVue, Wrapper } from '@vue/test-utils'
import VueRouter from 'vue-router'

import { getModule } from 'vuex-module-decorators'
import PurchaseModule from '../../../../src/vuexModules/PurchaseModule'
import appStore from '../../../../src/store'

import EventModule from '../../../../src/vuexModules/EventModule'

import PurchaseErc20TokenStep from '../../../../src/components/purchase/PurchaseErc20TokenStep.vue'

import { PurchaseStep } from '../../../../src/models/PurchaseStep'

import PurchaseProcessModule from '../../../../src/functionModules/components/PurchaseProcessModule'
import EtherTokenContractModule from '../../../../src/functionModules/protocol/EtherTokenContractModule'

// TODO: rewrite the specs
describe('PurchaseErc20TokenStep.vue', () => {

  const erc20TokenClass = 'erc20-token'
  const createTokenClass = 'create-token'
  const marketTokenBalanceClass = 'ether-token-balance'
  const buttonIsClickableData = 'data-is-clickable'
  const spinnerClass = 'is-loading'

  const localVue = createLocalVue()
  let purchaseModule!: PurchaseModule
  let eventModule!: EventModule
  let wrapper!: Wrapper<PurchaseErc20TokenStep>

  beforeAll(() => {
    localVue.use(VueRouter)

    purchaseModule = getModule(PurchaseModule, appStore)
    eventModule = getModule(EventModule, appStore)
  })

  afterEach(() => {
    if (wrapper !== undefined) {
      wrapper.destroy()
    }
  })

  it ('whatever', () => {
    expect(1).toBe(1)
  })

})
