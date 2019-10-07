import { Store } from 'vuex'
import { getModule } from 'vuex-module-decorators'
import DatatrustTaskModule from '../../vuexModules/DatatrustTaskModule'
import FfaListingsModule from '../../vuexModules/FfaListingsModule'
import VotingModule from '../../vuexModules/VotingModule'
import EventModule from '../../vuexModules/EventModule'

import DatatrustTask from '../../models/DatatrustTask'
import { FfaDatatrustTaskType } from '../../models/DatatrustTaskDetails'

export default class TaskPollerManagerModule {

  public static completeTask(task: DatatrustTask, store: Store<any>) {
    const dtModule = getModule(DatatrustTaskModule, store)
    const ffaListingsModule = getModule(FfaListingsModule, store)
    const votingModule = getModule(VotingModule, store)
    const eventModule = getModule(EventModule, store)

    dtModule.completeTask(task.key)

    switch (task.payload.ffaTaskType) {
      case FfaDatatrustTaskType.buyListing:
        return ffaListingsModule.purchaseListing(task.payload.listingHash)
      case FfaDatatrustTaskType.approveCMT:
        eventModule.append({
          timestamp: new Date().getTime(),
          processId: votingModule.approvalMinedProcessId,
          response: true,
          error: undefined,
        })
        return
      case FfaDatatrustTaskType.voteListing:
        eventModule.append({
          timestamp: new Date().getTime(),
          processId: votingModule.votingMinedProcessId,
          response: true,
          error: undefined,
        })
        return
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
