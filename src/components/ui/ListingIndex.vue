<template>
  <table class="table is-striped">
    <ListingIndexHeader /> 
    <tbody>
      <ListingIndexItem 
        v-for="listing in displayedListings" 
        :listing="listing" 
        :key="listing.title"/>
    </tbody>
  </table>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import ListingIndexItem from './ListingIndexItem.vue'
import ListingIndexHeader from './ListingIndexHeader.vue'
import { MutationPayload } from 'vuex'
import { getModule } from 'vuex-module-decorators'
import FfaListingsModule from '../../vuexModules/FfaListingsModule'
import FfaListing from '../../models/FfaListing'

@Component({
  components: {
    ListingIndexItem,
    ListingIndexHeader,
  },
})
export default class ListingIndex extends Vue {
  public ffaListingsModule: FfaListingsModule = getModule(FfaListingsModule, this.$store)
  public displayedListings: FfaListing[] = []

  @Prop()
  public userAddress!: string

  @Prop()
  public displayCategory!: string

  private mounted() {
    this.$store.subscribe(this.vuexSubscriptions)
    this.handleDisplay()
  }

  private vuexSubscriptions(mutation: MutationPayload, state: any) {
    switch (mutation.type) {
      default:
      this.handleDisplay()
    }
  }

  private async handleDisplay() {
    // Check if userAddress is truthy
    const addressProvided = !!this.userAddress

    // Show User listings only
    if (addressProvided) {
      if (this.displayCategory === 'candidate') {
        await this.displayUserCandidates()
      } else if (this.displayCategory === 'listed') {
        await this.displayUserListed()
      } else {
        await this.displayUserAllListings()
      }
    // Show all listings
    } else {
      if (this.displayCategory === 'candidate') {
        await this.displayAllCandidates()
      } else if (this.displayCategory === 'listed') {
        await this.displayAllListed()
      } else {
        await this.displayAllListings()
      }
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
