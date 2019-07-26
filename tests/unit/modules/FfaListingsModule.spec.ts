import { shallowMount } from '@vue/test-utils'
// import List from '@/views/List.vue' // TODO: fix vs code lint issue here
import { getModule } from 'vuex-module-decorators'
import FfaListingsModule from '../../../src/modules/FfaListingsModule'
import appStore from '../../../src/store'
import FfaListing from '../../../src/models/FfaListing'

describe('FfaListingsModule.ts', () => {

  const f = new FfaListing('title', 'description', 'type', 'hash', 'md5', [])

  it('correctly initializes and exposes properties', () => {
    const module = getModule(FfaListingsModule, appStore)
    expect(module.uploads).not.toBeNull()
    expect(Array.isArray(module.uploads)).toBeTruthy()
    expect(module.uploads.length).toBe(0)
  })

  it('correctly exposes getters', () => {
    const module = getModule(FfaListingsModule, appStore)
    expect(FfaListingsModule).not.toBeNull()
    expect(module.namespace).not.toBeNull()
    expect(module.namespace).toEqual('ffaListingsModule')
    expect(module.uploadedTitles).not.toBeNull()
    expect(Array.isArray(module.uploadedTitles)).toBeTruthy()
    expect(module.uploadedTitles.length).toBe(0)
  })

  it('correctly mutates uploads', () => {
    const module = getModule(FfaListingsModule, appStore)
    expect(module.uploads.length).toBe(0)
    module.addUpload(f)
    expect(module.uploads.length).toBe(1)
    expect(module.uploads[0].title).toEqual('title')
    module.removeUpload(f)
    expect(module.uploads.length).toBe(0)
  })

  it('correctly mutates via action', async () => {

    const module = getModule(FfaListingsModule, appStore)
    await module.fetchUploads()
    expect(module.uploads.length).toBe(5)
    expect(module.uploads[0].title).toEqual('title1')
    expect(module.uploads[1].title).toEqual('title2')
    expect(module.uploads[2].title).toEqual('title3')
    expect(module.uploads[3].title).toEqual('title4')
    expect(module.uploads[4].title).toEqual('title5')
  })

  it('correctly gets uploaded titles', async () => {
    const module = getModule(FfaListingsModule, appStore)
    await module.fetchUploads()
    expect(module.uploadedTitles.length).toBe(5)
    expect(module.uploadedTitles[0]).toEqual('title1')
    expect(module.uploadedTitles[1]).toEqual('title2')
    expect(module.uploadedTitles[2]).toEqual('title3')
    expect(module.uploadedTitles[3]).toEqual('title4')
    expect(module.uploadedTitles[4]).toEqual('title5')
  })
})
