<template>
  <section id='listings'>
    <h2>parsed status: {{ status }}</h2>
    <h2>wallet address: {{ walletAddress }}</h2>
    <RouterTabs
      :mapping="routerTabMapping"
      :selected="selectedTab"/>
    <FfaListingsComponent
      :walletAddress="walletAddress"
      :status="status" />
  </section>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'

import RouterTabs from '@/components/ui/RouterTabs.vue'
import FfaListingsComponent from '@/components/listing/FfaListingsComponent.vue'

import ListingsModule from '../functionModules/views/ListingsModule'

import { FfaListingStatus } from '../models/FfaListing'
import RouterTabMapping from '../models/RouterTabMapping'

import { Labels } from '../util/Constants'

import '@/assets/style/components/listing.sass'

@Component({
  components: {
    RouterTabs,
    FfaListingsComponent,
  },
})
export default class Listings extends Vue {

  public routerTabMapping: RouterTabMapping[] = []
  public selectedTab?: string = ''

  @Prop()
  public status!: FfaListingStatus

  @Prop()
  public walletAddress!: string

  private created(this: Listings) {
    this.routerTabMapping = ListingsModule.routerTabMapping(this.walletAddress)
    if (this.routerTabMapping.length === 0) { return }
    this.selectedTab = ListingsModule.selectedTab(this.routerTabMapping, this.status)
  }

  @Watch('status')
  private onStatusChanged(newStatus: FfaListingStatus, oldStatus: FfaListingStatus) {
    this.selectedTab = ListingsModule.selectedTab(this.routerTabMapping, newStatus)
  }
}
</script>
