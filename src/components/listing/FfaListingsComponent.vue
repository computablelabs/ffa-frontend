<template>
  <div class="ffa-listings-component">
    <table class="
      table
      is-narrow
      is-hoverable
      is-fullwidth
      ffa-listings-table">
      <tbody>
        <FfaListingsItem
          class="ffa-listing"
          v-for="listing in sortedDisplayedListings"
          :status="status"
          :listing="listing"
          :key="listing.hash" />
      </tbody>
      <tfoot>
      </tfoot>
    </table>
    <div class="load-more">
      <a v-if="hasMoreListings"
        class="load-more-link"
        @click="loadMore">
        Load more
      </a>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import { NoCache } from 'vue-class-decorator'

import FfaListingsItem from './FfaListingsItem.vue'
import FfaListingsHeader from './FfaListingsHeader.vue'

import { MutationPayload } from 'vuex'
import { getModule } from 'vuex-module-decorators'
import FfaListingsModule from '../../vuexModules/FfaListingsModule'
import AppModule from '../../vuexModules/AppModule'

import EthereumModule from '../../functionModules/ethereum/EthereumModule'
import FfaListingsComponentModule from '../../functionModules/components/FfaListingsComponentModule'

import FfaListing from '../../models/FfaListing'
import { FfaListingStatus } from '../../models/FfaListing'

import '@/assets/style/components/ffa-listings-component.sass'

const vuexModuleName = 'ffaListingsModule'

@Component({
  components: {
    FfaListingsItem,
    FfaListingsHeader,
  },
})
export default class FfaListingsComponent extends Vue {

  public ffaListingsModule = getModule(FfaListingsModule, this.$store)
  public appModule = getModule(AppModule, this.$store)
  public displayedListings: FfaListing[] = []
  public unsubscribe!: () => void
  public hasMoreListings = false

  @Prop()
  public walletAddress!: string

  @Prop()
  public status!: FfaListingStatus

  public get sortedDisplayedListings(): FfaListing[] {
    return this.displayedListings.sort(
      (a, b) => (a.title.toLowerCase() > b.title.toLowerCase()) ? 1 : -1)
  }

  @NoCache
  get allListings(): FfaListing[] {
    return this.ffaListingsModule.allListings
  }

  @NoCache
  get allCandidates(): FfaListing[] {
    return this.ffaListingsModule.candidates
  }

  @NoCache
  get allListed(): FfaListing[] {
    return this.ffaListingsModule.listed
  }

  @NoCache
  get allUserListings(): FfaListing[] {
    if (!!!this.walletAddress) {
      return this.allListings
    }

    return this.allListings.filter((listing) => (
      listing.owner.toLowerCase() === this.walletAddress.toLowerCase()
    ))
  }

  @NoCache
  get userCandidates(): FfaListing[] {
    if (!!!this.walletAddress) {
      return this.allCandidates
    }

    return this.allCandidates.filter((listing) => (
      listing.owner.toLowerCase() === this.walletAddress.toLowerCase()
    ))
  }

  @NoCache
  get userListed(): FfaListing[] {
    if (!!!this.walletAddress) {
      return this.allListed
    }

    return this.allListed.filter((listing) => (
      listing.owner.toLowerCase() === this.walletAddress.toLowerCase()
    ))
  }

  public async created() {
    this.unsubscribe = this.$store.subscribe(this.vuexSubscriptions)
  }

  public async mounted() {
    await FfaListingsComponentModule.fetchListingsForStatus(this.status, this.$store, true)
    await this.renderList()
  }

  public beforeDestroy() {
    this.unsubscribe()
  }

  public vuexSubscriptions(mutation: MutationPayload, state: any) {
    const payloadModule = mutation.type.split('/')[0]
    switch (mutation.type) {
      case 'ffaListingsModule/addListed':
      case 'ffaListingsModule/addCandidates':
        return this.renderList()
      default:
        return
    }
  }

  public renderList() {
    const addressProvided = !!this.walletAddress
    const statusNotProvided = !!!this.status

    if (statusNotProvided) {
      this.displayedListings = addressProvided ? this.allUserListings : this.allListings
    } else {
      switch (this.status) {
        case FfaListingStatus.candidate:
          this.displayedListings = addressProvided ? this.userCandidates : this.allCandidates
          this.hasMoreListings = this.ffaListingsModule.hasMoreCandidates
          return
        case FfaListingStatus.listed:
          this.hasMoreListings = this.ffaListingsModule.hasMoreListed
          this.displayedListings = addressProvided ? this.userListed : this.allListed
          return
        default:
      }
    }
  }

  public loadMore() {
     switch (this.status) {
        case FfaListingStatus.candidate:
          return  this.ffaListingsModule.fetchNextCandidates()
        case FfaListingStatus.listed:
          return this.ffaListingsModule.fetchNextListed()
        default:
          return
     }
  }

  @Watch('status')
  public async onStatusChanged(newStatus: string, oldStatus: string) {
    this.displayedListings = []
    await FfaListingsComponentModule.fetchListingsForStatus(this.status, this.$store, true)
    this.$forceUpdate()
  }
}
</script>
