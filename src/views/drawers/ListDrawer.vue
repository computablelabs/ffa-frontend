<template>
  <div class="list-drawer-container">
    <ListProcess v-if="isProcessing"/>
    <StartListingButton v-else/>
  </div>
</template>

<script lang="ts">
import { NoCache } from 'vue-class-decorator'
import { Component, Vue, Prop } from 'vue-property-decorator'
import { getModule } from 'vuex-module-decorators'

import UploadModule from '../../vuexModules/UploadModule'
import DrawerModule, { DrawerState } from '../../vuexModules/DrawerModule'

import StartListingButton from '@/components/listing/StartListingButton.vue'
import ListProcess from '@/components/listing/ListProcess.vue'
import BaseDrawer from './BaseDrawer.vue'

import { ProcessStatus, ProcessStatusLabelMap } from '../../models/ProcessStatus'

import FfaProcessModule from '../../interfaces/vuex/FfaProcessModule'

import { Messages, Errors } from '../../util/Constants'

import '@/assets/style/components/list-drawer.sass'

@Component({
  components: {
    ListProcess,
    StartListingButton,
  },
})
export default class ListDrawer extends BaseDrawer {
  public mounted(this: ListDrawer) {
    console.log('ListDrawer mounted')
  }

  @NoCache
  public get isProcessing(): boolean {
    const drawerModule = getModule(DrawerModule, this.$store)
    const foo = drawerModule.status === DrawerState.processing
    return foo
  }
}
</script>