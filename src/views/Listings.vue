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
    <h2 v-show="!dataInitialized">Searching</h2>
    <Observer @intersected="intersected"/>
  </section>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import { getModule } from 'vuex-module-decorators'
import axios from 'axios'

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
import Observer from '@/components/ui/Observer.vue'

import '@/assets/style/views/listings.sass'
import FfaLIstingsComponentModule from '../functionModules/components/FfaListingsComponentModule'

@Component({
  components: {
    RouterTabs,
    FfaListingsComponent,
    Observer,
  },
})
export default class Listings extends Vue {

  public routerTabMapping: RouterTabMapping[] = []
  public selectedTab?: string = ''
  public candidates: FfaListing[] = []
  public listed: FfaListing[] = []
  public dataInitialized = false
  public ffaListingsModule = getModule(FfaListingsModule, this.$store)
  public appModule = getModule(AppModule, this.$store)

  public page = 0
  public stopDataInitialization = false

  @Prop()
  public status!: FfaListingStatus

  @Prop()
  public walletAddress!: string

  @Prop()
  public componentKey!: string

  private async created() {
    this.routerTabMapping = ListingsModule.routerTabMapping(this.walletAddress)
    if (this.routerTabMapping.length === 0) { return }
    this.selectedTab = ListingsModule.selectedTab(this.routerTabMapping, this.status)
  }

  private async mounted() {
    // this.appModule.setLastBlock(await EthereumModule.getLastBlock(this.appModule.web3))

    // const [candidates, listed] = await Promise.all([
    //   DatatrustModule.getCandidates(appModule.lastBlock),
    //   DatatrustModule.getListed(appModule.lastBlock),
    // ])

    // this.ffaListingsModule.setCandidates(candidates)
    // this.ffaListingsModule.setListed(listed)

    await this.initializeData()
    this.$root.$emit(CloseDrawer)
  }

  private async intersected() {
    // if (!this.dataInitialized) { return }
    // if (this.status === FfaListingStatus.candidate) {
    //   await FfaLIstingsComponentModule.fetchListingsForStatus(FfaListingStatus.candidate, this.$store, false)
    //   console.log('fetched')
    // } else {
    //   await FfaLIstingsComponentModule.fetchListingsForStatus(FfaListingStatus.listed, this.$store, false)
    // }
  }

  private async initializeData() {
    const root = document.compatMode === 'BackCompat' ? document.body : document.documentElement
    let isVerticalScrollbar = root.scrollHeight > root.clientHeight
    await FfaLIstingsComponentModule.fetchListingsForStatus(this.status, this.$store, true)


    let fromBlock = this.status === FfaListingStatus.candidate ? 
                      this.ffaListingsModule.candidatesFromBlock : this.ffaListingsModule.listedFromBlock

    const genesisBlock = Number(process.env.VUE_APP_GENESIS_BLOCK!)

    this.stopDataInitialization = false
    this.dataInitialized = false

    // if scrollbar present on initialize, wait until no longer present
    while (isVerticalScrollbar) {
      isVerticalScrollbar = root.scrollHeight > root.clientHeight
    }

    while (!isVerticalScrollbar && fromBlock > genesisBlock && !this.stopDataInitialization) {
      if (this.status === FfaListingStatus.candidate) {
        try {
          await this.ffaListingsModule.fetchNextCandidates()
          fromBlock = this.ffaListingsModule.candidatesFromBlock
        } catch {
          return
        }
      } else {
        try {
          await this.ffaListingsModule.fetchNextListed()
          fromBlock = this.ffaListingsModule.listedFromBlock
        } catch {
          return
        }
      }

      isVerticalScrollbar = root.scrollHeight > root.clientHeight
    }

    this.dataInitialized = true
  }

  @Watch('status')
  private async onStatusChanged(newStatus: FfaListingStatus, oldStatus: FfaListingStatus) {
    await this.delay(500)
    this.selectedTab = ListingsModule.selectedTab(this.routerTabMapping, newStatus)
    this.stopDataInitialization = true
    this.ffaListingsModule.clearAll()
    await this.initializeData()
  }

  private async delay(ms: number): Promise<any> {
    return new Promise( (resolve) => setTimeout(resolve, ms) )
  }
}
</script>
