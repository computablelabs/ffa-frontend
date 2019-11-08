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

  it ('wraps ETH, if needed', async () => {
    EtherTokenContractModule.deposit = () => Promise.resolve()
    EtherTokenContractModule.balanceOf = () => Promise.resolve('1000000000')
    PurchaseProcessModule.getPurchasePrice = () => 0

    wrapper = mount(PurchaseErc20TokenStep, {
      attachToDocument: true,
      store: appStore,
      localVue,
    })

    const wrapTokenButtonDiv = wrapper.find('.erc20-token .process-button')
    const wrapTokenButton = wrapper.find('a[data-is-clickable="true"]')
    console.log(wrapper.html())

    // Initiate wrapping transaction
    expect(purchaseModule.purchaseStep).toBe(PurchaseStep.CreateToken)
    expect(wrapTokenButtonDiv.vm.$props.clickable).toBeTruthy()

    wrapTokenButton.trigger('click')

    const minedProcessId = purchaseModule.erc20TokenMinedProcessId

    // create an event signifying mining finsihed
    getModule(PurchaseModule, appStore).setPurchaseStep(PurchaseStep.ApproveSpending)

    // purchase step is now to approve, button is no longer clickable
    expect(purchaseModule.purchaseStep).toBe(PurchaseStep.ApproveSpending)
    expect(wrapTokenButtonDiv.vm.$props.clickable).toBeFalsy()
  })
  // NOTE: Removed conditional rendering for now, instead made conditionally clickable
  // NOTE: Will interface with Reid moving forward

  // it('conditionally renders the market token ', () => {

  //   wrapper = mount(PurchaseErc20TokenStep, {
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

    wrapper = mount(PurchaseErc20TokenStep, {
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

    wrapper = mount(PurchaseErc20TokenStep, {
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
