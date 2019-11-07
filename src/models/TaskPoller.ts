import { Store } from 'vuex'
import DatatrustTask from './DatatrustTask'
import DatatrustModule from '../functionModules/datatrust/DatatrustModule'
import { DatatrustTaskStatus } from './DatatrustTaskDetails'

export default class TaskPoller {

  public task: DatatrustTask
  protected startTime: number
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

    console.log(`creating new poller for task with key: ${task.key}`)
    this.task = task
    this.startTime = new Date().getTime()
    this.pollTime = pollTime
    this.appStore = appStore
    this.complete = complete
    this.fail = fail
  }

  public startTimer() {
    if (this.timerId !== undefined) {
      clearTimeout(this.timerId)
    }

    this.timerId = setTimeout(() => { this.poll() }, this.pollTime)
  }

  public async stopTimer() {
    if (this.timerId === undefined) {
      return
    }
    const timerId = this.timerId
    this.timerId = undefined
    clearTimeout(timerId)
  }

  public isRunning(): boolean {
    return this.timerId !== undefined
  }

  public async poll() {
    if (this.timerId !== undefined) {
      const timerId = this.timerId
      this.timerId = undefined
    }

    const [error, task] = await DatatrustModule.getTask(this.task.key, this.appStore)

    if (error !== undefined) {
      console.error('there are errors')
      return this.startTimer()
    }

    if (task === undefined) {
      console.error(`task is undefined!`)
      return this.startTimer() // TODO: huh?
    }

    switch (task.payload.status) {

      case DatatrustTaskStatus.started:
        return this.startTimer()

      case DatatrustTaskStatus.pending:

        if (new Date().getTime() - this.startTime > 15 * 60 * 1000) {
          console.error('Total runtime exceeded.  Stopping.')
          this.fail(task)
          return
        }

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
