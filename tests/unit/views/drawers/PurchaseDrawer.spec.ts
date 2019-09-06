import { TransactOpts } from '@computable/computablejs/dist/interfaces'

import { mount, createLocalVue, Wrapper } from '@vue/test-utils'
import VueRouter, { Route } from 'vue-router'
import { router } from '../../../../src/router'

import appStore from '../../../../src/store'
import { getModule } from 'vuex-module-decorators'
import DrawerModule, { DrawerState } from '../../../../src/vuexModules/DrawerModule'
import AppModule from '../../../../src/vuexModules/AppModule'
import Web3Module from '../../../../src/vuexModules/Web3Module'
import FlashesModule from '../../../../src/vuexModules/FlashesModule'

import MetamaskModule from '../../../../src/functionModules/metamask/MetamaskModule'
import VotingContractModule from '../../../../src/functionModules/protocol/VotingContractModule'
import ListingContractModule from '../../../../src/functionModules/protocol/ListingContractModule'

import PurchaseDrawer from '@/views/drawers/PurchaseDrawer.vue'
import App from '@/App.vue'
import Navigation from '@/components/ui/Navigation.vue'
import Drawer from '@/components/ui/Drawer.vue'

import Servers from '../../../../src/util/Servers'

import { library } from '@fortawesome/fontawesome-svg-core'
import { faFile as faFileSolid } from '@fortawesome/free-solid-svg-icons'
import { faFile, faCheckCircle } from '@fortawesome/free-regular-svg-icons'
import { faEthereum } from '@fortawesome/free-brands-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

import Web3 from 'web3'
import flushPromises from 'flush-promises'

// tslint:disable no-shadowed-variable

library.add(faFileSolid, faFile, faCheckCircle, faEthereum)
const purchaseDrawerId = 'purchase-drawer'
const drawerErrorClass = 'drawer-error'

let appModule!: AppModule
let web3Module!: Web3Module

describe('PurchaseDrawer.vue', () => {

  const localVue = createLocalVue()
  let wrapper!: Wrapper<PurchaseDrawer>

  beforeAll(() => {
    localVue.use(VueRouter)
    localVue.component('navigation', Navigation)
    localVue.component('drawer', Drawer)
    localVue.component('font-awesome-icon', FontAwesomeIcon)
    appModule = getModule(AppModule, appStore)
    web3Module = getModule(Web3Module, appStore)

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
  })

  afterEach(() => {
    wrapper.destroy()
  })

  it('renders the PurchaseDrawer and PurchaseProcess when hasMetamask', () => {

    setAppParams()

    ethereum.selectedAddress = '0x2C10c931FEbe8CA490A0Da3F7F78D463550CB048'
    web3Module.initialize('http://localhost:8545')
    appModule.setAppReady(true)

    wrapper = mount(PurchaseDrawer, {
      attachToDocument: true,
      store: appStore,
      localVue,
    })

    expect(wrapper.findAll(`#${purchaseDrawerId}`).length).toBe(1)
  })

  it('renders the PurchaseDrawer with error message when !hasMetamask', () => {

    web3Module.disconnect()
    delete ethereum.selectedAddress
    appModule.setAppReady(false)

    wrapper = mount(PurchaseDrawer, {
      attachToDocument: true,
      store: appStore,
      localVue,
    })

    expect(wrapper.findAll(`#${purchaseDrawerId}`).length).toBe(0)
    expect(wrapper.findAll(`.${drawerErrorClass}`).length).toBe(1)
    expect(wrapper.find(`.${drawerErrorClass}`).text()).toEqual('Metamask not connected or not installed.')
  })
})

// TODO: move to App.spec.ts
describe('App level integration test', () => {

  const localVue = createLocalVue()
  let integrationWrapper!: Wrapper<App>

  beforeAll(() => {
    localVue.use(VueRouter)
    localVue.component('navigation', Navigation)
    localVue.component('drawer', Drawer)
    localVue.component('font-awesome-icon', FontAwesomeIcon)
    appModule = getModule(AppModule, appStore)
    web3Module = getModule(Web3Module, appStore)
  })

  beforeEach(() => {
    router.beforeEach((to: Route, from: Route, next: (p: any) => void) => {
      console.log(`to: ${to.fullPath}, from: ${from.fullPath}`)
      next(true)
    })
  })

  afterEach(() => {
    integrationWrapper.destroy()
  })

  it ('correctly reacts to setAppReady when true', async () => {

    ethereum.selectedAddress = '0x123'
    web3Module.initialize(Servers.SkynetJsonRpc)

    MetamaskModule.enableEthereum = (
      flashesModule: FlashesModule,
      web3Module: Web3Module): Promise<boolean> => {

      return Promise.resolve(true)
    }

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

    router.replace('/listings/listed/0x1234567/purchase')

    integrationWrapper = mount(App, {
      attachToDocument: true,
      store: appStore,
      localVue,
      router,
    })

    await flushPromises()

    expect(integrationWrapper.findAll('.list-drawer-container').length).toBe(1)
    expect(integrationWrapper.findAll('#purchase-drawer').length).toBe(1)
  })

  it ('correctly reacts to setAppReady when true', async () => {

    ethereum.selectedAddress = ''
    web3Module.disconnect()

    MetamaskModule.enableEthereum = (
      flashesModule: FlashesModule,
      web3Module: Web3Module): Promise<boolean> => {

      return Promise.resolve(false)
    }

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

    // router.replace('/listings/listed/0x1234567/purchase')

    integrationWrapper = mount(App, {
      attachToDocument: true,
      store: appStore,
      localVue,
      router,
    })

    await flushPromises()

    expect(integrationWrapper.findAll('.list-drawer-container').length).toBe(1)
    expect(integrationWrapper.findAll('.drawer-error').length).toBe(1)
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
