import { shallowMount, createLocalVue, mount, Wrapper } from '@vue/test-utils'
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
const approveSpendingClass = 'voting-approve-spending'
const buttonContainerClass = 'voting-button-container'

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

    wrapper = mount(VotingProcess, {
      attachToDocument: true,
      store: appStore,
      localVue,
    })

    expect(wrapper.findAll(`.${containerClass}`).length).toBe(1)
    expect(wrapper.findAll(`.${errorClass}`).length).toBe(1)
  })

  it('renders approve spending', () => {
    votingModule.setVotingStep(VotingActionStep.ApproveSpending)
    appModule.setStake(1)
    appModule.setMarketTokenBalance(100)

    wrapper = mount(VotingProcess, {
      attachToDocument: true,
      store: appStore,
      localVue,
    })

    expect(wrapper.findAll(`.${approveSpendingClass}`).length).toBe(1)
  })

  it('renders vote', () => {
    votingModule.setVotingStep(VotingActionStep.VotingAction)
    appModule.setMarketTokenVotingContractAllowance(2)
    votingModule.setStake(1)

    wrapper = mount(VotingProcess, {
      attachToDocument: true,
      store: appStore,
      localVue,
    })

    // expect 2 buttons: accpet and reject
    // expect(wrapper.findAll(`.${buttonContainerClass}`).length).toBe(2)
  })
})
