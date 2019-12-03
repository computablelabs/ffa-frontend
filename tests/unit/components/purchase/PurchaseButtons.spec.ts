import { mount, createLocalVue, Wrapper } from '@vue/test-utils'
import { getModule } from 'vuex-module-decorators'
import VueRouter from 'vue-router'

import appStore from '../../../../src/store'

import PurchaseButtons from '../../../../src/components/purchase/PurchaseButtons.vue'
import PurchaseModule from '../../../../src/vuexModules/PurchaseModule'

import { ProcessStatus } from '../../../../src/models/ProcessStatus'
import { Labels } from '../../../../src/util/Constants'

const localVue = createLocalVue()
const spinnerClass = 'is-loading'

let wrapper!: Wrapper<PurchaseButtons>
let purchaseModule!: PurchaseModule

afterEach(() => {
  wrapper.destroy()
})

describe('ProcessButton.vue', () => {

  beforeAll(() => {
    localVue.use(VueRouter)

    purchaseModule = getModule(PurchaseModule, appStore)

    wrapper = mount(PurchaseButtons, {
      attachToDocument: true,
      store: appStore,
      localVue,
    })
  })

  afterAll(() => { wrapper.destroy() })

  it('renders correctly', () => {

    expect(wrapper.find('.purchase-buttons').exists()).toBeTruthy()
    expect(wrapper.find(`.purchase-buttons`).classes()).not.toContain(spinnerClass)
  })

  it('sets the right purchase status when clicked', () => {
    wrapper.find('a.button').trigger('click')
    expect(purchaseModule.status).toBe(ProcessStatus.Executing)
  })

  it('computes the right actionButtonText', () => {
    purchaseModule.setStatus(ProcessStatus.Complete)
    // @ts-ignore
    expect(wrapper.vm.actionButtonText).toBe(Labels.DOWNLOAD)

    purchaseModule.setStatus(ProcessStatus.Ready)
    // @ts-ignore
    expect(wrapper.vm.actionButtonText).toBe(Labels.PURCHASE)
  })

})
