import VueRouter from 'vue-router'
import { createLocalVue, shallowMount, Wrapper} from '@vue/test-utils'
import Listings from '../../../src/views/Listings.vue'
import appStore from '../../../src/store'

import DatatrustModule from '../../../src/functionModules/datatrust/DatatrustModule'

import FfaListing, { FfaListingStatus} from '../../../src/models/FfaListing'

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

describe('Listings.vue', () => {

  let wrapper!: Wrapper<Listings>

  beforeAll(async () => {
    localVue.use(VueRouter)

    DatatrustModule.getCandidates = jest.fn(() => {
      return Promise.resolve([undefined, [candidate], 1])
    })
    DatatrustModule.getListed = jest.fn(() => {
      return Promise.resolve([undefined, [listed], 1])
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
