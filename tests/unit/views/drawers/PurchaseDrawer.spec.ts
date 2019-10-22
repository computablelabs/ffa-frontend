
import { mount, createLocalVue, Wrapper } from '@vue/test-utils'
import VueRouter, { Route } from 'vue-router'
import { router } from '../../../../src/router'

import { Store } from 'vuex'
import appStore from '../../../../src/store'
import { getModule } from 'vuex-module-decorators'
import AppModule from '../../../../src/vuexModules/AppModule'
import FfaListingsModule from '../../../../src/vuexModules/FfaListingsModule'

import MetamaskModule from '../../../../src/functionModules/metamask/MetamaskModule'
import VotingContractModule from '../../../../src/functionModules/protocol/VotingContractModule'
import ListingContractModule from '../../../../src/functionModules/protocol/ListingContractModule'

import FfaListing, { FfaListingStatus } from '../../../../src/models/FfaListing'
import { ProcessStatus } from '../../../../src/models/ProcessStatus'

import PurchaseDrawer from '@/views/drawers/PurchaseDrawer.vue'
import App from '@/App.vue'
import Navigation from '@/components/ui/Navigation.vue'
import Drawer from '@/components/ui/Drawer.vue'

import Servers from '../../../../src/util/Servers'

import Web3 from 'web3'
import flushPromises from 'flush-promises'
import PurchaseModule from '../../../../src/vuexModules/PurchaseModule'

// tslint:disable no-shadowed-variable
const purchaseDrawerId = 'purchase-drawer'
const drawerErrorClass = 'drawer-error'
const purchaseProcessClass = 'purchase-process'
const purchaseButtonsClass = 'purchase-buttons'

const fakeRealAddress = '0x2C10c931FEbe8CA490A0Da3F7F78D463550CB048'

let appModule!: AppModule
let ffaListingsModule!: FfaListingsModule
let purchaseModule!: PurchaseModule

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

describe('PurchaseDrawer.vue', () => {

  const localVue = createLocalVue()
  let wrapper!: Wrapper<PurchaseDrawer>

  beforeAll(() => {
    localVue.use(VueRouter)
    appModule = getModule(AppModule, appStore)
    ffaListingsModule = getModule(FfaListingsModule, appStore)
    purchaseModule = getModule(PurchaseModule, appStore)

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
  })

  afterEach(() => {
    if (wrapper !== undefined) {
      wrapper.destroy()
    }
  })

  it('renders the error when there is no listingHash', () => {

    setAppParams()

    ethereum.selectedAddress = fakeRealAddress
    appModule.initializeWeb3('http://localhost:8545')
    appModule.setAppReady(true)

    wrapper = mount(PurchaseDrawer, {
      attachToDocument: true,
      store: appStore,
      localVue,
      router,
    })

    expect(wrapper.findAll(`#${purchaseDrawerId}`).length).toBe(1)
    // expect(wrapper.findAll(`#${purchaseDrawerId} .${drawerErrorClass}`).length).toBe(1)
  })

  it('renders the PurchaseDrawer with error message when !appReady', () => {

    appModule.disconnectWeb3()
    delete ethereum.selectedAddress
    appModule.setAppReady(false)
    ffaListingsModule.addToListed(listing)

    wrapper = mount(PurchaseDrawer, {
      attachToDocument: true,
      store: appStore,
      localVue,
      propsData: {
        listingHash,
      },
    })

    expect(wrapper.findAll(`#${purchaseDrawerId}`).length).toBe(1)
    // expect(wrapper.findAll(`#${purchaseDrawerId} .${drawerErrorClass}`).length).toBe(1)
  })

  it('renders the PurchaseDrawer and PurchaseProcess when !hasError', () => {

    setAppParams()

    ethereum.selectedAddress = fakeRealAddress
    appModule.initializeWeb3('http://localhost:8545')
    appModule.setAppReady(true)

    wrapper = mount(PurchaseDrawer, {
      attachToDocument: true,
      store: appStore,
      localVue,
      propsData: {
        listingHash,
      },
    })

    expect(wrapper.findAll(`#${purchaseDrawerId}`).length).toBe(1)
    // expect(wrapper.findAll(`#${purchaseDrawerId} .${purchaseButtonsClass}`).length).toBe(1)
  })

  // it('conditional rendering of ProcessStatus', () => {

  //   wrapper = mount(PurchaseDrawer, {
  //     attachToDocument: true,
  //     store: appStore,
  //     router,
  //     localVue,
  //     propsData: {
  //       listingHash,
  //     },
  //   })

  //   purchaseModule.setStatus(ProcessStatus.NotReady)
  //   expect(wrapper.findAll(`#${purchaseDrawerId}`).length).toBe(1)

  //   expect(wrapper.findAll(`#${purchaseDrawerId} .${purchaseButtonsClass}`).length).toBe(1)
  //   expect(wrapper.findAll(`#${purchaseDrawerId} .${purchaseProcessClass}`).length).toBe(0)

  //   purchaseModule.setStatus(ProcessStatus.Ready)
  //   expect(wrapper.findAll(`#${purchaseDrawerId} .${purchaseButtonsClass}`).length).toBe(1)
  //   expect(wrapper.findAll(`#${purchaseDrawerId} .${purchaseProcessClass}`).length).toBe(0)

  //   purchaseModule.setStatus(ProcessStatus.Executing)
  //   expect(wrapper.findAll(`#${purchaseDrawerId} .${purchaseButtonsClass}`).length).toBe(0)
  //   expect(wrapper.findAll(`#${purchaseDrawerId} .${purchaseProcessClass}`).length).toBe(1)

  //   purchaseModule.setStatus(ProcessStatus.Complete)
  //   expect(wrapper.findAll(`#${purchaseDrawerId} .${purchaseButtonsClass}`).length).toBe(1)
  //   expect(wrapper.findAll(`#${purchaseDrawerId} .${purchaseProcessClass}`).length).toBe(0)
  // })
})

// TODO: move to App.spec.ts
describe('App level integration test', () => {

  const localVue = createLocalVue()
  let integrationWrapper!: Wrapper<App>

  beforeAll(() => {
    localVue.use(VueRouter)
    localVue.component('navigation', Navigation)
    localVue.component('drawer', Drawer)
    appModule = getModule(AppModule, appStore)

    router.beforeEach((to: Route, from: Route, next: (p: any) => void) => {
      console.log(`to: ${to.fullPath}, from: ${from.fullPath}`)
      next(true)
    })
  })

  afterEach(() => {
    integrationWrapper.destroy()
  })

  it ('correctly loads the drawer', async () => {

    ethereum.selectedAddress = fakeRealAddress
    appModule.initializeWeb3(Servers.SkynetJsonRpc)

    MetamaskModule.enableEthereum = (
      appStore: Store<any>): Promise<boolean> => {

      return Promise.resolve(true)
    }

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

    router.replace(`/listings/listed/${listingHash}/purchase`)

    integrationWrapper = mount(App, {
      attachToDocument: true,
      store: appStore,
      localVue,
      router,
    })

    await flushPromises()

    expect(integrationWrapper.findAll(`#${purchaseDrawerId}`).length).toBe(1)
    // expect(integrationWrapper.findAll(`#${purchaseDrawerId} .${purchaseButtonsClass}`).length).toBe(1)
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
