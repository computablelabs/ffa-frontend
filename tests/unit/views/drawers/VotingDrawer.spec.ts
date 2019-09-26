import { mount, createLocalVue, Wrapper } from '@vue/test-utils'

import appStore from '../../../../src/store'
import { getModule } from 'vuex-module-decorators'
import AppModule from '../../../../src/vuexModules/AppModule'
import Web3Module from '../../../../src/vuexModules/Web3Module'
import FfaListingsModule from '../../../../src/vuexModules/FfaListingsModule'

import FfaListing, { FfaListingStatus } from '../../../../src/models/FfaListing'

import VotingDrawer from '@/views/drawers/VotingDrawer.vue'

import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faGavel, faTimesCircle } from '@fortawesome/free-solid-svg-icons'

import VotingModule from '../../../../src/vuexModules/VotingModule'
import VueRouter from 'vue-router'

// tslint:disable no-shadowed-variable

library.add(faGavel, faTimesCircle)

let appModule!: AppModule
let web3Module!: Web3Module
let ffaListingsModule!: FfaListingsModule
let votingModule!: VotingModule

const listingHash = '0x123456'

describe('VotingDrawer.vue', () => {

  const localVue = createLocalVue()
  let wrapper!: Wrapper<VotingDrawer>

  beforeAll(() => {
    localVue.use(VueRouter)
    appModule = getModule(AppModule, appStore)
    web3Module = getModule(Web3Module, appStore)
    ffaListingsModule = getModule(FfaListingsModule, appStore)
    votingModule = getModule(VotingModule, appStore)

    localVue.component('font-awesome-icon', FontAwesomeIcon)
  })

  afterEach(() => {
    if (wrapper !== undefined) {
      wrapper.destroy()
    }
  })

  it('renders VotingDrawer view', () => {
    wrapper = mount(VotingDrawer, {
      attachToDocument: true,
      store: appStore,
      localVue,
    })

    expect(wrapper.findAll('.voting-drawer-wrapper').length).toBe(1)
    expect(wrapper.findAll('.comment-box').length).toBe(1)
    expect(wrapper.findAll('.voting-interface-button').length).toBe(2)
  })
})
