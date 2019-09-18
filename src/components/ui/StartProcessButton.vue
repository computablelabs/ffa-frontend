<template>
  <div class="button-container">
    <button class="button" @click.prevent="start">Start Listing</button>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import DrawerModule, { DrawerState } from '../../vuexModules/DrawerModule'
import NewListingModule from '../../vuexModules/NewListingModule'
import { getModule } from 'vuex-module-decorators'
import { ProcessStatus } from '../../models/ProcessStatus'

import '@/assets/style/components/start-listing-button.sass'

@Component
export default class StartProcessButton extends Vue {
  public start() {
    const drawerModule = getModule(DrawerModule, this.$store)
    drawerModule.setDrawerState(DrawerState.processing)
  }
}
</script>
