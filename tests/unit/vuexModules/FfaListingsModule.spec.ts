import { shallowMount } from '@vue/test-utils'
// import List from '@/views/List.vue' // TODO: fix vs code lint issue here
import { getModule } from 'vuex-module-decorators'
import FfaListingsModule from '../../../src/vuexModules/FfaListingsModule'
import appStore from '../../../src/store'
import FfaListing, { FfaListingStatus } from '../../../src/models/FfaListing'

describe('FfaListingsModule.ts', () => {

  // tslint:disable:max-line-length
  const f1 = new FfaListing('title1', 'description1', 'type1', 'hash1', 'md51', [], FfaListingStatus.candidate, '0xwall3t')
  const f2 = new FfaListing('title2', 'description2', 'type2', 'hash2', 'md52', [], FfaListingStatus.candidate, '0xwall3t')
  const candidateListings: FfaListing[] = [f1, f2]

  const f3 = new FfaListing('title3', 'description3', 'type3', 'hash2', 'md53', [], FfaListingStatus.listed, '0xwall3t')
  const f4 = new FfaListing('title4', 'description4', 'type4', 'hash4', 'md54', [], FfaListingStatus.listed, '0xwall3t')
  const listedListings: FfaListing[] = [f3, f4]
  // tslint:enable:max-line-length

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
    module.addCandidate(f1)
    expect(module.candidates.length).toBe(1)
    expect(module.candidates[0].title).toEqual('title1')
    module.removeCandidate(f1)
    expect(module.candidates.length).toBe(0)
    module.setCandidates(candidateListings)
    expect(module.candidates.length).toBe(2)
  })

  it('correctly mutates listed', () => {
    const module = getModule(FfaListingsModule, appStore)
    expect(module.listed.length).toBe(0)
    module.addToListed(f3)
    expect(module.listed.length).toBe(1)
    expect(module.listed[0].title).toEqual('title3')
    module.removeFromListed(f3)
    expect(module.listed.length).toBe(0)
    module.setListed(listedListings)
    expect(module.listed.length).toBe(2)
    module.removeFromListed(f3)
    module.removeFromListed(f4)
  })

  it('correctly resets listings', () => {
    const module = getModule(FfaListingsModule, appStore)
    module.setCandidates(candidateListings)
    module.reset()
    expect(module.candidates.length).toBe(0)
  })

  it('correctly mutates candidates via action', async () => {
    const module = getModule(FfaListingsModule, appStore)
    await module.fetchCandidates()
    expect(module.candidates.length).toBe(6)
    expect(module.candidates[0].title).toEqual('title1')
    expect(module.candidates[1].title).toEqual('title2')
    expect(module.candidates[2].title).toEqual('title3')
    expect(module.candidates[3].title).toEqual('title4')
    expect(module.candidates[4].title).toEqual('title5')
    expect(module.candidates[5].title).toEqual('title6')
    expect(module.lastCandidatesBlock).toBe(42)
  })

  it('correctly promotes candidates', async () => {
    const module = getModule(FfaListingsModule, appStore)
    await module.fetchCandidates()
    expect(module.candidates.length).toBe(6)
    expect(module.listed.length).toBe(0)
    module.promoteCandidate(module.candidates[2])
    expect(module.candidates.length).toBe(5)
    expect(module.listed.length).toBe(1)
    expect(module.candidates[0].title).toEqual('title1')
  })

  it('correctly promotes candidates', async () => {
    const module = getModule(FfaListingsModule, appStore)
    await module.fetchCandidates()

    expect(module.allTitles.indexOf('foo')).toBeLessThan(0)
    expect(module.allTitles.indexOf('title1')).toBeGreaterThanOrEqual(0)
    module.promoteCandidate(module.candidates[2])
    expect(module.allTitles.indexOf('title3')).toBeGreaterThanOrEqual(0)
  })

  it('correctly mutates listed via action', async () => {
    const module = getModule(FfaListingsModule, appStore)
    await module.fetchListed()
    expect(module.listed.length).toBe(7)
    expect(module.listed[0].title).toEqual('title7')
    expect(module.listed[1].title).toEqual('title8')
    expect(module.listed[2].title).toEqual('title9')
    expect(module.listed[3].title).toEqual('title10')
    expect(module.listed[4].title).toEqual('title11')
    expect(module.listed[5].title).toEqual('title12')
    expect(module.listed[6].title).toEqual('title13')
    expect(module.lastListedBlock).toBe(42)
  })
})
