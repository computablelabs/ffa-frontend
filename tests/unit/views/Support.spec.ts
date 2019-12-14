import { shallowMount, createLocalVue, Wrapper } from '@vue/test-utils'
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
import CoinbaseModule from '../../../src/functionModules/ethereum/CoinbaseModule'
import MetamaskModule from '../../../src/functionModules/metamask/MetamaskModule'
import ParameterizerContractModule from '../../../src/functionModules/protocol/ParameterizerContractModule'

import flushPromises from 'flush-promises'

// tslint:disable no-shadowed-variable

const localVue = createLocalVue()

let appModule!: AppModule
let wrapper!: Wrapper<Support>

const sectionId = 'support'

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

      wrapper = shallowMount(Support, {
        attachToDocument: true,
        store: appStore,
        localVue,
        router,
        propsData: {
        },
      })

      expect(wrapper.vm.$props.requiresParameters).toBeFalsy()
    })
  })

  describe('loading message', () => {
    it('renders the loading message when parameters are required', () => {

      appModule.disconnectWeb3()

      wrapper = shallowMount(Support, {
        attachToDocument: true,
        store: appStore,
        localVue,
        router,
        propsData: {
          requiresParameters: true,
        },
      })

      expect(wrapper.findAll(`#${sectionId}`).length).toBe(1)
      expect(wrapper.findAll(`ethereumloader-stub`).length).toBe(1)
      expect(wrapper.findAll(`supportcooperative-stub`).length).toBe(0)
      expect(wrapper.findAll(`withdrawfromcooperative-stub`).length).toBe(0)
      expect(wrapper.findAll(`cooperativeinfo-stub`).length).toBe(0)
    })
  })

  // describe('render', () => {

  //   it('renders the support page', async () => {

  //     appModule.initializeWeb3('http://localhost:8545')
  //     ethereum.selectedAddress = fakeRealAddress

  //     CoinbaseModule.getEthereumPriceUSD = jest.fn(() => Promise.resolve([]))

  //     ParameterizerContractModule.getParameterizer = jest.fn()
  //     ParameterizerContractModule.getParameters = jest.fn(() => Promise.resolve([]))
  //     ParameterizerContractModule.getMakerPayment = jest.fn()
  //     ParameterizerContractModule.getCostPerByte = jest.fn()
  //     ParameterizerContractModule.getStake = jest.fn()
  //     ParameterizerContractModule.getPriceFloor = jest.fn()
  //     ParameterizerContractModule.getPlurality = jest.fn()
  //     ParameterizerContractModule.getVoteBy = jest.fn()

  //     EthereumModule.getEtherTokenContractAllowance = jest.fn((
  //       contractAddress: string, appStore: Store<any>) => {
  //         return Promise.resolve(appModule.setEtherTokenReserveAllowance(100))
  //       })

  //     CoinbaseModule.getEthereumPriceUSD = jest.fn()

  //     wrapper = shallowMount(Support, {
  //       attachToDocument: true,
  //       store: appStore,
  //       localVue,
  //       router,
  //       propsData: {
  //         requiresParameters: true,
  //       },
  //     })

  //     setAppParams()
  //     appModule.setAppReady(true)

  //     await flushPromises()
  //     console.log(wrapper.html())

  //     expect(wrapper.findAll(`#${sectionId}`).length).toBe(1)
  //     expect(wrapper.findAll(`ethereumloader-stub`).length).toBe(0)
  //     expect(wrapper.findAll(`supportcooperative-stub`).length).toBe(1)
  //     expect(wrapper.findAll(`withdrawfromcooperative-stub`).length).toBe(1)
  //     expect(wrapper.findAll(`cooperativeinfo-stub`).length).toBe(1)
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
  appModule.setEtherTokenBalance(1)
  appModule.setMarketTokenBalance(1)
  appModule.setEtherTokenDatatrustAllowance(1)
  appModule.setEtherTokenReserveAllowance(1)
  appModule.setTotalMarketTokenSupply(1)
  appModule.setTotalReserveEtherTokenSupply(1)
  appModule.setSupportPrice(50000)
  appModule.setMarketTokenVotingContractAllowance(1)
}
