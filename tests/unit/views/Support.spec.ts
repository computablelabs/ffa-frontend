import { mount, createLocalVue, Wrapper } from '@vue/test-utils'
import VueRouter from 'vue-router'
import { router } from '../../../src/router'

import { getModule } from 'vuex-module-decorators'
import { Store } from 'vuex'
import appStore from '../../../src/store'
import AppModule from '../../../src/vuexModules/AppModule'

import Navigation from '../../../src/components/ui/Navigation.vue'
import Drawer from '../../../src/components/ui/Drawer.vue'
import Support from '../../../src/views/Support.vue'

import EthereumModule from '../../../src/functionModules/ethereum/EthereumModule'

import flushPromises from 'flush-promises'

// tslint:disable no-shadowed-variable

const localVue = createLocalVue()

let appModule!: AppModule
let wrapper!: Wrapper<Support>

const sectionId = 'support'
const messageClass = '.message'
const yourTokensClass = '.your-tokens'
const supportCooperativeClass = '.support-cooperative'
const withdrawFromCooperativeClass = '.withdraw-from-cooperative'

const fakeRealAddress = '0x2C10c931FEbe8CA490A0Da3F7F78D463550CB048'

describe('Support.vue', () => {

  beforeAll(() => {
    localVue.use(VueRouter)
    localVue.component('Navigation', Navigation)
    localVue.component('Drawer', Drawer)
    appModule = getModule(AppModule, appStore)
  })

  beforeEach(() => {

    setAppParams()
  })

  afterEach(() => {
    flushPromises()
    wrapper.destroy()
  })

  describe('props', () => {
    it('sets default requires props', () => {

      wrapper = mount(Support, {
        attachToDocument: true,
        store: appStore,
        localVue,
        router,
        propsData: {
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

    it('renders the loading message when parameters are required', () => {

      appModule.disconnectWeb3()

      wrapper = mount(Support, {
        attachToDocument: true,
        store: appStore,
        localVue,
        router,
        propsData: {
          requiresParameters: true,
        },
      })

      expect(wrapper.findAll(`section#${sectionId}`).length).toBe(1)
      expect(wrapper.findAll(`section#${sectionId} ${messageClass}`).length).toBe(1)
      expect(
        wrapper.find(`section#${sectionId} ${messageClass}`)
        .text().indexOf('Connecting')).toBeGreaterThanOrEqual(0)
    })
  })

  describe('render', () => {

    it('renders the support page', async () => {

      appModule.initializeWeb3('http://localhost:8545')
      ethereum.selectedAddress = fakeRealAddress

      EthereumModule.getEthereumContractAllowance = jest.fn((
        contractAddress: string, appStore: Store<any>) => {
          return Promise.resolve(appModule.setReserveContractAllowance(100))
        })

      wrapper = mount(Support, {
        attachToDocument: true,
        store: appStore,
        localVue,
        router,
        propsData: {
          requiresParameters: true,
        },
      })

      setAppParams()
      appModule.setAppReady(true)

      await flushPromises()
      console.log(wrapper.html())
      expect(wrapper.findAll(`section#${sectionId}`).length).toBe(1)
      expect(wrapper.findAll(yourTokensClass).length).toBe(1)
      expect(wrapper.findAll(supportCooperativeClass).length).toBe(1)
      expect(wrapper.findAll(withdrawFromCooperativeClass).length).toBe(1)
    })

    // TODO: pending implementation
    // it('raises drawer', async () => {

    // })
  })
})

function setAppParams() {
  appModule.setMakerPayment(1)
  appModule.setCostPerByte(1)
  appModule.setStake(1)
  appModule.setPriceFloor(1)
  appModule.setPlurality(1)
  appModule.setVoteBy(1)
  appModule.setEtherTokenBalance(1)
  appModule.setMarketTokenBalance(1)
  appModule.setDatatrustContractAllowance(1)
  appModule.setSupportPrice(50000)
}
