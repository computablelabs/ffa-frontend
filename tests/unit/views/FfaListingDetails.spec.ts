import { mount, createLocalVue } from '@vue/test-utils'
import VueRouter from 'vue-router'
import appStore from '../../../src/store'
import { getModule } from 'vuex-module-decorators'
import AppModule from '../../../src/vuexModules/AppModule'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faFile as faFileSolid } from '@fortawesome/free-solid-svg-icons'
import { faFile, faCheckCircle, faPlusSquare } from '@fortawesome/free-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faEthereum } from '@fortawesome/free-brands-svg-icons'
import FfaListingDetails from '../../../src/views/FfaListingDetails.vue'

const localVue = createLocalVue()
library.add(faFileSolid, faFile, faCheckCircle, faPlusSquare, faEthereum)

let appModule!: AppModule

const sectionId = 'listing-detail'
const messageClass = 'message'

describe('List.vue', () => {

  beforeAll(() => {
    localVue.use(VueRouter)
    localVue.component('FfaListingDetails', FfaListingDetails)
    localVue.component('font-awesome-icon', FontAwesomeIcon)
    appModule = getModule(AppModule, appStore)
  })

  it('renders the disconnect message', () => {
    appModule.setEthereumEnabled(false)
    const wrapper = mount(FfaListingDetails, {
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
    const wrapper = mount(FfaListingDetails, {
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
    expect(wrapper.findAll(`section#${sectionId}`).length).toBe(1)
    expect(wrapper.findAll(`section#${sectionId} .${messageClass}`).length).toBe(1)
    expect(
      wrapper.find(`section#${sectionId} .${messageClass}`)
      .text().indexOf('Ready')).toBeGreaterThanOrEqual(0)
  })
})
