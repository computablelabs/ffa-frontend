import VueRouter from 'vue-router'
import axios from 'axios'
import { createLocalVue, shallowMount, mount, Wrapper} from '@vue/test-utils'
import FfaTabbedListingsComponent from '../../../../src/components/ui/FfaTabbedListingsComponent.vue'
import appStore from '../../../../src/store'
import FfaListing, { FfaListingStatus} from '../../../../src/models/FfaListing'
import { getModule } from 'vuex-module-decorators'
import FfalistingsModule from '../../../../src/vuexModules/FfaListingsModule'

jest.mock('axios')
const mockAxios = axios as jest.Mocked<typeof axios>

const localVue = createLocalVue()
const ffaListingClass = '.ffa-listing'
const listedTabAttribute = 'li[data-tab="listed"]'
const candidateTabAttribute = 'li[data-tab="candidates"]'
const listedAttribute = 'span[data-status="listed"]'
const candidateAttribute = 'span[data-status="candidate"]'
const ownerAttribute = 'span[data-property="owner"]'

describe('FfaListingsComponent.vue', () => {
  const owner = '0xowner'
  const title = 'title'
  const title1 = 'title1'
  const title2 = 'title2'
  const title3 = 'title3'
  const title4 = 'title4'
  const description = 'description'
  const description1 = 'description1'
  const description2 = 'description2'
  const description3 = 'description3'
  const description4 = 'description4'
  const type = 'image/gif'
  const hash = '0xhash'
  const hash1 = '0xhash1'
  const hash2 = '0xhash2'
  const hash3 = '0xhash3'
  const hash4 = '0xhash4'
  const md5 = '0xmd5'
  const tags = ['a', 'b']
  const tags2 = ['c', 'd']
  const candidateListings = [
    {
      owner,
      title,
      description,
      type,
      hash,
      md5,
      tags,
    },
    {
      owner: ethereum.selectedAddress,
      title: title1,
      description: description1,
      type,
      hash: hash1,
      md5,
      tags: tags2,
    },
  ]
  const listedListings = [
    {
      owner,
      title: title2,
      description: description2,
      type,
      hash: hash2,
      md5,
      tags: tags2,
    },
    {
      owner,
      title: title3,
      description: description3,
      type,
      hash: hash3,
      md5,
      tags,
    },
    {
      owner: ethereum.selectedAddress,
      title: title4,
      description: description4,
      type,
      hash: hash4,
      md5,
      tags: tags2,
    },
  ]

  let wrapper!: Wrapper<FfaTabbedListingsComponent>

  beforeAll(async () => {
    localVue.use(VueRouter)
    const mockCandidateResponse: any = {
      status: 200,
      data: {
        candidates: candidateListings,
        lastCandidateBlock: 42,
      },
    }
    const mockListedResponse: any = {
      status: 200,
      data: {
        listed: listedListings,
        lastListedBlock: 42,
      },
    }
    const ffaListingsModule = getModule(FfalistingsModule, appStore)

    mockAxios.get.mockResolvedValue(mockCandidateResponse as any)
    await ffaListingsModule.fetchCandidates()

    mockAxios.get.mockResolvedValue(mockListedResponse as any)
    await ffaListingsModule.fetchListed()
  })

  afterEach(() => {
    wrapper.destroy()
  })

  describe('FfaTabbedListingsComponent.vue', () => {
    it('correctly renders all listings by default', () => {
      wrapper = mount(FfaTabbedListingsComponent, {
        attachToDocument: true,
        store: appStore,
        localVue,
      })
      expect(wrapper.findAll(`${ffaListingClass}`).length).toBe(5)
    })

    it('correctly renders all candidates when candidates buttons clicked', () => {
      wrapper = mount(FfaTabbedListingsComponent, {
        attachToDocument: true,
        store: appStore,
        localVue,
      })
      const candidateButton = wrapper.find(candidateTabAttribute)
      candidateButton.trigger('click')

      const candidateAttributeWrapperArray = wrapper.findAll(candidateAttribute)
      const nonCandidates = candidateAttributeWrapperArray.filter((wrapped) => {
        return wrapped.text() !== FfaListingStatus.candidate
      })
      expect(wrapper.findAll(`${ffaListingClass}`).length).toBe(2)
      expect(candidateAttributeWrapperArray.length).toBe(2)
      expect(nonCandidates.length).toBe(0)
    })

    it('correctly renders all listed when listed buttons clicked', () => {
      wrapper = mount(FfaTabbedListingsComponent, {
        attachToDocument: true,
        store: appStore,
        localVue,
      })
      const listedButton = wrapper.find(listedTabAttribute)
      listedButton.trigger('click')

      const listedAttributeWrapperArray = wrapper.findAll(listedAttribute)
      const nonListed = listedAttributeWrapperArray.filter((wrapped) => {
        return wrapped.text() !== FfaListingStatus.listed
      })
      expect(wrapper.findAll(`${ffaListingClass}`).length).toBe(3)
      expect(listedAttributeWrapperArray.length).toBe(3)
      expect(nonListed.length).toBe(0)
    })

    it('correctly renders all of a user\'s listings', () => {
      wrapper = mount(FfaTabbedListingsComponent, {
        attachToDocument: true,
        store: appStore,
        localVue,
        data() {
          return {
            userAddress: owner,
          }
        },
      })

      const ownerAttributeWrapperArray = wrapper.findAll(ownerAttribute)
      const nonOwned = ownerAttributeWrapperArray.filter((wrapped) => wrapped.text() !== owner)
      expect(ownerAttributeWrapperArray.length).toBe(3)
      expect(nonOwned.length).toBe(0)
    })

    it('correctly renders user\'s candidate listings', () => {
      wrapper = mount(FfaTabbedListingsComponent, {
        attachToDocument: true,
        store: appStore,
        localVue,
        data() {
          return {
            userAddress: owner,
          }
        },
      })
      const candidateButton = wrapper.find(candidateTabAttribute)
      candidateButton.trigger('click')

      const candidateAttributeWrapperArray = wrapper.findAll(candidateAttribute)
      const nonCandidates = candidateAttributeWrapperArray.filter((wrapped) => {
        return wrapped.text() !== FfaListingStatus.candidate
      })
      expect(wrapper.findAll(`${ffaListingClass}`).length).toBe(1)
      expect(candidateAttributeWrapperArray.length).toBe(1)
      expect(nonCandidates.length).toBe(0)
    })


    it('correctly renders user\'s listed listings', () => {
      wrapper = mount(FfaTabbedListingsComponent, {
        attachToDocument: true,
        store: appStore,
        localVue,
        data() {
          return {
            userAddress: owner,
          }
        },
      })
      const listedButton = wrapper.find(listedTabAttribute)
      listedButton.trigger('click')

      const listedAttributeWrapperArray = wrapper.findAll(listedAttribute)
      const nonListed = listedAttributeWrapperArray.filter((wrapped) => (
        wrapped.text() !== FfaListingStatus.listed
      ))
      expect(wrapper.findAll(`${ffaListingClass}`).length).toBe(2)
      expect(listedAttributeWrapperArray.length).toBe(2)
      expect(nonListed.length).toBe(0)
    })

  })
})
