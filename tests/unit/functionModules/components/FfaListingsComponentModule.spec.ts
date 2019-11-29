import { getModule } from 'vuex-module-decorators'
import appStore from '../../../../src/store'

import AppModule from '../../../../src/vuexModules/AppModule'
import FfaListingsModule from '../../../../src/vuexModules/FfaListingsModule'

import FfaListingsComponentModule from '../../../../src/functionModules/components/FfaListingsComponentModule'

import { FfaListingStatus } from '../../../../src/models/FfaListing'

import flushPromises from 'flush-promises'
import axios from 'axios'

jest.mock('axios')
const mockAxios = axios as jest.Mocked<typeof axios>

// tslint:disable no-shadowed-variable

describe('DatatustModule.ts', () => {

  const appModule = getModule(AppModule, appStore)
  const ffaListingsModule = getModule(FfaListingsModule, appStore)

  describe('fetchListingsForStatus', () => {

    const spy1 = jest.fn()
    const spy2 = jest.fn()
    const spy3 = jest.fn()
    const spy4 = jest.fn()

    beforeAll(() => {
      axios.create = jest.fn(() => mockAxios)
      appModule.initializeWeb3('http://localhost:8545')
      appModule.web3.eth.getBlockNumber = jest.fn(() => {
        return Promise.resolve(10)
      })

    })

    beforeEach(() => {

      ffaListingsModule.resetListed = spy1
      ffaListingsModule.fetchNextListed = spy2
      ffaListingsModule.resetCandidates = spy3
      ffaListingsModule.fetchNextCandidates = spy4
    })

    afterEach(() => {
     jest.clearAllMocks()
    })

    it ('calls only the listed fetcher when no reset', async () => {

      FfaListingsComponentModule.fetchListingsForStatus(FfaListingStatus.listed, appStore)
      await flushPromises()

      expect(spy1).not.toBeCalled()
      expect(spy2).toBeCalled()
      expect(spy3).not.toBeCalled()
      expect(spy4).not.toBeCalled()
    })

    it ('calls only the candidate fetcher when no reset', async () => {

      FfaListingsComponentModule.fetchListingsForStatus(FfaListingStatus.candidate, appStore)
      await flushPromises()

      expect(spy1).not.toBeCalled()
      expect(spy2).not.toBeCalled()
      expect(spy3).not.toBeCalled()
      expect(spy4).toBeCalled()
    })

    it ('calls the listed reset and fetcher when reset', async () => {

      FfaListingsComponentModule.fetchListingsForStatus(FfaListingStatus.listed, appStore, true)
      await flushPromises()

      expect(spy1).toBeCalledWith(10)
      expect(spy2).toBeCalledWith()
      expect(spy3).not.toBeCalled()
      expect(spy4).not.toBeCalled()
    })

    it ('calls the candidate reset and fetcher when reset', async () => {

      FfaListingsComponentModule.fetchListingsForStatus(FfaListingStatus.candidate, appStore, true)
      await flushPromises()

      expect(spy1).not.toBeCalled()
      expect(spy2).not.toBeCalled()
      expect(spy3).toBeCalledWith(10)
      expect(spy4).toBeCalled()
    })
  })
})
