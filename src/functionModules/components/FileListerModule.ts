import ListModule from 'modules/ListModule'
import FfaListingsModule from 'modules/FfaListingsModule'
import ListingModule from '../protocol/ListingModule'
import { ProcessStatus } from '../../models/ProcessStatus'
import Web3 from 'web3'

export default class FileListerModule {
  public static async list(listModule: ListModule, ffaListingsModule: FfaListingsModule, web3: Web3) {
    try {
      listModule.setPercentComplete(50)
      // TODO: validate the listing?

      const transactionHash = await ListingModule.list(
        ethereum.selectedAddress,
        web3,
        listModule.listing.hash,
        {})

      listModule.setPercentComplete(100)
      listModule.setStatus(ProcessStatus.Complete)
      ffaListingsModule.addCandidate(listModule.listing)
    } catch {
      listModule.setStatus(ProcessStatus.Error)
    }

  }
}
