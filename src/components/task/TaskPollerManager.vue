<template>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'

import { MutationPayload } from 'vuex'
import { getModule } from 'vuex-module-decorators'
import DatatrustTaskModule from '../../vuexModules/DatatrustTaskModule'

import TaskPollerManagerModule from '../../functionModules/components/TaskPollerManagerModule'

import LocalStorageModule from '../../functionModules/localStorage/LocalStorageModule'

import DatatrustTask from '../../models/DatatrustTask'
import { DatatrustTaskStatus, FfaDatatrustTaskType } from '../../models/DatatrustTaskDetails'
import TaskPoller from '../../models/TaskPoller'

import { Config } from '../../util/Config'

@Component
export default class TaskPollerManager extends Vue {

  public pollers: TaskPoller[] = []

  public completeTask(task: DatatrustTask) {
    TaskPollerManagerModule.completeTask(task, this.$store)
  }

  public failTask(task: DatatrustTask) {
    TaskPollerManagerModule.failTask(task, this.$store)
  }

  private created() {
    this.$store.subscribe(this.vuexSubscriptions)
  }

  private mounted() {
    const datatrustTaskModule = getModule(DatatrustTaskModule, this.$store)
    const tasks = LocalStorageModule.readAll() as DatatrustTask[]
    tasks.forEach((t) => datatrustTaskModule.addTask(t))
  }

  private vuexSubscriptions(mutation: MutationPayload, state: any) {

    if (mutation.type !== 'datatrustTaskModule/addTask') {
      return
    }

    const task = mutation.payload as DatatrustTask

    // if (task.payload.status !== DatatrustTaskStatus.started) {
    //   return
    // }

    const existingPoller = this.pollers.find((p: TaskPoller) => p.task.key === task.key)

    if (existingPoller !== undefined) {
      return
    }

    const poller = new TaskPoller(task, Config.TaskPollingTime, this.$store, this.completeTask, this.failTask)
    if (task.payload.ffaTaskType !== FfaDatatrustTaskType.noExecute) {
      poller.poll()
    }
    this.pollers.push(poller)
    console.log(`poller count: ${this.pollers.length}`)
  }
}
</script>