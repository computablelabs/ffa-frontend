import { getModule } from 'vuex-module-decorators'

import { Location } from 'vue-router'
import appStore from '../../../../src/store'

import FfaListingViewModule from '../../../../src/functionModules/views/FfaListingViewModule'

import AppModule from '../../../../src/vuexModules/AppModule'

import VotingContractModule from '../../../../src/functionModules/protocol/VotingContractModule'
import ListingContractModule from '../../../../src/functionModules/protocol/ListingContractModule'
import DatatrustContractModule from '../../../../src/functionModules/protocol/DatatrustContractModule'

import FfaListing, { FfaListingStatus } from '../../../../src/models/FfaListing'

import Servers from '../../../../src/util/Servers'

import Web3 from 'web3'

// tslint:disable no-shadowed-variable

const fakeAccount = '0x2C10c931FEbe8CA490A0Da3F7F78D463550CB048'
const listingHash = '0x306725200a6E0D504A7Cc9e2d4e63A492C72990d'

let appModule!: AppModule

const w3 = new Web3(Servers.EthereumJsonRpcProvider)
const gethProvider = w3.currentProvider

const listing = new FfaListing(
  'title',
  'description',
  'type',
  '0xaddress',
  'md5',
  '0xwallet',
  0,
  '0xowner',
  [],
  FfaListingStatus.listed,
  120620,
  0)

describe('FfaListingViewModule.vue', () => {

  beforeAll(() => {
    appModule = getModule(AppModule, appStore)
  })

  describe('fetchListingStatus()', () => {

    it('returns new when neither candidate nor listed', async () => {
      VotingContractModule.isCandidate = (
        listingHash: string,
        account: string,
        web3: Web3): Promise<boolean> => {

          return Promise.resolve(false)
      }

      ListingContractModule.isListed = (
        listingHash: string,
        account: string,
        web3: Web3): Promise<boolean> => {

          return Promise.resolve(false)
      }

      const status = await FfaListingViewModule.fetchListingStatus(fakeAccount, listingHash, appModule)
      expect(status).toEqual(FfaListingStatus.new)
    })

    it('returns candidate when candidate', async () => {
      VotingContractModule.isCandidate = (
        listingHash: string,
        account: string,
        web3: Web3): Promise<boolean> => {

          return Promise.resolve(true)
      }

      ListingContractModule.isListed = (
        listingHash: string,
        account: string,
        web3: Web3): Promise<boolean> => {

          return Promise.resolve(false)
      }

      const status = await FfaListingViewModule.fetchListingStatus(fakeAccount, listingHash, appModule)
      expect(status).toEqual(FfaListingStatus.candidate)
    })

    it('returns listed when listed', async () => {
      VotingContractModule.isCandidate = (
        listingHash: string,
        account: string,
        web3: Web3): Promise<boolean> => {

          return Promise.resolve(false)
      }

      ListingContractModule.isListed = (
        listingHash: string,
        account: string,
        web3: Web3): Promise<boolean> => {

          return Promise.resolve(true)
      }

      const status = await FfaListingViewModule.fetchListingStatus(fakeAccount, listingHash, appModule)
      expect(status).toEqual(FfaListingStatus.listed)
    })
  })

  describe('getStatusRedirect()', () => {

    it('returns undefined if web3 is undefined', async () => {
      appModule.disconnectWeb3()
      const redirect = await FfaListingViewModule.getStatusRedirect(fakeAccount, listingHash,
        FfaListingStatus.candidate, appModule)
      expect(redirect).toBeUndefined()
    })

    it('returns promotion path if isListed but path is candidates', async () => {

      VotingContractModule.isCandidate = (
        listingHash: string,
        account: string,
        web3: Web3): Promise<boolean> => {

          return Promise.resolve(false)
      }

      ListingContractModule.isListed = (
        listingHash: string,
        account: string,
        web3: Web3): Promise<boolean> => {

          return Promise.resolve(true)
      }

      appModule.initializeWeb3(gethProvider)

      const redirect = await FfaListingViewModule.getStatusRedirect(fakeAccount, listingHash,
        FfaListingStatus.candidate, appModule) as Location

      expect(redirect).toBeDefined()
      expect(redirect.name).toEqual('singleListed')
    })

    it('returns / if statuses don\'t match', async () => {

      VotingContractModule.isCandidate = (
        listingHash: string,
        account: string,
        web3: Web3): Promise<boolean> => {

          return Promise.resolve(true)
      }

      ListingContractModule.isListed = (
        listingHash: string,
        account: string,
        web3: Web3): Promise<boolean> => {

          return Promise.resolve(false)
      }

      appModule.initializeWeb3(gethProvider)

      const redirect = await FfaListingViewModule.getStatusRedirect(fakeAccount, listingHash,
        FfaListingStatus.listed, appModule)
      expect(redirect).toBeDefined()
      expect(redirect).toEqual({name: 'listedListings'})
    })

    it('returns undefined if statuses match', async () => {

      VotingContractModule.isCandidate = (
        listingHash: string,
        account: string,
        web3: Web3): Promise<boolean> => {

          return Promise.resolve(true)
      }

      ListingContractModule.isListed = (
        listingHash: string,
        account: string,
        web3: Web3): Promise<boolean> => {

          return Promise.resolve(false)
      }

      appModule.initializeWeb3(gethProvider)

      const redirect = await FfaListingViewModule.getStatusRedirect(fakeAccount, listingHash,
        FfaListingStatus.candidate, appModule)

      expect(redirect).toBeUndefined()
    })


    it('updates purchase count', async () => {

      DatatrustContractModule.purchaseCount = jest.fn((account: string) => {
        return Promise.resolve(99)
      })

      appModule.initializeWeb3(gethProvider)

      await FfaListingViewModule.updatePurchaseCount(listing, appStore)
      expect(listing.purchaseCount).toBe(99)
    })
  })
})
