import { createLocalVue, Wrapper, shallowMount } from '@vue/test-utils'
import VueRouter from 'vue-router'
import { getModule } from 'vuex-module-decorators'
import AppModule from '../../../../src/vuexModules/AppModule'
import VotingModule from '../../../../src/vuexModules/VotingModule'

import appStore from '../../../../src/store'
import { router } from '../../../../src/router'

import VotingDetails from '../../../../src/components/voting/VotingDetails.vue'
import EthereumLoader from '../../../../src/components/ui/EthereumLoader.vue'

import DrawerModule, { DrawerState } from '../../../../src/vuexModules/DrawerModule'

import { FfaListingStatus } from '../../../../src/models/FfaListing'


// tslint:disable no-shadowed-variable
// tslint:disable max-line-length

const localVue = createLocalVue()

let wrapper!: Wrapper<VotingDetails>
let drawerModule!: DrawerModule
const appModule = getModule(AppModule, appStore)
const votingModule = getModule(VotingModule, appStore)

describe('VotingDetails.vue', () => {

  beforeAll(() => {
    localVue.use(VueRouter)
    localVue.component('EthereumLoader', EthereumLoader)
    drawerModule = getModule(DrawerModule, appStore)

    appModule.setMarketTokenBalance(5000)
    votingModule.setStake(1000)

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
        onPreviewButtonClicked: () => (undefined),
        onResolveApplicationButtonClicked: () => (undefined),
        onResolveChallengeButtonClicked: () => (undefined),
      },
    })
  })

  afterAll(() => {
    wrapper.destroy()
  })

  describe('VotingDetails.vue', () => {

    it('shows the voting & preview buttons when user has enough CMT', () => {
      expect(wrapper.findAll('.voting-button .button').length).toBe(3)
    })

    it('hides the voting & preview buttons when user lacks CMT', () => {
      appModule.setMarketTokenBalance(0)
      votingModule.setStake(5000)

      expect(wrapper.findAll('.voting-button .button').length).toBe(1)
    })

    it('renders the voting button disabled when the drawer is processing', () => {
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

  // describe('VotingDetails.vue', () => {

  //   describe('VotingDetailsBar.vue', () => {
  //     const candidate = new FfaListing(
  //       'title0',
  //       'description0',
  //       'type0',
  //       'hash0',
  //       'md50',
  //       'MIT',
  //       5,
  //       '0xwall3t',
  //       [],
  //       FfaListingStatus.candidate,
  //       121,
  //       1)

  //     it('renders percentages correctly', () => {

  //       const wrapper = mount(VotingDetails, {
  //         attachToDocument: true,
  //         store: appStore,
  //         localVue,
  //         propsData: {
  //           yeaVotes: acceptVotes,
  //           nayVotes: rejectVotes,
  //           plurality,
  //           candidate,
  //           onVoteButtonClicked,
  //           onResolveApplicationButtonClicked,
  //           onResolveChallengeButtonClicked,
  //         },
  //       })
  //       const [ acceptHtml, rejectHtml ] = [wrapper.find(acceptDataAttribute), wrapper.find(rejectDataAttribute)]
  //       expect(acceptHtml.text()).toBe(`${acceptVotes} Yes votes (${acceptPercentageString}%)`)
  //       expect(rejectHtml.text()).toBe(`${rejectVotes} No votes (${rejectPercentageString}%)`)
  //     })
  //   })

  //   describe('VotingDetailsIndex.vue', () => {
  //     it('renders votes correctly', () => {
  //       const wrapper = mount(VotingDetailsIndex, {
  //         attachToDocument: true,
  //         store: appStore,
  //         localVue,
  //         propsData: {
  //           yeaVotes: acceptVotes,
  //           nayVotes: rejectVotes,
  //           plurality,
  //           onVoteButtonClicked,
  //           onResolveApplicationButtonClicked,
  //           onResolveChallengeButtonClicked,
  //         },
  //       })
  //       expect(wrapper.find('.votes-info').text()).toBe(`${acceptVotes} Accept Votes`)
  //       wrapper.setProps({ yeaVotes: undefined, nayVotes: rejectVotes})
  //       expect(wrapper.find('.votes-info').text()).toBe(`${rejectVotes} Reject Votes`)
  //     })
  //   })
  // })
})
