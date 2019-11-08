import { mount, createLocalVue, Wrapper } from '@vue/test-utils'

import appStore from '../../../../src/store'
import { getModule } from 'vuex-module-decorators'
import AppModule from '../../../../src/vuexModules/AppModule'
import FfaListingsModule from '../../../../src/vuexModules/FfaListingsModule'

import ChallengeDrawer from '@/views/drawers/ChallengeDrawer.vue'

import VotingModule from '../../../../src/vuexModules/VotingModule'
import ChallengeModule from '../../../../src/vuexModules/ChallengeModule'
import VueRouter from 'vue-router'
import MarketTokenContractModule from '../../../../src/functionModules/protocol/MarketTokenContractModule'

import { VotingActionStep } from '../../../../src/models/VotingActionStep'

import flushPromises from 'flush-promises'
// tslint:disable no-shadowed-variable


let appModule!: AppModule
let challengeModule!: ChallengeModule

const listingHash = '0x123456'

describe('VotingDrawer.vue', () => {

  const localVue = createLocalVue()
  let wrapper!: Wrapper<ChallengeDrawer>

  beforeAll(() => {
    localVue.use(VueRouter)
    appModule = getModule(AppModule, appStore)
    appModule.initializeWeb3('http://localhost:8545')
    challengeModule = getModule(ChallengeModule, appStore)
    setAppParams()
  })

  afterEach(() => {
    if (wrapper !== undefined) {
      wrapper.destroy()
    }
  })

  it('renders renders the challenge drawer view', () => {
    wrapper = mount(ChallengeDrawer, {
      attachToDocument: true,
      store: appStore,
      localVue,
    })

    expect(wrapper.find('.challenge-drawer-wrapper').exists()).toBeTruthy()
 })

  it('renders the approval button', () => {

      wrapper = mount(ChallengeDrawer, {
        attachToDocument: true,
        store: appStore,
        localVue,
      })

      setAppParams()
      appModule.setAppReady(true)

      // Should allow staking
      expect(wrapper.findAll('.process-button').length).toBe(2)
      expect(wrapper.find('.process-button').text()).toBe('Approve Spending')
  })

  it('renders the challenge button', async () => {

      appModule.setMarketTokenVotingContractAllowance(1000)
      appModule.setAppReady(true)

      wrapper = mount(ChallengeDrawer, {
        attachToDocument: true,
        store: appStore,
        localVue,
      })
      challengeModule.setChallengeStep(VotingActionStep.VotingAction)

      await flushPromises()
      console.log(wrapper.html())
      expect(wrapper.findAll('.process-button').length).toBe(1)
      expect(wrapper.find('.process-button').text()).toBe('Challenge Listing')
  })
})

function setAppParams() {
  appModule.setMakerPayment(1)
  appModule.setCostPerByte(1)
  appModule.setStake(100)
  appModule.setPriceFloor(1)
  appModule.setPlurality(1)
  appModule.setVoteBy(1)
  appModule.setEtherTokenDatatrustAllowance(1)
  appModule.setMarketTokenVotingContractAllowance(0)
  appModule.setEtherTokenReserveAllowance(1)
}
