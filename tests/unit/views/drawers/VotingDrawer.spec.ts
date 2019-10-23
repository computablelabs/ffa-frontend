import { mount, createLocalVue, Wrapper } from '@vue/test-utils'

import appStore from '../../../../src/store'
import { getModule } from 'vuex-module-decorators'
import AppModule from '../../../../src/vuexModules/AppModule'
import FfaListingsModule from '../../../../src/vuexModules/FfaListingsModule'

import VotingDrawer from '@/views/drawers/VotingDrawer.vue'

import VotingModule from '../../../../src/vuexModules/VotingModule'
import VueRouter from 'vue-router'

// tslint:disable no-shadowed-variable

let appModule!: AppModule
let ffaListingsModule!: FfaListingsModule
let votingModule!: VotingModule

const listingHash = '0x123456'

describe('VotingDrawer.vue', () => {

  const localVue = createLocalVue()
  let wrapper!: Wrapper<VotingDrawer>

  beforeAll(() => {
    localVue.use(VueRouter)
    appModule = getModule(AppModule, appStore)
    ffaListingsModule = getModule(FfaListingsModule, appStore)
    votingModule = getModule(VotingModule, appStore)
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
