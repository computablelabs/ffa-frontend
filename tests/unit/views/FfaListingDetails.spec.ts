import { mount, createLocalVue, Wrapper } from '@vue/test-utils'
import VueRouter from 'vue-router'
import appStore from '../../../src/store'
import { getModule } from 'vuex-module-decorators'
import AppModule from '../../../src/vuexModules/AppModule'

import FfaListingDetails from '../../../src/views/FfaListingDetails.vue'

const localVue = createLocalVue()

let appModule!: AppModule

const sectionId = 'listing-detail'
const ethLoadingClass = '.loading-root'

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
    expect(wrapper.findAll(`section#${sectionId} ${ethLoadingClass}`).length).toBe(1)
  })
})
