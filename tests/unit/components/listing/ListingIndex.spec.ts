import VueRouter from 'vue-router'
import { shallowMount, createLocalVue, mount } from '@vue/test-utils'
import ListingIndex from '../../../../src/components/ui/ListingIndex.vue'
import appStore from '../../../../src/store'
import FfaListing, { FfaListingStatus} from '../../../../src/models/FfaListing'

const localVue = createLocalVue()

describe('ListingIndex.vue', () => {

  beforeAll(() => {
    localVue.use(VueRouter)
  })

  describe('handleDisplay()', () => {
    it('correctly renders user candidate listings when given address and candidate props', async () => {
      const userAddress = '0xwall3t'
      const wrapper = shallowMount(ListingIndex, {
        attachToDocument: true,
        store: appStore,
        propsData: {
          displayCategory: 'candidate',
          userAddress,
        },
      })
      // @ts-ignore
      await wrapper.vm.handleDisplay()
      const candidates = wrapper.vm.$data.displayedListings.filter((candidate: FfaListing) => {
        return candidate.status === FfaListingStatus.candidate
      })

      const userCandidatesOnly = wrapper.vm.$data.displayedListings.every((candidate: FfaListing) => {
        return candidate.status === FfaListingStatus.candidate && candidate.owner === userAddress
      })

      expect(candidates.length).toBe(5)
      expect(userCandidatesOnly).toBeTruthy()
    })

    it('correctly renders user listed listings when given address and listed props', async () => {
      const userAddress = '0xwall3t'
      const wrapper = shallowMount(ListingIndex, {
        attachToDocument: true,
        store: appStore,
        propsData: {
          displayCategory: 'listed',
          userAddress,
        },
      })
      // @ts-ignore
      await wrapper.vm.handleDisplay()

      const listed = wrapper.vm.$data.displayedListings.filter((candidate: FfaListing) => {
        return candidate.status === FfaListingStatus.listed
      })

      const userListedOnly = wrapper.vm.$data.displayedListings.every((candidate: FfaListing) => {
        return candidate.status === FfaListingStatus.listed && candidate.owner === userAddress
      })

      expect(listed.length).toBe(5)
      expect(userListedOnly).toBeTruthy()
    })

    it('correctly renders all user listings when given address and listed props', async () => {
      const userAddress = '0xwall3t'
      const wrapper = shallowMount(ListingIndex, {
        attachToDocument: true,
        store: appStore,
        propsData: {
          displayCategory: '',
          userAddress,
        },
      })
      // @ts-ignore
      await wrapper.vm.handleDisplay()

      const userListingsOnly = wrapper.vm.$data.displayedListings.every((candidate: FfaListing) => {
        return candidate.owner === userAddress
      })

      expect(wrapper.vm.$data.displayedListings.length).toBe(10)
      expect(userListingsOnly).toBeTruthy()
    })

    it('correctly renders all candidate listings when given candidate props', async () => {
      const userAddress = ''
      const wrapper = shallowMount(ListingIndex, {
        attachToDocument: true,
        store: appStore,
        propsData: {
          displayCategory: 'candidate',
          userAddress,
        },
      })
      // @ts-ignore
      await wrapper.vm.handleDisplay()

      const candidatesOnly = wrapper.vm.$data.displayedListings.every((candidate: FfaListing) => {
        return candidate.status === FfaListingStatus.candidate
      })

      expect(wrapper.vm.$data.displayedListings.length).toBe(5)
      expect(candidatesOnly).toBeTruthy()
    })

    it('correctly renders all listed listings when given listed props', async () => {
      const userAddress = ''
      const wrapper = shallowMount(ListingIndex, {
        attachToDocument: true,
        store: appStore,
        propsData: {
          displayCategory: 'listed',
          userAddress,
        },
      })
      // @ts-ignore
      await wrapper.vm.handleDisplay()

      const listedOnly = wrapper.vm.$data.displayedListings.every((candidate: FfaListing) => {
        return candidate.status === FfaListingStatus.listed
      })

      expect(wrapper.vm.$data.displayedListings.length).toBe(5)
      expect(listedOnly).toBeTruthy()
    })

    it('correctly renders all listings when given not given props', async () => {
      const userAddress = ''
      const wrapper = shallowMount(ListingIndex, {
        attachToDocument: true,
        store: appStore,
        propsData: {
          displayCategory: '',
          userAddress,
        },
      })

      // @ts-ignore
      await wrapper.vm.handleDisplay()
      expect(wrapper.vm.$data.displayedListings.length).toBe(10)
    })
  })
})
