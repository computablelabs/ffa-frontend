import { getModule } from 'vuex-module-decorators'
import appStore from '../../../src/store'

import DatatrustTaskModule from '../../../src/vuexModules/DatatrustTaskModule'
import EventModule from '../../../src/vuexModules/EventModule'
import DatatrustTask from '../../../src/models/DatatrustTask'
import { Eventable } from '../../../src/interfaces/Eventable'
import DatatrustTaskDetails,
  { DatatrustTaskStatus, FfaDatatrustTaskType } from '../../../src/models/DatatrustTaskDetails'

import TaskPollerManager from '../../../src/components/task/TaskPollerManager.vue'

// tslint:disable no-shadowed-variable
describe('DatatrustTaskModule.ts', () => {

  const details = new DatatrustTaskDetails('0x123', '456', FfaDatatrustTaskType.createListing)
  const task = new DatatrustTask('key', details)

  let datatrustTaskModule!: DatatrustTaskModule
  let eventModule!: EventModule

  beforeAll(() => {
    datatrustTaskModule = getModule(DatatrustTaskModule, appStore)
    eventModule = getModule(EventModule, appStore)
  })

  beforeEach(() => {
    jest.resetAllMocks()
    datatrustTaskModule.clear()
  })

  it ('returns empty task list', () => {
    expect(datatrustTaskModule).toBeDefined()
    expect(datatrustTaskModule.tasks.length).toBe(0)
  })

  it('adds tasks', () => {
    datatrustTaskModule.addTask(task)
    expect(datatrustTaskModule.tasks.length).toBe(1)
    // TODO: reenable if/when LocalStorage is used again
    // expect(LocalStorageModule.store).toBeCalled()
  })

  it('rejects tasks of the same key', () => {
    datatrustTaskModule.addTask(task)
    expect(datatrustTaskModule.tasks.length).toBe(1)
    datatrustTaskModule.addTask(task)
    expect(datatrustTaskModule.tasks.length).toBe(1)
  })

  it('completes tasks ', () => {
    datatrustTaskModule.addTask(task)
    expect(datatrustTaskModule.tasks.length).toBe(1)
    datatrustTaskModule.completeTask(task.key)
    const updatedTask = datatrustTaskModule.tasks.find((t) => t.key === 'key')
    expect(updatedTask).toBeDefined()
    expect(updatedTask!.payload.status).toEqual(DatatrustTaskStatus.success)
  })

  it('fails tasks ', () => {
    datatrustTaskModule.addTask(task)
    expect(datatrustTaskModule.tasks.length).toBe(1)
    datatrustTaskModule.failTask({
      uuid: task.key,
      response: undefined,
      error: undefined,
    })
    const updatedTask = datatrustTaskModule.tasks.find((t) => t.key === 'key')
    expect(updatedTask).toBeDefined()
    expect(updatedTask!.payload.status).toEqual(DatatrustTaskStatus.failure)
  })
})
