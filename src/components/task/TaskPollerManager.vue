<template>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'

import { MutationPayload } from 'vuex'
import { getModule } from 'vuex-module-decorators'
import DatatrustTaskModule from '../../vuexModules/DatatrustTaskModule'
import EventModule from '../../vuexModules/EventModule'

import TaskPollerManagerModule from '../../functionModules/components/TaskPollerManagerModule'

import LocalStorageModule from '../../functionModules/localStorage/LocalStorageModule'

import TaskFailure from '../../interfaces/TaskFailure'

import DatatrustTask from '../../models/DatatrustTask'
import { DatatrustTaskStatus, FfaDatatrustTaskType } from '../../models/DatatrustTaskDetails'
import TaskPoller from '../../models/TaskPoller'

import { Config } from '../../util/Config'

@Component
export default class TaskPollerManager extends Vue {

  public pollers: TaskPoller[] = []
  public unsubscribe!: () => void
  public datatrustTaskModule = getModule(DatatrustTaskModule, this.$store)

  public completeTask(task: DatatrustTask) {
    this.pollers = this.pollers.filter((p) => p.task.key !== task.key)
    TaskPollerManagerModule.completeTask(task, this.$store)
    console.log(`poller count: ${this.pollers.length}`)
  }

  public failTask(task: DatatrustTask) {
    this.pollers = this.pollers.filter((p) => p.task.key !== task.key)
    TaskPollerManagerModule.failTask(task, this.$store)
    console.log(`poller count: ${this.pollers.length}`)
  }

  private created() {
    this.unsubscribe = this.$store.subscribe(this.vuexSubscriptions)
  }

  private mounted() {
    // disabling for now
    // const tasks = LocalStorageModule.readAll() as DatatrustTask[]
    // tasks.forEach((t) => datatrustTaskModule.addTask(t))
  }

  private beforeDestroy() {
    this.unsubscribe()
  }

  private async vuexSubscriptions(mutation: MutationPayload, state: any) {

    let task: DatatrustTask|undefined
    switch (mutation.type) {
      case 'datatrustTaskModule/addTask':
        task = mutation.payload as DatatrustTask

        // if (task.payload.status !== DatatrustTaskStatus.started) {
        //   return
        // }

        const existingPoller = this.pollers.find((p: TaskPoller) => p.task.key === task!.key)

        if (existingPoller !== undefined) {
          return
        }

        const poller = new TaskPoller(task, Config.TaskPollingTime, this.$store, this.completeTask, this.failTask)
        this.pollers.push(poller)
        if (task.payload.ffaTaskType !== FfaDatatrustTaskType.noExecute) {
          poller.poll()
        }
        console.log(`poller count: ${this.pollers.length}`)
        await this.delay(10)
      case 'datatrustTaskModule/failTask':
        const taskFailure = mutation.payload as TaskFailure
        task = this.datatrustTaskModule.tasks.find((t) => t.key === taskFailure.uuid)

        if (task === undefined) {
          return
        }

        this.pollers = this.pollers.filter((p) => p.task.key !== task!.key)
        console.log(`poller count: ${this.pollers.length}`)

        const processId = task!.payload.processId
        const eventModule = getModule(EventModule, this.$store)
        if (eventModule) {
          (eventModule as EventModule).append({
            timestamp: new Date().getTime(),
            processId,
            response: taskFailure.response,
            error: taskFailure.error,
          })
        }
      default:
        // do nothing
    }
  }

  private async delay(ms: number): Promise<any> {
    return new Promise( (resolve) => setTimeout(resolve, ms) )
  }
}
</script>