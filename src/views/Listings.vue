<template>
  <section id='ffa-listings-view'>
    <RouterTabs
      class="listings-view-router-tabs"
      :mapping="routerTabMapping"
      :selected="selectedTab"/>
    <FfaListingsComponent
      class="ffa-listings-container"
      :walletAddress="walletAddress"
      :status="status" />
  </section>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import { getModule } from 'vuex-module-decorators'

import AppModule from '../vuexModules/AppModule'

import ListingsModule from '../functionModules/views/ListingsModule'
import EthereumModule from '../functionModules/ethereum/EthereumModule'

import FfaListing, { FfaListingStatus } from '../models/FfaListing'
import RouterTabMapping from '../models/RouterTabMapping'
import { CloseDrawer } from '../models/Events'

import { Labels } from '../util/Constants'

import DatatrustModule from '../functionModules/datatrust/DatatrustModule'
import FfaListingsModule from '../vuexModules/FfaListingsModule'

import RouterTabs from '@/components/ui/RouterTabs.vue'
import FfaListingsComponent from '@/components/listing/FfaListingsComponent.vue'

import '@/assets/style/views/listings.sass'

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
  public appModule = getModule(AppModule, this.$store)

  @Prop()
  public status!: FfaListingStatus

  @Prop()
  public walletAddress!: string

  private async created() {
    this.routerTabMapping = ListingsModule.routerTabMapping(this.walletAddress)
    if (this.routerTabMapping.length === 0) { return }
    this.selectedTab = ListingsModule.selectedTab(this.routerTabMapping, this.status)
  }

  private async mounted() {
    this.$root.$emit(CloseDrawer)
  }

  @Watch('status')
  private onStatusChanged(newStatus: FfaListingStatus, oldStatus: FfaListingStatus) {
    this.selectedTab = ListingsModule.selectedTab(this.routerTabMapping, newStatus)
  }
}
</script>
