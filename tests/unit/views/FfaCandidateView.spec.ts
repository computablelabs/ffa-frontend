import { TransactOpts } from '@computable/computablejs/dist/interfaces'

import { mount, createLocalVue, Wrapper, shallowMount } from '@vue/test-utils'
import VueRouter, {Route} from 'vue-router'
import { getModule } from 'vuex-module-decorators'

import appStore from '../../../src/store'
import { Store } from 'vuex'
import AppModule from '../../../src/vuexModules/AppModule'
import { router } from '../../../src/router'
import { RawLocation } from 'vue-router'

import FfaCandidateView from '../../../src/views/FfaCandidateView.vue'

import EthereumLoader from '../../../src/components/ui/EthereumLoader.vue'

import Web3Module from '../../../src/vuexModules/Web3Module'

import EthereumModule from '../../../src/functionModules/ethereum/EthereumModule'
import VotingContractModule from '../../../src/functionModules/protocol/VotingContractModule'
import ListingContractModule from '../../../src/functionModules/protocol/ListingContractModule'

import FfaListingViewModule from '../../../src/functionModules/views/FfaListingViewModule'
import TokenFunctionModule from '../../../src/functionModules/token/TokenFunctionModule'

import FfaListing, { FfaListingStatus } from '../../../src/models/FfaListing'

import { library } from '@fortawesome/fontawesome-svg-core'
import { faFile as faFileSolid, faDotCircle, faBars, faExclamationCircle } from '@fortawesome/free-solid-svg-icons'
import { faFile, faCheckCircle, faPlusSquare } from '@fortawesome/free-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faEthereum } from '@fortawesome/free-brands-svg-icons'
import flushPromises from 'flush-promises'

import Web3 from 'web3'
import FlashesModule from 'vuexModules/FlashesModule'
import FfaListingsModule from '../../../src/vuexModules/FfaListingsModule'
import DatatrustModule from '../../../src/functionModules/datatrust/DatatrustModule'
import VotingProcessModule from '../../../src/functionModules/components/VotingProcessModule'
import PurchaseProcessModule from '../../../src/functionModules/components/PurchaseProcessModule'

import MarketTokenContractModule from '../../../src/functionModules/protocol/MarketTokenContractModule'

// tslint:disable no-shadowed-variable

const localVue = createLocalVue()
library.add(faFileSolid, faFile, faCheckCircle, faPlusSquare, faEthereum, faDotCircle, faBars, faExclamationCircle)

let appModule!: AppModule
let web3Module!: Web3Module
let ffaListingsModule!: FfaListingsModule
let wrapper!: Wrapper<FfaCandidateView>
let ignoreBeforeEach = false
let expectRedirect = false
let redirectSucceeded = false

const sectionId = 'ffa-candidate'
const messageClass = 'message'
const listingHash = '0x306725200a6E0D504A7Cc9e2d4e63A492C72990d'

describe('FfaCandidateView.vue', () => {

  beforeAll(() => {
    localVue.use(VueRouter)
    localVue.component('FfaCandidateView', FfaCandidateView)
    localVue.component('EthereumLoader', EthereumLoader)
    localVue.component('font-awesome-icon', FontAwesomeIcon)
    appModule = getModule(AppModule, appStore)
    web3Module = getModule(Web3Module, appStore)
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

      web3Module.disconnect()
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
      expect(wrapper.findAll(`section#${sectionId} .${messageClass}`).length).toBe(1)
      expect(
        wrapper.find(`section#${sectionId} .${messageClass}`)
        .text().indexOf('Connecting')).toBeGreaterThanOrEqual(0)
    })

    it('renders the loading message when metamask is required', () => {

      web3Module.disconnect()
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
      expect(wrapper.findAll(`section#${sectionId} .${messageClass}`).length).toBe(1)
      expect(
        wrapper.find(`section#${sectionId} .${messageClass}`)
        .text().indexOf('Connecting')).toBeGreaterThanOrEqual(0)
    })

    it('renders the loading message when parameters is required', () => {

      web3Module.disconnect()
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
      expect(wrapper.findAll(`section#${sectionId} .${messageClass}`).length).toBe(1)
      expect(
        wrapper.find(`section#${sectionId} .${messageClass}`)
        .text().indexOf('Connecting')).toBeGreaterThanOrEqual(0)
    })
  })

  describe('ready message, VerticalSubway.vue', () => {

    it('renders the ready message, VerticalSubway component when web3 is required', async () => {
      setAppParams()
      const type = '1'
      const owner = listingHash
      const stake = '10000000000000000'
      const voteBy = '10'
      const yeaVotes = '2'
      const nayVotes = '4'
      const convertedStake = TokenFunctionModule.weiConverter(Number(stake))

      const candidate = new FfaListing(
        'title0',
        'description0',
        'type0',
        listingHash,
        'md50',
        'MIT',
        5,
        '0xwall3t',
        [],
        FfaListingStatus.candidate,
        121,
        1)

      VotingContractModule.getCandidate = (
        listingHash: string,
        account: string,
        web3: Web3): Promise<object> => {

        return Promise.resolve(
          {0: type,
          1: owner,
          2: stake,
          3: voteBy,
          4: yeaVotes,
          5: nayVotes,
          out: '0'})
      }

      DatatrustModule.getCandidates = (
        lastBlock?: number): Promise<[Error?, FfaListing[]?, number?]> => {
        return Promise.resolve([undefined, [candidate], 42])
      }

      FfaListingViewModule.getStatusRedirect = (
        account: string,
        listingHash: string,
        status: FfaListingStatus,
        currentPath: string,
        web3Module: Web3Module): Promise<RawLocation|undefined> => {

        return Promise.resolve(undefined)
      }

      ffaListingsModule.addCandidate(candidate)

      expectRedirect = false
      ignoreBeforeEach = true
      web3Module.initialize('http://localhost:8545')
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
          requiresParameters: false,
        },
      })

      wrapper.vm.$data.statusVerified = true
      wrapper.vm.$data.candidateFetched = true
      await flushPromises()

      // Checking ready message
      expect(wrapper.findAll(`section#${sectionId}`).length).toBe(1)
      expect(wrapper.findAll(`section#${sectionId} .${messageClass}`).length).toBe(1)
      expect(
        wrapper.find(`section#${sectionId} .${messageClass}`)
        .text().indexOf('Ready')).toBeGreaterThanOrEqual(0)

      // Checking Vertical Subway
      expect(wrapper.findAll(`.subway-item-wrapper`).length).toBe(5)
      expect(wrapper.findAll(`.votes-info`).at(0).text()).toBe(`${yeaVotes} Accept Votes`)
      expect(wrapper.findAll(`.votes-info`).at(1).text()).toBe(`${nayVotes} Reject Votes`)
      expect(wrapper.find('div[data-market-info="stake"]').text()).toBe(`Voting locks up ${convertedStake} CMT`)
      expect(wrapper.find('div[data-market-info="voteBy"]').text()).toBe(`Voting closes ${FfaListingViewModule.epochConverter(Number(voteBy))}`)

      // Check tabs
      expect(wrapper.findAll('.tabs').length).toBe(1)

      // Initial condition
      expect(wrapper.find('.file-metadata').isVisible()).toBe(true)
      expect(wrapper.find('.candidate-view-title').isVisible()).toBe(false)

      // Click tab
      wrapper.findAll('li').at(1).trigger('click')

      // Expect opposite condition
      expect(wrapper.find('.file-metadata').isVisible()).toBe(false)
      expect(wrapper.find('.candidate-view-title').isVisible()).toBe(true)

    })

    it('reacts properly to changes in candidate details, stake, CMT balance', async () => {
      setAppParams()
      const type = '1'
      const owner = listingHash
      const stake = '10000000000000000'
      const voteBy = '2147483647'
      const yeaVotesBefore = '0'
      const yeaVotesAfter = '1'
      const nayVotes = '0'
      const convertedStake = TokenFunctionModule.weiConverter(Number(stake))

      const candidate = new FfaListing(
        'title0',
        'description0',
        'type0',
        listingHash,
        'md50',
        'MIT',
        5,
        '0xwall3t',
        [],
        FfaListingStatus.candidate,
        121,
        1)

      VotingContractModule.getCandidate = (
        listingHash: string,
        account: string,
        web3: Web3): Promise<object> => {

        return Promise.resolve(
          {0: type,
          1: owner,
          2: stake,
          3: voteBy,
          4: yeaVotesBefore,
          5: nayVotes,
          out: '0'})
      }

      DatatrustModule.getCandidates = (
        lastBlock?: number): Promise<[Error?, FfaListing[]?, number?]> => {
        return Promise.resolve([undefined, [candidate], 42])
      }

      FfaListingViewModule.getStatusRedirect = (
        account: string,
        listingHash: string,
        status: FfaListingStatus,
        currentPath: string,
        web3Module: Web3Module): Promise<RawLocation|undefined> => {

        return Promise.resolve(undefined)
      }

      // On Voting tx success + wait
      VotingContractModule.getStake = (
        listingHash: string,
        account: string,
        web3: Web3): Promise<number> => {
        return Promise.resolve(0)
      }

      MarketTokenContractModule.getBalance = (
        account: string,
        web3: Web3): Promise<string> => {
          return Promise.resolve('100000000000000000')
      }

      MarketTokenContractModule.allowance = (
        account: string,
        web3: Web3,
        owner: string,
        spender: string): Promise<string> => {
          return Promise.resolve('10000000000000000')
      }

      // Created Hook
      VotingContractModule.didPass = (
        listingHash: string,
        plurality: number,
        account: string,
        web3: Web3,
        transactOpts: TransactOpts): Promise<boolean> => {
          return Promise.resolve(true)
      }

      ffaListingsModule.addCandidate(candidate)

      expectRedirect = false
      ignoreBeforeEach = true
      web3Module.initialize('http://localhost:8545')
      appModule.setAppReady(true)
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
          requiresParameters: false,
        },
      })

      wrapper.vm.$data.statusVerified = true
      wrapper.vm.$data.candidateFetched = true
      await flushPromises()


      // ffaListingsModule.addCandidate(candidate)
      // Navigate to details tab
      wrapper.findAll('li').at(1).trigger('click')

      const marketTokenBalance = 10

      const stakeInfo = wrapper.find('div[data-market-info="stake"]')
      const votesArray = wrapper.findAll('.votes-info')
      const votesInfoDiv = wrapper.find('div[data-votes-info="votes"]')
      const acceptPerc = wrapper.find('span[data-vote-type="accept"]')
      const rejectPerc = wrapper.find('span[data-vote-type="reject"]')
      const acceptVotes = votesArray.at(0)
      const rejectVotes = votesArray.at(1)
      const castedVotesBefore = 0
      const castedVotesAfter = castedVotesBefore + 1
      const possibleVotesBefore = 10
      const possibleVotesAfter = castedVotesAfter - 1

      // Voting Details state prior to voting
      expect(votesInfoDiv.isVisible()).toBe(true)
      expect(acceptVotes.text()).toEqual(`${yeaVotesBefore} Accept Votes`)
      expect(votesInfoDiv.text()).toEqual(`You have cast ${castedVotesBefore} vote(s). ${possibleVotesBefore} more vote(s) possible`)
      expect(acceptPerc.text()).toEqual(`Accept: 0%`)
      expect(rejectPerc.text()).toEqual(`Reject: 0%`)

      VotingContractModule.getCandidate = (
        listingHash: string,
        account: string,
        web3: Web3): Promise<object> => {

        return Promise.resolve(
          {0: type,
          1: owner,
          2: stake,
          3: voteBy,
          4: yeaVotesAfter,
          5: nayVotes,
          out: '0'})
      }

      // New Protocol call returns after the candidate details have changed
      VotingContractModule.getStake = (
        listingHash: string,
        account: string,
        web3: Web3): Promise<number> => {
        return Promise.resolve(10000000000000000)
      }

      MarketTokenContractModule.getBalance = (
        account: string,
        web3: Web3): Promise<string> => {
          return Promise.resolve(String(marketTokenBalance))
      }

      MarketTokenContractModule.allowance = (
        account: string,
        web3: Web3,
        owner: string,
        spender: string): Promise<string> => {
          return Promise.resolve('9000000000000000')
      }

      // Voting Details state after voting
      await Promise.all([
        VotingProcessModule.updateCandidateDetails(appStore),
        VotingProcessModule.updateStaked(appStore),
        PurchaseProcessModule.updateMarketTokenBalance(appStore),
      ])

      expect(acceptVotes.text()).toEqual(`${yeaVotesAfter} Accept Votes`)
      expect(rejectVotes.text()).toEqual(`${nayVotes} Reject Votes`)
      expect(votesInfoDiv.text()).toEqual(`You have cast ${castedVotesAfter} vote(s). ${possibleVotesAfter} more vote(s) possible`)
      expect(acceptPerc.text()).toEqual(`Accept: 100.0%`)
      expect(rejectPerc.text()).toEqual(`Reject: 0.0%`)
    })

    it('renders correctly when the listing is finished', async () => {
      setAppParams()
      const type = '1'
      const owner = listingHash
      const stake = '10000000000000000'
      const voteBy = '1'
      const yeaVotes = '0'
      const nayVotes = '1'

      const candidate = new FfaListing(
        'title0',
        'description0',
        'type0',
        listingHash,
        'md50',
        'MIT',
        5,
        '0xwall3t',
        [],
        FfaListingStatus.candidate,
        121,
        1)

      VotingContractModule.getCandidate = (
        listingHash: string,
        account: string,
        web3: Web3): Promise<object> => {

        return Promise.resolve(
          {0: type,
          1: owner,
          2: stake,
          3: voteBy,
          4: yeaVotes,
          5: nayVotes,
          out: '0'})
      }

      DatatrustModule.getCandidates = (
        lastBlock?: number): Promise<[Error?, FfaListing[]?, number?]> => {
        return Promise.resolve([undefined, [candidate], 42])
      }

      FfaListingViewModule.getStatusRedirect = (
        account: string,
        listingHash: string,
        status: FfaListingStatus,
        currentPath: string,
        web3Module: Web3Module): Promise<RawLocation|undefined> => {

        return Promise.resolve(undefined)
      }

      // On Voting tx success + wait
      VotingContractModule.getStake = (
        listingHash: string,
        account: string,
        web3: Web3): Promise<number> => {
        return Promise.resolve(0)
      }

      MarketTokenContractModule.getBalance = (
        account: string,
        web3: Web3): Promise<string> => {
          return Promise.resolve('100000000000000000')
      }

      MarketTokenContractModule.allowance = (
        account: string,
        web3: Web3,
        owner: string,
        spender: string): Promise<string> => {
          return Promise.resolve('10000000000000000')
      }

      // Created Hook
      VotingContractModule.didPass = (
        listingHash: string,
        plurality: number,
        account: string,
        web3: Web3,
        transactOpts: TransactOpts): Promise<boolean> => {
          return Promise.resolve(false)
      }

      ffaListingsModule.addCandidate(candidate)

      expectRedirect = false
      ignoreBeforeEach = true
      web3Module.initialize('http://localhost:8545')
      appModule.setAppReady(true)
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
          requiresParameters: false,
        },
      })

      wrapper.vm.$data.statusVerified = true
      wrapper.vm.$data.candidateFetched = true
      await flushPromises()

      // Navigate to details tab
      wrapper.findAll('li').at(1).trigger('click')

      const votingResults = wrapper.find('.subway-item-bottom')
      expect(votingResults.isVisible()).toBe(true)
      expect(votingResults.text()).toEqual('Candidate rejected')
    })
  })

  describe('single listing rendering', () => {

    it('displays a candidate', () => {
      setAppParams()
      VotingContractModule.isCandidate = (
        listingHash: string,
        account: string,
        web3: Web3,
        transactOpts: TransactOpts): Promise<boolean> => {
        return Promise.resolve(true)
      }

      ListingContractModule.isListed = (
        listingHash: string,
        account: string,
        web3: Web3,
        transactOpts: TransactOpts): Promise<boolean> => {

          return Promise.resolve(false)
      }

      ignoreBeforeEach = true
      router.push(`/listings/candidates/${listingHash}`)
      ignoreBeforeEach = false
      expectRedirect = false

      web3Module.initialize('http://localhost:8545')
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
        web3: Web3,
        transactOpts: TransactOpts): Promise<boolean> => {

        return Promise.resolve(false)
      }

      ListingContractModule.isListed = (
        listingHash: string,
        account: string,
        web3: Web3,
        transactOpts: TransactOpts): Promise<boolean> => {

          return Promise.resolve(true)
      }

      expectRedirect = false
      ignoreBeforeEach = true
      web3Module.initialize('http://localhost:8545')
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
  appModule.setDatatrustContractAllowance(1)
}

function delay(ms: number): Promise<any> {
  return new Promise( (resolve) => setTimeout(resolve, ms) )
}
