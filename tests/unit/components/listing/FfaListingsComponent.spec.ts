import VueRouter from 'vue-router'
import axios from 'axios'
import { createLocalVue, shallowMount, mount, Wrapper} from '@vue/test-utils'
import FfaListingsComponent from '../../../../src/components/ui/FfaListingsComponent.vue'
import appStore from '../../../../src/store'
import FfaListing, { FfaListingStatus} from '../../../../src/models/FfaListing'
import { getModule } from 'vuex-module-decorators'
import FfalistingsModule from '../../../../src/vuexModules/FfaListingsModule'

jest.mock('axios')
const mockAxios = axios as jest.Mocked<typeof axios>

const localVue = createLocalVue()
const ffaListingClass = '.ffa-listing'
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
  const tags2 = ['c']
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
      tags2,
    },
  ]
  const listedListings = [
    {
      owner,
      title2,
      description2,
      type,
      hash2,
      md5,
      tags,
    },
    {
      owner,
      title3,
      description3,
      type,
      hash3,
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
      tags2,
    },
  ]

  let wrapper!: Wrapper<FfaListingsComponent>

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

  describe('renderList()', () => {
    it('correctly renders user candidate listings when given address and candidate props', async () => {
      wrapper = mount(FfaListingsComponent, {
        attachToDocument: true,
        store: appStore,
        propsData: {
          status: FfaListingStatus.candidate,
          userAddress: owner,
        },
      })

      // @ts-ignore
      await wrapper.vm.renderList()

      const candidateAttributeWrapperArray = wrapper.findAll(candidateAttribute)
      const nonCandidates = candidateAttributeWrapperArray.filter((wrapped) => {
        return wrapped.text() !== FfaListingStatus.candidate
      })
      expect(wrapper.findAll(`${ffaListingClass}`).length).toBe(1)
      expect(candidateAttributeWrapperArray.length).toBe(1)
      expect(nonCandidates.length).toBe(0)
    })

    it('correctly renders user listed listings when given address and listed props', () => {
      wrapper = mount(FfaListingsComponent, {
        attachToDocument: true,
        store: appStore,
        propsData: {
          status: FfaListingStatus.listed,
          userAddress: owner,
        },
      })

      // @ts-ignore
      wrapper.vm.renderList()
      // console.log(wrapper.html())

      const listedAttributeWrapperArray = wrapper.findAll(listedAttribute)
      const nonListed = listedAttributeWrapperArray.filter((wrapped) => (
        wrapped.text() !== FfaListingStatus.listed
      ))
      expect(wrapper.findAll(`${ffaListingClass}`).length).toBe(2)
      expect(listedAttributeWrapperArray.length).toBe(2)
      expect(nonListed.length).toBe(0)
    })

    it('correctly renders all user listings when given address and listed props', () => {
      wrapper = mount(FfaListingsComponent, {
        attachToDocument: true,
        store: appStore,
        propsData: { userAddress: owner },
      })
      // @ts-ignore
      wrapper.vm.renderList()

      const ownerAttributeWrapperArray = wrapper.findAll(ownerAttribute)
      const nonOwned = ownerAttributeWrapperArray.filter((wrapped) => wrapped.text() !== owner)
      expect(wrapper.findAll(`${ffaListingClass}`).length).toBe(3)
      expect(ownerAttributeWrapperArray.length).toBe(3)
      expect(nonOwned.length).toBe(0)
    })

    it('correctly renders all candidate listings when given candidate props', () => {
      wrapper = mount(FfaListingsComponent, {
        attachToDocument: true,
        store: appStore,
        propsData: { status: FfaListingStatus.candidate },
      })
      // @ts-ignore
      wrapper.vm.renderList()

      const candidateAttributeWrapperArray = wrapper.findAll(candidateAttribute)
      const nonCandidates = candidateAttributeWrapperArray.filter((wrapped) => {
        return wrapped.text() !== FfaListingStatus.candidate
      })
      expect(wrapper.findAll(`${ffaListingClass}`).length).toBe(2)
      expect(candidateAttributeWrapperArray.length).toBe(2)
      expect(nonCandidates.length).toBe(0)
    })

    it('correctly renders all listed listings when given listed props', () => {
      wrapper = mount(FfaListingsComponent, {
        attachToDocument: true,
        store: appStore,
        propsData: { status: FfaListingStatus.listed },
      })
      // @ts-ignore
      wrapper.vm.renderList()

      const listedAttributeWrapperArray = wrapper.findAll(listedAttribute)
      const nonListed = listedAttributeWrapperArray.filter((wrapped) => {
        return wrapped.text() !== FfaListingStatus.listed
      })
      expect(wrapper.findAll(`${ffaListingClass}`).length).toBe(3)
      expect(listedAttributeWrapperArray.length).toBe(3)
      expect(nonListed.length).toBe(0)
    })

    it('correctly renders all listings when given not given props', () => {
      wrapper = shallowMount(FfaListingsComponent, {
        attachToDocument: true,
        store: appStore,
      })

      // @ts-ignore
      wrapper.vm.renderList()
      expect(wrapper.findAll(`${ffaListingClass}`).length).toBe(5)
    })

    // @ts-ignore
    it('correctly reacts to addCandidate(), removeCandidate(), setCandidate(), promoteCandidate()', () => {
      wrapper = mount(FfaListingsComponent, {
        attachToDocument: true,
        store: appStore,
      })
      const ffaListingsModule = getModule(FfalistingsModule, appStore)
      // tslint:disable:max-line-length
      const file0 = new FfaListing('title0', 'description0', 'type0', 'hash0', 'md50', [], FfaListingStatus.candidate, '0xwall3t')
      const file1 = new FfaListing('title1', 'description1', 'type1', 'hash1', 'md51', [], FfaListingStatus.candidate, '0xwall3t')
      // tslint:enable:max-line-length

      ffaListingsModule.clearAll()
      ffaListingsModule.addCandidate(file0)

      let candidateAttributeWrapperArray = wrapper.findAll(candidateAttribute)
      expect(wrapper.findAll(`${ffaListingClass}`).length).toBe(1)
      expect(candidateAttributeWrapperArray.length).toBe(1)

      ffaListingsModule.removeCandidate(file0)

      candidateAttributeWrapperArray = wrapper.findAll(candidateAttribute)
      expect(wrapper.findAll(`${ffaListingClass}`).length).toBe(0)
      expect(candidateAttributeWrapperArray.length).toBe(0)

      ffaListingsModule.setCandidates([file0, file1])

      candidateAttributeWrapperArray = wrapper.findAll(candidateAttribute)
      expect(wrapper.findAll(`${ffaListingClass}`).length).toBe(2)
      expect(candidateAttributeWrapperArray.length).toBe(2)

      ffaListingsModule.promoteCandidate(file1)

      candidateAttributeWrapperArray = wrapper.findAll(candidateAttribute)
      const listedAttributeWrapperArray = wrapper.findAll(listedAttribute)
      expect(wrapper.findAll(`${ffaListingClass}`).length).toBe(2)
      expect(candidateAttributeWrapperArray.length).toBe(1)
      expect(listedAttributeWrapperArray.length).toBe(1)
    })

    it('correctly reacts to setListed(), addToListed(), removeFromListed(), ', async () => {
      wrapper = mount(FfaListingsComponent, {
        attachToDocument: true,
        store: appStore,
      })
      const ffaListingsModule = getModule(FfalistingsModule, appStore)
      ffaListingsModule.clearAll()
    // tslint:disable:max-line-length
      const file0 = new FfaListing('title0', 'description0', 'type0', 'hash0', 'md50', [], FfaListingStatus.listed, '0xwall3t')
      const file1 = new FfaListing('title1', 'description1', 'type1', 'hash1', 'md51', [], FfaListingStatus.listed, '0xwall3t')
    // tslint:enable:max-line-length

      ffaListingsModule.addToListed(file0)

      let listedAttributeWrapperArray = wrapper.findAll(listedAttribute)
      expect(wrapper.findAll(`${ffaListingClass}`).length).toBe(1)
      expect(listedAttributeWrapperArray.length).toBe(1)

      ffaListingsModule.removeFromListed(file0)

      listedAttributeWrapperArray = wrapper.findAll(listedAttribute)
      expect(wrapper.findAll(`${ffaListingClass}`).length).toBe(0)
      expect(listedAttributeWrapperArray.length).toBe(0)

      ffaListingsModule.setListed([file0, file1])

      listedAttributeWrapperArray = wrapper.findAll(listedAttribute)
      expect(wrapper.findAll(`${ffaListingClass}`).length).toBe(2)
      expect(listedAttributeWrapperArray.length).toBe(2)
    })
  })
})

function delay(ms: number): Promise<any> {
  return new Promise( (resolve) => setTimeout(resolve, ms) )
}
