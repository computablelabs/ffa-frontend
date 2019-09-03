import { shallowMount } from '@vue/test-utils'
// import List from '@/views/List.vue' // TODO: fix vs code lint issue here
import { getModule } from 'vuex-module-decorators'
import NewListingModule from '../../../src/vuexModules/NewListingModule'
import appStore from '../../../src/store'
import FfaProcessModule from '../../../src/interfaces/vuex/FfaProcessModule'
import { ProcessStatus } from '../../../src/models/ProcessStatus'
import FfaListing, { FfaListingStatus } from '../../../src/models/FfaListing'

describe('NewListingModule.ts', () => {

  it('correctly implements the correct interface', () => {
    const newListingModule = getModule(NewListingModule, appStore)
    expect((newListingModule as FfaProcessModule).prepare).not.toBeNull()
    expect((newListingModule as FfaProcessModule).namespace).not.toBeNull()
    expect((newListingModule as FfaProcessModule).percentComplete).not.toBeNull()
    expect((newListingModule as FfaProcessModule).status).not.toBeNull()
  })

  it('correctly exposes getters', () => {
    const newListingModule = getModule(NewListingModule, appStore)
    expect(NewListingModule).not.toBeNull()
    expect(newListingModule.namespace).not.toBeNull()
    expect(newListingModule.namespace).toEqual('newListingModule')
    expect(newListingModule.listing).not.toBeNull()
    expect(newListingModule.listing.title).toEqual('')
    expect(newListingModule.listing.description).toEqual('')
    expect(newListingModule.listing.type).toEqual('')
    expect(newListingModule.listing.hash).toEqual('')
    expect(newListingModule.listing.md5).toEqual('')
    expect(newListingModule.listing.tags).toEqual([])
  })

  it ('correctly mutates state', () => {

    const ffaListing = new FfaListing('title',
                                      'desc',
                                      'image/gif',
                                      '0xbanana',
                                      'md5',
                                      [],
                                      FfaListingStatus.listed,
                                      '0xwall3t')
    const newListingModule = getModule(NewListingModule, appStore)

    expect(newListingModule.listing.title).toEqual('')
    newListingModule.prepare(ffaListing)
    expect(newListingModule.listing.title).toEqual('title')
    expect(newListingModule.status).toEqual(ProcessStatus.NotReady)
    newListingModule.setStatus(ProcessStatus.Error)
    expect(newListingModule.status).toEqual(ProcessStatus.Error)
    expect(newListingModule.percentComplete).toBe(0)
    newListingModule.setPercentComplete(42)
    expect(newListingModule.percentComplete).toBe(42)
    expect(newListingModule.transactionHash).toEqual('')
    newListingModule.setTransactionHash('0xwhatever')
    expect(newListingModule.transactionHash).toEqual('0xwhatever')
    newListingModule.reset()
    expect(newListingModule.listing.title).toEqual('')
    expect(newListingModule.status).toEqual(ProcessStatus.NotReady)
    expect(newListingModule.percentComplete).toEqual(0)
    expect(newListingModule.transactionHash).toEqual('')
  })
})
