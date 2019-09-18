import { RawLocation } from 'vue-router'

import Web3Module from '../../vuexModules/Web3Module'
import EthereumModule from '../ethereum/EthereumModule'
import VotingContractModule from '../protocol/VotingContractModule'
import ListingContractModule from '../protocol/ListingContractModule'
import { FfaListingStatus } from '../../models/FfaListing'

export default class FfaListingViewModule {

  public static async fetchListingStatus(
    account: string,
    listingHash: string,
    web3Module: Web3Module): Promise<FfaListingStatus> {

    const [isCandidate, isListed] = await Promise.all([
      VotingContractModule.isCandidate(listingHash, account, web3Module.web3, {}),
      ListingContractModule.isListed(listingHash, account, web3Module.web3, {}),
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
    currentPath: string,
    web3Module: Web3Module): Promise<RawLocation|undefined> {

    if (!EthereumModule.isWeb3Defined(web3Module)) {
      return undefined
    }

    const blockchainStatus = await FfaListingViewModule.fetchListingStatus(
      account, listingHash, web3Module)

    if (blockchainStatus !== status!) {

      if (blockchainStatus === FfaListingStatus.listed &&
        status! === FfaListingStatus.candidate) {

        return currentPath.replace(/\/candidates\//, '/listed/')
      }
      return '/'
    }
    return undefined
  }

  public static epochConverter(timestamp: number): Date {
    return new Date(timestamp * 1000)
  }
}
