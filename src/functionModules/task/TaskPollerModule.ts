import {Store} from 'vuex'
import { getModule } from 'vuex-module-decorators'
import DatatrustTaskModule from '../../vuexModules/DatatrustTaskModule'

import DatatrustModule from '../../functionModules/datatrust/DatatrustModule'

import DatatrustTaskDetails, {FfaDatatrustTaskType} from '../../models/DatatrustTaskDetails'
import DatatrustTask from '../../models/DatatrustTask'

export default class TaskPollerModule {

  public static createTaskPoller(
    datatrustTaskId: string,
    listingHash: string,
    taskType: FfaDatatrustTaskType,
    appStore: Store<any>) {

    const details = new DatatrustTaskDetails(listingHash, taskType)
    const task = new DatatrustTask(datatrustTaskId, details)
    const datatrustTaskModule = getModule(DatatrustTaskModule, appStore)
    datatrustTaskModule.addTask(task)
  }

  public static async createTaskPollerForEthereumTransaction(
    transactionId: string,
    listingHash: string,
    taskType: FfaDatatrustTaskType,
    store: Store<any>) {
    console.log(`createTaskPollerForEthereumTransaction: ${transactionId}`)
    const [error, uuid] = await DatatrustModule.createTask(transactionId)

    if (!!error) { console.log(error) }

    const datatrustTaskDetail = new DatatrustTaskDetails(listingHash, taskType)
    const datatrustTask = new DatatrustTask(uuid!, datatrustTaskDetail)

    getModule(DatatrustTaskModule, store).addTask(datatrustTask)
  }
}
