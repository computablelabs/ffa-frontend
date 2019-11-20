import VueRouter from 'vue-router'
import axios from 'axios'
import { createLocalVue, shallowMount, Wrapper} from '@vue/test-utils'
import FfaListingsComponent from '../../../../src/components/listing/FfaListingsComponent.vue'
import appStore from '../../../../src/store'
import { FfaListingStatus} from '../../../../src/models/FfaListing'
import { getModule } from 'vuex-module-decorators'
import FfalistingsModule from '../../../../src/vuexModules/FfaListingsModule'
import flushPromises from 'flush-promises'

jest.mock('axios')
const mockAxios = axios as jest.Mocked<typeof axios>

const localVue = createLocalVue()

describe('FfaListingsComponent.vue', () => {
  const owner = 'owner1'
  const owner1 = 'owner2'
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
  const fileType = 'image/gif'
  const listingHash = '0xhash'
  const hash1 = '0xhash1'
  const hash2 = '0xhash2'
  const hash3 = '0xhash3'
  const hash4 = '0xhash4'
  const md5 = '0xmd5'
  const tags = ['a', 'b']
  const tags2 = ['c']
  const candidatesListings = [
    {
      owner,
      title,
      description,
      fileType,
      listingHash,
      md5,
      tags,
      status: FfaListingStatus.candidate,
    },
    {
      owner: owner1,
      title: title1,
      description: description1,
      fileType,
      listingHash,
      md5,
      tags: tags2,
      status: FfaListingStatus.candidate,
    },
  ]
  const listedListings = [
    {
      owner,
      title: title2,
      description: description2,
      fileType,
      listingHash: hash2,
      md5,
      tags: tags2,
      status: FfaListingStatus.listed,
    },
    {
      owner,
      title: title3,
      description: description3,
      fileType,
      listingHash: hash3,
      md5,
      tags,
      status: FfaListingStatus.listed,
    },
    {
      owner: ethereum.selectedAddress,
      title: title4,
      description: description4,
      fileType,
      listingHash: hash4,
      md5,
      tags: tags2,
      status: FfaListingStatus.listed,
    },
  ]

  let wrapper!: Wrapper<FfaListingsComponent>

  beforeAll(async () => {
    localVue.use(VueRouter)
    const mockCandidateResponse: any = {
      status: 200,
      data: {
        listings: candidatesListings,
        lastBlock: 42,
      },
    }
    const mockListedResponse: any = {
      status: 200,
      data: {
        listings: listedListings,
        lastBlock: 42,
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

  describe('render table', () => {
    it('correctly renders all listings', async () => {
      wrapper = shallowMount(FfaListingsComponent, {
        attachToDocument: true,
        store: appStore,
        propsData: {
        },
      })
      const ffaListingsModule = getModule(FfalistingsModule, appStore)
      ffaListingsModule.setCandidates(ffaListingsModule.candidates)
      await flushPromises()
      console.log(wrapper.html())
      expect(wrapper.findAll('table').length).toBe(1)
      expect(wrapper.findAll('table tbody').length).toBe(1)
      expect(wrapper.findAll('ffalistingsitem-stub').length).toBe(5)
    })

    it('correctly renders all candidates', async () => {
      wrapper = shallowMount(FfaListingsComponent, {
        attachToDocument: true,
        store: appStore,
        propsData: {
          status: FfaListingStatus.candidate,
        },
      })
      const ffaListingsModule = getModule(FfalistingsModule, appStore)
      ffaListingsModule.setCandidates(ffaListingsModule.candidates)
      await flushPromises()
      console.log(wrapper.html())
      expect(wrapper.findAll('table').length).toBe(1)
      expect(wrapper.findAll('table tbody').length).toBe(1)
      expect(wrapper.findAll('ffalistingsitem-stub').length).toBe(2)
    })

    it('correctly renders all listed', async () => {
      wrapper = shallowMount(FfaListingsComponent, {
        attachToDocument: true,
        store: appStore,
        propsData: {
          status: FfaListingStatus.candidate,
        },
      })
      const ffaListingsModule = getModule(FfalistingsModule, appStore)
      ffaListingsModule.setCandidates(ffaListingsModule.candidates)
      await flushPromises()
      console.log(wrapper.html())
      expect(wrapper.findAll('table').length).toBe(1)
      expect(wrapper.findAll('table tbody').length).toBe(1)
      expect(wrapper.findAll('ffalistingsitem-stub').length).toBe(2)
    })

    it('correctly renders all user listings', async () => {
      wrapper = shallowMount(FfaListingsComponent, {
        attachToDocument: true,
        store: appStore,
        propsData: {
          walletAddress: owner,
        },
      })
      const ffaListingsModule = getModule(FfalistingsModule, appStore)
      ffaListingsModule.setCandidates(ffaListingsModule.candidates)
      await flushPromises()
      console.log(wrapper.html())
      expect(wrapper.findAll('table').length).toBe(1)
      expect(wrapper.findAll('table tbody').length).toBe(1)
      expect(wrapper.findAll('ffalistingsitem-stub').length).toBe(3)
    })

    it('correctly renders all user candidates', async () => {
      wrapper = shallowMount(FfaListingsComponent, {
        attachToDocument: true,
        store: appStore,
        propsData: {
          status: FfaListingStatus.candidate,
          walletAddress: owner,
        },
      })
      const ffaListingsModule = getModule(FfalistingsModule, appStore)
      ffaListingsModule.setCandidates(ffaListingsModule.candidates)
      await flushPromises()
      console.log(wrapper.html())
      expect(wrapper.findAll('table').length).toBe(1)
      expect(wrapper.findAll('table tbody').length).toBe(1)
      expect(wrapper.findAll('ffalistingsitem-stub').length).toBe(1)
    })

    it('correctly renders all user listed', async () => {
      wrapper = shallowMount(FfaListingsComponent, {
        attachToDocument: true,
        store: appStore,
        propsData: {
          status: FfaListingStatus.candidate,
          walletAddress: owner,
        },
      })
      const ffaListingsModule = getModule(FfalistingsModule, appStore)
      ffaListingsModule.setCandidates(ffaListingsModule.candidates)
      await flushPromises()
      console.log(wrapper.html())
      expect(wrapper.findAll('table').length).toBe(1)
      expect(wrapper.findAll('table tbody').length).toBe(1)
      expect(wrapper.findAll('ffalistingsitem-stub').length).toBe(1)
    })
  })
})
