import VueRouter from 'vue-router'
import { createLocalVue, mount, Wrapper} from '@vue/test-utils'
import Listings from '../../../src/views/Listings.vue'
import appStore from '../../../src/store'
import { FfaListingStatus} from '../../../src/models/FfaListing'

const localVue = createLocalVue()
const ffaListingsId = 'ffa-listings'
const tabsClass = 'tabs'
const owner = '0xowner'

describe('FfaListingsComponent.vue', () => {

  let wrapper!: Wrapper<Listings>

  beforeAll(async () => {
    localVue.use(VueRouter)
  })

  afterEach(() => {
    wrapper.destroy()
  })

  describe('Listings.vue', () => {
    it('correctly renders all listings by default', () => {
      wrapper = mount(Listings, {
        attachToDocument: true,
        store: appStore,
        localVue,
        propsData: {
        },
      })

      expect(wrapper.findAll(`#${ffaListingsId}`).length).toBe(1)
      expect(wrapper.findAll(`.${tabsClass}`).length).toBe(1)
      expect(wrapper.vm.$props.status).toBeUndefined()
      expect(wrapper.vm.$props.walletAddress).toBeUndefined()
    })

    it('correctly renders candidates', () => {
      wrapper = mount(Listings, {
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
      wrapper = mount(Listings, {
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
      wrapper = mount(Listings, {
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
      wrapper = mount(Listings, {
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
      wrapper = mount(Listings, {
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
})
