import { mount, createLocalVue, Wrapper } from '@vue/test-utils'
import VueRouter, {Route} from 'vue-router'
import { getModule } from 'vuex-module-decorators'

import appStore from '../../../src/store'
import { Store } from 'vuex'
import AppModule from '../../../src/vuexModules/AppModule'
import { router } from '../../../src/router'
import { RawLocation } from 'vue-router'

import FfaCandidateView from '../../../src/views/FfaCandidateView.vue'

import EthereumLoader from '../../../src/components/ui/EthereumLoader.vue'

import EthereumModule from '../../../src/functionModules/ethereum/EthereumModule'
import VotingContractModule from '../../../src/functionModules/protocol/VotingContractModule'
import ListingContractModule from '../../../src/functionModules/protocol/ListingContractModule'
import FfaListingViewModule from '../../../src/functionModules/views/FfaListingViewModule'
import FfaListingsModule from '../../../src/vuexModules/FfaListingsModule'
import DatatrustModule from '../../../src/functionModules/datatrust/DatatrustModule'
import VotingProcessModule from '../../../src/functionModules/components/VotingProcessModule'
import MarketTokenContractModule from '../../../src/functionModules/protocol/MarketTokenContractModule'

import FfaListing, { FfaListingStatus } from '../../../src/models/FfaListing'

import { Labels } from '../../../src/util/Constants'

import Web3 from 'web3'
import flushPromises from 'flush-promises'

// tslint:disable no-shadowed-variable
// tslint:disable max-line-length

const localVue = createLocalVue()

let appModule!: AppModule
let ffaListingsModule!: FfaListingsModule
let wrapper!: Wrapper<FfaCandidateView>
let ignoreBeforeEach = false
let expectRedirect = false
let redirectSucceeded = false

const sectionId = 'ffa-candidate'
const ethLoadingClass = '.loading-root'
const listingHash = '0x306725200a6E0D504A7Cc9e2d4e63A492C72990d'

describe('FfaCandidateView.vue', () => {

  beforeAll(() => {
    localVue.use(VueRouter)
    localVue.component('FfaCandidateView', FfaCandidateView)
    localVue.component('EthereumLoader', EthereumLoader)
    appModule = getModule(AppModule, appStore)
    ffaListingsModule = getModule(FfaListingsModule, appStore)

    router.beforeEach((to: Route, from: Route, next: (p: any) => void) => {
      console.log(`ignoreBeforeEach: ${ignoreBeforeEach}, expectRedirect: ${expectRedirect}`)
      if (ignoreBeforeEach) {
        return next(true)
      }

      if (expectRedirect) {
        console.log(`to: ${to.fullPath}, from: ${from.fullPath}`)
        redirectSucceeded = to.fullPath.indexOf('/listed') > 0 &&
          from.fullPath.indexOf('/candidates/') > 0
        expect(redirectSucceeded).toBeTruthy()
        return next(redirectSucceeded)
      } else {
        fail('should not change routes!')
        return next(false)
      }
    })
  })

  afterAll(() => {
    redirectSucceeded = false
    wrapper.destroy()
    flushPromises()
  })

  describe('props', () => {
    it('sets default requires props', () => {

      ignoreBeforeEach = true
      wrapper = mount(FfaCandidateView, {
        attachToDocument: true,
        store: appStore,
        localVue,
        router,
        propsData: {
          status: FfaListingStatus.candidate,
          listingHash,
        },
      })

      expect(wrapper.vm.$props.requiresWeb3).toBeFalsy()
      expect(wrapper.vm.$props.requiresMetamask).toBeFalsy()
      expect(wrapper.vm.$props.requiresParameters).toBeFalsy()
    })
  })

  describe('loading message', () => {

    EthereumModule.setEthereum = jest.fn((
      a: boolean,
      b: boolean,
      c: boolean,
      appStore: Store<any>): Promise<void> => {

        return Promise.resolve()
      })

    it('renders the loading message when web3 is required', () => {

      appModule.disconnectWeb3()
      ignoreBeforeEach = true

      wrapper = mount(FfaCandidateView, {
        attachToDocument: true,
        store: appStore,
        localVue,
        router,
        propsData: {
          status: FfaListingStatus.candidate,
          listingHash,
          requiresWeb3: true,
        },
      })

      expect(wrapper.findAll(`section#${sectionId}`).length).toBe(1)
      expect(wrapper.findAll(`section#${sectionId} ${ethLoadingClass}`).length).toBe(1)
    })

    it('renders the loading message when metamask is required', () => {

      appModule.disconnectWeb3()
      ignoreBeforeEach = true

      wrapper = mount(FfaCandidateView, {
        attachToDocument: true,
        store: appStore,
        localVue,
        router,
        propsData: {
          status: FfaListingStatus.candidate,
          listingHash,
          requiresMetamask: true,
        },
      })
      expect(wrapper.findAll(`section#${sectionId}`).length).toBe(1)
      expect(wrapper.findAll(`section#${sectionId} ${ethLoadingClass}`).length).toBe(1)
    })

    it('renders the loading message when parameters is required', () => {

      appModule.disconnectWeb3()
      ignoreBeforeEach = true

      wrapper = mount(FfaCandidateView, {
        attachToDocument: true,
        store: appStore,
        localVue,
        router,
        propsData: {
          status: FfaListingStatus.candidate,
          listingHash,
          requiresParameters: true,
        },
      })

      expect(wrapper.findAll(`section#${sectionId}`).length).toBe(1)
      expect(wrapper.findAll(`section#${sectionId} ${ethLoadingClass}`).length).toBe(1)
    })
  })

  // TODO: Move these to VerticalSubway and its subcomponents
  // describe('ready message, VerticalSubway.vue', () => {

  //   it('renders the ready message, VerticalSubway component when web3 is required', async () => {
  //     setAppParams()
  //     const type = '1'
  //     const owner = listingHash
  //     const stake = '10000000000000000'
  //     const voteBy = '10'
  //     const yeaVotes = '2'
  //     const nayVotes = '4'
  //     const convertedStake = TokenFunctionModule.weiConverter(Number(stake))

  //     const candidate = new FfaListing(
  //       'title0',
  //       'description0',
  //       'type0',
  //       listingHash,
  //       'md50',
  //       'MIT',
  //       5,
  //       '0xwall3t',
  //       [],
  //       FfaListingStatus.candidate,
  //       121,
  //       1)

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

  //     DatatrustModule.getCandidates = (
  //       lastBlock?: number): Promise<[Error?, FfaListing[]?, number?]> => {
  //       return Promise.resolve([undefined, [candidate], 42])
  //     }

  //     FfaListingViewModule.getStatusRedirect = (
  //       account: string,
  //       listingHash: string,
  //       status: FfaListingStatus,
  //       currentPath: string,
  //       appModule: AppModule): Promise<RawLocation|undefined> => {

  //       return Promise.resolve(undefined)
  //     }

  //     ffaListingsModule.addCandidate(candidate)

  //     expectRedirect = false
  //     ignoreBeforeEach = true
  //     appModule.initializeWeb3('http://localhost:8545')
  //     appModule.setAppReady(true)
  //     router.push(`/listings/candidates/${listingHash}`)
  //     ignoreBeforeEach = false
  //     expectRedirect = true

  //     wrapper = mount(FfaCandidateView, {
  //       attachToDocument: true,
  //       store: appStore,
  //       localVue,
  //       router,
  //       propsData: {
  //         status: FfaListingStatus.candidate,
  //         listingHash,
  //         requiresParameters: false,
  //         selectedTab: Labels.LISTING,
  //       },
  //     })

  //     wrapper.vm.$data.statusVerified = true
  //     wrapper.vm.$data.candidateFetched = true
  //     await flushPromises()

  //     // Checking ready message
  //     expect(wrapper.findAll(`section#${sectionId}`).length).toBe(1)

  //     // Check tabs
  //     expect(wrapper.findAll('.tabs').length).toBe(1)

  //     // Check banner
  //     expect(wrapper.findAll('.banner').length).toBe(1)

  //     // Initial condition
  //     expect(wrapper.find({ name: 'StaticFileMetadata' }).isVisible()).toBe(true)
  //     expect(wrapper.find('.candidate-view-title').isVisible()).toBe(false)

  //     // switch tabs - no clicking!
  //     wrapper.vm.$props.selectedTab = Labels.DETAILS

  //     // Expect opposite condition
  //     expect(wrapper.find({ name: 'StaticFileMetadata' }).isVisible()).toBe(false)
  //     expect(wrapper.find('.candidate-view-title').isVisible()).toBe(true)

  //     // Checking Vertical Subway
  //     expect(wrapper.findAll(`.subway-item-container`).length).toBe(5)

  //     expect(wrapper.find('.voting-details-bar-container').findAll(`.labels > span`).at(0).text()).toBe('2 yes votes (33.3%)')
  //     expect(wrapper.find('.voting-details-bar-container').findAll(`.labels > span`).at(1).text()).toBe('4 no votes (66.7%)')
  //     expect(wrapper.find('div[data-market-info="stake"]').text()).toBe(`Voting locks up ${convertedStake} CMT`)
  //     // Need to figure out how to do this when string returned is time in local timezone.
  //     // expect(wrapper.find('div[data-market-info="voteBy"]').text())
  //     // .toBe(`Voting closes ${FfaListingViewModule.epochConverter(Number(voteBy))}`)

  //   })

  //   it('reacts properly to changes in candidate details, stake, CMT balance', async () => {
  //     setAppParams()
  //     const type = '1'
  //     const owner = listingHash
  //     const stake = '10000000000000000'
  //     const voteBy = '2147483647'
  //     const yeaVotesBefore = '0'
  //     const yeaVotesAfter = '1'
  //     const yeaPercentAfter = '100.0'
  //     const nayVotes = '0'
  //     const convertedStake = TokenFunctionModule.weiConverter(Number(stake))

  //     const candidate = new FfaListing(
  //       'title0',
  //       'description0',
  //       'type0',
  //       listingHash,
  //       'md50',
  //       'MIT',
  //       5,
  //       '0xwall3t',
  //       [],
  //       FfaListingStatus.candidate,
  //       121,
  //       1)

  //     VotingContractModule.getCandidate = (
  //       listingHash: string,
  //       account: string,
  //       web3: Web3): Promise<object> => {

  //       return Promise.resolve(
  //         {0: type,
  //         1: owner,
  //         2: stake,
  //         3: voteBy,
  //         4: yeaVotesBefore,
  //         5: nayVotes,
  //         out: '0'})
  //     }

  //     DatatrustModule.getCandidates = (
  //       lastBlock?: number): Promise<[Error?, FfaListing[]?, number?]> => {
  //       return Promise.resolve([undefined, [candidate], 42])
  //     }

  //     FfaListingViewModule.getStatusRedirect = (
  //       account: string,
  //       listingHash: string,
  //       status: FfaListingStatus,
  //       currentPath: string,
  //       appModule: AppModule): Promise<RawLocation|undefined> => {

  //       return Promise.resolve(undefined)
  //     }

  //     // On Voting tx success + wait
  //     VotingContractModule.getStake = (
  //       listingHash: string,
  //       account: string,
  //       web3: Web3): Promise<number> => {
  //       return Promise.resolve(0)
  //     }

  //     MarketTokenContractModule.balanceOf = (
  //       account: string,
  //       web3: Web3): Promise<string> => {
  //         return Promise.resolve('100000000000000000')
  //     }

  //     MarketTokenContractModule.allowance = (
  //       account: string,
  //       spender: string,
  //       web3: Web3): Promise<string> => {
  //         return Promise.resolve('10000000000000000')
  //     }

  //     // Created Hook
  //     VotingContractModule.didPass = (
  //       listingHash: string,
  //       plurality: number,
  //       account: string,
  //       web3: Web3): Promise<boolean> => {
  //         return Promise.resolve(true)
  //     }

  //     ffaListingsModule.addCandidate(candidate)

  //     expectRedirect = false
  //     ignoreBeforeEach = true
  //     appModule.initializeWeb3('http://localhost:8545')
  //     appModule.setAppReady(true)
  //     ignoreBeforeEach = false
  //     expectRedirect = true

  //     wrapper = mount(FfaCandidateView, {
  //       attachToDocument: true,
  //       store: appStore,
  //       localVue,
  //       router,
  //       propsData: {
  //         status: FfaListingStatus.candidate,
  //         listingHash,
  //         requiresParameters: false,
  //         selectedTab: Labels.DETAILS,
  //       },
  //     })

  //     wrapper.vm.$data.statusVerified = true
  //     wrapper.vm.$data.candidateFetched = true
  //     await flushPromises()


  //     // ffaListingsModule.addCandidate(candidate)
  //     // Navigate to details tab
  //     wrapper.findAll('li').at(1).trigger('click')

  //     const marketTokenBalance = 10

  //     const stakeInfo = wrapper.find('div[data-market-info="stake"]')
  //     const votesInfoDiv = wrapper.find('div[data-votes-info="votes"]')
  //     const acceptPerc = wrapper.find('span[data-vote-type="accept"]')
  //     const rejectPerc = wrapper.find('span[data-vote-type="reject"]')
  //     const castedVotesBefore = 0
  //     const castedVotesAfter = castedVotesBefore + 1
  //     const possibleVotesBefore = 10
  //     const possibleVotesAfter = castedVotesAfter - 1
  //     const votesArray = wrapper.find('.voting-details-bar-container').findAll(`.labels > span`)
  //     const acceptVotes = votesArray.at(0)
  //     const rejectVotes = votesArray.at(1)

  //     // Voting Details state prior to voting
  //     expect(votesInfoDiv.isVisible()).toBe(true)
  //     expect(acceptVotes.text()).toEqual(`${yeaVotesBefore} yes votes`)
  //     expect(votesInfoDiv.text().indexOf('You have cast ')).toBe(0)

  //     VotingContractModule.getCandidate = (
  //       listingHash: string,
  //       account: string,
  //       web3: Web3): Promise<object> => {

  //       return Promise.resolve(
  //         {0: type,
  //         1: owner,
  //         2: stake,
  //         3: voteBy,
  //         4: yeaVotesAfter,
  //         5: nayVotes,
  //         out: '0'})
  //     }

  //     // New Protocol call returns after the candidate details have changed
  //     VotingContractModule.getStake = (
  //       listingHash: string,
  //       account: string,
  //       web3: Web3): Promise<number> => {
  //       return Promise.resolve(10000000000000000)
  //     }

  //     MarketTokenContractModule.balanceOf = (
  //       account: string,
  //       web3: Web3): Promise<string> => {
  //         return Promise.resolve(String(marketTokenBalance))
  //     }

  //     MarketTokenContractModule.allowance = (
  //       account: string,
  //       spender: string,
  //       web3: Web3): Promise<string> => {
  //         return Promise.resolve('9000000000000000')
  //     }

  //     // TODO: remove these.  specs should set state directly
  //     // Voting Details state after voting
  //     await Promise.all([
  //       VotingProcessModule.updateCandidateDetails(appStore),
  //       VotingProcessModule.updateStaked(appStore),
  //       EthereumModule.getMarketTokenBalance(appStore),
  //     ])

  //     expect(acceptVotes.text()).toEqual(`${yeaVotesAfter} yes vote (${yeaPercentAfter}%)`)
  //     expect(rejectVotes.text()).toEqual(`${nayVotes} no votes`)
  //     expect(votesInfoDiv.text()).toBe(`You have cast ${castedVotesAfter} out of ${possibleVotesAfter} votes.`)

  //     // expect(votesInfoDiv.text().indexOf(`You have cast ${castedVotesAfter} vote.`)).toBe(0)
  //     // expect(votesInfoDiv.text().indexOf(`${possibleVotesAfter} more votes possible`)).toBeGreaterThan(0)
  //   })

  //   it('renders correctly when the listing is finished', async () => {
  //     setAppParams()
  //     const type = '1'
  //     const owner = listingHash
  //     const stake = '10000000000000000'
  //     const voteBy = '1'
  //     const yeaVotes = '0'
  //     const nayVotes = '1'

  //     const candidate = new FfaListing(
  //       'title0',
  //       'description0',
  //       'type0',
  //       listingHash,
  //       'md50',
  //       'MIT',
  //       5,
  //       '0xwall3t',
  //       [],
  //       FfaListingStatus.candidate,
  //       121,
  //       1)

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

  //     DatatrustModule.getCandidates = (
  //       lastBlock?: number): Promise<[Error?, FfaListing[]?, number?]> => {
  //       return Promise.resolve([undefined, [candidate], 42])
  //     }

  //     FfaListingViewModule.getStatusRedirect = (
  //       account: string,
  //       listingHash: string,
  //       status: FfaListingStatus,
  //       currentPath: string,
  //       appModule: AppModule): Promise<RawLocation|undefined> => {

  //       return Promise.resolve(undefined)
  //     }

  //     // On Voting tx success + wait
  //     VotingContractModule.getStake = (
  //       listingHash: string,
  //       account: string,
  //       web3: Web3): Promise<number> => {
  //       return Promise.resolve(0)
  //     }

  //     MarketTokenContractModule.balanceOf = (
  //       account: string,
  //       web3: Web3): Promise<string> => {
  //         return Promise.resolve('100000000000000000')
  //     }

  //     MarketTokenContractModule.allowance = (
  //       account: string,
  //       spender: string,
  //       web3: Web3): Promise<string> => {
  //         return Promise.resolve('10000000000000000')
  //     }

  //     // Created Hook
  //     VotingContractModule.didPass = (
  //       listingHash: string,
  //       plurality: number,
  //       account: string,
  //       web3: Web3): Promise<boolean> => {
  //         return Promise.resolve(false)
  //     }

  //     ffaListingsModule.addCandidate(candidate)

  //     expectRedirect = false
  //     ignoreBeforeEach = true
  //     appModule.initializeWeb3('http://localhost:8545')
  //     appModule.setAppReady(true)
  //     ignoreBeforeEach = false
  //     expectRedirect = true

  //     wrapper = mount(FfaCandidateView, {
  //       attachToDocument: true,
  //       store: appStore,
  //       localVue,
  //       router,
  //       propsData: {
  //         status: FfaListingStatus.candidate,
  //         listingHash,
  //         requiresParameters: false,
  //         selectedTab: Labels.DETAILS,
  //       },
  //     })

  //     wrapper.vm.$data.statusVerified = true
  //     wrapper.vm.$data.candidateFetched = true
  //     await flushPromises()

  //     // Navigate to details tab
  //     wrapper.findAll('li').at(1).trigger('click')

  //     const subwayItems = wrapper.findAll('.subway-item-container')
  //     const votingResults = subwayItems.at(4)
  //     expect(votingResults.isVisible()).toBe(true)
  //     expect(votingResults.text()).toEqual('Candidate rejected from cooperative')
  //   })
  // })

  describe('single listing rendering', () => {

    it('displays a candidate', () => {
      setAppParams()
      VotingContractModule.isCandidate = (
        listingHash: string,
        account: string,
        web3: Web3): Promise<boolean> => {
        return Promise.resolve(true)
      }

      ListingContractModule.isListed = (
        listingHash: string,
        account: string,
        web3: Web3): Promise<boolean> => {

          return Promise.resolve(false)
      }

      ignoreBeforeEach = true
      router.push(`/listings/candidates/${listingHash}`)
      ignoreBeforeEach = false
      expectRedirect = false

      appModule.initializeWeb3('http://localhost:8545')
      appModule.setAppReady(true)

      wrapper = mount(FfaCandidateView, {
        attachToDocument: true,
        store: appStore,
        localVue,
        router,
        propsData: {
          status: FfaListingStatus.candidate,
          listingHash,
        },
      })
    })
  })

  describe('redirects', () => {
    it('redirects a candidate to listed', () => {
      setAppParams()
      VotingContractModule.isCandidate = (
        listingHash: string,
        account: string,
        web3: Web3): Promise<boolean> => {

        return Promise.resolve(false)
      }

      ListingContractModule.isListed = (
        listingHash: string,
        account: string,
        web3: Web3): Promise<boolean> => {

          return Promise.resolve(true)
      }

      expectRedirect = false
      ignoreBeforeEach = true
      appModule.initializeWeb3('http://localhost:8545')
      appModule.setAppReady(true)
      router.push(`/listings/candidates/${listingHash}`)
      ignoreBeforeEach = false
      expectRedirect = true

      wrapper = mount(FfaCandidateView, {
        attachToDocument: true,
        store: appStore,
        localVue,
        router,
        propsData: {
          status: FfaListingStatus.candidate,
          listingHash,
        },
      })
    })
  })
})

function setAppParams() {
  appModule.setMakerPayment(1)
  appModule.setCostPerByte(1)
  appModule.setStake(1)
  appModule.setPriceFloor(1)
  appModule.setPlurality(1)
  appModule.setVoteBy(1)
  appModule.setEtherTokenDatatrustAllowance(1)
  appModule.setMarketTokenVotingContractAllowance(1)
  appModule.setTotalMarketTokenSupply(1)
  appModule.setTotalReserveEtherTokenSupply(1)
  appModule.setEtherTokenReserveAllowance(1)
}

function delay(ms: number): Promise<any> {
  return new Promise( (resolve) => setTimeout(resolve, ms) )
}
