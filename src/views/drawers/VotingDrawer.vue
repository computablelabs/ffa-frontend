<template>
  <div class="voting-drawer-wrapper">
    <VotingProcess />
  </div>
</template>

<script lang="ts">
import { NoCache } from 'vue-class-decorator'
import { Component, Vue, Prop } from 'vue-property-decorator'
import { getModule } from 'vuex-module-decorators'

import UploadModule from '../../vuexModules/UploadModule'
import VotingModule from '../../vuexModules/VotingModule'
import DrawerModule, { DrawerState } from '../../vuexModules/DrawerModule'

import StartProcessButton from '@/components/ui/StartProcessButton.vue'
import NewListingProcess from '@/components/listing/NewListingProcess.vue'
import VotingProcess from '@/components/voting/VotingProcess.vue'
import BaseDrawer from './BaseDrawer.vue'

import { ProcessStatus, ProcessStatusLabelMap } from '../../models/ProcessStatus'

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
  public mounted(this: VotingDrawer) {
    getModule(DrawerModule, this.$store).setDrawerOpenClass('open200')
    this.$nextTick(() => {
      this.$root.$emit(OpenDrawer)
      getModule(DrawerModule, this.$store).setDrawerCanClose(true)
    })
    console.log('VotingDrawer mounted')
  }

  private onDrawerCloseClick() {
    this.$root.$emit(CloseDrawer)
  }
}
</script>