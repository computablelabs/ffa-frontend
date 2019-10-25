import { Store } from 'vuex'
import { getModule } from 'vuex-module-decorators'

import ListingContractModule from '../protocol/ListingContractModule'

import FlashesModule from '../../vuexModules/FlashesModule'
import NewListingModule from '../../vuexModules/NewListingModule'
import UploadModule from '../../vuexModules/UploadModule'

import { ProcessStatus } from '../../models/ProcessStatus'
import Flash from '../../models/Flash'
import { FlashType } from '../../models/Flash'

export default class FileListerModule {

  public static async list(processId: string, appStore: Store<any>) {

    const newListingModule = getModule(NewListingModule, appStore)
    newListingModule.setPercentComplete(50)

      // TODO: validate the listing?
    await ListingContractModule.postListing(
      ethereum.selectedAddress,
      newListingModule.listing.hash,
      processId,
      appStore,
    )
  }

  public static success(appStore: Store<any>) {

    const newListingModule = getModule(NewListingModule, appStore)
    const uploadModule = getModule(UploadModule, appStore)

    newListingModule.setPercentComplete(100)
    newListingModule.setStatus(ProcessStatus.Complete)
    uploadModule.setStatus(ProcessStatus.Ready)
  }
}
