import { RawLocation } from 'vue-router'
import { Store } from 'vuex'

import AppModule from '../../vuexModules/AppModule'
import EthereumModule from '../ethereum/EthereumModule'
import VotingContractModule from '../protocol/VotingContractModule'
import ListingContractModule from '../protocol/ListingContractModule'
import DatatrustContractModule from '../protocol/DatatrustContractModule'
import FfaListing, { FfaListingStatus } from '../../models/FfaListing'
import DatatrustModule from '../datatrust/DatatrustModule'

import FileSaver from 'file-saver'

export default class FfaListingViewModule {

  public static async fetchListingStatus(
    account: string,
    listingHash: string,
    appModule: AppModule): Promise<FfaListingStatus> {

    const [isCandidate, isListed] = await Promise.all([
      VotingContractModule.isCandidate(listingHash, account, appModule.web3),
      ListingContractModule.isListed(listingHash, account, appModule.web3),
    ])
    if (isCandidate || isListed) {
      return isCandidate ? FfaListingStatus.candidate : FfaListingStatus.listed
    }
    return FfaListingStatus.new
  }

  public static async getStatusRedirect(
    account: string,
    listingHash: string,
    status: FfaListingStatus,
    appModule: AppModule): Promise<RawLocation|undefined> {

    if (!EthereumModule.isWeb3Defined(appModule)) {
      return undefined
    }

    const blockchainStatus = await FfaListingViewModule.fetchListingStatus(
      account, listingHash, appModule)

    if (blockchainStatus !== status!) {

      if (blockchainStatus === FfaListingStatus.listed &&
        status! === FfaListingStatus.candidate) {

        return {
          name: 'singleListed',
          params: {
            listingHash,
            status: FfaListingStatus.listed,
          },
        }
      }
      return {name: 'listedListings'}
    }
    return undefined
  }

  public static async fetchPreview(listingHash: string, jwt: string) {
    const [error, response] = await DatatrustModule.getPreview(listingHash, jwt)
    if (error) {
      // TODO: handle
      return
    }
    const blob = new Blob([response.data], { type: response.headers['content-type'] })
    FileSaver.saveAs(blob)
  }

  public static async updatePurchaseCount(listing: FfaListing, store: Store<any>): Promise<void> {

    listing.purchaseCount = await DatatrustContractModule.purchaseCount(
      ethereum.selectedAddress,
      listing.hash,
      store)
  }

  public static epochConverter(timestamp: number): Date {
    return new Date(timestamp * 1000)
  }
}
