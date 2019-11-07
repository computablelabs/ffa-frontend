<template>
  <section id='listings'>
    <h2>parsed status: {{ status }}</h2>
    <h2>wallet address: {{ walletAddress }}</h2>
    <RouterTabs
      :mapping="routerTabMapping"
      :selected="selectedTab"/>
    <FfaListingsComponent
      :candidates="candidates"
      :listed="listed"
      :walletAddress="walletAddress"
      :status="status" />
  </section>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import { getModule } from 'vuex-module-decorators'
import axios from 'axios'

import RouterTabs from '@/components/ui/RouterTabs.vue'
import FfaListingsComponent from '@/components/listing/FfaListingsComponent.vue'

import ListingsModule from '../functionModules/views/ListingsModule'

import FfaListing, { FfaListingStatus } from '../models/FfaListing'
import RouterTabMapping from '../models/RouterTabMapping'
import { CloseDrawer } from '../models/Events'

import { Labels } from '../util/Constants'

import '@/assets/style/components/listing.sass'
import DatatrustModule from '../functionModules/datatrust/DatatrustModule'
import FfaListingsModule from '../vuexModules/FfaListingsModule'

@Component({
  components: {
    RouterTabs,
    FfaListingsComponent,
  },
})
export default class Listings extends Vue {

  public routerTabMapping: RouterTabMapping[] = []
  public selectedTab?: string = ''
  public candidates: FfaListing[] = []
  public listed: FfaListing[] = []
  public ffaListingsModule: FfaListingsModule = getModule(FfaListingsModule, this.$store)

  @Prop()
  public status!: FfaListingStatus

  @Prop()
  public walletAddress!: string

  private async created() {
    this.routerTabMapping = ListingsModule.routerTabMapping(this.walletAddress)
    if (this.routerTabMapping.length === 0) { return }
    this.selectedTab = ListingsModule.selectedTab(this.routerTabMapping, this.status)

    const [fetchCandidateError, candidates, lastCandidateBlock] = await DatatrustModule.getCandidates()
    const [fetchListedError, listed, lastListedBlock] = await DatatrustModule.getListed()
    if (!!!fetchCandidateError || !!!fetchListedError) {
      this.ffaListingsModule.setCandidates(candidates!)
      this.ffaListingsModule.setListed(listed!)
    }
  }

  // private mounted() {
  //   this.$root.$emit(CloseDrawer)
  // }

  @Watch('status')
  private onStatusChanged(newStatus: FfaListingStatus, oldStatus: FfaListingStatus) {
    this.selectedTab = ListingsModule.selectedTab(this.routerTabMapping, newStatus)
  }
}
</script>
