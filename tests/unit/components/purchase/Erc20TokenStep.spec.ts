import { mount, createLocalVue, Wrapper } from '@vue/test-utils'
import VueRouter from 'vue-router'

import { getModule } from 'vuex-module-decorators'
import PurchaseModule from '../../../../src/vuexModules/PurchaseModule'
import appStore from '../../../../src/store'

import Erc20TokenStep from '../../../../src/components/purchase/Erc20TokenStep.vue'

import { ProcessStatus } from '../../../../src/models/ProcessStatus'
import { PurchaseStep } from '../../../../src/models/PurchaseStep'

import { library } from '@fortawesome/fontawesome-svg-core'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

describe('Erc20TokenStep.vue', () => {

  const purchaseProcessClass = 'purchase-process'
  const erc20TokenClass = 'erc20-token'
  const createTokenClass = 'create-token'
  const marketTokenBalanceClass = 'ether-token-balance'
  const buttonIsClickableData = 'data-is-clickable'
  const spinnerClass = 'is-loading'

  const localVue = createLocalVue()
  let purchaseModule!: PurchaseModule
  let wrapper!: Wrapper<Erc20TokenStep>

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

  // NOTE: Removed conditional rendering for now, instead made conditionally clickable

  // it('conditionally renders the market token ', () => {

  //   wrapper = mount(Erc20TokenStep, {
  //     attachToDocument: true,
  //     store: appStore,
  //     localVue,
  //   })

  //   expect(wrapper.findAll(`.${erc20TokenClass}`).length).toBe(1)
  //   expect(wrapper.findAll(`.${createTokenClass}`).length).toBe(1)
  //   expect(wrapper.findAll(`.${marketTokenBalanceClass}`).length).toBe(0)

  //   purchaseModule.setPurchaseStep(PurchaseStep.ApproveSpending)
  //   expect(wrapper.findAll(`.${createTokenClass}`).length).toBe(0)
  //   expect(wrapper.findAll(`.${marketTokenBalanceClass}`).length).toBe(1)

  //   purchaseModule.setPurchaseStep(PurchaseStep.ApprovalPending)
  //   expect(wrapper.findAll(`.${createTokenClass}`).length).toBe(0)
  //   expect(wrapper.findAll(`.${marketTokenBalanceClass}`).length).toBe(1)

  //   purchaseModule.setPurchaseStep(PurchaseStep.PurchaseListing)
  //   expect(wrapper.findAll(`.${createTokenClass}`).length).toBe(0)
  //   expect(wrapper.findAll(`.${marketTokenBalanceClass}`).length).toBe(1)

  //   purchaseModule.setPurchaseStep(PurchaseStep.PurchasePending)
  //   expect(wrapper.findAll(`.${createTokenClass}`).length).toBe(0)
  //   expect(wrapper.findAll(`.${marketTokenBalanceClass}`).length).toBe(1)

  //   purchaseModule.setPurchaseStep(PurchaseStep.Complete)
  //   expect(wrapper.findAll(`.${createTokenClass}`).length).toBe(0)
  //   expect(wrapper.findAll(`.${marketTokenBalanceClass}`).length).toBe(1)
  // })

  it('conditionally renders the token creation step ', () => {

    wrapper = mount(Erc20TokenStep, {
      attachToDocument: true,
      store: appStore,
      localVue,
    })

    expect(wrapper.findAll(`.${erc20TokenClass}`).length).toBe(1)

    purchaseModule.setPurchaseStep(PurchaseStep.CreateToken)
    expect(wrapper.findAll(`.${createTokenClass}`).length).toBe(1)
    expect(wrapper.findAll(`.${marketTokenBalanceClass}`).length).toBe(0)

    purchaseModule.setPurchaseStep(PurchaseStep.TokenPending)
    expect(wrapper.findAll(`.${createTokenClass}`).length).toBe(1)
    expect(wrapper.findAll(`.${marketTokenBalanceClass}`).length).toBe(0)
  })

  it('correctly passes processing prop to the button', () => {

    wrapper = mount(Erc20TokenStep, {
      attachToDocument: true,
      store: appStore,
      localVue,
    })
    purchaseModule.setPurchaseStep(PurchaseStep.TokenPending)
    expect(wrapper.findAll(`.${createTokenClass}`).length).toBe(1)
    expect(wrapper.findAll(`.${marketTokenBalanceClass}`).length).toBe(0)
    expect(wrapper.contains(buttonIsClickableData)).toBe(false)
    expect(wrapper.findAll(`.${spinnerClass}`).length).toBe(1)
  })
})
