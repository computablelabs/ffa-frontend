import { shallowMount } from '@vue/test-utils'
// import List from '@/views/List.vue' // TODO: fix vs code lint issue here
import { getModule } from 'vuex-module-decorators'
import FfaListingsModule from '../../../src/vuexModules/FfaListingsModule'
import appStore from '../../../src/store'
import FfaListing from '../../../src/models/FfaListing'

describe('FfaListingsModule.ts', () => {

  const f = new FfaListing('title', 'description', 'type', 'hash', 'md5', [])

  it('correctly initializes and exposes properties', () => {
    const module = getModule(FfaListingsModule, appStore)
    expect(module.candidates).not.toBeNull()
    expect(Array.isArray(module.candidates)).toBeTruthy()
    expect(module.candidates.length).toBe(0)
    expect(module.listed).not.toBeNull()
    expect(Array.isArray(module.listed)).toBeTruthy()
    expect(module.listed.length).toBe(0)
  })

  it('correctly exposes getters', () => {
    const module = getModule(FfaListingsModule, appStore)
    expect(module).not.toBeNull()
    expect(module.namespace).not.toBeNull()
    expect(module.namespace).toEqual('ffaListingsModule')
    expect(module.allTitles).not.toBeNull()
    expect(Array.isArray(module.allTitles)).toBeTruthy()
  })

  it('correctly mutates candidates', () => {
    const module = getModule(FfaListingsModule, appStore)
    expect(module.candidates.length).toBe(0)
    module.addCandidate(f)
    expect(module.candidates.length).toBe(1)
    expect(module.candidates[0].title).toEqual('title')
    module.removeCandidate(f)
    expect(module.candidates.length).toBe(0)
  })

  it('correctly mutates via action', async () => {

    const module = getModule(FfaListingsModule, appStore)
    await module.fetchCandidates()
    expect(module.candidates.length).toBe(5)
    expect(module.candidates[0].title).toEqual('title1')
    expect(module.candidates[1].title).toEqual('title2')
    expect(module.candidates[2].title).toEqual('title3')
    expect(module.candidates[3].title).toEqual('title4')
    expect(module.candidates[4].title).toEqual('title5')
  })

  it('correctly promotes candidates', async () => {
    const module = getModule(FfaListingsModule, appStore)
    await module.fetchCandidates()
    expect(module.candidates.length).toBe(5)
    expect(module.listed.length).toBe(0)
    module.promoteCandidate(module.candidates[2])
    expect(module.candidates.length).toBe(4)
    expect(module.listed.length).toBe(1)
    expect(module.listed[0].title).toEqual('title3')
  })

  it('correctly promotes candidates', async () => {
    const module = getModule(FfaListingsModule, appStore)
    await module.fetchCandidates()

    expect(module.allTitles.indexOf('foo')).toBeLessThan(0)
    expect(module.allTitles.indexOf('title1')).toBeGreaterThanOrEqual(0)
    module.promoteCandidate(module.candidates[2])
    expect(module.allTitles.indexOf('title3')).toBeGreaterThanOrEqual(0)
  })
})
