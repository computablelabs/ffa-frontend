import { getModule } from 'vuex-module-decorators'
import appStore from '../../../src/store'

import FfaListingsModule from '../../../src/vuexModules/FfaListingsModule'

import DatatrustModule, { GetListingsResponse } from '../../../src/functionModules/datatrust/DatatrustModule'

import FfaListing, { FfaListingStatus } from '../../../src/models/FfaListing'

import { CancelToken } from 'axios'

import mockAxios from 'jest-mock-axios'

// tslint:disable no-shadowed-variable

// jest.mock('axios')
// const mockAxios = axios as jest.Mocked<typeof axios>

describe('FfaListingsModule.ts', () => {

  const ffaListingsModule = getModule(FfaListingsModule, appStore)

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
  const fileType = 'image/gif'
  const listingHash = '0xhash'
  const hash1 = '0xhash1'
  const hash2 = '0xhash2'
  const hash3 = '0xhash3'
  const hash4 = '0xhash4'
  const md5 = '0xmd5'
  const tags = ['a', 'b']
  const tags2 = ['c']

  const candidates = [
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
      owner: ethereum.selectedAddress,
      title: title1,
      description: description1,
      fileType,
      listingHash: hash1,
      md5,
      tags2,
      status: FfaListingStatus.candidate,
    },
  ]

  const listeds = [
    {
      owner,
      title: title2,
      description: description2,
      fileType,
      listingHash: hash2,
      md5,
      tags,
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
      tags2,
      status: FfaListingStatus.listed,
    },
  ]

  // tslint:disable:max-line-length
  const f1 = new FfaListing('title1', 'description1', 'type1', 'hash1', 'md51', 'MIT', 20, '0xwallet', [], FfaListingStatus.candidate, 121, 1)
  const f2 = new FfaListing('title2', 'description2', 'type2', 'hash2', 'md52', 'MIT', 24, '0xwallet', [], FfaListingStatus.candidate, 121, 1)
  const f3 = new FfaListing('title3', 'description3', 'type3', 'hash3', 'md53', 'MIT', 10, '0xwallet', [], FfaListingStatus.candidate, 121, 1)
  const candidatesListings: FfaListing[] = [f1, f2]

  const f4 = new FfaListing('title4', 'description4', 'type4', 'hash4', 'md54', 'MIT', 11, '0xwallet', [], FfaListingStatus.listed, 121, 1)
  const f5 = new FfaListing('title5', 'description5', 'type5', 'hash5', 'md55', 'MIT', 21, '0xwallet', [], FfaListingStatus.listed, 121, 1)
  const listedListings: FfaListing[] = [f3, f4]
  // tslint:enable:max-line-length

  it('correctly initializes and exposes properties', () => {
    expect(ffaListingsModule.candidates).not.toBeNull()
    expect(Array.isArray(ffaListingsModule.candidates)).toBeTruthy()
    expect(ffaListingsModule.candidates.length).toBe(0)
    expect(ffaListingsModule.listed).not.toBeNull()
    expect(Array.isArray(ffaListingsModule.listed)).toBeTruthy()
    expect(ffaListingsModule.listed.length).toBe(0)
  })

  it('correctly exposes getters', () => {
    expect(module).not.toBeNull()
    expect(ffaListingsModule.namespace).not.toBeNull()
    expect(ffaListingsModule.namespace).toEqual('ffaListingsModule')
    expect(ffaListingsModule.allTitles).not.toBeNull()
    expect(Array.isArray(ffaListingsModule.allTitles)).toBeTruthy()
  })

  it('correctly mutates candidates', () => {
    ffaListingsModule.clearAll()
    expect(ffaListingsModule.candidates.length).toBe(0)
    ffaListingsModule.addCandidate(f1)
    expect(ffaListingsModule.candidates.length).toBe(1)
    expect(ffaListingsModule.candidates[0].title).toEqual('title1')
    ffaListingsModule.removeCandidate(f1.hash)
    expect(ffaListingsModule.candidates.length).toBe(0)
    ffaListingsModule.setCandidates(candidatesListings)
    expect(ffaListingsModule.candidates.length).toBe(2)
  })

  it('correctly mutates listed', () => {
    expect(ffaListingsModule.listed.length).toBe(0)
    ffaListingsModule.addToListed(f3)
    expect(ffaListingsModule.listed.length).toBe(1)
    expect(ffaListingsModule.listed[0].title).toEqual('title3')
    ffaListingsModule.removeFromListed(f3.hash)
    expect(ffaListingsModule.listed.length).toBe(0)
    ffaListingsModule.setListed(listedListings)
    expect(ffaListingsModule.listed.length).toBe(2)
    ffaListingsModule.removeFromListed(f3.hash)
    ffaListingsModule.removeFromListed(f4.hash)
  })

  it('correctly resets listed', () => {
    ffaListingsModule.setCandidates(listedListings)
    ffaListingsModule.resetListed(10)
    expect(ffaListingsModule.listed.length).toBe(0)
    expect(ffaListingsModule.listedFromBlock).toBe(10)
    expect(ffaListingsModule.isFetchingListed).toBeFalsy()
    expect(ffaListingsModule.listedRetryCount).toBe(0)
  })

  it('correctly resets candidates', () => {
    ffaListingsModule.setCandidates(candidatesListings)
    ffaListingsModule.resetCandidates(10)
    expect(ffaListingsModule.candidates.length).toBe(0)
    expect(ffaListingsModule.candidatesFromBlock).toBe(10)
    expect(ffaListingsModule.isFetchingListed).toBeFalsy()
    expect(ffaListingsModule.candidatesRetryCount).toBe(0)
  })

  it('correctly promotes candidates', async () => {
    ffaListingsModule.setCandidates([f1, f2, f3])
    expect(ffaListingsModule.candidates.length).toBe(3)
    expect(ffaListingsModule.listed.length).toBe(0)
    ffaListingsModule.promoteCandidate(ffaListingsModule.candidates[2].hash)
    expect(ffaListingsModule.candidates.length).toBe(2)
    expect(ffaListingsModule.listed.length).toBe(1)
    expect(ffaListingsModule.listed[0].title).toEqual('title3')
  })

  describe('fetches', () => {

    beforeAll(() => {
      DatatrustModule.genesisBlock = 0
      DatatrustModule.blockBatchSize = 100
    })

    describe('fetch listed', () => {
      it('fetches listed when there are no problems', async () => {

        let idx = 0
        const responses = [{
          listings: listedListings,
          fromBlock: 900,
        }]

        DatatrustModule.fetchNextOf = jest.fn((
            isListed: boolean,
            toBlock: number,
            retryCount: number,
            maxRetries: number,
            cancelToken: CancelToken,
            blockBatchSizeCalculator: (retryCount: number) => number,
            batchSizeOverride?: number,
            owner?: string|undefined): Promise<GetListingsResponse> => {

            return Promise.resolve(responses[idx++])
        })

        ffaListingsModule.resetListed(1000)
        await ffaListingsModule.fetchNextListed()
        expect(ffaListingsModule.listed.length).toBe(2)
      })

      it('fetches listed when there are problems', async () => {

        let idx = 0
        const responses = [{
          listings: listedListings,
          fromBlock: 950,
        }, {
          listings: listedListings,
          fromBlock: 925,
        }, {
          listings: [],
          fromBlock: 900,
        }]

        DatatrustModule.fetchNextOf = jest.fn((
            isListed: boolean,
            toBlock: number,
            retryCount: number,
            maxRetries: number,
            cancelToken: CancelToken,
            blockBatchSizeCalculator: (retryCount: number) => number,
            batchSizeOverride?: number,
            owner?: string|undefined): Promise<GetListingsResponse> => {

            return Promise.resolve(responses[idx++])
        })

        ffaListingsModule.resetListed(1000)
        await ffaListingsModule.fetchNextListed()
        expect(ffaListingsModule.listed.length).toBe(4)
      })

      it('fetches handles exceptions', async () => {

        DatatrustModule.fetchNextOf = jest.fn((
            isListed: boolean,
            toBlock: number,
            retryCount: number,
            maxRetries: number,
            cancelToken: CancelToken,
            blockBatchSizeCalculator: (retryCount: number) => number,
            batchSizeOverride?: number,
            owner?: string|undefined): Promise<GetListingsResponse> => {

            throw new Error('retry count exceeded, yo')
        })

        ffaListingsModule.resetListed(1000)
        await ffaListingsModule.fetchNextListed()
        expect(ffaListingsModule.listed.length).toBe(0)
      })
    })
    describe('fetch candidates', () => {
      it('fetches candidates when there are no problems', async () => {

        let idx = 0
        const responses = [{
          listings: candidatesListings,
          fromBlock: 900,
        }]

        DatatrustModule.fetchNextOf = jest.fn((
            isListed: boolean,
            toBlock: number,
            retryCount: number,
            maxRetries: number,
            cancelToken: CancelToken,
            blockBatchSizeCalculator: (retryCount: number) => number,
            batchSizeOverride?: number,
            owner?: string|undefined): Promise<GetListingsResponse> => {

            return Promise.resolve(responses[idx++])
        })

        ffaListingsModule.resetListed(1000)
        await ffaListingsModule.fetchNextListed()
        expect(ffaListingsModule.listed.length).toBe(2)
      })

      it('fetches candidates when there are problems', async () => {

        let idx = 0
        const responses = [{
          listings: candidatesListings,
          fromBlock: 950,
        }, {
          listings: [],
          fromBlock: 925,
        }, {
          listings: candidatesListings,
          fromBlock: 900,
        }]

        DatatrustModule.fetchNextOf = jest.fn((
            isListed: boolean,
            toBlock: number,
            retryCount: number,
            maxRetries: number,
            cancelToken: CancelToken,
            blockBatchSizeCalculator: (retryCount: number) => number,
            batchSizeOverride?: number,
            owner?: string|undefined): Promise<GetListingsResponse> => {

            return Promise.resolve(responses[idx++])
        })

        ffaListingsModule.resetListed(1000)
        await ffaListingsModule.fetchNextListed()
        expect(ffaListingsModule.listed.length).toBe(4)
      })

      it('fetches handles exceptions', async () => {

        DatatrustModule.fetchNextOf = jest.fn((
            isListed: boolean,
            toBlock: number,
            retryCount: number,
            maxRetries: number,
            cancelToken: CancelToken,
            blockBatchSizeCalculator: (retryCount: number) => number,
            batchSizeOverride?: number,
            owner?: string|undefined): Promise<GetListingsResponse> => {

            throw new Error('retry count exceeded, yo')
        })

        ffaListingsModule.resetListed(1000)
        await ffaListingsModule.fetchNextListed()
        expect(ffaListingsModule.listed.length).toBe(0)
      })
    })
  })
})
