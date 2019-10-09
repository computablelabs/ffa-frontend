<template>
  <div class="process-button">
    <a 
      v-if="isProcessing"
      class="button is-loading is-primary is-rounded is-large">
      {{ buttonText }}
    </a>
    <a 
      v-else
      data-is-clickable="true"
      class="button is-primary is-rounded is-large"
      @click="onClick">
      <span class="ethereum-step">{{ buttonText }}</span>
    </a>
  </div>
</template>

<script lang="ts">
import { NoCache } from 'vue-class-decorator'
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import { getModule } from 'vuex-module-decorators'

import '@/assets/style/ui/process-button.sass'

@Component
export default class ProcessButton extends Vue {

  @Prop()
  public processing?: boolean

  @Prop()
  public onClickCallback?: () => void

  @Prop()
  public buttonText!: string

  @Prop()
  public noToggle?: boolean

  @Prop()
  public clickable?: boolean

  protected isProcessing = false

  public mounted(this: ProcessButton) {
    if (this.processing === undefined) {
      this.isProcessing = false
      return
    }
    this.isProcessing = this.processing
  }

  public get isButtonEnabled(): boolean {
    return true
  }

  protected onClick() {
    if (this.clickable !== undefined && !this.clickable) { return }

    if (!!!this.noToggle) {
      this.isProcessing = !this.isProcessing
    }

    this.$emit('clicked')

    if (this.onClickCallback !== undefined) {
      this.onClickCallback()
    }
  }

  @Watch('processing')
  protected onProcessingChanged(newProcessing: boolean, oldProcessing: boolean) {
    this.isProcessing = newProcessing
  }
}
</script>