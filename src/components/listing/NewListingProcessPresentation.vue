<template>
  <div id="new-listing-process-presentation">
    <!-- Render button to let user start list / upload -->
    <div data-test-list-button-message="true" v-if="renderListButton">
      <h1>
        Upload file and send to the cooperative for voting. 
      </h1>
    </div>
    <ProcessButton 
      v-if="renderListButton"
      class="list-button"
      :processing="isWaitingUserConfirmSignature"
      @clicked="$emit('onStartButtonClick')"
      :buttonText="listingStepButtonText"
      :noToggle="true"
      :clickable="true" /> 

    <!-- Render to show progress of upload / list -->
    <!-- mining in progress -->
    <BlockchainExecutingMessage v-if="renderProgressIndicators && !listingIsComplete"> 
      <div slot="messageSlot" class="executing-message">
        Sending your new listing to the cooperative
      </div>
    </BlockchainExecutingMessage>

    <!-- mining complete -->
    <DrawerMessage v-if="renderProgressIndicators && listingIsComplete">
      <div slot="messageSlot" class="check-light-icon drawer-message">
        Sent to the cooperative
      </div>
    </DrawerMessage>

    <!-- upload in progress -->
    <Status
      v-if="renderProgressIndicators && !uploadIsComplete"
      class="upload-executing"
      :label="uploadStepLabel"
      :percentComplete="uploadPercentComplete"
    />

    <!-- upload complete -->
    <DrawerMessage 
      v-if="renderProgressIndicators && uploadIsComplete"
      class="upload-complete">
      <div slot="messageSlot" class="check-light-icon drawer-message">
        Uploaded
      </div>
    </DrawerMessage>

    <!-- Voting is happening now -->
    <DrawerMessage v-if="allStepsComplete">
      <div slot="messageSlot" class="voting-light-icon drawer-message">
        Voting is open for this listing
      </div>
      <div slot="subMessageSlot" class="drawer-submessage">
        <a href="">see details</a>
      </div>
    </DrawerMessage>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'

import Status from '@/components/ui/Status.vue'
import DrawerMessage from '@/components/ui/DrawerMessage.vue'
import ProcessButton from '@/components/ui/ProcessButton.vue'
import BlockchainExecutingMessage from '@/components/ui/BlockchainExecutingMessage.vue'

import { ProcessStatus } from '../../models/ProcessStatus'

import '@/assets/style/components/new-listing-process-presentation.sass'

@Component({
  components: {
    Status,
    ProcessButton,
    DrawerMessage,
    BlockchainExecutingMessage,
  },
})

export default class NewListingProcessPresentation extends Vue {

  @Prop()
  public listingStepStatus!: ProcessStatus

  @Prop()
  public listingStepButtonText!: string

  @Prop()
  public uploadStepStatus!: ProcessStatus

  @Prop()
  public uploadStepLabel!: string

  @Prop()
  public uploadPercentComplete!: number

  @Prop()
  public transactionHashIsAssigned!: boolean

  get isWaitingUserConfirmSignature(): boolean {
    return (
      this.listingStepStatus === ProcessStatus.Executing &&
      !this.transactionHashIsAssigned)
  }

  get renderListButton(): boolean {
    return (
      (this.listingStepStatus === ProcessStatus.Ready) ||
      this.isWaitingUserConfirmSignature)
  }

  get renderProgressIndicators(): boolean {
    if (this.isWaitingUserConfirmSignature) {
      return false
    }

    return (
      this.listingStepStatus === ProcessStatus.Executing ||
      this.uploadStepStatus === ProcessStatus.Executing)
  }

  get allStepsComplete(): boolean {
    return (
      this.listingStepStatus === ProcessStatus.Complete &&
      this.uploadStepStatus === ProcessStatus.Complete)
  }

  get renderTimeToVote(): boolean {
    return (
      this.listingStepStatus === ProcessStatus.Complete ||
      this.uploadStepStatus === ProcessStatus.Complete)
  }

  get listingIsComplete(): boolean {
    return this.listingStepStatus === ProcessStatus.Complete
  }

  get uploadIsComplete(): boolean {
    return this.uploadStepStatus === ProcessStatus.Complete
  }

  public mounted(this: NewListingProcessPresentation) {
    this.updateDrawerCanClose()
  }

  private updateDrawerCanClose() {
    let drawerCanClose = false
    if (this.renderListButton && !this.isWaitingUserConfirmSignature) {
      drawerCanClose = true
    }

    if (this.allStepsComplete) {
      drawerCanClose = true
    }

    this.$emit('onUpdateDrawerCanClose', drawerCanClose)
  }

  @Watch('listingStepStatus')
  private onListingStatusChanged(newStatus: ProcessStatus, oldStatus: ProcessStatus) {
    this.updateDrawerCanClose()
  }

  @Watch('transactionHashIsAssigned')
  private onTransactionHashIsAssigned(newHash: string, oldHash: string) {
    this.updateDrawerCanClose()
  }

  @Watch('uploadStepStatus')
  private onUploadStepStatusChanged(newStatus: ProcessStatus, oldStatus: ProcessStatus) {
    this.updateDrawerCanClose()
  }
}
</script>
