<template>
  <div class="list-drawer-container">
    <NewListingProcess v-if="isProcessing"/>
  </div>
</template>

<script lang="ts">
import { NoCache } from 'vue-class-decorator'
import { Component, Vue, Prop } from 'vue-property-decorator'
import { getModule } from 'vuex-module-decorators'
import { MutationPayload } from 'vuex'

import NewListingModule from '../../vuexModules/NewListingModule'
import DrawerModule, { DrawerState } from '../../vuexModules/DrawerModule'

import StartProcessButton from '@/components/ui/StartProcessButton.vue'
import NewListingProcess from '@/components/listing/NewListingProcess.vue'
import BaseDrawer from './BaseDrawer.vue'

import { ProcessStatus, ProcessStatusLabelMap } from '../../models/ProcessStatus'

import FfaProcessModule from '../../interfaces/vuex/FfaProcessModule'

import { Messages, Errors } from '../../util/Constants'

import '@/assets/style/components/list-drawer.sass'

@Component({
  components: {
    NewListingProcess,
    StartProcessButton,
  },
})
export default class NewListingDrawer extends BaseDrawer {

  @NoCache
  public get isProcessing(): boolean {
    return getModule(DrawerModule, this.$store).status === DrawerState.processing
  }

  public created(this: NewListingDrawer) {
    this.$store.subscribe(this.vuexSubscriptions)
  }

  public mounted(this: NewListingDrawer) {
    getModule(DrawerModule, this.$store)
      .setDrawerOpenClass('create-candidate-3step')
    console.log('NewListingDrawer mounted')
  }

  protected async vuexSubscriptions(mutation: MutationPayload, state: any) {
    switch (mutation.type) {
      case 'drawerModule/setDrawerMode':
        if (mutation.payload === DrawerState.processing) {
          const newListingModule = getModule(NewListingModule, this.$store)
          newListingModule.setStatus(ProcessStatus.Ready)
        }
      default:
        return
    }
  }
}
</script>