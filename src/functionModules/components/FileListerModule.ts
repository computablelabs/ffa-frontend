import ListingModule from '../protocol/ListingContractModule'

import Web3Module from '../../vuexModules/Web3Module'
import FlashesModule from '../../vuexModules/FlashesModule'
import NewListingModule from '../../vuexModules/NewListingModule'
import UploadModule from '../../vuexModules/UploadModule'

import { ProcessStatus } from '../../models/ProcessStatus'
import Flash from '../../models/Flash'
import { FlashType } from '../../models/Flash'

export default class FileListerModule {

  public static async list(web3Module: Web3Module,
                           flashesModule: FlashesModule,
                           newListingModule: NewListingModule,
                           uploadModule: UploadModule) {

    try {
      newListingModule.setPercentComplete(50)

      // TODO: validate the listing?
      await ListingModule.postListing(
        ethereum.selectedAddress,
        web3Module,
        flashesModule,
        newListingModule,
        uploadModule,
        {},
        this.success)
     } catch (Error) { // TODO: figure out why instanbul chokes on a no param catch
      newListingModule.setStatus(ProcessStatus.Error)
    }
  }

  public static success(response: any,
                        flashesModule: FlashesModule,
                        newListingModule: NewListingModule,
                        uploadModule: UploadModule) {

    if (!response.result) {
      return
    }

    const transactionHash = response.result

    const message = `Transaction ${transactionHash} posted`
    flashesModule.append(new Flash(message, FlashType.success))

    newListingModule.setTransactionHash(transactionHash)
    newListingModule.setPercentComplete(100)
    newListingModule.setStatus(ProcessStatus.Complete)
    uploadModule.setStatus(ProcessStatus.Ready)
  }
}
