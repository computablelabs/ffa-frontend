import { mount, createLocalVue, Wrapper } from '@vue/test-utils'
import { Store } from 'vuex'

import appStore from '../../../../src/store'
import { getModule } from 'vuex-module-decorators'
import AppModule from '../../../../src/vuexModules/AppModule'
import Web3Module from '../../../../src/vuexModules/Web3Module'
import FfaListingsModule from '../../../../src/vuexModules/FfaListingsModule'

import FfaListing, { FfaListingStatus } from '../../../../src/models/FfaListing'

import VotingDrawer from '@/views/drawers/VotingDrawer.vue'

import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faGavel, faTimesCircle } from '@fortawesome/free-solid-svg-icons'

import VotingModule from '../../../../src/vuexModules/VotingModule'
import VueRouter from 'vue-router'
import { TransactOpts } from '@computable/computablejs/dist/interfaces'

import Web3 from 'Web3'
import VotingContractModule from '../../../../src/functionModules/protocol/VotingContractModule'
import MarketTokenContractModule from '../../../../src/functionModules/protocol/MarketTokenContractModule'
import { Config } from '../../../../src/util/Config'

// tslint:disable no-shadowed-variable

library.add(faGavel, faTimesCircle)

let appModule!: AppModule
let web3Module!: Web3Module
let ffaListingsModule!: FfaListingsModule
let votingModule!: VotingModule

const listingHash = '0x123456'
const listing = new FfaListing(
  'title',
  'description',
  'type',
  listingHash,
  'md5',
  'license',
  10,
  '0xwallet',
  [],
  FfaListingStatus.listed,
  10,
  10)

describe('VotingDrawer.vue', () => {

  const localVue = createLocalVue()
  let wrapper!: Wrapper<VotingDrawer>

  beforeAll(() => {
    localVue.use(VueRouter)
    appModule = getModule(AppModule, appStore)
    web3Module = getModule(Web3Module, appStore)
    ffaListingsModule = getModule(FfaListingsModule, appStore)
    votingModule = getModule(VotingModule, appStore)

    localVue.component('font-awesome-icon', FontAwesomeIcon)
  })

  afterEach(() => {
    if (wrapper !== undefined) {
      wrapper.destroy()
    }
  })

  it('renders VotingDrawer view', () => {
    wrapper = mount(VotingDrawer, {
      attachToDocument: true,
      store: appStore,
      localVue,
    })

    expect(wrapper.findAll('.voting-drawer-wrapper').length).toBe(1)
    expect(wrapper.findAll('.comment-box').length).toBe(1)
    expect(wrapper.findAll('.voting-interface-button').length).toBe(2)
  })

  // it('reacts properly to an accept vote', async () => {
  //   wrapper = mount(VotingDrawer, {
  //     attachToDocument: true,
  //     store: appStore,
  //     localVue,
  //   })

  //   const type = '1'
  //   const owner = listingHash
  //   const stake = '10000000000000000'
  //   const voteBy = '10'
  //   const yeaVotes = '2'
  //   const nayVotes = '4'

  //   VotingContractModule.vote = (
  //     votesYes: boolean,
  //     listingHash: string,
  //     account: string,
  //     appStore: Store<any>,
  //     success: (
  //       response: any,
  //       appStore: Store<any>) => void,
  //     transactOpts: TransactOpts): Promise<void> => {
  //     return Promise.resolve()
  //   }


  //   VotingContractModule.getCandidate = (
  //     listingHash: string,
  //     account: string,
  //     web3: Web3): Promise<object> => {

  //     return Promise.resolve(
  //       {0: type,
  //       1: owner,
  //       2: stake,
  //       3: voteBy,
  //       4: yeaVotes,
  //       5: nayVotes,
  //       out: '0'})
  //   }

  //   Config.BlockchainWaitTime = 100

  //   votingModule.setCandidate(listing)

  //   VotingContractModule.getStake = (
  //     listingHash: string,
  //     account: string,
  //     web3: Web3): Promise<number> => {
  //     return Promise.resolve(10000000000000000)
  //   }

  //   MarketTokenContractModule.getBalance = (
  //     account: string,
  //     web3: Web3,
  //     transactOpts: TransactOpts): Promise<string> => {
  //       return Promise.resolve('10')
  //   }

  //   MarketTokenContractModule.allowance = (
  //     account: string,
  //     web3: Web3,
  //     owner: string,
  //     spender: string): Promise<string> => {
  //       return Promise.resolve('10000000000000000')
  //   }

  //   const accept = wrapper.findAll('.voting-interface-button').at(0)
  //   const reject = wrapper.findAll('.voting-interface-button').at(1)
  //   accept.trigger('click')
  //   await wait(1.5 * Config.BlockchainWaitTime)
  //   console.log(wrapper.html())

  // })
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

function wait(ms: number): Promise<any> {
  return new Promise( (resolve) => setTimeout(resolve, ms) )
}
