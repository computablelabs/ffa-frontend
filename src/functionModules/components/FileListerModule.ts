import { Store } from 'vuex'
import { getModule } from 'vuex-module-decorators'

import ListingModule from '../protocol/ListingContractModule'

import FlashesModule from '../../vuexModules/FlashesModule'
import NewListingModule from '../../vuexModules/NewListingModule'
import UploadModule from '../../vuexModules/UploadModule'

import { ProcessStatus } from '../../models/ProcessStatus'
import Flash from '../../models/Flash'
import { FlashType } from '../../models/Flash'

export default class FileListerModule {

  public static async list(appStore: Store<any>) {

    const newListingModule = getModule(NewListingModule, appStore)
    try {
      newListingModule.setPercentComplete(50)

      // TODO: validate the listing?
      await ListingModule.postListing(
        ethereum.selectedAddress,
        newListingModule.listing.hash,
        appStore,
        this.success,
        {})
     } catch (Error) { // TODO: figure out why instanbul chokes on a no param catch
      newListingModule.setStatus(ProcessStatus.Error)
    }
  }

  public static success(
    response: any,
    appStore: Store<any>) {

    if (!response.result) {
      return
    }

    const flashesModule = getModule(FlashesModule, appStore)
    const newListingModule = getModule(NewListingModule, appStore)
    const uploadModule = getModule(UploadModule, appStore)

    const transactionHash = response.result

    const message = `Transaction ${transactionHash} posted`
    flashesModule.append(new Flash(message, FlashType.success))

    newListingModule.setTransactionHash(transactionHash)
    newListingModule.setPercentComplete(100)
    newListingModule.setStatus(ProcessStatus.Complete)
    uploadModule.setStatus(ProcessStatus.Ready)
  }
}
