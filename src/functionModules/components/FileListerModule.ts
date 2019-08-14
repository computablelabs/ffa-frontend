import ListingModule from '../protocol/ListingModule'

import { getModule } from 'vuex-module-decorators'
import Web3Module from '../../vuexModules/Web3Module'
import FlashesModule from '../../vuexModules/FlashesModule'
import ListModule from '../../vuexModules/ListModule'
import UploadModule from '../../vuexModules/UploadModule'
import store from '../../store'

import { ProcessStatus } from '../../models/ProcessStatus'
import Flash from '../../models/Flash'
import { FlashType } from '../../models/Flash'

export default class FileListerModule {

  public static async list() {

    const web3Module = getModule(Web3Module, store)
    const listModule = getModule(ListModule, store)

    try {
      listModule.setPercentComplete(50)

      // TODO: validate the listing?
      await ListingModule.postListing(
        ethereum.selectedAddress,
        web3Module.web3,
        listModule.listing.hash,
        {},
        this.success)
     } catch (Error) { // TODO: figure out why instanbul chokes on a no param catch
      listModule.setStatus(ProcessStatus.Error)
    }
  }

  public static success(response: any) {

    if (!response.result) {
      return
    }

    const transactionHash = response.result

    const flashesModule = getModule(FlashesModule, store)
    const listModule = getModule(ListModule, store)
    const uploadModule = getModule(UploadModule, store)
    const message = `Transaction ${transactionHash} posted`
    flashesModule.append(new Flash(message, FlashType.success))

    listModule.setTransactionHash(transactionHash)
    listModule.setPercentComplete(100)
    listModule.setStatus(ProcessStatus.Complete)
    uploadModule.setStatus(ProcessStatus.Ready)
  }
}
