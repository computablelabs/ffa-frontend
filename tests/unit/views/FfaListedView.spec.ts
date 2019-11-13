import { mount, createLocalVue, Wrapper } from '@vue/test-utils'
import VueRouter, {Route, RawLocation} from 'vue-router'
import { router } from '../../../src/router'

import { getModule } from 'vuex-module-decorators'
import { Store } from 'vuex'
import appStore from '../../../src/store'
import AppModule from '../../../src/vuexModules/AppModule'
import FfaListingsModule from '../../../src/vuexModules/FfaListingsModule'
import VotingModule from '../../../src/vuexModules/VotingModule'
import ChallengeModule from '../../../src/vuexModules/ChallengeModule'
import PurchaseModule from '../../../src/vuexModules/PurchaseModule'

import Navigation from '../../../src/components/ui/Navigation.vue'
import Drawer from '../../../src/components/ui/Drawer.vue'
import FfaListedView from '../../../src/views/FfaListedView.vue'
import StaticFileMetadata from '../../../src/components/ui/StaticFileMetadata.vue'
import StaticFfaTags from '../../../src/components/ui/StaticFfaTags.vue'
import EthereumLoader from '../../../src/components/ui/EthereumLoader.vue'
import FileUploader from '../../../src/components/listing/FileUploader.vue'

import EthereumModule from '../../../src/functionModules/ethereum/EthereumModule'
import MetamaskModule from '../../../src/functionModules/metamask/MetamaskModule'
import DatatrustModule from '../../../src/functionModules/datatrust/DatatrustModule'
import VotingContractModule from '../../../src/functionModules/protocol/VotingContractModule'
import ListingContractModule from '../../../src/functionModules/protocol/ListingContractModule'
import EtherTokenContractModule from '../../../src/functionModules/protocol/EtherTokenContractModule'
import MarketTokenContractModule from '../../../src/functionModules/protocol/MarketTokenContractModule'

import FfaListing, { FfaListingStatus } from '../../../src/models/FfaListing'
import { PurchaseStep } from '../../../src/models/PurchaseStep'

import { Labels } from '../../../src/util/Constants'

import Web3 from 'web3'
// tslint:disable no-shadowed-variable

const localVue = createLocalVue()

let appModule!: AppModule
let challengeModule!: ChallengeModule
let votingModule!: VotingModule
let purchaseModule!: PurchaseModule

let wrapper!: Wrapper<FfaListedView>
let ignoreBeforeEach = false
let expectRedirect = false
let redirectSucceeded = false

const sectionId = 'ffa-listed'
const staticFileMetadataName = 'StaticFileMetadata'

const fakeRealAddress = '0x2C10c931FEbe8CA490A0Da3F7F78D463550CB048'
const listingHash = '0x306725200a6E0D504A7Cc9e2d4e63A492C72990d'

const ffaListing = new FfaListing(
  'title',
  'description',
  'type',
  listingHash,
  'md5',
  'license',
  0,
  '0xwallet',
  ['foo', 'bar'],
  FfaListingStatus.listed,
  0,
  0,
)

describe('FfaListedView.vue', () => {

  beforeAll(() => {
    localVue.use(VueRouter)
    localVue.component('Navigation', Navigation)
    localVue.component('Drawer', Drawer)
    localVue.component('FfaListedView', FfaListedView)
    localVue.component('StaticFileMetadata', StaticFileMetadata)
    localVue.component('StaticFileMetadata', StaticFfaTags)
    localVue.component('EthereumLoader', EthereumLoader)
    localVue.component('FileUploader', FileUploader)
    appModule = getModule(AppModule, appStore)
    votingModule = getModule(VotingModule, appStore)
    challengeModule = getModule(ChallengeModule, appStore)
    purchaseModule = getModule(PurchaseModule, appStore)

    EtherTokenContractModule.balanceOf = jest.fn((
      account: string,
      spender: string,
      web3: Web3): Promise<string> => {

      return Promise.resolve('10')
    })

    EtherTokenContractModule.allowance = jest.fn((
      account: string,
      contractAddress: string): Promise<string> => {

      return Promise.resolve('10')
    })

    MarketTokenContractModule.allowance = jest.fn((
      account: string,
      contractAddress: string): Promise<string> => {

      return Promise.resolve('10')
    })

    MarketTokenContractModule.balanceOf = jest.fn((
      account: string,
      web3: Web3): Promise<string> => {

      return Promise.resolve('100000000000000000')
    })

    MarketTokenContractModule.allowance = jest.fn((
      account: string,
      spender: string,
      web3: Web3): Promise<string> => {

      return Promise.resolve('10000000000000000')
    })

    VotingContractModule.isCandidate = jest.fn((
      listingHash: string,
      account: string,
      web3: Web3): Promise<boolean> => {

        return Promise.resolve(false)
    })

    ListingContractModule.isListed = jest.fn((
      listingHash: string,
      account: string,
      web3: Web3): Promise<boolean> => {

        return Promise.resolve(true)
    })

    MetamaskModule.enable = jest.fn((): Promise<string|Error> => {
      return Promise.resolve('foo')
    })

    router.beforeEach((to: Route, from: Route, next: (p: any) => void) => {
      console.log(`ignoreBeforeEach: ${ignoreBeforeEach}, expectRedirect: ${expectRedirect}`)
      if (ignoreBeforeEach) {
        return next(true)
      }

      if (expectRedirect) {
        console.log(`to: ${to.fullPath}, from: ${from.fullPath}`)
        redirectSucceeded = to.fullPath === '/' &&
          from.fullPath.indexOf('/listed/') > 0
        expect(redirectSucceeded).toBeTruthy()
        return next(redirectSucceeded)
      } else {
        fail('should not change routes!')
        return next(false)
      }
    })
  })

  beforeEach(() => {

    setAppParams()

  })

  afterEach(() => {
    redirectSucceeded = false
    wrapper.destroy()
  })

  describe('props', () => {
    it('sets default requires props', () => {

      ignoreBeforeEach = true
      wrapper = mount(FfaListedView, {
        attachToDocument: true,
        store: appStore,
        localVue,
        router,
        propsData: {
          status: FfaListingStatus.listed,
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

      wrapper = mount(FfaListedView, {
        attachToDocument: true,
        store: appStore,
        localVue,
        router,
        propsData: {
          status: FfaListingStatus.listed,
          listingHash,
          requiresWeb3: true,
        },
      })

      expect(wrapper.findAll(`section#${sectionId}`).length).toBe(1)
      expect(wrapper.findAll(`section#${sectionId} .loading-root`).length).toBe(1)
    })

    it('renders the loading message when parameters is required', () => {

      appModule.disconnectWeb3()
      ignoreBeforeEach = true

      wrapper = mount(FfaListedView, {
        attachToDocument: true,
        store: appStore,
        localVue,
        router,
        propsData: {
          status: FfaListingStatus.listed,
          listingHash,
          requiresParameters: true,
          requiresWeb3: true,
        },
      })

      expect(wrapper.findAll(`section#${sectionId}`).length).toBe(1)
      expect(wrapper.findAll(`section#${sectionId} .loading-root`).length).toBe(1)
    })
  })

  describe('render listing, challenged', () => {

    it('renders listing tab', async () => {
      appModule.initializeWeb3('http://localhost:8545')
      ignoreBeforeEach = true
      ethereum.selectedAddress = fakeRealAddress
      votingModule.setCandidate(ffaListing)
      appModule.setAppReady(true)

      wrapper = mount(FfaListedView, {
        attachToDocument: true,
        store: appStore,
        localVue,
        router,
        propsData: {
          status: FfaListingStatus.listed,
          listingHash,
          requiresParameters: true,
          enablePurchaseButton: true,
          selectedTab: Labels.LISTING,
        },
      })

      wrapper.setData({ statusVerified: true })
      expect(wrapper.findAll(`section#${sectionId}`).length).toBe(1)
      expect(wrapper.findAll({ name: staticFileMetadataName}).length).toBe(1)
      expect(wrapper.findAll(`section#${sectionId} span[data-size="size"]`).length).toBe(1)

      // router tabs exists
      expect(wrapper.findAll('.tabs').length).toBe(1)

      // Listing Tab
      // Initial Condition
      expect(wrapper.find({ name: 'StaticFileMetadata' }).isVisible()).toBeTruthy()
      expect(wrapper.find('button[data-purchase="true"]').isVisible()).toBeTruthy()
    })

    it('renders details tab', async () => {

      ignoreBeforeEach = true
      ethereum.selectedAddress = fakeRealAddress
      appModule.initializeWeb3('http://localhost:8545')
      votingModule.setCandidate(ffaListing)
      appModule.setAppReady(true)

      wrapper = mount(FfaListedView, {
        attachToDocument: true,
        store: appStore,
        localVue,
        router,
        propsData: {
          status: FfaListingStatus.listed,
          listingHash,
          requiresParameters: true,
          requiresWeb3: true,
          enablePurchaseButton: true,
          selectedTab: Labels.DETAILS,
        },
      })

      challengeModule.setListingChallenged(true)

      wrapper.setData({ statusVerified: true})

      expect(wrapper.findAll(`section#${sectionId}`).length).toBe(1)
      expect(wrapper.findAll({ name: staticFileMetadataName}).length).toBe(1)
      expect(wrapper.findAll(`section#${sectionId} span[data-size="size"]`).length).toBe(1)

      expect(wrapper.find({ name: 'StaticFileMetadata' }).isVisible()).toBeFalsy()
      expect(wrapper.find('button[data-challenge="true"]').isVisible()).toBeFalsy()
    })

    it('purchase and request delivery buttons work correctly', async () => {

      ignoreBeforeEach = true
      ethereum.selectedAddress = fakeRealAddress
      appModule.initializeWeb3('http://localhost:8545')
      appModule.setAppReady(true)
      setAppParams()

      const ffaListingsModule = getModule(FfaListingsModule, appStore)
      ffaListingsModule.addToListed(ffaListing)

      wrapper = mount(FfaListedView, {
        attachToDocument: true,
        store: appStore,
        localVue,
        router,
        propsData: {
          status: FfaListingStatus.listed,
          listingHash,
          requiresMetamask: true,
          requiresParameters: true,
          enablePurchaseButton: true,
          selectedTab: Labels.LISTING,
        },
      })

      wrapper.setData({ statusVerified: true })

      let purchaseButton = wrapper.find('button[data-purchase="true"]')
      expect(purchaseButton.exists()).toBeTruthy()

      // Clicking the purchase button pushes to a different route
      purchaseButton.trigger('click')

      expect(router.currentRoute.name).toEqual('singleListedPurchase')

      wrapper.setProps({ enablePurchaseButton: false })

      purchaseButton = wrapper.find('button[data-purchase="true"]')
      expect(purchaseButton.exists()).toBeFalsy()

      expect(wrapper.find('button[data-delivery="true"]').exists()).toBeFalsy()

      purchaseModule.setPurchaseStep(PurchaseStep.Complete)
      appModule.setJwt('jwt')

      expect(wrapper.find('button[data-delivery="true"]').exists()).toBeTruthy()
    })
  })

  it('correctly renders listing details', () => {
      ignoreBeforeEach = true
      ethereum.selectedAddress = fakeRealAddress
      appModule.initializeWeb3('http://localhost:8545')
      appModule.setAppReady(true)
      setAppParams()

      wrapper = mount(FfaListedView, {
        attachToDocument: true,
        store: appStore,
        localVue,
        router,
        propsData: {
          status: FfaListingStatus.listed,
          listingHash,
          requiresMetamask: true,
          requiresParameters: true,
          enablePurchaseButton: true,
          selectedTab: Labels.DETAILS,
        },
      })

      const ffaListingsModule = getModule(FfaListingsModule, appStore)
      ffaListingsModule.addToListed(ffaListing)

      wrapper.setData({ statusVerified: true })
      expect(wrapper.find('.container > .title').text()).toBe(ffaListing.title)
  })

  it('correctly renders challenge banner', () => {
    ignoreBeforeEach = true
    ethereum.selectedAddress = fakeRealAddress
    appModule.initializeWeb3('http://localhost:8545')
    appModule.setAppReady(true)
    setAppParams()

    wrapper = mount(FfaListedView, {
      attachToDocument: true,
      store: appStore,
      localVue,
      router,
      propsData: {
        status: FfaListingStatus.listed,
        listingHash,
        requiresMetamask: true,
        requiresParameters: true,
        enablePurchaseButton: true,
        selectedTab: Labels.DETAILS,
      },
    })

    const ffaListingsModule = getModule(FfaListingsModule, appStore)
    ffaListingsModule.addToListed(ffaListing)

    wrapper.setData({ statusVerified: true })
    expect(wrapper.findAll('.banner').length).toBe(0)
    challengeModule.setListingChallenged(true)
    expect(wrapper.findAll('.banner').length).toBe(1)
  })

  it('redirects a non-listed to /', () => {

    expectRedirect = false
    ignoreBeforeEach = true
    appModule.initializeWeb3('http://localhost:8545')
    appModule.setAppReady(true)
    router.push(`/listings/listed/${listingHash}`)
    ignoreBeforeEach = false
    expectRedirect = true

    wrapper = mount(FfaListedView, {
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

function setAppParams() {
  appModule.setMakerPayment(1)
  appModule.setCostPerByte(1)
  appModule.setStake(1)
  appModule.setPriceFloor(1)
  appModule.setPlurality(1)
  appModule.setVoteBy(1)
  appModule.setEtherTokenBalance(10)
  appModule.setMarketTokenBalance(1)
  appModule.setEtherTokenDatatrustAllowance(1)
  appModule.setEtherTokenReserveAllowance(1)
  appModule.setTotalMarketTokenSupply(1)
  appModule.setTotalReserveEtherTokenSupply(1)
  appModule.setMarketTokenVotingContractAllowance(1)
  appModule.setSupportPrice(1000000)
}
