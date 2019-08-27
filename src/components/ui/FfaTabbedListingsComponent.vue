<template>
  <div class="columns-container">
    <FfaListingsTabs 
      :tabs="tabs"
      @tab-click="(tab) => selectedTab = tab" />
    <FfaListingsComponent
      :userAddress="userAddress"
      :status="handleStatus()" />
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

const listingsRoute = 'listings'
const exploreRoute = 'explore'
const homeRoute = 'home'

@Component({
  components: {
    FfaListingsComponent,
    FfaListingsTabs,
  },
})
export default class FfaTabbedListingsComponent extends Vue {
  @Prop()
  public route!: string

  public tabs: string[] = [allTab, candidatesTab, listedTab]
  public userAddress?: string = this.parseAddress()
  public selectedTab?: string = this.tabs[0]

  public handleStatus(): string {
    switch (this.selectedTab) {
      case allTab:
        return ''
      case candidatesTab:
        return FfaListingStatus.candidate
      case listedTab:
        return FfaListingStatus.listed
      default:
        return ''
    }
  }

  public parseAddress(): string {
    switch (this.route) {
      case  listingsRoute:
        return ''
      case exploreRoute:
        return ''
      case homeRoute:
        return ethereum.selectedAddress
      default:
        return ''
    }
  }
}
</script>
