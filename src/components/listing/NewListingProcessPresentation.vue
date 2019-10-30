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
    <BlockchainExecutingMessage v-if="isInProgress && isListingPending">
      <div slot="messageSlot" class="executing-message">
        Sending your new listing to the cooperative
      </div>
    </BlockchainExecutingMessage>

    <!-- mining complete -->
    <DrawerMessage v-if="isInProgress && isListingComplete">
      <div slot="messageSlot" class="check-light-icon drawer-message">
        Sent to the cooperative
      </div>
    </DrawerMessage>

    <!-- upload in progress -->
    <Status
      v-if="isInProgress && !isUploadComplete"
      class="upload-executing"
      label="Uploading"
      :percentComplete="uploadPercentComplete"
    />

    <!-- upload complete -->
    <DrawerMessage
      v-if="isInProgress && isUploadComplete"
      class="upload-complete">
      <div slot="messageSlot" class="check-light-icon drawer-message">
        Uploaded
      </div>
    </DrawerMessage>

    <!----- datatrust hasn't started yet ------>
    <DrawerMessage 
      v-if="isInProgress && !isUploadComplete"
      class="datatrust-step"
      >
      <div slot="messageSlot" class="ethereum-step drawer-message">
        Verify upload
      </div>
    </DrawerMessage>

    <!-- datatrust in progress -->
    <BlockchainExecutingMessage 
      v-if="isInProgress && isUploadComplete && !isDatatrustComplete"
      class="datatrust-step"
      >
      <div slot="messageSlot" class="executing-message">
        Verifying upload
      </div>
    </BlockchainExecutingMessage>

    <!-- datatrust complete -->
    <DrawerMessage
      v-if="isInProgress && isDatatrustComplete"
      class="upload-complete">
      <div slot="messageSlot" class="check-light-icon drawer-message datatrust-step">
        Upload verified
      </div>
    </DrawerMessage>

    <!-- Voting is happening now -->
    <DrawerMessage v-if="areAllStepsComplete">
      <div slot="messageSlot" class="voting-light-icon drawer-message">
        Voting is open for this listing
      </div>
    </DrawerMessage>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import { NoCache } from 'vue-class-decorator'
import { getModule } from 'vuex-module-decorators'

import Status from '@/components/ui/Status.vue'
import DrawerMessage from '@/components/ui/DrawerMessage.vue'
import ProcessButton from '@/components/ui/ProcessButton.vue'
import BlockchainExecutingMessage from '@/components/ui/BlockchainExecutingMessage.vue'

import { ProcessStatus } from '../../models/ProcessStatus'

import { Labels } from '../../util/Constants'
import UploadModule from '../../vuexModules/UploadModule'

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

  // scaffolding
  public uploadModule = getModule(UploadModule, this.$store)

  @Prop()
  public listingStatus!: ProcessStatus

  @Prop()
  public listingStepButtonText!: string

  @Prop()
  public uploadStatus!: ProcessStatus

  @Prop()
  public uploadStepLabel!: string

  @Prop()
  public uploadPercentComplete!: number

  @Prop( )
  public datatrustStatus!: ProcessStatus

  @Prop()
  public hasTransactionHash!: boolean

  // scaffolding
  get candidateViewLink(): string {
    return `/listings/candidates/${this.uploadModule.hash}`
  }

  get isWaitingUserConfirmSignature(): boolean {
    return this.listingStatus === ProcessStatus.Executing &&
      !this.hasTransactionHash
  }

  get renderListButton(): boolean {
    return this.listingStatus === ProcessStatus.Ready ||
      this.isWaitingUserConfirmSignature
  }

  @NoCache
  get isInProgress(): boolean {
    if (this.isWaitingUserConfirmSignature) {
      return false
    }
    return this.listingStatus === ProcessStatus.Executing ||
      this.uploadStatus === ProcessStatus.Executing ||
      this.datatrustStatus === ProcessStatus.Executing
  }

  get areAllStepsComplete(): boolean {
    return this.listingStatus === ProcessStatus.Complete &&
      this.uploadStatus === ProcessStatus.Complete &&
      this.datatrustStatus === ProcessStatus.Complete
  }

  get isListingPending(): boolean {
    console.log(`isListingPending: ${this.listingStatus}`)
    return this.listingStatus === ProcessStatus.Executing
  }

  get isListingComplete(): boolean {
    return this.listingStatus === ProcessStatus.Complete
  }

  get isUploadPending(): boolean {
    return this.uploadStatus === ProcessStatus.Executing
  }

  get isUploadComplete(): boolean {
    return this.uploadStatus === ProcessStatus.Complete
  }

  get isDatatrustPending(): boolean {
    return this.datatrustStatus === ProcessStatus.Executing
  }

  get isDatatrustComplete(): boolean {
    return this.datatrustStatus === ProcessStatus.Complete
  }

  public mounted(this: NewListingProcessPresentation) {
    this.updateDrawerParentState()
  }

  private updateDrawerParentState() {
    let drawerCanClose = false
    if (this.renderListButton && !this.isWaitingUserConfirmSignature) {
      drawerCanClose = true
    }

    if (this.areAllStepsComplete) {
      drawerCanClose = true
    }

    this.$emit('onUpdateDrawerCanClose', drawerCanClose)

    if (this.areAllStepsComplete) {
      this.$emit('onSetDrawerOpenClass', 'open71')
    }
  }

  @Watch('listingStatus')
  private onListingStatusChanged(newStatus: ProcessStatus, oldStatus: ProcessStatus) {
    this.updateDrawerParentState()
  }

  @Watch('hasTransactionHash')
  private onTransactionHashIsAssigned(newHash: string, oldHash: string) {
    this.updateDrawerParentState()
  }

  @Watch('uploadStepStatus')
  private onUploadStepStatusChanged(newStatus: ProcessStatus, oldStatus: ProcessStatus) {
    this.updateDrawerParentState()
  }

  @Watch('datatrustStatus')
  private onDatatrustStatusChanged(newStatus: ProcessStatus, oldStatus: ProcessStatus) {
    this.updateDrawerParentState()
  }
}
</script>
