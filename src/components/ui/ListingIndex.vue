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
  protected ffaListingsModule: FfaListingsModule = getModule(FfaListingsModule, this.$store)
  protected displayedListings!: FfaListing[]

  @Prop()
  public userAddress!: string

  @Prop()
  public displayCategory!: string

  private mounted() {
    // this.$store.subscribe(this.vuexSubscriptions)
    this.handleDisplay()
  }

  // private vuexSubscriptions(mutation: MutationPayload, state: any) {
  //   const candidateMutationsType = ['fetchCandidates',
  //                                   'setCandidates',
  //                                   'addCandidate',
  //                                   'promoteCandidate',
  //                                   'removeCandidate',
  //                                   'fetchCandidates' ]
  //   const listedMutationsType = ['promoteCandidate',
  //                                'setListed',
  //                                'addToListed',
  //                                'removeFromListed',
  //                                'fetchListed' ]
  //   const mutationType = mutation.type.split('/')[1]
  //   if (candidateMutationsType.includes(mutationType)) {
  //     this.updateCandidates()
  //   } else if (listedMutationsType.includes(mutationType)) {
  //     this.updateListed()
  //   }
  // }

  private handleDisplay() {
    // Check if userAddress is truthy
    const addressProvided = !!this.userAddress

    // Show User listings only
    if (addressProvided) {
      if (this.displayCategory === 'candidate') {
        this.displayUserCandidates()
      } else if (this.displayCategory === 'listed') {
        this.displayUserListed()
      } else {
        this.displayUserAllListings()
      }
    // Show all listings
    } else {
      if (this.displayCategory === 'candidate') {
        this.displayAllCandidates()
      } else if (this.displayCategory === 'listed') {
        this.displayAllListed()
      } else {
        this.displayAllListings()
      }
    }
  }
  
  private async fetchAllCandidates(): Promise<FfaListing[]> {
    return (await this.ffaListingsModule.fetchCandidates()).candidates
  }

  private async fetchAllListed(): Promise<FfaListing[]> {
    return (await this.ffaListingsModule.fetchListed()).listed
  }

  private async fetchAllListings(): Promise<FfaListing[]> {
    return (await this.fetchAllCandidates()).concat(await this.fetchAllListed())
  }

  private filterUserListing(inputListings: FfaListing[]): FfaListing[] {
    return inputListings.filter(listing => listing.owner === this.userAddress)
  }

  private async displayUserCandidates() {
    this.displayedListings = this.filterUserListing(await this.fetchAllCandidates())
  }

  private async displayUserListed() {
    this.displayedListings = this.filterUserListing(await this.fetchAllListed())
  }

  private async displayUserAllListings() {
    this.displayedListings = this.filterUserListing(await this.fetchAllListings())
  }

  private async displayAllCandidates() {
    this.displayedListings = await this.fetchAllCandidates()
  }

  private async displayAllListed() {
    this.displayedListings = await this.fetchAllListed()
  }

  private async displayAllListings() {
    this.displayedListings = await this.fetchAllListings()
  }


}
</script>