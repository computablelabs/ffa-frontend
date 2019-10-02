<template>
  <div class="status tile is-hcentered">
    <div class="tile is-8 ">
      <div class="indicator tile is-2">
        <div class="c100"
          :class="currentPercentClass">
          <span>{{percentComplete}}%</span>
          <div class="slice">
            <div class="bar"></div>
            <div class="fill"></div>
          </div>
        </div>
      </div>
      <div class="label tile">
        <a class="button is-primary"
          @click="execute"
          v-if="isReady">
          {{ label }}
        </a>
        <span class="label-text"
          v-else>
          {{ label }}
        </span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import { NoCache } from 'vue-class-decorator'
import { MutationPayload } from 'vuex'
import { VuexModule } from 'vuex-module-decorators'

import { ProcessStatus, ProcessStatusLabelMap } from '../../models/ProcessStatus'
import { OpenDrawer } from '../../models/Events'

import FfaProcessModule from '../../interfaces/vuex/FfaProcessModule'

import '@/assets/style/ui/status.sass'
import '@/assets/style/ui/percentage-circle.css'

@Component
export default class Status extends Vue {

  @NoCache
  private get isReady(): boolean {
    if (!!!this.currentStatus) {
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

  @Prop()
  public statusLabels!: ProcessStatusLabelMap

  @Prop()
  public vuexModule!: FfaProcessModule

  private currentStatus!: ProcessStatus
  private percentComplete = 0
  private buttonEnabled = false

  public mounted(this: Status) {
    this.currentStatus = this.vuexModule.status
    this.percentComplete = this.vuexModule.percentComplete
    this.$store.subscribe(this.vuexSubscriptions)
    this.$forceUpdate()
  }

  @Watch('currentStatus')
  public onCurrentStatusChanged(newCurrentStatus: ProcessStatus, oldCurrentStatus: ProcessStatus) {
    this.$forceUpdate()
  }

  private vuexSubscriptions(mutation: MutationPayload, state: any) {
    const namespace = this.vuexModule.namespace
    switch (mutation.type) {
      case `${namespace}/setPercentComplete`:
        if (mutation.payload !== null) {
          const percent = mutation.payload as number
          this.percentComplete = Number.parseInt(percent.toFixed(0), 10)
        }
        this.$forceUpdate()
        return
      case `${namespace}/setStatus`:
        const statusIndex = Number(mutation.payload)
        const statusKey = ProcessStatus[statusIndex] as keyof typeof ProcessStatus
        this.currentStatus = ProcessStatus[statusKey]
        this.$forceUpdate()
        return
      default:
        return
    }
  }

  private execute() {
    this.vuexModule.setStatus(ProcessStatus.Executing)
  }

}
</script>