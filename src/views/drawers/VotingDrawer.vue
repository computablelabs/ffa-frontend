<template>
  <div class="voting-drawer-wrapper">
    <VotingInterface />
    <font-awesome-icon 
      @click="onDrawerCloseClick"
      size="2x"
      class="drawer-exit-icon"
      :icon="['fa', 'times-circle']" />
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
import VotingInterface from '@/components/voting/VotingInterface.vue'
import BaseDrawer from './BaseDrawer.vue'

import { ProcessStatus, ProcessStatusLabelMap } from '../../models/ProcessStatus'

import FfaProcessModule from '../../interfaces/vuex/FfaProcessModule'

import { Messages, Errors } from '../../util/Constants'

import { CloseDrawer } from '../../models/Events'

import '@/assets/style/components/list-drawer.sass'

@Component({
  components: {
    NewListingProcess,
    StartProcessButton,
    VotingInterface,
  },
})
export default class VotingDrawer extends BaseDrawer {
  public mounted(this: VotingDrawer) {
    console.log('VotingDrawer mounted')
  }

  private onDrawerCloseClick() {
    this.$root.$emit(CloseDrawer)
  }
}
</script>