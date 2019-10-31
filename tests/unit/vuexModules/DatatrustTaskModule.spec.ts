import { getModule } from 'vuex-module-decorators'
import appStore from '../../../src/store'

import DatatrustTaskModule from '../../../src/vuexModules/DatatrustTaskModule'
import DatatrustTask from '../../../src/models/DatatrustTask'
import DatatrustTaskDetails,
  { DatatrustTaskStatus, FfaDatatrustTaskType } from '../../../src/models/DatatrustTaskDetails'
import LocalStorageModule from '../../../src/functionModules/localStorage/LocalStorageModule'

describe('DatatrustTaskModule.ts', () => {

  const details = new DatatrustTaskDetails('0x123', FfaDatatrustTaskType.createListing)
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

  it ('returns empty task list', () => {
    expect(dtModule).toBeDefined()
    expect(dtModule.tasks.length).toBe(0)
  })

  it('adds tasks', () => {
    LocalStorageModule.exists = jest.fn((key: string) => {
      return false
    })
    LocalStorageModule.store = jest.fn()
    dtModule.addTask(task)
    expect(dtModule.tasks.length).toBe(1)
    // TODO: reenable if/when LocalStorage is used again
    // expect(LocalStorageModule.store).toBeCalled()
  })

  it('rejects tasks of the same key', () => {
    dtModule.addTask(task)
    expect(dtModule.tasks.length).toBe(1)
    dtModule.addTask(task)
    expect(dtModule.tasks.length).toBe(1)
  })

  it('completes tasks ', () => {
    LocalStorageModule.exists = jest.fn((key: string) => {
      return true
    })
    dtModule.addTask(task)
    LocalStorageModule.delete = jest.fn()
    expect(dtModule.tasks.length).toBe(1)
    dtModule.completeTask(task.key)
    const updatedTask = dtModule.tasks.find((t) => t.key === 'key')
    expect(updatedTask).toBeDefined()
    expect(updatedTask!.payload.status).toEqual(DatatrustTaskStatus.success)
    expect(LocalStorageModule.delete).toBeCalled()
  })

  it('fails tasks ', () => {
    LocalStorageModule.exists = jest.fn((key: string) => {
      return true
    })
    dtModule.addTask(task)
    LocalStorageModule.delete = jest.fn()
    expect(dtModule.tasks.length).toBe(1)
    dtModule.failTask(task.key)
    const updatedTask = dtModule.tasks.find((t) => t.key === 'key')
    expect(updatedTask).toBeDefined()
    expect(updatedTask!.payload.status).toEqual(DatatrustTaskStatus.failure)
    expect(LocalStorageModule.delete).toBeCalled()
  })
})
