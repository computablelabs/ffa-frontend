<template>
  <div class="columns-container">
    <FfaListingsTabs 
      :tabs="tabs"
      @tab-click="(tab) => selectedTab = tab" />
    <FfaListingsComponent
      :userAddress="userAddress"
      :status="selectedTab"/>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import FfaListing, { FfaListingStatus } from '../../models/FfaListing'
import FfaListingsComponent from './FfaListingsComponent.vue'
import FfaListingsTabs from './FfaListingsTabs.vue'

const allTab = 'all'
const candidatesTab = 'candidates'
const listedTab = 'listed'

@Component({
  components: {
    FfaListingsComponent,
    FfaListingsTabs,
  },
})
export default class FfaTabbedListingsComponent extends Vue {
  public tabs: string[] = [allTab, candidatesTab, listedTab]
  public userAddress?: string = '0xWall3t'
  public selectedTab?: string = this.tabs[0]
}
</script>
