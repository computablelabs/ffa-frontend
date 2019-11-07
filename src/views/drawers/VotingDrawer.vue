<template>
  <div class="voting-drawer-wrapper">
    <VotingProcess
      :listingHash="listingHash"/>
  </div>
</template>

<script lang="ts">
import { NoCache } from 'vue-class-decorator'
import { Component, Vue, Prop } from 'vue-property-decorator'
import { getModule } from 'vuex-module-decorators'
import { MutationPayload } from 'vuex'

import UploadModule from '../../vuexModules/UploadModule'
import VotingModule from '../../vuexModules/VotingModule'
import DrawerModule, { DrawerState } from '../../vuexModules/DrawerModule'

import StartProcessButton from '@/components/ui/StartProcessButton.vue'
import NewListingProcess from '@/components/listing/NewListingProcess.vue'
import VotingProcess from '@/components/voting/VotingProcess.vue'
import BaseDrawer from './BaseDrawer.vue'

import { ProcessStatus, ProcessStatusLabelMap } from '../../models/ProcessStatus'
import { VotingActionStep } from '../../models/VotingActionStep'

import FfaProcessModule from '../../interfaces/vuex/FfaProcessModule'

import { Messages, Errors } from '../../util/Constants'

import { OpenDrawer, CloseDrawer } from '../../models/Events'

import '@/assets/style/components/list-drawer.sass'

@Component({
  components: {
    NewListingProcess,
    StartProcessButton,
    VotingProcess,
  },
})
export default class VotingDrawer extends BaseDrawer {

  public unsubscribe!: () => void

  @Prop()
  public listingHash!: string

  public created() {
    this.unsubscribe = this.$store.subscribe(this.vuexSubscriptions)
  }

  public mounted() {
    getModule(VotingModule, this.$store).resetVoting()
    getModule(DrawerModule, this.$store).setDrawerOpenClass('open200')
    this.$nextTick(() => {
      this.$root.$emit(OpenDrawer)
      getModule(DrawerModule, this.$store).setDrawerCanClose(true)
    })
    console.log('VotingDrawer mounted')
  }

  public beforeDestroy() {
    this.unsubscribe()
  }

  public async vuexSubscriptions(mutation: MutationPayload) {
    if (mutation.type === 'votingModule/setVotingStep') {
      switch (mutation.payload) {

        case VotingActionStep.ApprovalPending:
        case VotingActionStep.VotingActionPending:
          return this.drawerModule.setDrawerCanClose(false)

        default:
          return this.drawerModule.setDrawerCanClose(true)
      }
    }
  }

  private onDrawerCloseClick() {
    this.$root.$emit(CloseDrawer)
  }
}
</script>