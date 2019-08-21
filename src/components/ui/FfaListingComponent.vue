<template>
  <div class="columns-container">
    <FfaListingHeader />
    <FfaListingItem 
      class="ffa-listing"
      v-for="listing in displayedListings" 
      :listing="listing" 
      :key="listing.title" />
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import FfaListingItem from './FfaListingItem.vue'
import FfaListingHeader from './FfaListingHeader.vue'
import { MutationPayload } from 'vuex'
import { getModule } from 'vuex-module-decorators'
import FfaListingsModule from '../../vuexModules/FfaListingsModule'
import FfaListing from '../../models/FfaListing'
import '@/assets/style/components/listing.sass'
import { FfaListingStatus } from '../../models/FfaListing'

// TODO
const vuexModuleName = 'uploadModule'
@Component({
  components: {
    FfaListingItem,
    FfaListingHeader,
  },
})
export default class FfaListingComponent extends Vue {
  public ffaListingsModule: FfaListingsModule = getModule(FfaListingsModule, this.$store)
  public displayedListings: FfaListing[] = []

  @Prop()
  public userAddress?: string

  @Prop()
  public status?: FfaListingStatus

  private async mounted() {
    this.$store.subscribe(this.vuexSubscriptions)
    this.renderList()
  }

  private vuexSubscriptions(mutation: MutationPayload, state: any) {
    const payloadModule = mutation.type.split('/')[0]
    if (payloadModule !== vuexModuleName) {
      return
    }
    switch (mutation.type) {
      default:
        this.renderList()
    }
  }

  private renderList() {
    // Check if userAddress is truthy
    const addressProvided = !!this.userAddress
    const statusNotProvided = !!!this.status

    if (statusNotProvided) {
      addressProvided ? this.displayUserAllListings() : this.displayAllListings()
    } else {
      addressProvided ? this.renderFilteredUserList() : this.renderFilteredAllList()
    }
  }

  private renderFilteredUserList() {
    switch (this.status) {
      case FfaListingStatus.candidate:
        this.displayUserCandidates()
        return
      case FfaListingStatus.listed:
        this.displayUserListed()
        return
      default:
    }
  }

  private renderFilteredAllList() {
    switch (this.status) {
      case FfaListingStatus.candidate:
        this.displayAllCandidates()
        return
      case FfaListingStatus.listed:
        this.displayAllListed()
        return
      default:
    }
  }

  private filterUserListing(inputListings: FfaListing[]): FfaListing[] {
    return inputListings.filter((listing) => listing.owner === this.userAddress)
  }

  private displayUserCandidates() {
    this.displayedListings = this.filterUserListing(this.ffaListingsModule.candidates)
  }

  private displayUserListed() {
    this.displayedListings = this.filterUserListing(this.ffaListingsModule.listed)
  }

  private displayUserAllListings() {
    this.displayedListings = this.filterUserListing(this.ffaListingsModule.allListings)
  }

  private displayAllCandidates() {
    this.displayedListings = this.ffaListingsModule.candidates
  }

  private displayAllListed() {
    this.displayedListings = this.ffaListingsModule.listed
  }

  private async displayAllListings() {
    this.displayedListings = this.ffaListingsModule.allListings
  }
}
</script>