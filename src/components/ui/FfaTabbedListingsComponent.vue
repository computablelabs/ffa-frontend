<template>
  <div class="columns-container">
    <div class="tabs">
      <ul>
        <li 
          v-for="tab in tabs"
          :key="tab"
          :class="{'is-active': tab === selectedTab}"
          @click="selectedTab = tab" >
          <a> {{tab}} </a>
        </li>
      </ul>
    </div>
    <FfaListingsComponent
      :userAddress="userAddress"
      :status="provideStatus()"/>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import '@/assets/style/components/listing.sass'
import FfaListing, { FfaListingStatus } from '../../models/FfaListing'
import FfaListingsComponent from './FfaListingsComponent.vue'

const allTab = 'all'
const candidatesTab = 'candidates'
const listedTab = 'listed'

@Component({
  components: {
    FfaListingsComponent,
  },
})
export default class FfaTabbedListingsComponent extends Vue {
  public tabs: string[] = [allTab, candidatesTab, listedTab]
  public selectedTab: string = 'all'
  public userAddress?: string = ''

  private provideStatus(): string {
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
}
</script>
