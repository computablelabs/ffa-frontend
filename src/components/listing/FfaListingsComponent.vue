<template>
  <div id='ffa-listings'>
    <FfaListingsHeader />
    <FfaListingsItem
      class="ffa-listing"
      v-for="listing in displayedListings"
      :status="status"
      :listing="listing"
      :key="listing.hash" />
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

import FfaListing from '../../models/FfaListing'
import { FfaListingStatus } from '../../models/FfaListing'

import '@/assets/style/components/listing.sass'

const vuexModuleName = 'ffaListingsModule'
@Component({
  components: {
    FfaListingsItem,
    FfaListingsHeader,
  },
})
export default class FfaListingsComponent extends Vue {

  public ffaListingsModule = getModule(FfaListingsModule, this.$store)
  public displayedListings: FfaListing[] = []
  public unsubscribe!: () => void

  @Prop()
  public walletAddress!: string

  @Prop()
  public status!: FfaListingStatus

  @Prop()
  public candidates!: FfaListing[]

  @Prop()
  public listed!: FfaListing[]

  public created() {
    this.unsubscribe = this.$store.subscribe(this.vuexSubscriptions)
  }

  public mounted() {
    this.renderList()
    console.log('FfaListingsComponent mounted')
  }

  public beforeDestroy() {
    this.displayedListings = []
    this.unsubscribe()
    console.log('FfaListingsComponent beforeDestroy')
  }

  private vuexSubscriptions(mutation: MutationPayload, state: any) {
    const payloadModule = mutation.type.split('/')[0]
    if (payloadModule !== vuexModuleName) {
      return
    }
    this.renderList()
  }

  private renderList() {
    const addressProvided = !!this.walletAddress
    const statusNotProvided = !!!this.status

    if (statusNotProvided) {
      this.displayedListings = addressProvided ? this.allUserListings : this.allListings
    } else {

      switch (this.status) {
        case FfaListingStatus.candidate:
          this.displayedListings = addressProvided ? this.userCandidates : this.allCandidates
          return
        case FfaListingStatus.listed:
          this.displayedListings = addressProvided ? this.userListed : this.allListed
          return
        default:
      }
    }
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
    return this.allListings.filter((listing) => listing.owner === this.walletAddress)
  }

  @NoCache
  get userCandidates(): FfaListing[] {
    return this.allCandidates.filter((listing) => listing.owner === this.walletAddress)
  }

  @NoCache
  get userListed(): FfaListing[] {
    return this.allListed.filter((listing) => listing.owner === this.walletAddress)
  }

  @Watch('status')
  private onStatusChanged(newStatus: string, oldStatus: string) {
    this.renderList()
  }

  @Watch('candidates')
  private onCandidatesChanged(newCandidates: object[], oldCandidates: object[]) {
    this.renderList()
 }

  @Watch('listed')
  private onListedChange(newListed: object[], oldListed: object[]) {
    this.renderList()
  }
}
</script>