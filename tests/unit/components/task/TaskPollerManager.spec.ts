import { mount, createLocalVue, Wrapper } from '@vue/test-utils'
import VueRouter from 'vue-router'

import { getModule } from 'vuex-module-decorators'
import appStore from '../../../../src/store'
import DatatrustTaskModule from '../../../../src/vuexModules/DatatrustTaskModule'
import EventModule from '../../../../src/vuexModules/EventModule'

import TaskPollerManager from '../../../../src/components/task/TaskPollerManager.vue'

import DatatrustModule from '../../../../src/functionModules/datatrust/DatatrustModule'

import Storeable from '../../../../src/interfaces/Storeable'

import DatatrustTask from '../../../../src/models/DatatrustTask'
import DatatrustTaskDetails, { DatatrustTaskStatus, FfaDatatrustTaskType } from '../../../../src/models/DatatrustTaskDetails'

import { Config } from '../../../../src/util/Config'

import flushPromises from 'flush-promises'

// tslint:disable no-shadowed-variable

describe('TaskPollerManager.vue', () => {

  const key = 'key'
  const createdDetails = new DatatrustTaskDetails('0x123', '456', FfaDatatrustTaskType.createListing)
  const completedDetails = new DatatrustTaskDetails('0x345', '456', FfaDatatrustTaskType.createListing)
  completedDetails.status = DatatrustTaskStatus.success
  const failedDetails = new DatatrustTaskDetails('0x456', '456', FfaDatatrustTaskType.createListing)
  failedDetails.status = DatatrustTaskStatus.failure
  const createdTask = new DatatrustTask(key, createdDetails)
  const completedTask = new DatatrustTask(key, completedDetails)
  const failedTask = new DatatrustTask(key, failedDetails)
  const localVue = createLocalVue()

  const datatrustTaskModule = getModule(DatatrustTaskModule, appStore)
  const eventModule = getModule(EventModule, appStore)

  let wrapper!: Wrapper<TaskPollerManager>

  beforeAll(() => {
    localVue.use(VueRouter)

    Config.TaskPollingTime = 15

    jest.mock('../../../../src/vuexModules/EventModule')
  })

  afterEach(() => {
    wrapper.destroy()
    datatrustTaskModule.clear()
  })

  it ('creates pollers', async () => {

    DatatrustModule.getTask = jest.fn((uuid: string): Promise<[Error?, DatatrustTask?]>  => {
      return Promise.resolve([undefined, completedTask])
    })

    wrapper = mount(TaskPollerManager, {
      store: appStore,
      localVue,
    })

    const details = new DatatrustTaskDetails('0x567', '890', FfaDatatrustTaskType.noExecute)
    const task = new DatatrustTask(key, details)
    datatrustTaskModule.addTask(task)

    await flushPromises()

    expect(wrapper.vm.$data.pollers).toBeDefined()
    expect(Array.isArray(wrapper.vm.$data.pollers)).toBeTruthy()
    const pollers = wrapper.vm.$data.pollers
    expect(pollers.length).toBe(1)
    expect(pollers[0].isRunning()).toBeFalsy()
    expect(datatrustTaskModule.tasks.find((t) => t.key === key)).toBeDefined()
    expect(datatrustTaskModule.tasks.find((t) => t.key === key)!.payload.status).toEqual(DatatrustTaskStatus.started)
  })

  it ('fails pollers', async () => {
    DatatrustModule.getTask = jest.fn((uuid: string): Promise<[Error?, DatatrustTask?]>  => {
      return Promise.resolve([undefined, completedTask])
    })

    const spy = jest.fn()
    eventModule.append = spy

    wrapper = mount(TaskPollerManager, {
      store: appStore,
      localVue,
    })

    const details = new DatatrustTaskDetails('0x567', '890', FfaDatatrustTaskType.noExecute)
    const task = new DatatrustTask(key, details)
    datatrustTaskModule.addTask(task)

    await flushPromises()

    let pollers = wrapper.vm.$data.pollers
    expect(pollers.length).toBe(1)

    datatrustTaskModule.failTask({
      uuid: task.key,
      response: undefined,
      error: undefined,
    })

    await flushPromises()

    expect(wrapper.vm.$data.pollers).toBeDefined()
    expect(Array.isArray(wrapper.vm.$data.pollers)).toBeTruthy()
    pollers = wrapper.vm.$data.pollers
    expect(pollers.length).toBe(0)
    expect(datatrustTaskModule.tasks.find((t) => t.key === key)!.payload.status).toEqual(DatatrustTaskStatus.failure)
    expect(spy).toHaveBeenCalled()
  })
})
