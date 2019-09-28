import { Store } from 'vuex'
import DatatrustTask from './DatatrustTask'
import DatatrustModule from '../functionModules/datatrust/DatatrustModule'
import { DatatrustTaskStatus } from './DatatrustTaskDetails'

export default class TaskPoller {

  public task: DatatrustTask
  protected pollTime: number
  protected complete: (task: DatatrustTask) => void
  protected fail: (task: DatatrustTask) => void
  protected appStore: Store<any>
  protected timerId!: NodeJS.Timeout|undefined

  constructor(
    task: DatatrustTask,
    pollTime: number,
    appStore: Store<any>,
    complete: (task: DatatrustTask) => void,
    fail: (task: DatatrustTask) => void) {

    this.task = task
    this.pollTime = pollTime
    this.appStore = appStore
    this.complete = complete
    this.fail = fail
  }

  public startTimer() {
    console.log(`TaskPoller for task '${this.task.key}' starting...`)
    if (this.timerId !== undefined) {
      clearTimeout(this.timerId)
    }

    this.timerId = setTimeout(() => { this.poll() }, this.pollTime)
    console.log(`TaskPoller ${this.timerId} for task '${this.task.key}' started.`)
  }

  public async stopTimer() {
    if (this.timerId === undefined) {
      return
    }
    const timerId = this.timerId
    this.timerId = undefined
    clearTimeout(timerId)
    console.log(`TaskPoller ${timerId} for task '${this.task.key}' stopped.`)
  }

  public isRunning(): boolean {
    return this.timerId !== undefined
  }

  public async poll() {

    if (this.timerId !== undefined) {
      const timerId = this.timerId
      this.timerId = undefined
      console.log(`TaskPoller ${timerId} for task '${this.task.key}' completed.`)
    }

    const [error, task] = await DatatrustModule.getTask(this.task.key, this.appStore)

    if (error !== undefined) {
      console.error('there are errors')
      return this.startTimer()
    }

    if (task === undefined) {
      console.error(`task is undefined!`)
      return this.startTimer()
    }

    switch (task.payload.status) {
      case DatatrustTaskStatus.started:
        console.log(`task '${this.task.key}' is still running.`)
        return this.startTimer()
      case DatatrustTaskStatus.success:
        console.log(`task '${this.task.key}' completed.`)
        return this.complete(task)
      case DatatrustTaskStatus.failure:
        console.log(`task '${this.task.key}' failed.`)
        return this.fail(task)
    }
  }
}
