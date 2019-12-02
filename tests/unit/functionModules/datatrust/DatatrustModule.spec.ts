import { getModule } from 'vuex-module-decorators'
import appStore from '../../../../src/store'

import DatatrustTaskModule from '../../../../src/vuexModules/DatatrustTaskModule'

import DatatrustModule from '../../../../src/functionModules/datatrust/DatatrustModule'
import { FfaListingStatus } from '../../../../src/models/FfaListing'
import DatatrustTask from '../../../../src/models/DatatrustTask'
import DatatrustTaskDetails, { FfaDatatrustTaskType } from '../../../../src/models/DatatrustTaskDetails'

import Servers from '../../../../src/util/Servers'
import Paths from '../../../../src/util/Paths'

import axios, { AxiosRequestConfig, Cancel } from 'axios'

jest.mock('axios')
const mockAxios = axios as jest.Mocked<typeof axios>

// tslint:disable no-shadowed-variable

describe('DatatustModule.ts', () => {

  const uuid = 'uuid'
  const status = 'SUCCESS'
  const message = uuid
  const result = {
    foo: '123',
  }
  const owner = '0xowner'
  const title = 'title'
  const title2 = 'title2'
  const description = 'description'
  const description2 = 'description2'
  const fileType = 'image/gif'
  const hash = '0xhash'
  const hash2 = '0xhash2'
  const md5 = '0xmd5'
  const tags = ['a', 'b']

  const mockTaskDetails = new DatatrustTaskDetails(hash, '456', FfaDatatrustTaskType.createListing)
  const mockTask = new DatatrustTask(uuid, mockTaskDetails)

  const mockCancelToken = {
    promise: new Promise<Cancel>(() => {
      return {message: 'message' }
    }),
    throwIfRequested: jest.fn(),
  }

  describe('Paths', () => {
    it('correctly generates listed paths', () => {
      expect(DatatrustModule.generateGetListedUrl(0, 10))
      .toEqual(`${Servers.Datatrust}${Paths.ListedsPath}?from-block=0&to-block=10`)
    })

    it('correctly generates user listed paths', () => {
      expect(DatatrustModule.generateGetListedUrl(0, 10, '0xaddress'))
      .toEqual(`${Servers.Datatrust}${Paths.ListedsPath}?owner=0xaddress&from-block=0&to-block=10`)
    })

    it('correctly generates candidates paths', () => {
      expect(DatatrustModule.generateGetCandidatesUrl(0, 10))
      .toEqual(`${Servers.Datatrust}${Paths.CandidatesPath}?from-block=0&to-block=10`)
    })

    it('correctly generates previews path', () => {
      const listingHash = '0x321'
      const url = `${Servers.Datatrust}${Paths.PreviewPath}${listingHash}`
      expect(DatatrustModule.generatePreviewUrl(listingHash)).toEqual(url)
    })

    it('correctly generates deliveries path', () => {
      const deliveryHash = '0x123'
      const listingHash = '0x321'
      const url = `${Servers.Datatrust}${Paths.DeliveriesPath}?delivery_hash=0x123&query=0x321`
      expect(DatatrustModule.generateDeliveriesUrl(deliveryHash, listingHash)).toEqual(url)
    })
  })

  describe('generateDatrustEndpoint()', () => {
    it('returns the right url when given no type, no fromBlock, and no ownerHash', () => {
      expect(DatatrustModule.generateDatatrustEndPoint(true, 0, 10))
        .toEqual(`${Servers.Datatrust}${Paths.ListedsPath}?from-block=0&to-block=10`)
      expect(DatatrustModule.generateDatatrustEndPoint(false, 0, 10))
        .toEqual(`${Servers.Datatrust}${Paths.CandidatesPath}?from-block=0&to-block=10`)
    })

    it('returns the right url when given type, fromBlock, and ownerHash', () => {
      expect(DatatrustModule.generateDatatrustEndPoint(false, 0, 10))
       .toEqual(`${Servers.Datatrust}${Paths.CandidatesPath}?from-block=0&to-block=10`)
      expect(DatatrustModule.generateDatatrustEndPoint(false, 0, 10, '0xowner'))
       .toEqual(`${Servers.Datatrust}${Paths.CandidatesPath}?owner=0xowner&from-block=0&to-block=10`)

      expect(DatatrustModule.generateDatatrustEndPoint(true, 0, 10))
        .toEqual(`${Servers.Datatrust}${Paths.ListedsPath}?from-block=0&to-block=10`)

      expect(DatatrustModule.generateDatatrustEndPoint(true, 0, 10, '0xowner'))
        .toEqual(`${Servers.Datatrust}/listings/?owner=0xowner&from-block=0&to-block=10`)
    })
  })

  // describe('batches', () => {
  //   DatatrustModule.blockBatchSize = 10000
  //   it ('creates batches', () => {
  //     let batchUrls = DatatrustModule.createBatches(0, 100, undefined, DatatrustModule.generateGetCandidatesUrl)
  //     expect(batchUrls.length).toBe(1)
  //     expect(batchUrls[0].indexOf(Paths.CandidatesPath)).toBeGreaterThan(0)
  //     batchUrls = DatatrustModule.createBatches(0, 100, undefined, DatatrustModule.generateGetListedUrl)
  //     expect(batchUrls.length).toBe(1)
  //     expect(batchUrls[0].indexOf(Paths.ListedsPath)).toBeGreaterThan(0)
  //     batchUrls = DatatrustModule.createBatches(0, 100, '0xowner', DatatrustModule.generateGetListedUrl)
  //     expect(batchUrls.length).toBe(1)
  //     expect(batchUrls[0].indexOf('0xowner')).toBeGreaterThan(0)
  //     batchUrls = DatatrustModule.createBatches(0, 51234, undefined, DatatrustModule.generateGetListedUrl)
  //     expect(batchUrls.length).toBe(6)
  //     expect(batchUrls[0].indexOf('from-block=0')).toBeGreaterThan(0)
  //     expect(batchUrls[0].indexOf('to-block=9999')).toBeGreaterThan(0)
  //     expect(batchUrls[1].indexOf('from-block=10000')).toBeGreaterThan(0)
  //     expect(batchUrls[1].indexOf('to-block=19999')).toBeGreaterThan(0)
  //     expect(batchUrls[2].indexOf('from-block=20000')).toBeGreaterThan(0)
  //     expect(batchUrls[2].indexOf('to-block=29999')).toBeGreaterThan(0)
  //     expect(batchUrls[3].indexOf('from-block=30000')).toBeGreaterThan(0)
  //     expect(batchUrls[3].indexOf('to-block=39999')).toBeGreaterThan(0)
  //     expect(batchUrls[4].indexOf('from-block=40000')).toBeGreaterThan(0)
  //     expect(batchUrls[4].indexOf('to-block=49999')).toBeGreaterThan(0)
  //     expect(batchUrls[5].indexOf('from-block=50000')).toBeGreaterThan(0)
  //     expect(batchUrls[5].indexOf('to-block=51234')).toBeGreaterThan(0)
  //   })

  //   it('returns empty when fromBlock > toBlock', () => {
  //     const batches = DatatrustModule.createBatches(100, 0, undefined, DatatrustModule.generateGetCandidatesUrl)
  //     expect(batches.length).toBe(0)
  //   })
  // })

  describe('Mocked fetches', () => {

    it ('correctly posts for jwt tokens', async () => {
      const mockResponse = {
        status: 200,
        data: {
          message: 'foo',
          access_token: 'token',
          refresh_token: 'refresh',
        },
      }

      mockAxios.post.mockResolvedValue(mockResponse as any)

      const [error, jwt] = await DatatrustModule.authorize('foo', 'sig', 'key')

      expect(error).toBeUndefined()
      expect(jwt).toBeDefined()

      expect(jwt).toEqual('token')
    })

    it ('correctly gets delivery', async () => {
      const mockResponse = {
        status: 200,
        data: 'data',
        headers: {
          'content-type': 'application/pdf',
        },
      }

      mockAxios.get.mockResolvedValue(mockResponse as any)

      const [error, data] = await DatatrustModule.getDelivery('0xdelivery', '0xlisting', 'jwt')

      expect(error).toBeUndefined()
      expect(data).toBeDefined()
    })

    it ('correctly fetches tasks', async () => {

      const datatrustTaskModule = getModule(DatatrustTaskModule, appStore)
      datatrustTaskModule.addTask(mockTask)

      const mockResponse = {
        status: 200,
        data: {
          message,
          status,
          result,
        },
      }

      mockAxios.get.mockResolvedValue(mockResponse as any)

      const [error, task] = await DatatrustModule.getTask('uuid', appStore)

      expect(error).toBeUndefined()
      expect(task).toBeDefined()

      expect(task!.key).toEqual(uuid)
      expect(task!.payload.status).toEqual(status)
    })

    it ('returns error when get task fails', async () => {

      const mockResponse = {
        status: 500,
        statusText: 'server error, yo',
      }
      mockAxios.get.mockResolvedValue(mockResponse as any)

      const [error, listed] = await DatatrustModule.getTask(uuid, appStore)

      expect(error).toBeDefined()
      expect(listed).toBeUndefined()

      expect(error!.message).toEqual('Failed to get task: 500: server error, yo')
    })

    describe ('fetchListingsBatch()', () => {

      beforeAll(() => {
        axios.create = jest.fn(() => mockAxios)
      })

      it ('correctly fetches batch listings', async () => {
        const mockResponse = {
          status: 200,
          data: {
            listings: [
              {
                owner,
                title,
                description,
                fileType,
                hash,
                md5,
                tags,
                status: FfaListingStatus.listed,
              },
              {
                owner: ethereum.selectedAddress,
                title: title2,
                description: description2,
                fileType,
                hash: hash2,
                md5,
                status: FfaListingStatus.listed,
              },
            ],
            from_block: 8,
            to_block: 10,
          },
        }
        mockAxios.get.mockResolvedValue(mockResponse as any)

        const url = DatatrustModule.generateGetListedUrl(0, 10)
        const listings = await DatatrustModule.fetchListingsBatch(url, mockCancelToken)
        expect(listings.length).toBe(2)
      })

      it ('returns empty if not 200 but not 500', async () => {

        DatatrustModule.datatrustTimeout = 10

        mockAxios.get = jest.fn().mockImplementation(async (url: string, config?: AxiosRequestConfig) => {
         return {
           status: 400,
         }
        })

        const url = DatatrustModule.generateGetListedUrl(0, 10)
        const listings = await DatatrustModule.fetchListingsBatch(url, mockCancelToken)
        expect(listings.length).toBe(0)
      })
    })

    describe('fetchNextOf()', () => {

      DatatrustModule.genesisBlock = 0
      DatatrustModule.blockBatchSize = 100

      const batchSizeCalculator = jest.fn((retryCount: number) => {
        switch (retryCount) {
          case 0:
            return 100
          case 1:
            return 10
          case 2:
            return 5
          default:
            return 1
        }
      })

      const mockServerError = {
        status: 500,
      }

      const mockResponse1 = {
        status: 200,
        data: {
          listings: [
            {
              owner,
              title,
              description,
              fileType,
              hash,
              md5,
              tags,
              status: FfaListingStatus.listed,
            },
            {
              owner: ethereum.selectedAddress,
              title: title2,
              description: description2,
              fileType,
              hash: hash2,
              md5,
              status: FfaListingStatus.listed,
            },
          ],
          from_block: 100,
          to_block: 200,
        },
      }

      const mockResponse2 = {
        status: 200,
        data: {
          listings: [
            {
              owner,
              title,
              description,
              fileType,
              hash,
              md5,
              tags,
              status: FfaListingStatus.listed,
            },
            {
              owner: ethereum.selectedAddress,
              title: title2,
              description: description2,
              fileType,
              hash: hash2,
              md5,
              status: FfaListingStatus.listed,
            },
          ],
          from_block: 195,
          to_block: 200,
        },
      }

      beforeAll(() => {
        axios.create = jest.fn(() => mockAxios)
      })

      afterEach(() => {
        batchSizeCalculator.mockClear()
      })

      it ('correctly fetches next listings', async () => {

        const responses = [mockResponse1]

        let idx = 0
        mockAxios.get = jest.fn().mockImplementation(() => {
          return responses[idx++] as any
        })

        const response = await DatatrustModule.fetchNextOf(true, 200, 0, 5, mockCancelToken, batchSizeCalculator)

        expect(response.listings.length).toBe(2)
        expect(response.fromBlock).toBe(100)
        expect(batchSizeCalculator).toBeCalledTimes(1)
      })

      it ('correctly retries batch listings', async () => {

        const responses = [mockServerError, mockServerError, mockResponse2]

        let idx = 0
        mockAxios.get = jest.fn().mockImplementation(() => {
          return responses[idx++] as any
        })

        const response = await DatatrustModule.fetchNextOf(true, 200, 0, 5, mockCancelToken, batchSizeCalculator)

        expect(response.listings.length).toBe(2)
        expect(response.fromBlock).toBe(195)
        expect(batchSizeCalculator).toBeCalledTimes(3)
      })

      it ('failes on max retries', async () => {
        const responses = [mockServerError, mockServerError, mockServerError]

        let idx = 0
        mockAxios.get = jest.fn().mockImplementation(() => {
          return responses[idx++] as any
        })

        await expect(
          DatatrustModule.fetchNextOf(true, 200, 0, 1, mockCancelToken, batchSizeCalculator)).rejects.toThrow()
        expect(batchSizeCalculator).toBeCalled()
      })
    })
  })

  describe('util', () => {
    it ('flattens', () => {
      const raORas = [['a'], ['b', 'c'], ['d', 'e', 'f']]
      expect(DatatrustModule.flatten(raORas).length).toBe(6)
      expect(DatatrustModule.flatten(raORas)).toEqual(['a', 'b', 'c', 'd', 'e', 'f'])
    })

    it ('computes batch size based on retry', () => {
      DatatrustModule.blockBatchSize = 10000

      expect(DatatrustModule.batchSizeForRetry(0)).toBe(10000)
      expect(DatatrustModule.batchSizeForRetry(1)).toBe(1000)
      expect(DatatrustModule.batchSizeForRetry(2)).toBe(100)
      expect(DatatrustModule.batchSizeForRetry(3)).toBe(10)
      expect(DatatrustModule.batchSizeForRetry(4)).toBe(1)
      expect(DatatrustModule.batchSizeForRetry(5)).toBe(1)
      expect(DatatrustModule.batchSizeForRetry(555)).toBe(1)
    })
  })
})
