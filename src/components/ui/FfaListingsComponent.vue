<template>
  <div>
    <FfaListingsHeader />
    <FfaListingsItem 
      class="ffa-listing"
      v-for="listing in displayedListings" 
      :listing="listing" 
      :key="listing.title" />
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import FfaListingsItem from './FfaListingsItem.vue'
import FfaListingsHeader from './FfaListingsHeader.vue'
import { MutationPayload } from 'vuex'
import { getModule } from 'vuex-module-decorators'
import FfaListingsModule from '../../vuexModules/FfaListingsModule'
import FfaListing from '../../models/FfaListing'
import '@/assets/style/components/listing.sass'
import { FfaListingStatus } from '../../models/FfaListing'

const vuexModuleName = 'ffaListingsModule'
@Component({
  components: {
    FfaListingsItem,
    FfaListingsHeader,
  },
})
export default class FfaListingsComponent extends Vue {
  public ffaListingsModule: FfaListingsModule = getModule(FfaListingsModule, this.$store)
  public displayedListings: FfaListing[] = []

  @Prop()
  public userAddress?: string

  @Prop()
  public status?: FfaListingStatus

  private async created() {
    this.$store.subscribe(this.vuexSubscriptions)
    // await this.ffaListingsModule.fetchCandidates()
    // await this.ffaListingsModule.fetchListed()
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
    const addressProvided = !!this.userAddress
    const statusNotProvided = !!!this.status

    if (statusNotProvided) {
      addressProvided ? this.displayAllUserListings() : this.displayAllListings()
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

  private displayAllUserListings() {
    this.displayedListings = this.filterUserListing(this.ffaListingsModule.allListings)
  }

  private displayAllCandidates() {
    this.displayedListings = this.ffaListingsModule.candidates
  }

  private displayAllListed() {
    this.displayedListings = this.ffaListingsModule.listed
  }

  private displayAllListings() {
    this.displayedListings = this.ffaListingsModule.allListings
  }

  @Watch('status')
  private onStatusChanged(newStatus: string, oldStatus: string) {
    this.renderList()
  }
}
</script>