<template>
  <div class="process-button">
    <font-awesome-icon
      class="spinner fa-pulse"
      :icon="['fas', 'spinner']"
      v-if="isProcessing"
      />
    <a
      class="button"
      @click="onClick"
      v-else>
      {{ buttonText }}
    </a>
  </div>
</template>

<script lang="ts">
import { NoCache } from 'vue-class-decorator'
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'

@Component
export default class ProcessButton extends Vue {

  @Prop()
  public processing?: boolean

  @Prop()
  public onClickCallback?: () => void

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