<template>
  <div class="status tile is-hcentered">
    <div class="tile is-8 ">
      <div class="indicator tile is-2">
        <div class="c100" v-bind:class="currentPercentClass">
          <span>{{percentComplete}}%</span>
          <div class="slice">
            <div class="bar"></div>
            <div class="fill"></div>
          </div>
        </div>
      </div>
      <div class="label tile">
        <span class="label-text"
          v-if="!isReady">
          {{ label }}
        </span>
        <a class="button is-primary"
          @click="execute"
          v-if="isReady">
          {{ label }}
        </a>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import { NoCache } from 'vue-class-decorator'
import { MutationPayload } from 'vuex'
import { getModule, VuexModule } from 'vuex-module-decorators'
// import datatrust from '@computable/computablejs/dist/contracts/datatrust'

import '@/assets/style/ui/status.sass'
import '@/assets/style/ui/percentage-circle.css'
import { ExecOptions } from 'child_process'
import { ProcessStatus, ProcessStatusLabelMap } from '../../models/ProcessStatus'
import FfaProcessModule from '../../models/FfaProcessModule'

@Component
export default class Status extends Vue {

  @Prop()
  public statusLabels!: ProcessStatusLabelMap

  @Prop()
  public vuexModule!: FfaProcessModule

  private currentStatus!: ProcessStatus
  private percentComplete = 0
  private buttonEnabled = false

  public mounted(this: Status) {
    // let d = new datatrust()
    this.currentStatus = ProcessStatus.NotReady
    this.$store.subscribe(this.vuexSubscriptions)
  }

  @NoCache
  private get isReady(): boolean {
    if (!this.currentStatus) {
      return false
    }
    return this.currentStatus === ProcessStatus.Ready
  }

  @NoCache
  private get label(): string {
    if (!this.currentStatus) {
      if (this.statusLabels) {
        return this.statusLabels[0]
      }
      return ''
    }
    return this.statusLabels[Number(this.currentStatus)]
  }

  @NoCache
  private get currentPercentClass(): string {
    return `p${this.percentComplete}`
  }

  private vuexSubscriptions(mutation: MutationPayload, state: any) {

    const namespace = this.vuexModule.namespace
    switch (mutation.type) {
      case `${namespace}/setPercentComplete`: {
        if (mutation.payload !== null) {
          this.percentComplete = mutation.payload
        }
        this.$forceUpdate()
        break
      }
      case `${namespace}/setStatus`: {
        const statusIndex = Number(mutation.payload)
        const statusKey = ProcessStatus[statusIndex] as keyof typeof ProcessStatus
        this.currentStatus = ProcessStatus[statusKey]
        this.$forceUpdate()
        break
      }
      default:
        // do the bender
    }
  }

  private execute() {
    this.vuexModule.setStatus(ProcessStatus.Executing)
  }
}
</script>