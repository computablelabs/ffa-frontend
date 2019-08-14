<template>
  <div class="list-drawer-container">
      <div id="list-drawer"
        class="list-drawer tile is-vertical is-ancestor list-drawer"
        v-show="isProcessingListing">
        <status
          :vuexModule="listModule"
          :statusLabels="listLabels"/>
        <status
            :vuexModule="uploadModule"
            :statusLabels="uploadLabels"/>
        <status
          :vuexModule="voteModule"
          :statusLabels="voteLabels"/>
      </div>
      <StartListingButton v-show="!isProcessingListing"/>
  </div>
</template>

<script lang="ts">
import { NoCache } from 'vue-class-decorator'
import { Component, Vue, Prop } from 'vue-property-decorator'
import { getModule } from 'vuex-module-decorators'
import UploadModule from '../vuexModules/UploadModule'
import ListModule from '../vuexModules/ListModule'
import VoteModule from '../vuexModules/VoteModule'
import Status from '@/components/ui/Status.vue'
import StartListingButton from '../components/listing/StartListingButton.vue'
import { ProcessStatus, ProcessStatusLabelMap } from '../models/ProcessStatus'
import FfaProcessModule from '../interfaces/vuex/FfaProcessModule'
import { Messages, Errors } from '../util/Constants'
import '@/assets/style/components/list-drawer.sass'

@Component({
  components: {
    Status,
    StartListingButton,
  },
})
export default class ListDrawer extends Vue {

  private uploadLabels!: ProcessStatusLabelMap
  private listLabels!: ProcessStatusLabelMap
  private voteLabels!: ProcessStatusLabelMap

  private uploadModule = getModule(UploadModule, this.$store)
  private listModule = getModule(ListModule, this.$store)
  private voteModule = getModule(VoteModule, this.$store)

  private beforeCreate(this: ListDrawer) {
    this.uploadLabels = {}
    this.uploadLabels[ProcessStatus.NotReady] = Messages.UPLOAD
    this.uploadLabels[ProcessStatus.Ready] = Messages.UPLOAD
    this.uploadLabels[ProcessStatus.Executing] = Messages.UPLOADING
    this.uploadLabels[ProcessStatus.Complete] = Messages.UPLOADED
    this.uploadLabels[ProcessStatus.Error] = Errors.UPLOAD_FAILED

    this.listLabels = {}
    this.listLabels[ProcessStatus.NotReady] = Messages.LIST
    this.listLabels[ProcessStatus.Ready] = Messages.LIST
    this.listLabels[ProcessStatus.Executing] = Messages.LISTING
    this.listLabels[ProcessStatus.Complete] = Messages.LISTED
    this.listLabels[ProcessStatus.Error] = Errors.LISTING_FAILED

    this.voteLabels = {}
    this.voteLabels[ProcessStatus.NotReady] = Messages.VOTE
    this.voteLabels[ProcessStatus.Ready] = Messages.VOTE
    this.voteLabels[ProcessStatus.Executing] = Messages.VOTING
    this.voteLabels[ProcessStatus.Complete] = Messages.VOTED
    this.voteLabels[ProcessStatus.Error] = Errors.VOTING_FAILED
  }

  @NoCache
  get isProcessingListing(): boolean {
    return this.listModule.listingProcessing
  }
}
</script>