import { Store } from 'vuex'
import { getModule } from 'vuex-module-decorators'

import DatatrustTaskModule from '../../vuexModules/DatatrustTaskModule'
import FfaListingsModule from '../../vuexModules/FfaListingsModule'
import VotingModule from '../../vuexModules/VotingModule'
import EventModule from '../../vuexModules/EventModule'
import PurchaseModule from '../../vuexModules/PurchaseModule'

import DatatrustModule from '../../functionModules/datatrust/DatatrustModule'
import EventableModule from '../../functionModules/eventable/EventableModule'

import DatatrustTask from '../../models/DatatrustTask'
import DatatrustTaskDetails, { FfaDatatrustTaskType } from '../../models/DatatrustTaskDetails'


export default class TaskPollerManagerModule {

  public static completeTask(task: DatatrustTask, store: Store<any>) {
    const dtModule = getModule(DatatrustTaskModule, store)
    const ffaListingsModule = getModule(FfaListingsModule, store)
    const votingModule = getModule(VotingModule, store)
    const purchaseModule = getModule(PurchaseModule, store)
    const eventModule = getModule(EventModule, store)

    dtModule.completeTask(task.key)
    let event

    switch (task.payload.ffaTaskType) {
      case FfaDatatrustTaskType.wrapETH:
        event = EventableModule.createEvent(purchaseModule.erc20TokenMinedProcessId, true, undefined)
        return eventModule.append(event)
      case FfaDatatrustTaskType.approveCET:
        event = EventableModule.createEvent(purchaseModule.approvalMinedProcessId, true, undefined)
        return eventModule.append(event)
      case FfaDatatrustTaskType.buyListing:
        event = EventableModule.createEvent(purchaseModule.purchaseListingMinedProcessId, true, undefined)
        return eventModule.append(event)
      case FfaDatatrustTaskType.createListing:
        return ffaListingsModule.promotePending(task.payload.listingHash)
      case FfaDatatrustTaskType.voteListing:
        event = EventableModule.createEvent(votingModule.votingMinedProcessId, true, undefined)
        return eventModule.append(event)
    }
  }

  public static async failTask(task: DatatrustTask, store: Store<any>) {
    const dtModule = getModule(DatatrustTaskModule, store)
    dtModule.failTask(task.key)
    // TODO: failure handling?
  }

  public static async createPoller(
    txHash: string,
    listingHash: string,
    taskType: FfaDatatrustTaskType,
    store: Store<any>) {

    const [error, uuid] = await DatatrustModule.createTask(txHash)

    if (!!error) { console.log(error) }

    const datatrustTaskDetail = new DatatrustTaskDetails(listingHash, taskType)
    const datatrustTask = new DatatrustTask(uuid!, datatrustTaskDetail)

    const datatrustTaskModule = getModule(DatatrustTaskModule, store)
    datatrustTaskModule.addTask(datatrustTask)
  }
}
