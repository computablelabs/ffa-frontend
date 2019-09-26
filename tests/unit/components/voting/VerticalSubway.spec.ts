import { createLocalVue, mount } from '@vue/test-utils'
import VueRouter from 'vue-router'
import SubwayItem from '@/components/voting/SubwayItem.vue'
import VerticalSubway from '../../../../src/components/voting/VerticalSubway.vue'

import appStore from '../../../../src/store'
import VotingDetails from '@/components/voting/VotingDetails.vue'
import VotingDetailsIndex from '@/components/voting/VotingDetailsIndex.vue'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faExclamationCircle, faBars, faDotCircle } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import FfaListing, { FfaListingStatus } from '../../../../src/models/FfaListing'
import { VueConstructor } from 'vue'
import VotingProcessModule from '../../../../src/functionModules/components/VotingProcessModule'
import PurchaseProcessModule from '../../../../src/functionModules/components/PurchaseProcessModule'

import { TransactOpts } from '@computable/computablejs/dist/interfaces'

import Web3 from 'Web3'
import VotingContractModule from '../../../../src/functionModules/protocol/VotingContractModule'
import MarketTokenContractModule from '../../../../src/functionModules/protocol/MarketTokenContractModule'
import { Config } from '../../../../src/util/Config'
import { getModule } from 'vuex-module-decorators'
import VotingModule from '../../../../src/vuexModules/VotingModule'
import FfaListingsModule from '../../../../src/vuexModules/FfaListingsModule'
import TokenFunctionModule from '../../../../src/functionModules/token/TokenFunctionModule'

const localVue = createLocalVue()
localVue.use(VueRouter)
library.add(faExclamationCircle, faBars, faDotCircle)

const calcPercent = (partial: number, total: number): string => (
  (partial / total * 100).toFixed(1).toString()
)

const subwayItemWrapperTopClass = '.subway-item-top'
const subwayItemContainerTopClass = '.subway-item-container-top'
const subwayIconTopClass = '.subway-icon-top'
const subwayItemWrapperBottomClass = '.subway-item-bottom'
const subwayItemContainerBottomClass = '.subway-item-container-bottom'
const subwayIconBottomClass = '.subway-icon-bottom'

const acceptDataAttribute = 'span[data-vote-type="accept"]'
const rejectDataAttribute = 'span[data-vote-type="reject"]'
const acceptVotes = 125
const rejectVotes = 69
const passPercentage = 69
const totalVotes = acceptVotes + rejectVotes
const acceptPercentageString = calcPercent(acceptVotes, totalVotes)
const rejectPercentageString = calcPercent(rejectVotes, totalVotes)

const listingHash = '0x306725200a6E0D504A7Cc9e2d4e63A492C72990d'

let votingModule!: VotingModule
let ffaListingsModule!: FfaListingsModule

describe('VerticalSubway.vue', () => {
    beforeAll(() => {
      localVue.use(VueRouter)
      localVue.component('font-awesome-icon', FontAwesomeIcon)
      votingModule = getModule(VotingModule, appStore)
    })
    // const type = '1'
    // const owner = listingHash
    // const stake = '10000000000000000'
    // const voteBy = '10'
    // const yeaVotes = '2'
    // const nayVotes = '4'
    // const convertedStake = TokenFunctionModule.weiConverter(Number(stake))

    // const candidate = new FfaListing(
    //   'title0',
    //   'description0',
    //   'type0',
    //   listingHash,
    //   'md50',
    //   'MIT',
    //   5,
    //   '0xwall3t',
    //   [],
    //   FfaListingStatus.candidate,
    //   121,
    //   1)

    // describe('VerticalSubway.vue', () => {
    //   it('reacts to changes in candidate detail, staked, CMT balance properly', async () => {
    //     // votingModule.setCandidate(candidate)

    //     VotingContractModule.getCandidate = (
    //       listingHash: string,
    //       account: string,
    //       web3: Web3): Promise<object> => {

    //       return Promise.resolve(
    //         {0: type,
    //         1: owner,
    //         2: stake,
    //         3: voteBy,
    //         4: yeaVotes,
    //         5: nayVotes,
    //         out: '0'})
    //     }
    //     // Config.BlockchainWaitTime = 100


    //     // On Voting tx success + wait
    //     VotingContractModule.getStake = (
    //       listingHash: string,
    //       account: string,
    //       web3: Web3): Promise<number> => {
    //       return Promise.resolve(10000000000000000)
    //     }

    //     MarketTokenContractModule.getBalance = (
    //       account: string,
    //       web3: Web3,
    //       transactOpts: TransactOpts): Promise<string> => {
    //         return Promise.resolve('10')
    //     }

    //     MarketTokenContractModule.allowance = (
    //       account: string,
    //       web3: Web3,
    //       owner: string,
    //       spender: string): Promise<string> => {
    //         return Promise.resolve('10000000000000000')
    //     }

    //     // Created Hook
    //     VotingContractModule.didPass = (
    //       listingHash: string,
    //       plurality: number,
    //       account: string,
    //       web3: Web3,
    //       transactOpts: TransactOpts): Promise<boolean> => {
    //         return Promise.resolve(true)
    //     }

    //     const wrapper = mount(VerticalSubway, {
    //       attachToDocument: true,
    //       store: appStore,
    //       localVue,
    //       propsData: {
    //         votingFinished: false,
    //         plurality: 50,
    //         candidate,
    //       },
    //     })


    //     await Promise.all([
    //       VotingProcessModule.updateCandidateDetails(appStore),
    //       VotingProcessModule.updateStaked(appStore),
    //       PurchaseProcessModule.updateMarketTokenBalance(appStore),
    //     ])
    //     const votesArray = wrapper.findAll('.votes-info')
    //     const acceptVotes = votesArray.at(0)
    //     const rejectVotes = votesArray.at(1)
    //     console.log(ffa)

    //   })
    // })

    describe('SubwayItem.vue', () => {
      const wrapper = mount(SubwayItem, {
        attachToDocument: true,
        store: appStore,
        localVue,
        propsData: { isIconTop: true },
      })
      expect(wrapper.findAll(`${subwayItemWrapperTopClass}`).length).toBe(1)
      expect(wrapper.findAll(`${subwayItemContainerTopClass}`).length).toBe(1)
      expect(wrapper.findAll(`${subwayIconTopClass}`).length).toBe(1)

      wrapper.setProps({isIconTop: false})

      expect(wrapper.findAll(`${subwayItemWrapperBottomClass}`).length).toBe(1)
      expect(wrapper.findAll(`${subwayItemContainerBottomClass}`).length).toBe(1)
      expect(wrapper.findAll(`${subwayIconBottomClass}`).length).toBe(1)
    })

    describe('VotingDetails.vue', () => {

    // beforeAll(() => {
    //   localVue.use(VueRouter)
    //   localVue.component('font-awesome-icon', FontAwesomeIcon)
    describe('VotingDetailsBar.vue', () => {
      it('renders percentages correctly', () => {
        const wrapper = mount(VotingDetails, {
          attachToDocument: true,
          store: appStore,
          localVue,
          propsData: {
            yeaVotes: acceptVotes,
            nayVotes: rejectVotes,
            passPercentage,
          },
        })
        const [ acceptHtml, rejectHtml ] = [wrapper.find(acceptDataAttribute), wrapper.find(rejectDataAttribute)]
        expect(acceptHtml.text()).toBe(`Accept: ${acceptPercentageString}%`)
        expect(rejectHtml.text()).toBe(`Reject: ${rejectPercentageString}%`)
      })
    })

    describe('VotingDetailsIndex.vue', () => {
      it('renders votes correctly', () => {
        const wrapper = mount(VotingDetailsIndex, {
          attachToDocument: true,
          store: appStore,
          localVue,
          propsData: {
            yeaVotes: acceptVotes,
            nayVotes: rejectVotes,
            passPercentage,
          },
        })
        expect(wrapper.find('.votes-info').text()).toBe(`${acceptVotes} Accept Votes`)
        wrapper.setProps({ yeaVotes: undefined, nayVotes: rejectVotes})
        expect(wrapper.find('.votes-info').text()).toBe(`${rejectVotes} Reject Votes`)
      })
    })
  })
})
