import { getModule } from 'vuex-module-decorators'
import appStore from '../../../../src/store'

import TaskPollerManagerModule from '../../../../src/functionModules/components/TaskPollerManagerModule'
import DatatrustTaskModule from '../../../../src/vuexModules/DatatrustTaskModule'
import DatatrustTask from '../../../../src/models/DatatrustTask'
import DatatrustTaskDetails, { DatatrustTaskStatus } from '../../../../src/models/DatatrustTaskDetails'
import LocalStorageModule from '../../../../src/functionModules/localStorage/LocalStorageModule'

describe('TaskPollerManagerModule.ts', () => {

  const details = new DatatrustTaskDetails()
  const task = new DatatrustTask('key', details)

  let dtModule: DatatrustTaskModule

  beforeAll(() => {
    dtModule = getModule(DatatrustTaskModule, appStore)
  })

  beforeEach(() => {
    localStorage.clear()
    jest.resetAllMocks()
    dtModule.clear()
  })

  it ('completes tasks', () => {
    dtModule.addTask(task)
    LocalStorageModule.delete = jest.fn()
    TaskPollerManagerModule.completeTask(task, appStore)
    const updatedTask = dtModule.tasks.find((t) => t.key === task.key)
    expect(updatedTask).toBeDefined()
    expect(updatedTask!.payload.status).toEqual(DatatrustTaskStatus.completed)
    expect(LocalStorageModule.delete).toHaveBeenCalled()
  })

  it ('fails tasks', () => {
    dtModule.addTask(task)
    LocalStorageModule.delete = jest.fn()
    TaskPollerManagerModule.failTask(task, appStore)
    const updatedTask = dtModule.tasks.find((t) => t.key === task.key)
    expect(updatedTask).toBeDefined()
    expect(updatedTask!.payload.status).toEqual(DatatrustTaskStatus.failed)
    expect(LocalStorageModule.delete).toHaveBeenCalled()
  })
})
