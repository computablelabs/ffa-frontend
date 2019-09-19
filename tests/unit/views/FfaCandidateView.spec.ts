import { TransactOpts } from '@computable/computablejs/dist/interfaces'

import { mount, createLocalVue, Wrapper, shallowMount } from '@vue/test-utils'
import VueRouter, {Route} from 'vue-router'
import { getModule } from 'vuex-module-decorators'

import appStore from '../../../src/store'
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

import FfaListing, { FfaListingStatus } from '../../../src/models/FfaListing'

import { library } from '@fortawesome/fontawesome-svg-core'
import { faFile as faFileSolid } from '@fortawesome/free-solid-svg-icons'
import { faFile, faCheckCircle, faPlusSquare } from '@fortawesome/free-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faEthereum } from '@fortawesome/free-brands-svg-icons'
import flushPromises from 'flush-promises'

import Web3 from 'web3'
import FlashesModule from 'vuexModules/FlashesModule'
import FfaListingsModule from '../../../src/vuexModules/FfaListingsModule'

// tslint:disable no-shadowed-variable

const localVue = createLocalVue()
library.add(faFileSolid, faFile, faCheckCircle, faPlusSquare, faEthereum)

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

  afterEach(() => {
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
      appModule: AppModule,
      web3Module: Web3Module,
      flashesModule: FlashesModule): Promise<void> => {

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
      const type = '0'
      const owner = listingHash
      const stake = '5'
      const voteBy = '10'
      const yeaVotes = '2'
      const nayVotes = '4'

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

      FfaListingViewModule.getStatusRedirect = (
        account: string,
        listingHash: string,
        status: FfaListingStatus,
        currentPath: string,
        web3Module: Web3Module): Promise<RawLocation|undefined> => {

        return Promise.resolve(undefined)
      }

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
      expect(wrapper.find('div[data-market-info="stake"]').text()).toBe(`Voting locks up ${stake} MKT`)
      expect(wrapper.find('div[data-market-info="voteBy"]').text()).toBe(`Voting closes ${voteBy} at 8:00 pm`)

      // No render if no candidate found
      ffaListingsModule.removeCandidate(candidate.hash)
      expect(wrapper.findAll(`.subway-item-wrapper`).length).toBe(0)
      expect(wrapper.findAll(`.voting-details`).length).toBe(0)
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
