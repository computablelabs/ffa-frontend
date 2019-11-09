import { mount, createLocalVue, Wrapper, shallowMount } from '@vue/test-utils'
import VueRouter from 'vue-router'
import { getModule } from 'vuex-module-decorators'

import appStore from '../../../../src/store'
import AppModule from '../../../../src/vuexModules/AppModule'
import { router } from '../../../../src/router'

import VotingDetails from '../../../../src/components/voting/VotingDetails.vue'

import EthereumLoader from '../../../../src/components/ui/EthereumLoader.vue'

import FfaListingsModule from '../../../../src/vuexModules/FfaListingsModule'
import DrawerModule, { DrawerState } from '../../../../src/vuexModules/DrawerModule'

import FfaListing, { FfaListingStatus } from '../../../../src/models/FfaListing'


// tslint:disable no-shadowed-variable
// tslint:disable max-line-length

const localVue = createLocalVue()

let appModule!: AppModule
let wrapper!: Wrapper<VotingDetails>
let ffaListingsModule!: FfaListingsModule
let drawerModule!: DrawerModule

describe('FfaCandidateView.vue', () => {

  beforeAll(() => {
    localVue.use(VueRouter)
    localVue.component('EthereumLoader', EthereumLoader)
    appModule = getModule(AppModule, appStore)
    ffaListingsModule = getModule(FfaListingsModule, appStore)
    drawerModule = getModule(DrawerModule, appStore)
  })

  afterAll(() => {
    wrapper.destroy()
  })

  describe('VotingDetails.vue', () => {
    it('renders the voting button disabled when the drawer is processing', () => {
      wrapper = shallowMount(VotingDetails, {
        attachToDocument: true,
        store: appStore,
        localVue,
        router,
        propsData: {
          listingHash: 'hash',
          listingStatus: FfaListingStatus.candidate,
          resolved: false,
          resolvesChallenge: false,
          yeaVotes: 1,
          nayVotes: 1,
          voteBy: 1000,
          plurality: 10,
          isVotingClosed: false,
          onVoteButtonClicked: () => (undefined),
          onResolveApplicationButtonClicked: () => (undefined),
          onResolveChallengeButtonClicked: () => (undefined),
        },
      })

      expect(wrapper.find('.voting-button button').attributes()).not.toHaveProperty('disabled')

      drawerModule.setDrawerState(DrawerState.processing)

      expect(wrapper.find('.voting-button button').attributes()).toHaveProperty('disabled')

      wrapper.setProps({ resolvesChallenge: true })
      drawerModule.setDrawerState(DrawerState.beforeProcessing)

      expect(wrapper.find('[data-resolve-challenge="true"]').attributes()).not.toHaveProperty('disabled')

      drawerModule.setDrawerState(DrawerState.processing)

      expect(wrapper.find('[data-resolve-challenge="true"]').attributes()).toHaveProperty('disabled')
    })
  })
})
