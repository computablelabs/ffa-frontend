<template>
  <div class="button-container">
    <button class="button" @click.prevent="startListing">Start Listing</button>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import DrawerModule, { DrawerState } from '../../vuexModules/DrawerModule'
import NewListingModule from '../../vuexModules/NewListingModule'
import { getModule } from 'vuex-module-decorators'
import { ProcessStatus } from '../../models/ProcessStatus'

import '@/assets/style/components/start-listing-button.sass'

// TODO: consider generalizing?

@Component
export default class StartListingButton extends Vue {
  public startListing() {
    const drawerModule = getModule(DrawerModule, this.$store)
    drawerModule.setDrawerState(DrawerState.processing)
    const newListingModule = getModule(NewListingModule, this.$store)
    newListingModule.setStatus(ProcessStatus.Ready)
  }
}
</script>