import { mount, createLocalVue, Wrapper } from '@vue/test-utils'
import VueRouter from 'vue-router'

import { getModule } from 'vuex-module-decorators'
import appStore from '../../../../src/store'
import DatatrustTaskModule from '../../../../src/vuexModules/DatatrustTaskModule'

import TaskPollerManager from '../../../../src/components/task/TaskPollerManager.vue'

import DatatrustModule from '../../../../src/functionModules/datatrust/DatatrustModule'
import LocalStorageModule from '../../../../src/functionModules/localStorage/LocalStorageModule'

import Storeable from '../../../../src/interfaces/Storeable'

import DatatrustTask from '../../../../src/models/DatatrustTask'
import DatatrustTaskDetails, { DatatrustTaskStatus, FfaDatatrustTaskType } from '../../../../src/models/DatatrustTaskDetails'

import { Config } from '../../../../src/util/Config'

import flushPromises from 'flush-promises'

// tslint:disable no-shadowed-variable

describe('TaskPollerManager.vue', () => {

  const key = 'key'
  const createdDetails = new DatatrustTaskDetails('0x123', FfaDatatrustTaskType.createListing)
  const completedDetails = new DatatrustTaskDetails('0x345', FfaDatatrustTaskType.createListing)
  completedDetails.status = DatatrustTaskStatus.success
  const failedDetails = new DatatrustTaskDetails('0x456', FfaDatatrustTaskType.createListing)
  failedDetails.status = DatatrustTaskStatus.failure
  const createdTask = new DatatrustTask(key, createdDetails)
  const completedTask = new DatatrustTask(key, completedDetails)
  const failedTask = new DatatrustTask(key, failedDetails)
  const localVue = createLocalVue()

  let dtModule!: DatatrustTaskModule
  let wrapper!: Wrapper<TaskPollerManager>

  beforeAll(() => {
    localVue.use(VueRouter)

    dtModule = getModule(DatatrustTaskModule, appStore)

    Config.TaskPollingTime = 15
  })

  afterEach(() => {
    wrapper.destroy()
    dtModule.clear()
  })

  it ('creates pollers', async () => {

    LocalStorageModule.exists = jest.fn((key: string) => {
      return true
    })

    LocalStorageModule.store = ((storeable: Storeable) => {
      return
    })

    LocalStorageModule.delete = ((key: string) => {
      return
    })

    DatatrustModule.getTask = jest.fn((uuid: string): Promise<[Error?, DatatrustTask?]>  => {
      return Promise.resolve([undefined, completedTask])
    })

    wrapper = mount(TaskPollerManager, {
      store: appStore,
      localVue,
    })

    const details = new DatatrustTaskDetails('0x567', FfaDatatrustTaskType.noExecute)
    const task = new DatatrustTask(key, details)
    dtModule.addTask(task)
    await delay(200)
    expect(wrapper.vm.$data.pollers).toBeDefined()
    expect(Array.isArray(wrapper.vm.$data.pollers)).toBeTruthy()
    const pollers = wrapper.vm.$data.pollers
    expect(pollers.length).toBe(1)
    expect(pollers[0].isRunning()).toBeFalsy()
    expect(dtModule.tasks.find((t) => t.key === key)).toBeDefined()
    expect(dtModule.tasks.find((t) => t.key === key)!.payload.status).toEqual(DatatrustTaskStatus.started)
  })
})

function delay(ms: number): Promise<any> {
  return new Promise( (resolve) => setTimeout(resolve, ms) )
}
