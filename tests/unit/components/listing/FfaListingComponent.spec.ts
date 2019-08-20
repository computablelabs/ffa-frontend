import VueRouter from 'vue-router'
import { shallowMount, createLocalVue, mount } from '@vue/test-utils'
import FfaListingComponent from '../../../../src/components/ui/FfaListingComponent.vue'
import appStore from '../../../../src/store'
import FfaListing, { FfaListingStatus} from '../../../../src/models/FfaListing'

const localVue = createLocalVue()
const ffaListingClass = '.ffa-listing'
const userAddress = '0xwall3t'

describe('FfaListingComponent.vue', () => {

  beforeAll(() => {
    localVue.use(VueRouter)
  })

  describe('renderList()', () => {
    it('correctly renders user candidate listings when given address and candidate props', async () => {
      const wrapper = shallowMount(FfaListingComponent, {
        attachToDocument: true,
        store: appStore,
        propsData: {
          status: FfaListingStatus.candidate,
          userAddress,
        },
      })
      // @ts-ignore
      await wrapper.vm.renderList()

      const userCandidatesOnly = wrapper.vm.$data.displayedListings.every((candidate: FfaListing) => {
        return candidate.status === FfaListingStatus.candidate && candidate.owner === userAddress
      })

      expect(wrapper.findAll(`${ffaListingClass}`).length).toBe(5)
      expect(userCandidatesOnly).toBeTruthy()
    })

    it('correctly renders user listed listings when given address and listed props', async () => {
      const wrapper = shallowMount(FfaListingComponent, {
        attachToDocument: true,
        store: appStore,
        propsData: {
          status: FfaListingStatus.listed,
          userAddress,
        },
      })
      // @ts-ignore
      await wrapper.vm.renderList()

      const userListedOnly = wrapper.vm.$data.displayedListings.every((candidate: FfaListing) => {
        return candidate.status === FfaListingStatus.listed && candidate.owner === userAddress
      })

      expect(wrapper.findAll(`${ffaListingClass}`).length).toBe(4)
      expect(userListedOnly).toBeTruthy()
    })

    it('correctly renders all user listings when given address and listed props', async () => {
      const wrapper = shallowMount(FfaListingComponent, {
        attachToDocument: true,
        store: appStore,
        propsData: {
          status: '',
          userAddress,
        },
      })
      // @ts-ignore
      await wrapper.vm.renderList()

      const userListingsOnly = wrapper.vm.$data.displayedListings.every((candidate: FfaListing) => {
        return candidate.owner === userAddress
      })

      expect(wrapper.findAll(`${ffaListingClass}`).length).toBe(9)
      expect(userListingsOnly).toBeTruthy()
    })

    it('correctly renders all candidate listings when given candidate props', async () => {
      const wrapper = shallowMount(FfaListingComponent, {
        attachToDocument: true,
        store: appStore,
        propsData: { status: FfaListingStatus.candidate },
      })
      // @ts-ignore
      await wrapper.vm.renderList()

      const candidatesOnly = wrapper.vm.$data.displayedListings.every((candidate: FfaListing) => {
        return candidate.status === FfaListingStatus.candidate
      })

      expect(wrapper.findAll(`${ffaListingClass}`).length).toBe(6)
      expect(candidatesOnly).toBeTruthy()
    })

    it('correctly renders all listed listings when given listed props', async () => {
      const wrapper = shallowMount(FfaListingComponent, {
        attachToDocument: true,
        store: appStore,
        propsData: { status: FfaListingStatus.listed },
      })
      // @ts-ignore
      await wrapper.vm.renderList()

      const listedOnly = wrapper.vm.$data.displayedListings.every((candidate: FfaListing) => {
        return candidate.status === FfaListingStatus.listed
      })

      expect(wrapper.findAll(`${ffaListingClass}`).length).toBe(7)
      expect(listedOnly).toBeTruthy()
    })

    it('correctly renders all listings when given not given props', async () => {
      const wrapper = shallowMount(FfaListingComponent, {
        attachToDocument: true,
        store: appStore,
      })

      // @ts-ignore
      await wrapper.vm.renderList()
      expect(wrapper.findAll(`${ffaListingClass}`).length).toBe(13)
    })
  })
})
