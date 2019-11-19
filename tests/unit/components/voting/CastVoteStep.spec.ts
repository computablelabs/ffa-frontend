import { createLocalVue, Wrapper, shallowMount } from '@vue/test-utils'
import { getModule } from 'vuex-module-decorators'
import VueRouter from 'vue-router'

import appStore from '../../../../src/store'

import { Labels } from '../../../../src/util/Constants'

import CastVoteStep from '@/components/voting/CastVoteStep.vue'

import { FfaListingStatus } from '../../../../src/models/FfaListing'
import { VotingActionStep } from '../../../../src/models/VotingActionStep'

import VotingContractModule from '../../../../src/functionModules/protocol/VotingContractModule'

import VotingModule from '../../../../src/vuexModules/VotingModule'

// tslint:disable no-shadowed-variable
const localVue = createLocalVue()
localVue.use(VueRouter)
let wrapper!: Wrapper<CastVoteStep>
let votingModule: VotingModule

describe('VerticalSubway.vue', () => {
  beforeAll(() => {
    localVue.use(VueRouter)
    votingModule = getModule(VotingModule, appStore)

    wrapper = shallowMount(CastVoteStep, {
      attachToDocument: true,
      store: appStore,
      localVue,
    })
  })

  it('renders subcomponents correctly', () => {
    votingModule.setVotingStep(VotingActionStep.VotingAction)

    expect(wrapper.findAll('drawerblockchainstep-stub').length).toBe(2)

    votingModule.setVotingStep(VotingActionStep.ApprovalPending)

    expect(wrapper.findAll('drawerblockchainstep-stub').length).toBe(1)
  })
})
