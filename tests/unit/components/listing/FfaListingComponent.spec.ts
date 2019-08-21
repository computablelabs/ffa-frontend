import VueRouter from 'vue-router'
import { shallowMount, createLocalVue, mount } from '@vue/test-utils'
import FfaListingComponent from '../../../../src/components/ui/FfaListingComponent.vue'
import appStore from '../../../../src/store'
import FfaListing, { FfaListingStatus} from '../../../../src/models/FfaListing'

const localVue = createLocalVue()
const ffaListingClass = '.ffa-listing'
const userAddress = '0xwall3t'
const statusAttribute = '[data-property="status"]'
const ownerAttribute = '[data-property="owner"]'

describe('FfaListingComponent.vue', () => {

  beforeAll(() => {
    localVue.use(VueRouter)
  })

  describe('renderList()', () => {
    it('correctly renders user candidate listings when given address and candidate props', async () => {
      const wrapper = mount(FfaListingComponent, {
        attachToDocument: true,
        store: appStore,
        propsData: {
          status: FfaListingStatus.candidate,
          userAddress,
        },
      })
      // @ts-ignore
      await wrapper.vm.renderList()

      const statusAttributeWrapperArray = wrapper.findAll(statusAttribute)
      const nonCandidates = statusAttributeWrapperArray.filter((wrapped) => {
        return wrapped.text() !== FfaListingStatus.candidate
      })
      expect(wrapper.findAll(`${ffaListingClass}`).length).toBe(5)
      expect(statusAttributeWrapperArray.length).toBe(5)
      expect(nonCandidates.length).toBe(0)
    })

    it('correctly renders user listed listings when given address and listed props', async () => {
      const wrapper = mount(FfaListingComponent, {
        attachToDocument: true,
        store: appStore,
        propsData: {
          status: FfaListingStatus.listed,
          userAddress,
        },
      })
      // @ts-ignore
      await wrapper.vm.renderList()

      const statusAttributeWrapperArray = wrapper.findAll(statusAttribute)
      const nonListed = statusAttributeWrapperArray.filter((wrapped) => {
        return wrapped.text() !== FfaListingStatus.listed
      })
      expect(wrapper.findAll(`${ffaListingClass}`).length).toBe(4)
      expect(statusAttributeWrapperArray.length).toBe(4)
      expect(nonListed.length).toBe(0)
    })

    it('correctly renders all user listings when given address and listed props', async () => {
      const wrapper = mount(FfaListingComponent, {
        attachToDocument: true,
        store: appStore,
        propsData: { userAddress },
      })
      // @ts-ignore
      await wrapper.vm.renderList()

      const ownerAttributeWrapperArray = wrapper.findAll(ownerAttribute)
      const nonOwned = ownerAttributeWrapperArray.filter((wrapped) => (wrapped.text() !== userAddress))
      expect(wrapper.findAll(`${ffaListingClass}`).length).toBe(9)
      expect(ownerAttributeWrapperArray.length).toBe(9)
      expect(nonOwned.length).toBe(0)
    })

    it('correctly renders all candidate listings when given candidate props', async () => {
      const wrapper = mount(FfaListingComponent, {
        attachToDocument: true,
        store: appStore,
        propsData: { status: FfaListingStatus.candidate },
      })
      // @ts-ignore
      await wrapper.vm.renderList()

      const statusAttributeWrapperArray = wrapper.findAll(statusAttribute)
      const nonCandidates = statusAttributeWrapperArray.filter((wrapped) => {
        return wrapped.text() !== FfaListingStatus.candidate
      })
      expect(wrapper.findAll(`${ffaListingClass}`).length).toBe(6)
      expect(statusAttributeWrapperArray.length).toBe(6)
      expect(nonCandidates.length).toBe(0)
    })

    it('correctly renders all listed listings when given listed props', async () => {
      const wrapper = mount(FfaListingComponent, {
        attachToDocument: true,
        store: appStore,
        propsData: { status: FfaListingStatus.listed },
      })
      // @ts-ignore
      await wrapper.vm.renderList()

      const statusAttributeWrapperArray = wrapper.findAll(statusAttribute)
      const nonListed = statusAttributeWrapperArray.filter((wrapped) => {
        return wrapped.text() !== FfaListingStatus.listed
      })
      expect(wrapper.findAll(`${ffaListingClass}`).length).toBe(7)
      expect(statusAttributeWrapperArray.length).toBe(7)
      expect(nonListed.length).toBe(0)
    })

    it('correctly renders all listings when given not given props', async () => {
      const wrapper = mount(FfaListingComponent, {
        attachToDocument: true,
        store: appStore,
      })

      // @ts-ignore
      await wrapper.vm.renderList()
      expect(wrapper.findAll(`${ffaListingClass}`).length).toBe(13)
    })
  })
})
