import { mount, createLocalVue, Wrapper } from '@vue/test-utils'

import appStore from '../../../../src/store'
import { getModule } from 'vuex-module-decorators'
import AppModule from '../../../../src/vuexModules/AppModule'
import Web3Module from '../../../../src/vuexModules/Web3Module'
import FfaListingsModule from '../../../../src/vuexModules/FfaListingsModule'

import ChallengeDrawer from '@/views/drawers/ChallengeDrawer.vue'

import VotingModule from '../../../../src/vuexModules/VotingModule'
import VueRouter from 'vue-router'

// tslint:disable no-shadowed-variable


let appModule!: AppModule
let web3Module!: Web3Module
let ffaListingsModule!: FfaListingsModule
let votingModule!: VotingModule

const listingHash = '0x123456'

describe('VotingDrawer.vue', () => {

  const localVue = createLocalVue()
  let wrapper!: Wrapper<ChallengeDrawer>

  beforeAll(() => {
    localVue.use(VueRouter)
    appModule = getModule(AppModule, appStore)
    web3Module = getModule(Web3Module, appStore)
    ffaListingsModule = getModule(FfaListingsModule, appStore)
    votingModule = getModule(VotingModule, appStore)

  })

  afterEach(() => {
    if (wrapper !== undefined) {
      wrapper.destroy()
    }
  })

  it('renders renders the challeng drawer view', () => {
    wrapper = mount(ChallengeDrawer, {
      attachToDocument: true,
      store: appStore,
      localVue,
    })

    expect(wrapper.find('.challenge-drawer-wrapper').exists()).toBeTruthy()
 })
})
