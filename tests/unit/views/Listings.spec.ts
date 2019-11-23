import VueRouter from 'vue-router'
import { createLocalVue, shallowMount, Wrapper} from '@vue/test-utils'
import { getModule } from 'vuex-module-decorators'
import appStore from '../../../src/store'

import AppModule from '../../../src/vuexModules/AppModule'

import DatatrustModule from '../../../src/functionModules/datatrust/DatatrustModule'

import FfaListing, { FfaListingStatus} from '../../../src/models/FfaListing'

import Listings from '../../../src/views/Listings.vue'

const candidate = new FfaListing(
  'candidate',
  '',
  '',
  '0xcandidate',
  '',
  '',
  0,
  '',
  [],
  FfaListingStatus.candidate,
  0,
  0)

const listed = new FfaListing(
  'listed',
  '',
  '',
  '0xlisted',
  '',
  '',
  0,
  '',
  [],
  FfaListingStatus.listed,
  0,
  0)

const localVue = createLocalVue()
const owner = '0xowner'
let appModule!: AppModule

describe('Listings.vue', () => {

  let wrapper!: Wrapper<Listings>

  beforeAll(async () => {
    localVue.use(VueRouter)

    appModule = getModule(AppModule, appStore)
    appModule.initializeWeb3('http://localhost:8545')

    appModule.web3.eth.getBlockNumber = jest.fn(() => {
      return Promise.resolve(10)
    })

    DatatrustModule.getCandidates = jest.fn((fromBlock: number) => {
      return Promise.resolve([candidate])
    })
    DatatrustModule.getListed = jest.fn((fromBlock: number) => {
      return Promise.resolve([listed])
    })
  })

  afterEach(() => {
    wrapper.destroy()
  })

  it('correctly renders all listings by default', () => {
    wrapper = shallowMount(Listings, {
      attachToDocument: true,
      store: appStore,
      localVue,
      propsData: {
      },
    })

    expect(wrapper.findAll(`routertabs-stub`).length).toBe(1)
    expect(wrapper.findAll(`ffalistingscomponent-stub`).length).toBe(1)
    expect(wrapper.vm.$props.status).toBeUndefined()
    expect(wrapper.vm.$props.walletAddress).toBeUndefined()
  })

  it('correctly renders candidates', () => {
    wrapper = shallowMount(Listings, {
      attachToDocument: true,
      store: appStore,
      localVue,
      propsData: {
        status: FfaListingStatus.candidate,
      },
    })

    expect(wrapper.vm.$props.status).toEqual(FfaListingStatus.candidate)
    expect(wrapper.vm.$props.walletAddress).toBeUndefined()
  })

  it('correctly renders listed', () => {
    wrapper = shallowMount(Listings, {
      attachToDocument: true,
      store: appStore,
      localVue,
      propsData: {
        status: FfaListingStatus.listed,
      },
    })

    expect(wrapper.vm.$props.status).toEqual(FfaListingStatus.listed)
    expect(wrapper.vm.$props.walletAddress).toBeUndefined()
  })

  it('correctly renders all of a user\'s listings', () => {
    wrapper = shallowMount(Listings, {
      attachToDocument: true,
      store: appStore,
      localVue,
      propsData: {
        walletAddress: owner,
      },
    })

    expect(wrapper.vm.$props.status).toBeUndefined()
    expect(wrapper.vm.$props.walletAddress).toEqual(owner)
  })

  it('correctly renders user\'s candidate listings', () => {
    wrapper = shallowMount(Listings, {
      attachToDocument: true,
      store: appStore,
      localVue,
      propsData: {
        walletAddress: owner,
        status: FfaListingStatus.candidate,
      },
    })

    expect(wrapper.vm.$props.status).toEqual(FfaListingStatus.candidate)
    expect(wrapper.vm.$props.walletAddress).toEqual(owner)
  })


  it('correctly renders user\'s listed listings', () => {
    wrapper = shallowMount(Listings, {
      attachToDocument: true,
      store: appStore,
      localVue,
      propsData: {
        walletAddress: owner,
        status: FfaListingStatus.listed,
      },
    })

    expect(wrapper.vm.$props.status).toEqual(FfaListingStatus.listed)
    expect(wrapper.vm.$props.walletAddress).toEqual(owner)
  })
})
