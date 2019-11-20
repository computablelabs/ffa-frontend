import { shallowMount, createLocalVue, Wrapper } from '@vue/test-utils'
import VueRouter from 'vue-router'
import { getModule } from 'vuex-module-decorators'
import appStore from '../../../../src/store'
import AppModule from '../../../../src/vuexModules/AppModule'
import VotingModule from '../../../../src/vuexModules/VotingModule'

import { VotingActionStep } from '../../../../src/models/VotingActionStep'

import VotingProcess from '../../../../src/components/voting/VotingProcess.vue'

const localVue = createLocalVue()
localVue.use(VueRouter)
const containerClass = 'voting-drawer-container'
const errorClass = 'voting-error'

describe('VotingProcess.vue', () => {

  const appModule = getModule(AppModule, appStore)
  const votingModule = getModule(VotingModule, appStore)
  let wrapper!: Wrapper<VotingProcess>

  beforeAll(() => {
    localVue.use(VueRouter)
  })

  afterEach(() => {
    wrapper.destroy()
  })

  it('renders error', () => {
    votingModule.setVotingStep(VotingActionStep.Error)
    appModule.setStake(1)
    appModule.setMarketTokenBalance(0)

    wrapper = shallowMount(VotingProcess, {
      attachToDocument: true,
      store: appStore,
      localVue,
    })

    expect(wrapper.findAll(`.${containerClass}`).length).toBe(1)
    expect(wrapper.findAll(`.${errorClass}`).length).toBe(1)
  })

  it('renders sub-components correctly', () => {
    votingModule.setVotingStep(VotingActionStep.ApproveSpending)
    appModule.setStake(1)
    appModule.setMarketTokenBalance(100)

    wrapper = shallowMount(VotingProcess, {
      attachToDocument: true,
      store: appStore,
      localVue,
    })

    expect(wrapper.find('votingapprovespendingstep-stub').exists()).toBe(true)
    expect(wrapper.findAll(`castvotestep-stub`).exists()).toBe(true)
  })
})
