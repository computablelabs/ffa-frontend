import VueRouter from 'vue-router'
import { shallowMount, createLocalVue, mount, Wrapper} from '@vue/test-utils'
import FfaListingComponent from '../../../../src/components/ui/FfaListingComponent.vue'
import appStore from '../../../../src/store'
import FfaListing, { FfaListingStatus} from '../../../../src/models/FfaListing'
import { getModule } from 'vuex-module-decorators'
import FfalistingsModule from '../../../../src/vuexModules/FfaListingsModule'
import FfaListingsModule from '../../../../src/vuexModules/FfaListingsModule'

const localVue = createLocalVue()
const ffaListingClass = '.ffa-listing'
const userAddress = '0xwall3t'
const listedAttribute = 'span[data-status="listed"]'
const candidateAttribute = 'span[data-status="candidate"]'
const ownerAttribute = '[data-property="owner"]'

describe('FfaListingComponent.vue', () => {

  let wrapper!: Wrapper<FfaListingComponent>

  beforeAll(async () => {
    localVue.use(VueRouter)
    const ffaListingsModule = getModule(FfalistingsModule, appStore)
    await ffaListingsModule.fetchCandidates()
    await ffaListingsModule.fetchListed()
  })


  afterEach(() => {
    wrapper.destroy()
  })

  describe('renderList()', () => {
    it('correctly renders user candidate listings when given address and candidate props', async () => {
      wrapper = mount(FfaListingComponent, {
        attachToDocument: true,
        store: appStore,
        propsData: {
          status: FfaListingStatus.candidate,
          userAddress,
        },
      })

      // @ts-ignore
      await wrapper.vm.renderList()

      const candidateAttributeWrapperArray = wrapper.findAll(candidateAttribute)
      const nonCandidates = candidateAttributeWrapperArray.filter((wrapped) => {
        return wrapped.text() !== FfaListingStatus.candidate
      })
      expect(wrapper.findAll(`${ffaListingClass}`).length).toBe(5)
      expect(candidateAttributeWrapperArray.length).toBe(5)
      expect(nonCandidates.length).toBe(0)
    })

    it('correctly renders user listed listings when given address and listed props', async () => {
      wrapper = mount(FfaListingComponent, {
        attachToDocument: true,
        store: appStore,
        propsData: {
          status: FfaListingStatus.listed,
          userAddress,
        },
      })

      // @ts-ignore
      await wrapper.vm.renderList()

      const listedAttributeWrapperArray = wrapper.findAll(listedAttribute)
      const nonListed = listedAttributeWrapperArray.filter((wrapped) => {
        return wrapped.text() !== FfaListingStatus.listed
      })
      expect(wrapper.findAll(`${ffaListingClass}`).length).toBe(4)
      expect(listedAttributeWrapperArray.length).toBe(4)
      expect(nonListed.length).toBe(0)
    })

    it('correctly renders all user listings when given address and listed props', async () => {
      wrapper = mount(FfaListingComponent, {
        attachToDocument: true,
        store: appStore,
        propsData: { userAddress },
      })
      // @ts-ignore
      await wrapper.vm.renderList()

      const ownerAttributeWrapperArray = wrapper.findAll(ownerAttribute)
      const nonOwned = ownerAttributeWrapperArray.filter((wrapped) => wrapped.text() !== userAddress)
      expect(wrapper.findAll(`${ffaListingClass}`).length).toBe(9)
      expect(ownerAttributeWrapperArray.length).toBe(9)
      expect(nonOwned.length).toBe(0)
    })

    it('correctly renders all candidate listings when given candidate props', async () => {
      wrapper = mount(FfaListingComponent, {
        attachToDocument: true,
        store: appStore,
        propsData: { status: FfaListingStatus.candidate },
      })
      // @ts-ignore
      await wrapper.vm.renderList()

      const candidateAttributeWrapperArray = wrapper.findAll(candidateAttribute)
      const nonCandidates = candidateAttributeWrapperArray.filter((wrapped) => {
        return wrapped.text() !== FfaListingStatus.candidate
      })
      expect(wrapper.findAll(`${ffaListingClass}`).length).toBe(6)
      expect(candidateAttributeWrapperArray.length).toBe(6)
      expect(nonCandidates.length).toBe(0)
    })

    it('correctly renders all listed listings when given listed props', async () => {
      wrapper = mount(FfaListingComponent, {
        attachToDocument: true,
        store: appStore,
        propsData: { status: FfaListingStatus.listed },
      })
      // @ts-ignore
      await wrapper.vm.renderList()

      const listedAttributeWrapperArray = wrapper.findAll(listedAttribute)
      const nonListed = listedAttributeWrapperArray.filter((wrapped) => {
        return wrapped.text() !== FfaListingStatus.listed
      })
      expect(wrapper.findAll(`${ffaListingClass}`).length).toBe(7)
      expect(listedAttributeWrapperArray.length).toBe(7)
      expect(nonListed.length).toBe(0)
    })

    it('correctly renders all listings when given not given props', async () => {
      wrapper = shallowMount(FfaListingComponent, {
        attachToDocument: true,
        store: appStore,
      })

      // @ts-ignore
      await wrapper.vm.renderList()
      expect(wrapper.findAll(`${ffaListingClass}`).length).toBe(13)
    })

    // it('correctly reacts to vuex state mutation', async () => {
    //   wrapper = mount(FfaListingComponent, {
    //     attachToDocument: true,
    //     store: appStore,
    //   })

    //   const ffaListingsModule = getModule(FfalistingsModule, appStore)
    //   const file1 = new FfaListing('title1',
    //                                'description1',
    //                                'type1',
    //                                'hash1',
    //                                'md51',
    //                                [],
    //                                FfaListingStatus.candidate,
    //                                '0xwall3t')

    //   ffaListingsModule.addCandidate(file1)


    //   const candidateAttributeWrapperArray = wrapper.findAll(candidateAttribute)
    //   expect(wrapper.findAll(`${ffaListingClass}`).length).toBe(1)
    //   expect(candidateAttributeWrapperArray.length).toBe(1)
    // })
  })
})

// function delay(ms: number): Promise<any> {
//   return new Promise( (resolve) => setTimeout(resolve, ms) )
// }
