import { createLocalVue, Wrapper, shallowMount } from '@vue/test-utils'
import { getModule } from 'vuex-module-decorators'
import VueRouter from 'vue-router'

import appStore from '../../../../src/store'

import { Labels } from '../../../../src/util/Constants'

import VerticalSubway from '@/components/voting/VerticalSubway.vue'

import { FfaListingStatus } from '../../../../src/models/FfaListing'

import VotingContractModule from '../../../../src/functionModules/protocol/VotingContractModule'

import VotingModule from '../../../../src/vuexModules/VotingModule'

// tslint:disable no-shadowed-variable
const localVue = createLocalVue()
localVue.use(VueRouter)
let wrapper!: Wrapper<VerticalSubway>
let votingModule: VotingModule

describe('VerticalSubway.vue', () => {
  beforeAll(() => {
    localVue.use(VueRouter)
    VotingContractModule.didPass = jest.fn(() => ( Promise.resolve(false)))

    votingModule = getModule(VotingModule, appStore)

    wrapper = shallowMount(VerticalSubway, {
      attachToDocument: true,
      store: appStore,
      localVue,
    })

  })

  it('renders subcomponents correctly', () => {
    expect(wrapper.findAll('subwayitem-stub').length).toEqual(5)
    expect(wrapper.findAll('votingdetails-stub').length).toEqual(1)
  })

  it('renders correctly when challenged', () => {
    wrapper.setProps({ isUnderChallenge: true })
    expect(wrapper.findAll('subwayitem-stub').length).toEqual(6)

    expect(wrapper.findAll('subwayitem-stub').length).toEqual(6)
    expect(wrapper.findAll('votingdetails-stub').length).toEqual(2)
  })

  it('renders the correct voting result', () => {
    wrapper.setProps({
      isVotingClosed: true,
      listingStatus: FfaListingStatus.candidate,
    })

    votingModule.setListingDidPass(true)
    expect(wrapper.find('.subway-result-message').text()).toEqual(Labels.SUBWAY_LISTED)

    wrapper.setProps({ listingStatus: FfaListingStatus.candidate })
    votingModule.setListingDidPass(false)

    expect(wrapper.find('.subway-result-message').text()).toEqual(Labels.SUBWAY_REJECTED)
  })
})
