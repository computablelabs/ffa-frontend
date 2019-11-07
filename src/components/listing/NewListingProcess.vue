<template>
  <NewListingProcessPresentation
    :listingStatus="listingStatus"
    :listingStepButtonText="listingLabel"
    :uploadStatus="uploadStatus"
    :uploadStepLabel="uploadLabel"
    :uploadPercentComplete="uploadPercentComplete"
    :hasTransactionHash="hasTransactionHash"
    :datatrustStatus="datatrustStatus"
    :onStartButtonClick="onStartButtonClick"
    @onUpdateDrawerCanClose="onUpdateDrawerCanClose"
    @onSetDrawerOpenClass="onSetDrawerOpenClass" />
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator'
import { NoCache } from 'vue-class-decorator'
import { Location } from 'vue-router'
import { getModule } from 'vuex-module-decorators'
import { MutationPayload } from 'vuex'

import UploadModule from '../../vuexModules/UploadModule'
import NewListingModule from '../../vuexModules/NewListingModule'
import DrawerModule from '../../vuexModules/DrawerModule'
import FlashesModule from '../../vuexModules/FlashesModule'

import ProcessStatusModule from '../../functionModules/processStatus/ProcessStatusModule'
import NewListingProcessModule from '../../functionModules/components/NewListingProcessModule'
import EventableModule from '../../functionModules/eventable/EventableModule'
import TaskPollerModule from '../../functionModules/task/TaskPollerModule'
import ListingContractModule from '../../functionModules/protocol/ListingContractModule'

import NewListingProcessPresentation from './NewListingProcessPresentation.vue'
import FfaProcessModule from '../../interfaces/vuex/FfaProcessModule'

import { Eventable } from '../../interfaces/Eventable'

import { ProcessStatus, ProcessStatusLabelMap } from '../../models/ProcessStatus'
import Flash, { FlashType } from '../../models/Flash'
import { FfaDatatrustTaskType } from '../../models/DatatrustTaskDetails'


import { Messages, Errors } from '../../util/Constants'
import { CloseDrawer } from '../../models/Events'
import FfaListingsModule from '../../vuexModules/FfaListingsModule'
import FfaListing from '../../models/FfaListing'

import uuid4 from 'uuid/v4'

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
  private flashesModule = getModule(FlashesModule, this.$store)

  private uploadPercentComplete = 0
  private listingStatus = ProcessStatus.NotReady
  private uploadStatus = ProcessStatus.NotReady
  private datatrustStatus = ProcessStatus.NotReady

  private hasTransactionHash = false
  private newListingProcessId = ''

  private unsubscribe!: () => void

  get listingHash(): string {
    return this.uploadModule.hash
  }

  get candidates(): FfaListing[] {
    return this.ffaListingsModule.candidates
  }

  get candidateListed(): boolean {
    return this.candidates.find((listing) => listing.hash === this.listingHash) !== undefined
  }

  @NoCache
  private get listingLabel(): string {
    if (!this.listingStatus) {
      return this.listingLabels ? this.listingLabels[0] : ''
    }
    return this.listingLabels[Number(this.listingStatus)]
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

  public created() {
    this.unsubscribe = this.$store.subscribe(this.vuexSubscriptions)
  }

  public beforeDestroy() {
    this.unsubscribe()
  }

  public mounted(this: NewListingProcess) {
    console.log('NewListingProcess mounted')
    this.listingStatus = this.newListingModule.status
    this.uploadStatus = this.uploadModule.status
    this.uploadPercentComplete = this.uploadModule.percentComplete
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
  }

  private vuexSubscriptions(mutation: MutationPayload, state: any) {
    if (!!!mutation.payload) {
      return
    }
    let location: Location|null
    switch (mutation.type) {
      case 'uploadModule/setPercentComplete':
        const percent = mutation.payload as number
        this.uploadPercentComplete = Number.parseInt(percent.toFixed(0), 10)
        return

      case 'uploadModule/setStatus':
        this.uploadStatus = ProcessStatusModule.toEnumValue(mutation.payload)

        switch (this.uploadStatus) {
          case ProcessStatus.Ready:
            return this.uploadModule.setStatus(ProcessStatus.Executing)

          case ProcessStatus.Complete:
            location = NewListingProcessModule.getDoneRedirect(this.$router, this.$store)
            if (location) {
              this.$router.push(location)
            }
        }
        return

      case 'uploadModule/setDatatrustStatus':
        this.datatrustStatus = ProcessStatusModule.toEnumValue(mutation.payload)

        if (this.datatrustStatus === ProcessStatus.Complete) {
          this.drawerModule.setDrawerCanClose(true)
        }

        location = NewListingProcessModule.getDoneRedirect(this.$router, this.$store)
        if (location) {
          this.$router.push(location)
        }
        return

      case 'newListingModule/setStatus':
        this.listingStatus = ProcessStatusModule.toEnumValue(mutation.payload)
        location = NewListingProcessModule.getDoneRedirect(this.$router, this.$store)
        if (location) {
          this.$router.push(location)
        }
        return

      case 'newListingModule/setTransactionHash':
        if (!mutation.payload) {
          return this.hasTransactionHash =  false
        }
        return this.hasTransactionHash = (mutation.payload as string).length > 0

      case 'eventModule/append':

        if (!EventableModule.isEventable(mutation.payload)) {
          return
        }

        const event = mutation.payload as Eventable

        if (event.processId !== this.newListingProcessId) {
          return
        }

        if (event.error) {
          if (event.error.message.indexOf(Errors.USER_DENIED_SIGNATURE) > 0) {
            return this.newListingModule.setStatus(ProcessStatus.Ready)
          } else {
            this.newListingModule.setStatus(ProcessStatus.Error)
            return this.flashesModule.append(new Flash(mutation.payload.error, FlashType.error))
          }
        }

        const transactionHash = event.response.result
        this.newListingModule.setTransactionHash(transactionHash)

        return TaskPollerModule.createTaskPollerForEthereumTransaction(
          event.response.result,
          this.newListingModule.listing.hash,
          FfaDatatrustTaskType.createListing,
          this.$store)

      // TODO: error handling case (eventModule/append)
      default:
        return
    }
  }

  private onVotingDetailsClick() {
    const listingHash = this.uploadModule.hash
    this.$root.$emit(CloseDrawer)
    this.$router.push(`/listings/candidates/${listingHash}`)
  }

  private async onStartButtonClick() {
    this.newListingProcessId = uuid4()
    this.newListingModule.setStatus(ProcessStatus.Executing)
    this.ffaListingsModule.addPending(this.newListingModule.listing)

      // TODO: validate the listing?
    await ListingContractModule.postListing(
      ethereum.selectedAddress,
      this.listingHash,
      this.newListingProcessId,
      this.$store,
    )
  }

  // TODO: evaluate if these can be removed in lieu of reactions to vuex changes
  private onUpdateDrawerCanClose(canClose: boolean) {
    this.drawerModule.setDrawerCanClose(canClose)
  }

  private onSetDrawerOpenClass(cssClass: string) {
    this.drawerModule.setDrawerOpenClass(cssClass)
  }

  private redirect() {
    const resolved = this.$router.resolve({
      name: 'singleCandidateCreated',
      params: {
        listingHash: this.uploadModule.hash,
      },
    })
  }
}
</script>
