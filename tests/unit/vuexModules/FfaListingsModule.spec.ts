import { shallowMount } from '@vue/test-utils'
import { getModule } from 'vuex-module-decorators'
import FfaListingsModule from '../../../src/vuexModules/FfaListingsModule'
import appStore from '../../../src/store'
import FfaListing, { FfaListingStatus } from '../../../src/models/FfaListing'

import axios from 'axios'
jest.mock('axios')
const mockAxios = axios as jest.Mocked<typeof axios>

describe('FfaListingsModule.ts', () => {
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
  const lastCandidateBlock = 42
  const lastListedBlock = 42

  const candidates = [
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

  const listeds = [
    {
      owner,
      title: title2,
      description: description2,
      type,
      hash: hash2,
      md5,
      tags,
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
      tags2,
    },
  ]

  // tslint:disable:max-line-length
  const f1 = new FfaListing('title1', 'description1', 'type1', 'hash1', 'md51', '0xwall3t', 'MIT', '0.3 kB', [], FfaListingStatus.candidate, 121, 1)
  const f2 = new FfaListing('title2', 'description2', 'type2', 'hash2', 'md52', '0xwall3t', 'MIT', '0.3 kB', [], FfaListingStatus.candidate, 121, 1)
  const f3 = new FfaListing('title3', 'description3', 'type3', 'hash3', 'md53', '0xwall3t', 'MIT', '0.3 kB', [], FfaListingStatus.candidate, 121, 1)
  const candidateListings: FfaListing[] = [f1, f2]

  const f4 = new FfaListing('title4', 'description4', 'type4', 'hash4', 'md54', '0xwall3t', 'MIT', '0.3 kB', [], FfaListingStatus.listed, 121, 1)
  const f5 = new FfaListing('title5', 'description5', 'type5', 'hash5', 'md55', '0xwall3t', 'MIT', '0.3 kB', [], FfaListingStatus.listed, 121, 1)
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
    module.clearAll()
    expect(module.candidates.length).toBe(0)
    module.addCandidate(f1)
    expect(module.candidates.length).toBe(1)
    expect(module.candidates[0].title).toEqual('title1')
    module.removeCandidate(f1.hash)
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
    module.removeFromListed(f3.hash)
    expect(module.listed.length).toBe(0)
    module.setListed(listedListings)
    expect(module.listed.length).toBe(2)
    module.removeFromListed(f3.hash)
    module.removeFromListed(f4.hash)
  })

  it('correctly resets listings', () => {
    const module = getModule(FfaListingsModule, appStore)
    module.setCandidates(candidateListings)
    module.reset()
    expect(module.candidates.length).toBe(0)
  })

  it('correctly promotes candidates', async () => {
    const module = getModule(FfaListingsModule, appStore)
    module.setCandidates([f1, f2, f3])
    expect(module.candidates.length).toBe(3)
    expect(module.listed.length).toBe(0)
    module.promoteCandidate(module.candidates[2])
    expect(module.candidates.length).toBe(2)
    expect(module.listed.length).toBe(1)
    expect(module.listed[0].title).toEqual('title3')
  })

  it('correctly mutates candidates via action', async () => {
    const mockCandidateResponse: any = {
      status: 200,
      data: {
        candidates,
        lastCandidateBlock,
      },
    }

    mockAxios.get.mockResolvedValue(mockCandidateResponse as any)
    const module = getModule(FfaListingsModule, appStore)
    module.clearAll()
    await module.fetchCandidates()

    expect(module.candidates.length).toBe(2)
    expect(module.candidates[0].title).toEqual('title')
    expect(module.candidates[1].title).toEqual('title1')
    expect(module.lastCandidateBlock).toBe(42)
  })

  it('correctly mutates listed via action', async () => {

    const mockListedResponse: any = {
      status: 200,
      data: {
        listed: listeds,
        lastListedBlock,
      },
    }

    mockAxios.get.mockResolvedValue(mockListedResponse as any)
    const module = getModule(FfaListingsModule, appStore)
    module.clearAll()
    await module.fetchListed()

    expect(module.listed.length).toBe(3)
    expect(module.listed[0].title).toEqual('title2')
    expect(module.listed[1].title).toEqual('title3')
    expect(module.listed[2].title).toEqual('title4')
    expect(module.lastListedBlock).toBe(42)
  })
})
