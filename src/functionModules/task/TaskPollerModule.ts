import {Store} from 'vuex'
import { getModule } from 'vuex-module-decorators'
import DatatrustTaskModule from '../../vuexModules/DatatrustTaskModule'

import DatatrustTaskDetails, {FfaDatatrustTaskType} from '../../models/DatatrustTaskDetails'
import DatatrustTask from '../../models/DatatrustTask'

export default class TaskPollerModule {

  public static createTaskPoller(
    key: string,
    listingHash: string,
    taskType: FfaDatatrustTaskType,
    appStore: Store<any>) {

    const details = new DatatrustTaskDetails(listingHash, taskType)
    const task = new DatatrustTask(key, details)
    const datatrustTaskModule = getModule(DatatrustTaskModule, appStore)
    datatrustTaskModule.addTask(task)
  }
}
