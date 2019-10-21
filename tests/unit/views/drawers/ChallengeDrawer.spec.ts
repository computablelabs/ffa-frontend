import { mount, createLocalVue, Wrapper } from '@vue/test-utils'

import appStore from '../../../../src/store'
import { getModule } from 'vuex-module-decorators'
import AppModule from '../../../../src/vuexModules/AppModule'
import Web3Module from '../../../../src/vuexModules/Web3Module'
import FfaListingsModule from '../../../../src/vuexModules/FfaListingsModule'

import ChallengeDrawer from '@/views/drawers/ChallengeDrawer.vue'

import VotingModule from '../../../../src/vuexModules/VotingModule'
import ChallengeModule from '../../../../src/vuexModules/ChallengeModule'
import VueRouter from 'vue-router'
import MarketTokenContractModule from '../../../../src/functionModules/protocol/MarketTokenContractModule'
import { ChallengeStep } from '../../../../src/models/ChallengeStep'

import flushPromises from 'flush-promises'
// tslint:disable no-shadowed-variable


let appModule!: AppModule
let challengeModule!: ChallengeModule
let web3Module!: Web3Module
let ffaListingsModule!: FfaListingsModule
let votingModule!: VotingModule

const listingHash = '0x123456'

describe('VotingDrawer.vue', () => {

  const localVue = createLocalVue()
  let wrapper!: Wrapper<ChallengeDrawer>

  beforeAll(() => {
    localVue.use(VueRouter)
    appModule = getModule(AppModule, appStore)
    web3Module = getModule(Web3Module, appStore)
    ffaListingsModule = getModule(FfaListingsModule, appStore)
    votingModule = getModule(VotingModule, appStore)
    challengeModule = getModule(ChallengeModule, appStore)

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

  it('renders renders the allow staking button conditionally', () => {
      MarketTokenContractModule.balanceOf = () => Promise.resolve('1000000000000000000')
      MarketTokenContractModule.allowance = () => Promise.resolve('0')

      wrapper = mount(ChallengeDrawer, {
        attachToDocument: true,
        store: appStore,
        localVue,
      })

      setAppParams()
      appModule.setAppReady(true)

      // Should allow staking
      expect(wrapper.findAll('.process-button').length).toBe(1)
      expect(wrapper.find('.process-button').text()).toBe('Allow Staking')
  })

  it('renders the challenge stake button conditionally', async () => {
      MarketTokenContractModule.balanceOf = () => Promise.resolve('1000000000000000000')
      MarketTokenContractModule.allowance = () => Promise.resolve('1000')
      appModule.setAppReady(true)

      wrapper = mount(ChallengeDrawer, {
        attachToDocument: true,
        store: appStore,
        localVue,
      })
      await flushPromises()

      expect(wrapper.findAll('.process-button').length).toBe(1)
      expect(wrapper.find('.process-button').text()).toBe('Challenge Listing')
  })
})

function setAppParams() {
  appModule.setMakerPayment(1)
  appModule.setCostPerByte(1)
  appModule.setStake(1)
  appModule.setPriceFloor(1)
  appModule.setPlurality(1)
  appModule.setVoteBy(1)
  appModule.setDatatrustContractAllowance(1)
}
