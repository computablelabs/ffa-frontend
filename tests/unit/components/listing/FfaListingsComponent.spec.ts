import VueRouter from 'vue-router'
import { createLocalVue, shallowMount, Wrapper} from '@vue/test-utils'
import FfaListingsComponent from '../../../../src/components/listing/FfaListingsComponent.vue'
import appStore from '../../../../src/store'
import FfaListing, { FfaListingStatus} from '../../../../src/models/FfaListing'
import { getModule } from 'vuex-module-decorators'
import FfaListingsModule from '../../../../src/vuexModules/FfaListingsModule'
import flushPromises from 'flush-promises'

const localVue = createLocalVue()

describe('FfaListingsComponent.vue', () => {
  const owner1 = 'owner1'
  const owner2 = 'owner2'
  const title1 = 'title1'
  const title2 = 'title2'
  const title3 = 'title3'
  const title4 = 'title4'
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
  const hash5 = '0xhash5'
  const md5 = '0xmd5'
  const tags1 = ['a', 'b']
  const tags2 = ['c']

  const candidatesListings = [
    new FfaListing(
      title1,
      description1,
      fileType,
      hash1,
      md5,
      'license',
      100,
      owner1,
      [],
      FfaListingStatus.candidate,
      0,
      0),
    new FfaListing(
      title1,
      description1,
      fileType,
      hash2,
      md5,
      'license',
      300,
      owner2,
      [],
      FfaListingStatus.candidate,
      0,
      0),
  ]
  const listedListings = [
    new FfaListing(
      title2,
      description2,
      fileType,
      hash3,
      md5,
      'license',
      400,
      owner2,
      [],
      FfaListingStatus.listed,
      0,
      0),
    new FfaListing(
      title3,
      description3,
      fileType,
      hash4,
      md5,
      'license',
      500,
      owner2,
      [],
      FfaListingStatus.listed,
      0,
      0),
    new FfaListing(
      title4,
      description4,
      fileType,
      hash5,
      md5,
      'license',
      600,
      ethereum.selectedAddress,
      [],
      FfaListingStatus.listed,
      0,
      0),
  ]

  let ffaListingsModule!: FfaListingsModule

  let wrapper!: Wrapper<FfaListingsComponent>

  beforeAll(async () => {
    localVue.use(VueRouter)
    ffaListingsModule = getModule(FfaListingsModule, appStore)
  })

  afterEach(() => {
    wrapper.destroy()
  })

  describe('render table', () => {
    it('correctly renders all listings', async () => {
      wrapper = shallowMount(FfaListingsComponent, {
        attachToDocument: true,
        store: appStore,
      })
      ffaListingsModule.setCandidates(candidatesListings)
      ffaListingsModule.setListed(listedListings)
      await flushPromises()

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
      ffaListingsModule.setCandidates(candidatesListings)
      ffaListingsModule.setListed(listedListings)
      await flushPromises()

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
      ffaListingsModule.setCandidates(candidatesListings)
      ffaListingsModule.setListed(listedListings)
      await flushPromises()

      expect(wrapper.findAll('table').length).toBe(1)
      expect(wrapper.findAll('table tbody').length).toBe(1)
      expect(wrapper.findAll('ffalistingsitem-stub').length).toBe(2)
    })

    it('correctly renders all user listings', async () => {
      wrapper = shallowMount(FfaListingsComponent, {
        attachToDocument: true,
        store: appStore,
        propsData: {
          walletAddress: owner1,
        },
      })
      ffaListingsModule.setCandidates(candidatesListings)
      ffaListingsModule.setListed(listedListings)
      await flushPromises()

      expect(wrapper.findAll('table').length).toBe(1)
      expect(wrapper.findAll('table tbody').length).toBe(1)
      expect(wrapper.findAll('ffalistingsitem-stub').length).toBe(1)
    })

    it('correctly renders all user candidates', async () => {
      wrapper = shallowMount(FfaListingsComponent, {
        attachToDocument: true,
        store: appStore,
        propsData: {
          status: FfaListingStatus.candidate,
          walletAddress: owner1,
        },
      })
      ffaListingsModule.setCandidates(candidatesListings)
      ffaListingsModule.setListed(listedListings)
      await flushPromises()

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
          walletAddress: owner1,
        },
      })
      ffaListingsModule.setCandidates(candidatesListings)
      ffaListingsModule.setListed(listedListings)
      await flushPromises()

      expect(wrapper.findAll('table').length).toBe(1)
      expect(wrapper.findAll('table tbody').length).toBe(1)
      expect(wrapper.findAll('ffalistingsitem-stub').length).toBe(1)
    })
  })
})
