import { mount, createLocalVue, Wrapper } from '@vue/test-utils'
import VueRouter, {Route} from 'vue-router'
import { router } from '../../../src/router'

import { getModule } from 'vuex-module-decorators'
import { Store } from 'vuex'
import appStore from '../../../src/store'
import AppModule from '../../../src/vuexModules/AppModule'
import Web3Module from '../../../src/vuexModules/Web3Module'
import FlashesModule from '../../../src/vuexModules/FlashesModule'
import FfaListingsModule from '../../../src/vuexModules/FfaListingsModule'

import App from '../../../src/App.vue'
import Navigation from '../../../src/components/ui/Navigation.vue'
import Drawer from '../../../src/components/ui/Drawer.vue'
import FfaListedView from '../../../src/views/FfaListedView.vue'
import StaticFileMetadata from '../../../src/components/ui/StaticFileMetadata.vue'
import StaticFfaTags from '../../../src/components/ui/StaticFfaTags.vue'
import EthereumLoader from '../../../src/components/ui/EthereumLoader.vue'
import FileUploader from '../../../src/components/listing/FileUploader.vue'

import EthereumModule from '../../../src/functionModules/ethereum/EthereumModule'
import MetamaskModule from '../../../src/functionModules/metamask/MetamaskModule'
import VotingContractModule from '../../../src/functionModules/protocol/VotingContractModule'
import ListingContractModule from '../../../src/functionModules/protocol/ListingContractModule'

import FfaListing, { FfaListingStatus } from '../../../src/models/FfaListing'
import { OpenDrawer } from '../../../src/models/Events'

import { library } from '@fortawesome/fontawesome-svg-core'
import { faFile as faFileSolid } from '@fortawesome/free-solid-svg-icons'
import { faFile, faCheckCircle, faPlusSquare } from '@fortawesome/free-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faEthereum } from '@fortawesome/free-brands-svg-icons'

import Web3 from 'web3'
import flushPromises from 'flush-promises'

// tslint:disable no-shadowed-variable

const localVue = createLocalVue()
library.add(faFileSolid, faFile, faCheckCircle, faPlusSquare, faEthereum)

let appModule!: AppModule
let web3Module!: Web3Module
let wrapper!: Wrapper<FfaListedView>
let ignoreBeforeEach = false
let expectRedirect = false
let redirectSucceeded = false

const sectionId = 'ffa-listed'
const messageClass = 'message'
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
  0)

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
    localVue.component('font-awesome-icon', FontAwesomeIcon)
    appModule = getModule(AppModule, appStore)
    web3Module = getModule(Web3Module, appStore)

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
  })

  afterEach(() => {
    redirectSucceeded = false
    flushPromises()
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

      web3Module.disconnect()
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
      expect(wrapper.findAll(`section#${sectionId} .${messageClass}`).length).toBe(1)
      expect(
        wrapper.find(`section#${sectionId} .${messageClass}`)
        .text().indexOf('Connecting')).toBeGreaterThanOrEqual(0)
    })

    it('renders the loading message when metamask is required', () => {

      web3Module.disconnect()
      ignoreBeforeEach = true

      wrapper = mount(FfaListedView, {
        attachToDocument: true,
        store: appStore,
        localVue,
        router,
        propsData: {
          status: FfaListingStatus.listed,
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
      expect(wrapper.findAll(`section#${sectionId} .${messageClass}`).length).toBe(1)
      expect(
        wrapper.find(`section#${sectionId} .${messageClass}`)
        .text().indexOf('Connecting')).toBeGreaterThanOrEqual(0)
    })
  })

  describe('render listing', () => {

    it('renders the listing when web3 is required', async () => {

      web3Module.initialize('http://localhost:8545')
      appModule.setAppReady(true)
      ethereum.selectedAddress = fakeRealAddress
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

      wrapper.setData({ statusVerified: true})

      await flushPromises()

      expect(wrapper.findAll(`section#${sectionId}`).length).toBe(1)
      expect(wrapper.findAll({ name: staticFileMetadataName }).length).toBe(1)
    })

    it('displays a listed', async () => {

      ignoreBeforeEach = true
      ethereum.selectedAddress = fakeRealAddress
      web3Module.initialize('http://localhost:8545')
      appModule.setAppReady(true)
      setAppParams()
      router.push(`/listings/listed/${listingHash}/purchase`)

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
          enablePurchaseButton: true,
        },
      })

      wrapper.setData({ statusVerified: true})

      await flushPromises()

      expect(wrapper.findAll(`section#${sectionId}`).length).toBe(1)
      expect(wrapper.findAll({ name: staticFileMetadataName}).length).toBe(1)
      expect(wrapper.findAll(`section#${sectionId} span[data-size="size"]`).length).toBe(1)

      // Tabs header exists
      expect(wrapper.findAll('.tabs').length).toBe(1)

      // Listing Tab
      // Initial Condition
      expect(wrapper.find({ name: 'StaticFileMetadata' }).isVisible()).toBeTruthy()
      expect(wrapper.find('button[data-purchase="true"]').isVisible()).toBeTruthy()

      wrapper.findAll('li').at(1).trigger('click')

      // Details Tab
      expect(wrapper.find({ name: 'StaticFileMetadata' }).isVisible()).toBeFalsy()
      expect(wrapper.find('button[data-challenge="true"]').isVisible()).toBeTruthy()
    })

    it('purchase button works correctly', async () => {

      ignoreBeforeEach = true
      ethereum.selectedAddress = fakeRealAddress
      web3Module.initialize('http://localhost:8545')
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
          enablePurchaseButton: true,
        },
      })

      wrapper.setData({ statusVerified: true })

      await flushPromises()
      let purchaseButton = wrapper.find('button[data-purchase="true"]')
      expect(purchaseButton.exists()).toBeTruthy()

      wrapper = mount(FfaListedView, {
        attachToDocument: true,
        store: appStore,
        localVue,
        router,
        propsData: {
          status: FfaListingStatus.listed,
          listingHash,
          requiresMetamask: true,
          enablePurchaseButton: true,
        },
      })

      purchaseButton = wrapper.find('button[data-purchase="true"]')
      expect(purchaseButton.exists()).toBeFalsy()
    })
  })

  describe('redirects', () => {
    it('redirects a non-listed to /', () => {

      expectRedirect = false
      ignoreBeforeEach = true
      web3Module.initialize('http://localhost:8545')
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

  // describe('FfaListedView tabs header', () => {
  //   it('renders correctly with clicks', async () => {
  //     ignoreBeforeEach = true
  //     ethereum.selectedAddress = fakeRealAddress
  //     web3Module.initialize('http://localhost:8545')
  //     appModule.setAppReady(true)
  //     setAppParams()

  //     const ffaListingsModule = getModule(FfaListingsModule, appStore)
  //     ffaListingsModule.addToListed(ffaListing)

  //     wrapper = mount(FfaListedView, {
  //       attachToDocument: true,
  //       store: appStore,
  //       localVue,
  //       router,
  //       propsData: {
  //         status: FfaListingStatus.listed,
  //         listingHash,
  //         requiresMetamask: true,
  //       },
  //     })
  //     wrapper.setData({ statusVerified: true})

  //     await flushPromises()

  //     console.log(wrapper.html())


  //   })
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
  appModule.setMarketTokenBalance(1)
}

function delay(ms: number): Promise<any> {
  return new Promise( (resolve) => setTimeout(resolve, ms) )
}
