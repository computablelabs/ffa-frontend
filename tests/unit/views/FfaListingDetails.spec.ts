import { mount, createLocalVue, Wrapper } from '@vue/test-utils'
import VueRouter from 'vue-router'
import appStore from '../../../src/store'
import { getModule } from 'vuex-module-decorators'
import AppModule from '../../../src/vuexModules/AppModule'

import FfaListingDetails from '../../../src/views/FfaListingDetails.vue'

const localVue = createLocalVue()

let appModule!: AppModule

const sectionId = 'listing-detail'
const messageClass = 'message'

describe('List.vue', () => {

  let wrapper: Wrapper<FfaListingDetails>

  beforeAll(() => {
    localVue.use(VueRouter)
    localVue.component('FfaListingDetails', FfaListingDetails)
    appModule = getModule(AppModule, appStore)
  })

  afterEach(() => {
    wrapper.destroy()
  })

  it('renders the disconnect message', () => {
    appModule.setAppReady(false)
    wrapper = mount(FfaListingDetails, {
      attachToDocument: true,
      store: appStore,
      localVue,
    })
    expect(wrapper.findAll(`section#${sectionId}`).length).toBe(1)
    expect(wrapper.findAll(`section#${sectionId} .${messageClass}`).length).toBe(1)
    expect(
      wrapper.find(`section#${sectionId} .${messageClass}`)
      .text().indexOf('Connecting')).toBeGreaterThanOrEqual(0)
  })

  it('renders the connect message', async () => {
    wrapper = mount(FfaListingDetails, {
      attachToDocument: true,
      store: appStore,
      localVue,
    })
    appModule.setMakerPayment(1)
    appModule.setCostPerByte(1)
    appModule.setStake(1)
    appModule.setPriceFloor(1)
    appModule.setPlurality(1)
    appModule.setVoteBy(1)
    appModule.setMarketTokenBalance(10)
    appModule.setEtherTokenBalance(1)
    appModule.setDatatrustContractAllowance(1)
    appModule.setSupportPrice(1)

    expect(wrapper.findAll(`section#${sectionId}`).length).toBe(1)
    expect(wrapper.findAll(`section#${sectionId} .${messageClass}`).length).toBe(1)
    expect(
      wrapper.find(`section#${sectionId} .${messageClass}`)
      .text().indexOf('Ready')).toBeGreaterThanOrEqual(0)
  })
})
