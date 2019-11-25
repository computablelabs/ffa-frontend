import CoinbaseModule from '../../../../src/functionModules/ethereum/CoinbaseModule'
import DatatrustTask from '../../../../src/models/DatatrustTask'
import DatatrustTaskDetails, { FfaDatatrustTaskType } from '../../../../src/models/DatatrustTaskDetails'

import axios from 'axios'

jest.mock('axios')
const mockAxios = axios as jest.Mocked<typeof axios>

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

  const mockTaskDetails = new DatatrustTaskDetails(hash, '456', FfaDatatrustTaskType.createListing)
  const mockTask = new DatatrustTask(uuid, mockTaskDetails)

  describe('CoinbaseModule', () => {

    it ('correctly gets exchange rates', async () => {
      const mockResponse = {
        status: 200,
        data: {
          data: {
            currency: 'ETH',
            rates: {
              AUD: '1',
              EUR: '2',
              JPY: '3',
              USD: '4',
            },
          },
        },
      }

      mockAxios.get.mockResolvedValue(mockResponse as any)

      const [error, price] = await CoinbaseModule.getEthereumPriceUSD()

      expect(error).toBeUndefined()
      expect(price).toBeDefined()
      expect(price).toBe(4)
    })
  })
})
