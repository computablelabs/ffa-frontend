import { createLocalVue, Wrapper, shallowMount } from '@vue/test-utils'
import { getModule } from 'vuex-module-decorators'
import VueRouter from 'vue-router'

import appStore from '../../../../src/store'

import VotingChallengeStep from '@/components/voting/VotingChallengeStep.vue'

import VotingModule from '../../../../src/vuexModules/VotingModule'

// tslint:disable no-shadowed-variable
const localVue = createLocalVue()
localVue.use(VueRouter)
let wrapper!: Wrapper<VotingChallengeStep>
let votingModule: VotingModule

describe('VerticalSubway.vue', () => {
  beforeAll(() => {
    localVue.use(VueRouter)
    votingModule = getModule(VotingModule, appStore)

    wrapper = shallowMount(VotingChallengeStep, {
      attachToDocument: true,
      store: appStore,
      localVue,
    })
  })

  it('renders subcomponents correctly', () => {
    expect(wrapper.findAll('drawerblockchainstep-stub').length).toBe(1)
  })
})
