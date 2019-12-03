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
    // this.appModule.setLastBlock(await EthereumModule.getLastBlock(this.appModule.web3))

    // const [candidates, listed] = await Promise.all([
    //   DatatrustModule.getCandidates(appModule.lastBlock),
    //   DatatrustModule.getListed(appModule.lastBlock),
    // ])

    // this.ffaListingsModule.setCandidates(candidates)
    // this.ffaListingsModule.setListed(listed)

    // await this.initializeData()
    this.$root.$emit(CloseDrawer)
  }

  private async intersected() {
    // if (!this.dataInitialized) { return }
    // const res = await axios.get(`https://jsonplaceholder.typicode.com/posts/?_page=${this.page++}`)
    const res = await axios.get(`https://jsonplaceholder.typicode.com/posts/`)

    // @ts-ignore
    const fetched = res.data.map((item) => new FfaListing(
        item.title,
        item.body,
        'text',
        `hash${this.page}${item.id}`,
        'md5',
        'MIT',
        1,
        'owner',
        ['tag'],
        FfaListingStatus.candidate,
        5,
        0,
      ),
    )

    if (this.status === FfaListingStatus.candidate) {
      this.candidates = [...this.candidates, ...fetched]
      this.ffaListingsModule.setCandidates(this.candidates)
    } else {
      this.listed = [...this.listed, ...fetched]
      this.ffaListingsModule.setListed(this.listed)
    }
  }

  private async initializeData() {
    const root = document.compatMode === 'BackCompat' ? document.body : document.documentElement
    let isVerticalScrollbar = root.scrollHeight > root.clientHeight

    while (!isVerticalScrollbar) {
      // const res = await axios.get(`https://jsonplaceholder.typicode.com/posts/?_page=${this.page++}`)
      const res = await axios.get(`https://jsonplaceholder.typicode.com/posts/`)

      // @ts-ignore
      const fetched = res.data.map((item) => new FfaListing(
          item.title,
          item.body,
          'text',
          `hash${this.page++}${item.id}`,
          'md5',
          'MIT',
          1,
          'owner',
          ['tag'],
          FfaListingStatus.candidate,
          5,
          0,
        ),
      )

      if (this.status === FfaListingStatus.candidate) {
        this.candidates = [...this.candidates, ...fetched]
        this.ffaListingsModule.setCandidates(this.candidates)
      } else {
        this.listed = [...this.listed, ...fetched]
        this.ffaListingsModule.setListed(this.listed)
      }

      isVerticalScrollbar = root.scrollHeight > root.clientHeight
    }

    this.dataInitialized = true
  }

  @Watch('status')
  private onStatusChanged(newStatus: FfaListingStatus, oldStatus: FfaListingStatus) {
    this.selectedTab = ListingsModule.selectedTab(this.routerTabMapping, newStatus)
  }
}
</script>
