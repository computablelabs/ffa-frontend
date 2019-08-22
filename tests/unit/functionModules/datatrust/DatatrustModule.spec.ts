import axios from 'axios'
jest.mock('axios')
const mockAxios = axios as jest.Mocked<typeof axios>

import DatatrustModule from '../../../../src/functionModules/datatrust/DatatrustModule'
import { FfaListingStatus } from '../../../../src/models/FfaListing'
import Servers from '../../../../src/util/Servers'
import Paths from '../../../../src/util/Paths'

describe('DatatustModule.ts', () => {

  const owner = '0xowner'
  const title = 'title'
  const title2 = 'title2'
  const title3 = 'title3'
  const title4 = 'title4'
  const description = 'description'
  const description2 = 'description2'
  const description3 = 'description3'
  const description4 = 'description4'
  const type = 'image/gif'
  const hash = '0xhash'
  const hash2 = '0xhash2'
  const hash3 = '0xhash3'
  const hash4 = '0xhash4'
  const md5 = '0xmd5'
  const tags = ['a', 'b']
  const tags2 = ['c']

  describe('Paths', () => {
    it('correctly generates listings paths', () => {
      expect(DatatrustModule.generateGetListedUrl(0)).toEqual(`${Servers.Datatrust}${Paths.ListingsPath}`)
      expect(DatatrustModule.generateGetListedUrl(100))
        .toEqual(`${Servers.Datatrust}${Paths.ListingsPath}?from=100`)
    })

    it('correctly generates candidates paths', () => {
      expect(DatatrustModule.generateGetCandidatesUrl(0)).toEqual(`${Servers.Datatrust}${Paths.CandidatesPath}`)
      expect(DatatrustModule.generateGetCandidatesUrl(111))
        .toEqual(`${Servers.Datatrust}${Paths.CandidatesPath}?from=111`)
    })
  })

  describe('Mocked fetches', () => {
    it ('correctly fetches listings', async () => {

      const mockResponse = {
        status: 200,
        data: {
          listings: [
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
              title: title2,
              description: description2,
              type,
              hash: hash2,
              md5,
            },
          ],
        },
      }
      mockAxios.get.mockResolvedValue(mockResponse as any)

      const [error, listings] = await DatatrustModule.getListed(0)

      expect(error).toBeUndefined()
      expect(listings).not.toBeUndefined()
      expect(listings!.length).toBe(2)

      let ffaListing = listings![0]
      expect(ffaListing.status).toEqual(FfaListingStatus.listed)
      expect(ffaListing.owner).toEqual(owner)
      expect(ffaListing.title).toEqual(title)
      expect(ffaListing.description).toEqual(description)
      expect(ffaListing.type).toEqual(type)
      expect(ffaListing.hash).toEqual(hash)
      expect(ffaListing.md5).toEqual(md5)
      expect(ffaListing.tags.length).toBe(2)
      expect(ffaListing.tags[0]).toEqual('a')
      expect(ffaListing.tags[1]).toEqual('b')

      ffaListing = listings![1]
      expect(ffaListing.status).toEqual(FfaListingStatus.listed)
      expect(ffaListing.owner).toEqual(ethereum.selectedAddress)
      expect(ffaListing.title).toEqual(title2)
    })

    it ('correctly fetches candidates', async () => {

      const mockResponse = {
        status: 200,
        data: {
          candidates: [
            {
              owner,
              title: title3,
              description: description3,
              type,
              hash: hash3,
              md5,
              tags: tags2,
            },
            {
              owner: ethereum.selectedAddress,
              title: title4,
              description: description4,
              type,
              hash: hash4,
              md5,
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
      expect(ffaListing.type).toEqual(type)
      expect(ffaListing.hash).toEqual(hash3)
      expect(ffaListing.md5).toEqual(md5)
      expect(ffaListing.tags.length).toBe(1)
      expect(ffaListing.tags[0]).toEqual('c')

      ffaListing = candidates![1]
      expect(ffaListing.status).toEqual(FfaListingStatus.candidate)
      expect(ffaListing.owner).toEqual(ethereum.selectedAddress)
      expect(ffaListing.title).toEqual(title4)
    })

    it ('returns error when get listings fails', async () => {

      const mockResponse = {
        status: 500,
        statusText: 'server error, yo',
      }
      mockAxios.get.mockResolvedValue(mockResponse as any)

      const [error, listings] = await DatatrustModule.getListed(0)

      expect(error).not.toBeUndefined()
      expect(listings).toBeUndefined()

      expect(error!.message).toEqual('Failed to get listings: 500: server error, yo')
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
