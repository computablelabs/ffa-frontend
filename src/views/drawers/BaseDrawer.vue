<template>
  <div></div>
</template>

<script lang="ts">
import { NoCache } from 'vue-class-decorator'
import { Component, Vue, Prop } from 'vue-property-decorator'
import { getModule } from 'vuex-module-decorators'
import UploadModule from '../../vuexModules/UploadModule'
import DrawerModule, { DrawerState } from '../../vuexModules/DrawerModule'
import StartListingButton from '../../components/listing/StartListingButton.vue'
import ListProcess from '../../components/listing/ListProcess.vue'
import { ProcessStatus, ProcessStatusLabelMap } from '../../models/ProcessStatus'
import FfaProcessModule from '../../interfaces/vuex/FfaProcessModule'
import { Messages, Errors } from '../../util/Constants'

import '@/assets/style/components/list-drawer.sass'

@Component
export default class BaseDrawer extends Vue {

  private drawerModule!: DrawerModule

  public created() {
    this.drawerModule = getModule(DrawerModule, this.$store)
  }

  @NoCache
  public get isBeforeProcessing(): boolean {
    return this.drawerModule.drawerState === DrawerState.beforeProcessing
  }

  @NoCache
  public get isProcessing(): boolean {
    return this.drawerModule.drawerState === DrawerState.processing
  }

  @NoCache
  public get isAfterProcessing(): boolean {
    return this.drawerModule.drawerState === DrawerState.afterProcessing
  }

}
</script>