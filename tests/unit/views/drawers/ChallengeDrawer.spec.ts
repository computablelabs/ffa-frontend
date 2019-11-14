import { mount, createLocalVue, Wrapper } from '@vue/test-utils'

import appStore from '../../../../src/store'
import { getModule } from 'vuex-module-decorators'
import AppModule from '../../../../src/vuexModules/AppModule'

import ChallengeDrawer from '@/views/drawers/ChallengeDrawer.vue'

import ChallengeModule from '../../../../src/vuexModules/ChallengeModule'
import VueRouter from 'vue-router'

import { VotingActionStep } from '../../../../src/models/VotingActionStep'

import flushPromises from 'flush-promises'
// tslint:disable no-shadowed-variable

let appModule!: AppModule
let challengeModule!: ChallengeModule

const challengeDrawerWrapperClass = '.challenge-drawer-wrapper'
const votingApproveSpendingClass = '.voting-approve-spending'
const votingChallengeClass = '.voting-challenge'
const drawerMessageContainerClass = '.drawer-message-container'
const processButtonClass = '.process-button'
const blockchainExecutingMessageClass = '.blockchain-executing-message'

// TODO: improve these specs
describe('ChallengeDrawer.vue', () => {

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

    expect(wrapper.find(challengeDrawerWrapperClass).exists()).toBeTruthy()
 })

  it('renders the approval button', () => {

      wrapper = mount(ChallengeDrawer, {
        attachToDocument: true,
        store: appStore,
        localVue,
      })

      setAppParams()
      appModule.setAppReady(true)

      expect(wrapper.findAll(`${votingApproveSpendingClass} ${processButtonClass}`).length).toBe(1)
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
      expect(wrapper.findAll(`${votingChallengeClass} ${processButtonClass}`).length).toBe(1)
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
  appModule.setTotalMarketTokenSupply(1)
  appModule.setTotalReserveEtherTokenSupply(1)
  appModule.setEtherTokenReserveAllowance(1)
}
