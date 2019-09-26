<template>
  <div id="list-drawer"
    class="tile is-vertical is-ancestor">
    <status
      :vuexModule="newListingModule"
      :statusLabels="listLabels"/>
    <status
      :vuexModule="uploadModule"
      :statusLabels="uploadLabels"/>
    <drawer-message>
      <div slot="iconSlot">
        <font-awesome-icon
          class="file-bg"
          :icon="['far', 'file']"
          />
      </div>
      <span slot="messageSlot" class="label-text">
        Vote by community
      </span>
      <div slot="subMessageSlot">
        <a 
          class="sub-message-anchor"
          @click="onVotingDetailsClick"
          >Voting Details
        </a>
      </div>
    </drawer-message>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { NoCache } from 'vue-class-decorator'
import { getModule } from 'vuex-module-decorators'

import UploadModule from '../../vuexModules/UploadModule'
import NewListingModule from '../../vuexModules/NewListingModule'

import Status from '@/components/ui/Status.vue'
import DrawerMessage from '@/components/ui/DrawerMessage.vue'

import { ProcessStatus, ProcessStatusLabelMap } from '../../models/ProcessStatus'

import FfaProcessModule from '../../interfaces/vuex/FfaProcessModule'

import { Messages, Errors } from '../../util/Constants'
import { CloseDrawer } from '../../models/Events'

@Component({
  components: {
    Status,
    DrawerMessage,
  },
})
export default class NewListingProcess extends Vue {

  private uploadLabels!: ProcessStatusLabelMap
  private listLabels!: ProcessStatusLabelMap
  private voteLabels!: ProcessStatusLabelMap

  private uploadModule = getModule(UploadModule, this.$store)
  private newListingModule = getModule(NewListingModule, this.$store)

  public mounted(this: NewListingProcess) {
    console.log('NewListingProcess mounted')
  }

  private beforeCreate(this: NewListingProcess) {
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

  private onVotingDetailsClick() {
    const listingHash = this.uploadModule.hash
    this.$root.$emit(CloseDrawer)
    this.$router.push(`/listings/candidates/${listingHash}`)
  }
}
</script>
