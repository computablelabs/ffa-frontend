<<<<<<< HEAD
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

@Component({
  components: {
    FfaListingsComponent,
    FfaListingsTabs,
  },
})
export default class FfaTabbedListingsComponent extends Vue {
  public tabs: string[] = [allTab, candidatesTab, listedTab]
  public userAddress?: string = ''
  public selectedTab?: string = this.tabs[0]

  public handleStatus() {
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
||||||| merged common ancestors
=======
<template>
  <div class="columns-container">
    <div class="column is-3 tabs-container">
      <button 
        v-for="tab in tabs" 
        class="tab-button"
        :key="tab"
        :class="{active: tab === selectedTab}"
        @click="selectedTab = tab" >
        {{tab}}
      </button>
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

  @Prop()
  public userAddress?: string

  @Prop()
  public status?: FfaListingStatus

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
>>>>>>> 470d10ed7691237db154c491d4f33650e7854759
