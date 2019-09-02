import { TransactOpts } from '@computable/computablejs/dist/interfaces'

import { mount, createLocalVue, Wrapper, RouterLinkStub } from '@vue/test-utils'
import VueRouter, {Route} from 'vue-router'
import { getModule } from 'vuex-module-decorators'

import appStore from '../../../src/store'
import AppModule from '../../../src/vuexModules/AppModule'
import { router } from '../../../src/router'

import FfaListingView from '../../../src/views/FfaListingView.vue'

import EthereumLoader from '../../../src/components/ui/EthereumLoader.vue'

import Web3Module from '../../../src/vuexModules/Web3Module'

import EthereumModule from '../../../src/functionModules/ethereum/EthereumModule'
import VotingModule from '../../../src/functionModules/protocol/VotingModule'
import ListingModule from '../../../src/functionModules/protocol/ListingModule'

import { FfaListingStatus } from '../../../src/models/FfaListing'

import { library } from '@fortawesome/fontawesome-svg-core'
import { faFile as faFileSolid } from '@fortawesome/free-solid-svg-icons'
import { faFile, faCheckCircle, faPlusSquare } from '@fortawesome/free-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faEthereum } from '@fortawesome/free-brands-svg-icons'
import FlashesModule from 'vuexModules/FlashesModule'

// tslint:disable no-shadowed-variable

const localVue = createLocalVue()
library.add(faFileSolid, faFile, faCheckCircle, faPlusSquare, faEthereum)

let appModule!: AppModule
let web3Module!: Web3Module
let wrapper!: Wrapper<FfaListingView>
let ignoreAfterEach = false
let expectRedirect = false

const sectionId = 'single-listing'
const messageClass = 'message'
const listingHash = '0x306725200a6E0D504A7Cc9e2d4e63A492C72990d'

describe('List.vue', () => {

  beforeAll(() => {
    localVue.use(VueRouter)
    localVue.component('FfaListingView', FfaListingView)
    localVue.component('EthereumLoader', EthereumLoader)
    localVue.component('font-awesome-icon', FontAwesomeIcon)
    appModule = getModule(AppModule, appStore)
    web3Module = getModule(Web3Module, appStore)

    router.afterEach((to: Route, from: Route) => {
      if (ignoreAfterEach) { return }
      console.log(`to: ${to.fullPath}, from: ${from.fullPath}`)
      if (expectRedirect) {
        expect(to.fullPath.indexOf('/listed/')).toBeGreaterThan(0)
        expect(from.fullPath.indexOf('/candidates/')).toBeGreaterThan(0)
      } else {
        fail('should not change routes!')
      }
    })
  })

  afterAll(() => {
    wrapper.destroy()
  })

  describe('props', () => {
    it('sets default requires props', () => {

      ignoreAfterEach = true
      wrapper = mount(FfaListingView, {
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

    EthereumModule.setEthereum = jest.fn((a: boolean,
                                          b: boolean,
                                          c: boolean,
                                          appModule: AppModule,
                                          web3Module: Web3Module,
                                          flashesModule: FlashesModule): Promise<void> => {
                                    return Promise.resolve()
                                    })

    it('renders the loading message when web3 is required', () => {

      web3Module.disconnect()
      ignoreAfterEach = true

      wrapper = mount(FfaListingView, {
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
      ignoreAfterEach = true

      wrapper = mount(FfaListingView, {
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
      ignoreAfterEach = true

      wrapper = mount(FfaListingView, {
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

  describe('ready message', () => {

    it('renders the ready message when nothing is required', async () => {

      wrapper = mount(FfaListingView, {
        attachToDocument: true,
        store: appStore,
        localVue,
        router,
        propsData: {
          status: FfaListingStatus.candidate,
          listingHash,
        },
      })

      expect(wrapper.findAll(`section#${sectionId}`).length).toBe(1)
      expect(wrapper.findAll(`section#${sectionId} .${messageClass}`).length).toBe(1)
      expect(
        wrapper.find(`section#${sectionId} .${messageClass}`)
        .text().indexOf('Ready')).toBeGreaterThanOrEqual(0)
    })

    it('renders the ready message when web3 is required', async () => {

      VotingModule.isCandidate = (llistingHash: string,
                                  account: string,
                                  wweb3Module: Web3Module,
                                  transactOpts: TransactOpts): Promise<boolean> => {
        return Promise.resolve(true)
      }

      ListingModule.isListed = (llistingHash: string,
                                account: string,
                                wweb3Module: Web3Module,
                                transactOpts: TransactOpts): Promise<boolean> => {
        return Promise.resolve(false)
      }

      ignoreAfterEach = true

      web3Module.initialize('http://localhost:8545')
      appModule.setAppReady(true)

      wrapper = mount(FfaListingView, {
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

      setAppParams()
      wrapper.vm.$data.statusValidated = true
      expect(wrapper.findAll(`section#${sectionId}`).length).toBe(1)
      expect(wrapper.findAll(`section#${sectionId} .${messageClass}`).length).toBe(1)
      expect(
        wrapper.find(`section#${sectionId} .${messageClass}`)
        .text().indexOf('Ready')).toBeGreaterThanOrEqual(0)
    })
  })

  describe('single listing rendering', () => {

    it('displays a candidate', () => {
      setAppParams()
      VotingModule.isCandidate = (llistingHash: string,
                                  account: string,
                                  wweb3Module: Web3Module,
                                  transactOpts: TransactOpts): Promise<boolean> => {
        return Promise.resolve(true)
      }

      ListingModule.isListed = (llistingHash: string,
                                account: string,
                                wweb3Module: Web3Module,
                                transactOpts: TransactOpts): Promise<boolean> => {
        return Promise.resolve(false)
      }

      ignoreAfterEach = true
      router.push(`/listings/candidates/${listingHash}`)
      ignoreAfterEach = false
      expectRedirect = false

      web3Module.initialize('http://localhost:8545')
      appModule.setAppReady(true)

      wrapper = mount(FfaListingView, {
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

    it('displays a listed', () => {
      setAppParams()
      VotingModule.isCandidate = (llistingHash: string,
                                  account: string,
                                  wweb3Module: Web3Module,
                                  transactOpts: TransactOpts): Promise<boolean> => {
        return Promise.resolve(false)
      }

      ListingModule.isListed = (llistingHash: string,
                                account: string,
                                wweb3Module: Web3Module,
                                transactOpts: TransactOpts): Promise<boolean> => {
        return Promise.resolve(true)
      }

      ignoreAfterEach = true
      router.push(`/listings/listed/${listingHash}`)
      ignoreAfterEach = false
      expectRedirect = false

      web3Module.initialize('http://localhost:8545')
      appModule.setAppReady(true)

      wrapper = mount(FfaListingView, {
        attachToDocument: true,
        store: appStore,
        localVue,
        router,
        propsData: {
          status: FfaListingStatus.listed,
          listingHash,
        },
      })
    })
  })

  describe('redirects', () => {
    it('redirects a candiate to listed', () => {
      setAppParams()
      VotingModule.isCandidate = (llistingHash: string,
                                  account: string,
                                  wweb3Module: Web3Module,
                                  transactOpts: TransactOpts): Promise<boolean> => {
        return Promise.resolve(false)
      }

      ListingModule.isListed = (llistingHash: string,
                                account: string,
                                wweb3Module: Web3Module,
                                transactOpts: TransactOpts): Promise<boolean> => {
        return Promise.resolve(true)
      }

      ignoreAfterEach = true
      router.push(`/listings/candidates/${listingHash}`)
      ignoreAfterEach = false
      expectRedirect = true

      web3Module.initialize('http://localhost:8545')
      appModule.setAppReady(true)

      wrapper = mount(FfaListingView, {
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
}

function delay(ms: number): Promise<any> {
  return new Promise( (resolve) => setTimeout(resolve, ms) )
}
