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

  private async created(this: Listings) {
    this.routerTabMapping = ListingsModule.routerTabMapping(this.walletAddress)
    if (this.routerTabMapping.length === 0) { return }
    this.selectedTab = ListingsModule.selectedTab(this.routerTabMapping, this.status)

    const endpoint = DatatrustModule.generateDatatrustEndPoint(false, 'application')
    let candidates = (await axios.get(`${endpoint}`)).data.items
    candidates = candidates.map((res: any) => {
      return new FfaListing(
        res.title,
        res.description,
        res.type,
        res.listing_hash,
        'md5',
        res.license,
        100,
        '0xowner',
        res.tags,
        FfaListingStatus.candidate,
        42,
        23)
      })
    this.ffaListingsModule.setCandidates(candidates)
  }

  @Watch('status')
  private onStatusChanged(newStatus: FfaListingStatus, oldStatus: FfaListingStatus) {
    this.selectedTab = ListingsModule.selectedTab(this.routerTabMapping, newStatus)
  }
}
</script>
