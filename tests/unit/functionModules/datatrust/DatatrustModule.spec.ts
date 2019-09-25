import DatatrustModule from '../../../../src/functionModules/datatrust/DatatrustModule'
import { FfaListingStatus } from '../../../../src/models/FfaListing'
import Servers from '../../../../src/util/Servers'
import Paths from '../../../../src/util/Paths'

import axios from 'axios'
jest.mock('axios')
const mockAxios = axios as jest.Mocked<typeof axios>

describe('DatatustModule.ts', () => {

  const uuid = 'uuid'
  const status = 'created'
  const taskType = 'createListing'
  const owner = '0xowner'
  const title = 'title'
  const title2 = 'title2'
  const title3 = 'title3'
  const title4 = 'title4'
  const description = 'description'
  const description2 = 'description2'
  const description3 = 'description3'
  const description4 = 'description4'
  const fileType = 'image/gif'
  const hash = '0xhash'
  const hash2 = '0xhash2'
  const hash3 = '0xhash3'
  const hash4 = '0xhash4'
  const md5 = '0xmd5'
  const tags = ['a', 'b']
  const tags2 = ['c']

  describe('Paths', () => {
    it('correctly generates listed paths', () => {
      expect(DatatrustModule.generateGetListedUrl(0)).toEqual(`${Servers.Datatrust}${Paths.ListingsPath}`)
      expect(DatatrustModule.generateGetListedUrl(100))
        .toEqual(`${Servers.Datatrust}/listings?from-block=100`)
    })

    it('correctly generates candidates paths', () => {
      expect(DatatrustModule.generateGetCandidatesUrl(0)).toEqual(`${Servers.Datatrust}${Paths.CandidatesPath}`)
      expect(DatatrustModule.generateGetCandidatesUrl(111))
        .toEqual(`${Servers.Datatrust}${Paths.CandidatesPath}?from-block=111`)
    })
  })

  describe('generateDatrustEndpoint()', () => {
    it('returns the right url when given no type, no fromBlock, and no ownerHash', () => {
      expect(DatatrustModule.generateDatatrustEndPoint(true)).toEqual(`${Servers.Datatrust}${Paths.ListingsPath}`)
      expect(DatatrustModule.generateDatatrustEndPoint(false, 'application')).toEqual(`${Servers.Datatrust}${Paths.CandidatesPath}`)
    })

    it('returns the right url when given type, fromBlock, and ownerHash', () => {
      expect(DatatrustModule.generateDatatrustEndPoint(false, 'application')).toEqual(`${Servers.Datatrust}${Paths.CandidatesPath}`)
      expect(DatatrustModule.generateDatatrustEndPoint(false, 'application', 4)).toEqual(`${Servers.Datatrust}${Paths.CandidatesPath}?from-block=4`)
      expect(DatatrustModule.generateDatatrustEndPoint(false, 'application', 5, '0xowner')).toEqual(`${Servers.Datatrust}${Paths.CandidatesPath}?owner=0xowner&from-block=5`)

      expect(DatatrustModule.generateDatatrustEndPoint(true)).toEqual(`${Servers.Datatrust}${Paths.ListingsPath}`)
      expect(DatatrustModule.generateDatatrustEndPoint(true, undefined, 4)).toEqual(`${Servers.Datatrust}/listings?from-block=4`)
      expect(DatatrustModule.generateDatatrustEndPoint(true, undefined, 5, '0xowner')).toEqual(`${Servers.Datatrust}/listings?owner=0xowner&from-block=5`)
    })
  })

  describe('Mocked fetches', () => {

    it ('correctly fetches tasks', async () => {

      const mockResponse = {
        status: 200,
        data: {
          uuid,
          hash,
          status,
          type: taskType,
        },
      }

      mockAxios.get.mockResolvedValue(mockResponse as any)

      const [error, task] = await DatatrustModule.getTask('uuid')

      expect(error).toBeUndefined()
      expect(task).not.toBeUndefined()

      expect(task!.key).toEqual(uuid)
      expect(task!.payload.status).toEqual(status)
    })

    it ('correctly fetches listed', async () => {

      // The axios mock currently doesn't account for the transform
      // therefore the mocked response must return the _transformed_ object
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
          lastCandidateBlock: 42,
        },
      }
      mockAxios.get.mockResolvedValue(mockResponse as any)

      const [error, listed] = await DatatrustModule.getListed(0)

      expect(error).toBeUndefined()
      expect(listed).not.toBeUndefined()
      expect(listed!.length).toBe(2)

      let ffaListing = listed![0]
      expect(ffaListing.status).toEqual(FfaListingStatus.listed)
      expect(ffaListing.owner).toEqual(owner)
      expect(ffaListing.title).toEqual(title)
      expect(ffaListing.description).toEqual(description)
      expect(ffaListing.fileType).toEqual(fileType)
      expect(ffaListing.hash).toEqual(hash)
      expect(ffaListing.md5).toEqual(md5)
      expect(ffaListing.tags.length).toBe(2)
      expect(ffaListing.tags[0]).toEqual('a')
      expect(ffaListing.tags[1]).toEqual('b')

      ffaListing = listed![1]
      expect(ffaListing.status).toEqual(FfaListingStatus.listed)
      expect(ffaListing.owner).toEqual(ethereum.selectedAddress)
      expect(ffaListing.title).toEqual(title2)
    })

    it ('correctly fetches candidates', async () => {

      // The axios mock currently doesn't account for the transform
      // therefore the mocked response must return the _transformed_ object
      const mockResponse = {
        status: 200,
        data: {
          listings: [
            {
              owner,
              title: title3,
              description: description3,
              fileType,
              hash: hash3,
              md5,
              tags: tags2,
              status: FfaListingStatus.candidate,
            },
            {
              owner: ethereum.selectedAddress,
              title: title4,
              description: description4,
              fileType,
              hash: hash4,
              md5,
              status: FfaListingStatus.candidate,
            },
          ],
        },
      }
      mockAxios.get.mockResolvedValue(mockResponse as any)

      const [error, candidates] = await DatatrustModule.getCandidates(0)

      expect(error).toBeUndefined()
      expect(candidates).not.toBeUndefined()
      expect(candidates!.length).toBe(2)

      let ffaListing = candidates![0]
      expect(ffaListing.status).toEqual(FfaListingStatus.candidate)
      expect(ffaListing.owner).toEqual(owner)
      expect(ffaListing.title).toEqual(title3)
      expect(ffaListing.description).toEqual(description3)
      expect(ffaListing.fileType).toEqual(fileType)
      expect(ffaListing.hash).toEqual(hash3)
      expect(ffaListing.md5).toEqual(md5)
      expect(ffaListing.tags.length).toBe(1)
      expect(ffaListing.tags[0]).toEqual('c')

      ffaListing = candidates![1]
      expect(ffaListing.status).toEqual(FfaListingStatus.candidate)
      // TODO: comment back in when endpoint has owner field
      // expect(ffaListing.owner).toEqual(ethereum.selectedAddress)
      expect(ffaListing.title).toEqual(title4)
    })

    it ('returns error when get task fails', async () => {

      const mockResponse = {
        status: 500,
        statusText: 'server error, yo',
      }
      mockAxios.get.mockResolvedValue(mockResponse as any)

      const [error, listed] = await DatatrustModule.getTask(uuid)

      expect(error).not.toBeUndefined()
      expect(listed).toBeUndefined()

      expect(error!.message).toEqual('Failed to get task: 500: server error, yo')
    })

    it ('returns error when get listed fails', async () => {

      const mockResponse = {
        status: 500,
        statusText: 'server error, yo',
      }
      mockAxios.get.mockResolvedValue(mockResponse as any)

      const [error, listed] = await DatatrustModule.getListed(0)

      expect(error).not.toBeUndefined()
      expect(listed).toBeUndefined()

      expect(error!.message).toEqual('Failed to get listed: 500: server error, yo')
    })

    it ('returns error when get candidates fails', async () => {

      const mockResponse = {
        status: 500,
        statusText: 'server error, yo',
      }
      mockAxios.get.mockResolvedValue(mockResponse as any)

      const [error, candidates] = await DatatrustModule.getCandidates(0)

      expect(error).not.toBeUndefined()
      expect(candidates).toBeUndefined()

      expect(error!.message).toEqual('Failed to get candidates: 500: server error, yo')
    })
  })
})
