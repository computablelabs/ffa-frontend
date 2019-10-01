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
import VotingModule from '../../vuexModules/VotingModule'
import { getModule } from 'vuex-module-decorators'


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
  protected votingModule = getModule(VotingModule, this.$store)

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