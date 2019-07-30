import { shallowMount } from '@vue/test-utils'
// import List from '@/views/List.vue' // TODO: fix vs code lint issue here
import { getModule } from 'vuex-module-decorators'
import ListModule from '../../../src/modules/ListModule'
import appStore from '../../../src/store'
import FfaProcessModule from '../../../src/interfaces/vuex/FfaProcessModule'
import { ProcessStatus } from '../../../src/models/ProcessStatus'

describe('ListModule.ts', () => {

  it('correctly implements the correct interface', () => {
    const listModule = getModule(ListModule, appStore)
    expect((listModule as FfaProcessModule).prepare).not.toBeNull()
    expect((listModule as FfaProcessModule).namespace).not.toBeNull()
    expect((listModule as FfaProcessModule).percentComplete).not.toBeNull()
    expect((listModule as FfaProcessModule).status).not.toBeNull()
  })

  it('correctly exposes getters', () => {
    const listModule = getModule(ListModule, appStore)
    expect(ListModule).not.toBeNull()
    expect(listModule.namespace).not.toBeNull()
    expect(listModule.namespace).toEqual('listModule')
    expect(listModule.listing).not.toBeNull()
    expect(listModule.listing.title).toEqual('')
    expect(listModule.listing.description).toEqual('')
    expect(listModule.listing.type).toEqual('')
    expect(listModule.listing.hash).toEqual('')
    expect(listModule.listing.md5).toEqual('')
    expect(listModule.listing.tags).toEqual([])
  })
})
