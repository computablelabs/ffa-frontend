<template>
  <div class="list-drawer tile is-vertical is-ancestor">
    <status
      :vuexModule="uploadModule"
      :statusLabels="uploadLabels"/>
    <status
      :vuexModule="listModule"
      :statusLabels="listLabels"/>
    <status
      :vuexModule="voteModule"
      :statusLabels="voteLabels"/>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { getModule } from 'vuex-module-decorators'
import UploadModule from '../modules/UploadModule'
import ListModule from '../modules/ListModule'
import VoteModule from '../modules/VoteModule'
import Status from '@/components/ui/Status.vue'
import { ProcessStatus, ProcessStatusLabelMap } from '../models/ProcessStatus'
import FfaProcessModule from '../modules/FfaProcessModule'

@Component({
  components: {
    Status,
  },
})
export default class ListDrawer extends Vue {

  private initialUploadState = [ProcessStatus.NotReady, 'Uploading']
  private uploadLabels!: ProcessStatusLabelMap
  private listLabels!: ProcessStatusLabelMap
  private voteLabels!: ProcessStatusLabelMap

  private uploadModule = getModule(UploadModule, this.$store)
  private listModule = getModule(ListModule, this.$store)
  private voteModule = getModule(VoteModule, this.$store)

  private beforeCreate(this: ListDrawer) {
    this.uploadLabels = {}
    this.uploadLabels[ProcessStatus.NotReady] = 'Upload'
    this.uploadLabels[ProcessStatus.Ready] = 'Upload'
    this.uploadLabels[ProcessStatus.Executing] = 'Uploading...'
    this.uploadLabels[ProcessStatus.Complete] = 'Upload complete.'
    this.uploadLabels[ProcessStatus.Error] = 'Upload failure'

    this.listLabels = {}
    this.listLabels[ProcessStatus.NotReady] = 'List'
    this.listLabels[ProcessStatus.Ready] = 'List'
    this.listLabels[ProcessStatus.Executing] = 'Listing on blockchain...'
    this.listLabels[ProcessStatus.Complete] = 'Listed'
    this.listLabels[ProcessStatus.Error] = 'Listing failure'

    this.voteLabels = {}
    this.voteLabels[ProcessStatus.NotReady] = 'Vote'
    this.voteLabels[ProcessStatus.Ready] = 'Vote'
    this.voteLabels[ProcessStatus.Executing] = 'Voting open'
    this.voteLabels[ProcessStatus.Complete] = 'Voting closed'
    this.voteLabels[ProcessStatus.Error] = 'Voting failure'
  }
}
</script>