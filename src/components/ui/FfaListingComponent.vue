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

  private async vuexSubscriptions(mutation: MutationPayload, state: any) {
    const mutationVuexModule = mutation.type.split('/')[0]
    if (mutationVuexModule !== vuexModuleName) {
      return
    }
    switch (mutation.type) {
      default:
        await this.renderList()
    }
  }

  private async renderList() {
    // Check if userAddress is truthy
    const addressProvided = !!this.userAddress
    const statusNotProvided = !!!this.status

    if (statusNotProvided) {
      addressProvided ? await this.displayUserAllListings() : await this.displayAllListings()
    } else {
      addressProvided ? await this.renderFilteredUserList() : await this.renderFilteredAllList()
    }
  }

  private async renderFilteredUserList() {
    switch (this.status) {
      case FfaListingStatus.candidate:
        await this.displayUserCandidates()
        return
      case FfaListingStatus.listed:
        await this.displayUserListed()
        return
      default:
    }
  }

  private async renderFilteredAllList() {
    switch (this.status) {
      case FfaListingStatus.candidate:
        await this.displayAllCandidates()
        return
      case FfaListingStatus.listed:
        await this.displayAllListed()
        return
      default:
    }
  }

  private async fetchAllCandidates() {
    await this.ffaListingsModule.fetchCandidates()
  }

  private async fetchAllListed() {
    await this.ffaListingsModule.fetchListed()
  }

  private async fetchAllListings() {
    await this.ffaListingsModule.fetchCandidates()
    await this.ffaListingsModule.fetchListed()
  }

  private filterUserListing(inputListings: FfaListing[]): FfaListing[] {
    return inputListings.filter((listing) => listing.owner === this.userAddress)
  }

  private async displayUserCandidates() {
    await this.fetchAllCandidates()
    this.displayedListings = this.filterUserListing(this.ffaListingsModule.candidates)
  }

  private async displayUserListed() {
    await this.fetchAllListed()
    this.displayedListings = this.filterUserListing(this.ffaListingsModule.listed)
  }

  private async displayUserAllListings() {
    await this.fetchAllListings()
    const allListings = (this.ffaListingsModule.candidates).concat(this.ffaListingsModule.listed)
    this.displayedListings = this.filterUserListing(allListings)
  }

  private async displayAllCandidates() {
    await this.fetchAllCandidates()
    this.displayedListings = this.ffaListingsModule.candidates
  }

  private async displayAllListed() {
    await this.fetchAllListed()
    this.displayedListings = this.ffaListingsModule.listed
  }

  private async displayAllListings() {
    await this.fetchAllListings()
    this.displayedListings = (this.ffaListingsModule.candidates).concat(this.ffaListingsModule.listed)
  }
}
</script>