import { RawLocation } from 'vue-router'

import Web3Module from '../../vuexModules/Web3Module'
import VotingModule from '../../functionModules/protocol/VotingModule'
import ListingModule from '../../functionModules/protocol/ListingModule'
import { FfaListingStatus } from '../../models/FfaListing'
import { Labels } from '../../util/Constants'

export default class FfaListingViewModule {

  public static async fetchListingStatus(account: string,
                                         listingHash: string,
                                         web3Module: Web3Module): Promise<FfaListingStatus> {

    const [isCandidate, isListed] = await Promise.all([
      VotingModule.isCandidate(listingHash, account, web3Module, {}),
      ListingModule.isListed(account, listingHash, web3Module, {}),
    ])
    if (isListed) {
      return FfaListingStatus.listed
    }

    if (isCandidate) {
      return FfaListingStatus.candidate
    }

    return FfaListingStatus.new
  }

  public static async getRedirect(account: string,
                                  listingHash: string,
                                  status: FfaListingStatus,
                                  currentPath: string,
                                  web3Module: Web3Module): Promise<RawLocation|undefined> {

    if (!web3Module.web3) {
      return undefined
    }

    const blockchainStatus = await FfaListingViewModule.fetchListingStatus(
      account, listingHash, web3Module)

    if (blockchainStatus !== status) {

      if (blockchainStatus === FfaListingStatus.listed &&
        status === FfaListingStatus.candidate) {
        return currentPath.replace(/\/candidates\//, '/listed/')
      }
      return '/'
    }
    return undefined
  }
}
