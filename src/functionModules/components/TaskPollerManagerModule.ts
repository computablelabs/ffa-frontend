import { Store } from 'vuex'
import { getModule } from 'vuex-module-decorators'
import DatatrustTaskModule from '../../vuexModules/DatatrustTaskModule'
import FfaListingsModule from '../../vuexModules/FfaListingsModule'

import DatatrustTask from '../../models/DatatrustTask'
import { FfaDatatrustTaskType } from '../../models/DatatrustTaskDetails'

export default class TaskPollerManagerModule {

  public static completeTask(task: DatatrustTask, store: Store<any>) {
    const dtModule = getModule(DatatrustTaskModule, store)
    const ffaListingsModule = getModule(FfaListingsModule, store)

    dtModule.completeTask(task.key)

    switch (task.payload.ffaTaskType) {
      case FfaDatatrustTaskType.buyListing:
        return ffaListingsModule.purchaseListing(task.payload.listingHash)
      case FfaDatatrustTaskType.createListing:
        return ffaListingsModule.promotePending(task.payload.listingHash)
    }
  }

  public static failTask(task: DatatrustTask, store: Store<any>) {
    const dtModule = getModule(DatatrustTaskModule, store)
    dtModule.failTask(task.key)
    // TODO: failure handling?
  }
}
