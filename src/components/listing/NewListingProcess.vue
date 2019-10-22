<template>
  <NewListingProcessPresentation 
    :listingStepStatus="getListingStatus"
    :listingStepButtonText="listingLabel"
    :uploadStepStatus="getUploadStatus"
    :uploadStepLabel="uploadLabel"
    :uploadPercentComplete="uploadPercentComplete"
    :transactionHashIsAssigned="transactionHashIsAssigned"
    @onStartButtonClick="onStartButtonClick"
    @onUpdateDrawerCanClose="onUpdateDrawerCanClose"
  />
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator'
import { NoCache } from 'vue-class-decorator'
import { getModule } from 'vuex-module-decorators'
import { MutationPayload } from 'vuex'

import UploadModule from '../../vuexModules/UploadModule'
import NewListingModule from '../../vuexModules/NewListingModule'
import DrawerModule from '../../vuexModules/DrawerModule'

import NewListingProcessPresentation from './NewListingProcessPresentation.vue'

import { ProcessStatus, ProcessStatusLabelMap } from '../../models/ProcessStatus'

import FfaProcessModule from '../../interfaces/vuex/FfaProcessModule'

import { Messages, Errors } from '../../util/Constants'
import { CloseDrawer } from '../../models/Events'
import FfaListingsModule from '../../vuexModules/FfaListingsModule'
import FfaListing from '../../models/FfaListing'

@Component({
  components: {
    NewListingProcessPresentation,
  },
})
export default class NewListingProcess extends Vue {
  private uploadLabels!: ProcessStatusLabelMap
  private listingLabels!: ProcessStatusLabelMap
  private voteLabels!: ProcessStatusLabelMap

  private uploadModule = getModule(UploadModule, this.$store)
  private newListingModule = getModule(NewListingModule, this.$store)
  private ffaListingsModule = getModule(FfaListingsModule, this.$store)
  private drawerModule = getModule(DrawerModule, this.$store)

  get listingHash(): string {
    return this.uploadModule.hash
  }

  get candidates(): FfaListing[] {
    return this.ffaListingsModule.candidates
  }

  get candidateListed(): boolean {
    return this.candidates.find((listing) => listing.hash === this.listingHash) !== undefined
  }

  private uploadPercentComplete = 0
  private uploadStatus = ProcessStatus.NotReady
  private listingStatus = ProcessStatus.NotReady

  private transactionHashIsAssigned = false

  @NoCache
  private get listingLabel(): string {
    if (!this.listingStatus) {
      if (this.listingLabels) {
        return this.listingLabels[0]
      }
      return ''
    }
    return this.listingLabels[Number(this.listingStatus)]
  }

  @NoCache
  private get getUploadStatus(): ProcessStatus {
    return this.uploadStatus
  }

  @NoCache
  private get getListingStatus(): ProcessStatus {
    return this.listingStatus
  }

  @NoCache
  private get uploadLabel(): string {
    if (!this.uploadStatus) {
      if (this.uploadLabels) {
        return this.uploadLabels[0]
      }
      return ''
    }
    return this.uploadLabels[Number(this.uploadStatus)]
  }

  public mounted(this: NewListingProcess) {
    console.log('NewListingProcess mounted')
    this.listingStatus = this.newListingModule.status
    this.uploadStatus = this.uploadModule.status
    this.uploadPercentComplete = this.uploadModule.percentComplete
    this.$store.subscribe(this.vuexSubscriptions)
    this.$forceUpdate()
  }

  private beforeCreate(this: NewListingProcess) {
    this.uploadLabels = {}
    this.uploadLabels[ProcessStatus.NotReady] = Messages.UPLOAD
    this.uploadLabels[ProcessStatus.Ready] = Messages.UPLOAD
    this.uploadLabels[ProcessStatus.Executing] = Messages.UPLOADING
    this.uploadLabels[ProcessStatus.Complete] = Messages.UPLOADED
    this.uploadLabels[ProcessStatus.Error] = Errors.UPLOAD_FAILED

    this.listingLabels = {}
    this.listingLabels[ProcessStatus.NotReady] = Messages.LIST
    this.listingLabels[ProcessStatus.Ready] = Messages.LIST
    this.listingLabels[ProcessStatus.Executing] = Messages.LISTING
    this.listingLabels[ProcessStatus.Complete] = Messages.LISTED
    this.listingLabels[ProcessStatus.Error] = Errors.LISTING_FAILED

    this.voteLabels = {}
    this.voteLabels[ProcessStatus.NotReady] = Messages.VOTE
    this.voteLabels[ProcessStatus.Ready] = Messages.VOTE
    this.voteLabels[ProcessStatus.Executing] = Messages.VOTING
    this.voteLabels[ProcessStatus.Complete] = Messages.VOTED
    this.voteLabels[ProcessStatus.Error] = Errors.VOTING_FAILED
  }

  private startListing() {
    this.newListingModule.setStatus(ProcessStatus.Executing)
  }

  private startUpload() {
    this.uploadModule.setStatus(ProcessStatus.Executing)
  }

  private vuexSubscriptions(mutation: MutationPayload, state: any) {
    console.log(`got mutation ${mutation.type}, ${mutation.payload}`)
    if (!!!mutation.payload) {
      return
    }

    switch (mutation.type) {
      case `uploadModule/setPercentComplete`:
        const percent = mutation.payload as number
        this.uploadPercentComplete = Number.parseInt(percent.toFixed(0), 10)
        this.$forceUpdate()
        return
      case `uploadModule/setStatus`:
        const uploadStatusIndex = Number(mutation.payload)
        const uploadStatusKey = ProcessStatus[uploadStatusIndex] as keyof typeof ProcessStatus
        this.uploadStatus = ProcessStatus[uploadStatusKey]
        this.$forceUpdate()
        return
      case `newListingModule/setStatus`:
        const listingStatusIndex = Number(mutation.payload)
        const listingStatusKey = ProcessStatus[listingStatusIndex] as keyof typeof ProcessStatus
        this.listingStatus = ProcessStatus[listingStatusKey]
        this.$forceUpdate()
        return
      case `newListingModule/setTransactionHash`:
        this.transactionHashIsAssigned = true
        this.$forceUpdate()
        return
      default:
        return
    }
  }

  private onVotingDetailsClick() {
    const listingHash = this.uploadModule.hash
    this.$root.$emit(CloseDrawer)
    this.$router.push(`/listings/candidates/${listingHash}`)
  }

  private onStartButtonClick() {
    this.startListing()
  }

  private onUpdateDrawerCanClose(canClose: boolean) {
    this.drawerModule.setDrawerCanClose(canClose)
  }

  @Watch('uploadStatus')
  private onUploadStatusChanged(newStatus: ProcessStatus, oldStatus: ProcessStatus) {
    // Once upload status is Ready, just start it
    if (newStatus === ProcessStatus.Ready) {
      this.uploadModule.setStatus(ProcessStatus.Executing)
    }
  }
}
</script>
