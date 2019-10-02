import { Store } from 'vuex'
import { getModule } from 'vuex-module-decorators'

import ListingContractModule from '../protocol/ListingContractModule'

import FlashesModule from '../../vuexModules/FlashesModule'
import NewListingModule from '../../vuexModules/NewListingModule'
import UploadModule from '../../vuexModules/UploadModule'

import EventableModule from '../../functionModules/eventable/EventableModule'

import { Eventable } from '../../interfaces/Eventable'

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

  public static success(
    event: Eventable,
    appStore: Store<any>) {

    if (!EventableModule.isEventable(event)) {
      return
    }

    const flashesModule = getModule(FlashesModule, appStore)
    const newListingModule = getModule(NewListingModule, appStore)
    const uploadModule = getModule(UploadModule, appStore)

    const transactionHash = event.response.result

    const message = `Transaction ${transactionHash} posted`
    flashesModule.append(new Flash(message, FlashType.success))

    newListingModule.setTransactionHash(transactionHash)
    newListingModule.setPercentComplete(100)
    newListingModule.setStatus(ProcessStatus.Complete)
    uploadModule.setStatus(ProcessStatus.Ready)
  }
}
