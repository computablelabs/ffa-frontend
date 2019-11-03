<template>
  <section id='ffa-listed'>
    <RouterTabs
      :mapping="routerTabMapping"
      :selected="selectedTab"/>
    <div
      v-if="isReady"
      class="container" >
        <!-- listing tab selected -->
        <StaticFileMetadata
          v-show="selectedTab === listing"
          :ffaListing="ffaListing"/>

        <button
          v-if="enablePurchaseButton"
          v-show="selectedTab === listing"
          @click="onPurchaseButtonClicked"
          data-purchase="true">
          Purchase
        </button>

        <!-- details tab selected -->
        <button
          v-show="showChallenge"
          @click="onChallengeButtonClicked"
          data-challenge="true">
          Challenge listing
        </button>

        <VerticalSubway
          v-show="selectedTab === details"
          :listingHash="listingHash"
          :listingStatus="status"
          :listing="ffaListing"
          :isUnderChallenge="isUnderChallenge"
          :plurality="plurality"
          :voteBy="voteBy"
          :isVotingClosed="isVotingClosed"
          :onVoteButtonClicked="onVoteButtonClicked"
          :onResolveButtonClicked="onResolveButtonClicked"/>

      </div>
    </div>
    <EthereumLoader v-else />
  </section>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import { NoCache } from 'vue-class-decorator'
import { MutationPayload } from 'vuex'

import { getModule } from 'vuex-module-decorators'
import FlashesModule from '../vuexModules/FlashesModule'
import NewListingModule from '../vuexModules/NewListingModule'
import UploadModule from '../vuexModules/UploadModule'
import FfaListingsModule from '../vuexModules/FfaListingsModule'
import AppModule from '../vuexModules/AppModule'
import VotingModule from '../vuexModules/VotingModule'
import PurchaseModule from '../vuexModules/PurchaseModule'
import ChallengeModule from '../vuexModules/ChallengeModule'

import SharedModule from '../functionModules/components/SharedModule'
import FfaListingViewModule from '../functionModules/views/FfaListingViewModule'
import VotingProcessModule from '../functionModules/components/VotingProcessModule'
import PurchaseProcessModule from '../functionModules/components/PurchaseProcessModule'
import DatatrustModule from '../functionModules/datatrust/DatatrustModule'
import EthereumModule from '../functionModules/ethereum/EthereumModule'
import VotingContractModule from '../functionModules/protocol/VotingContractModule'

import FfaListing, { FfaListingStatus } from '../models/FfaListing'
import { ProcessStatus } from '../models/ProcessStatus'
import ContractAddresses from '../models/ContractAddresses'
import { OpenDrawer, DrawerClosed, CandidateForceUpdate } from '../models/Events'
import RouterTabMapping from '../models/RouterTabMapping'

import { Errors, Labels, Messages } from '../util/Constants'

import VerticalSubway from '../components/voting/VerticalSubway.vue'
import StaticFileMetadata from '../components/ui/StaticFileMetadata.vue'
import EthereumLoader from '../components/ui/EthereumLoader.vue'
import RouterTabs from '../components/ui/RouterTabs.vue'
import FileUploader from '../components/listing/FileUploader.vue'

import '@/assets/style/views/ffa-listed-view.sass'

import Web3 from 'web3'

@Component({
  components: {
    StaticFileMetadata,
    EthereumLoader,
    FileUploader,
    RouterTabs,
    VerticalSubway,
  },
})
export default class FfaListedView extends Vue {

  get candidate(): FfaListing {
    return this.ffaListingsModule.candidates.find((candidate) => candidate.hash === this.listingHash)!
  }

  get showChallenge(): boolean {
    return this.selectedTab === this.details && !this.isUnderChallenge
  }

  get isUnderChallenge(): boolean {
    return this.challengeModule.listingChallenged
  }

  @NoCache
  get voteBy(): number {
    return this.votingModule.voteBy
  }

  @NoCache
  get isVotingClosed(): boolean {
    if (!this.voteBy) {
      return true
    }
    return new Date().getTime() > this.voteBy
  }

  public get hasPurchased(): boolean {
    return false
  }

  public get plurality() {
    return this.appModule.plurality
  }

  public get prerequisitesMet(): boolean {
    return SharedModule.isReady(
      this.requiresWeb3!,
      this.requiresMetamask!,
      this.requiresParameters!,
      this.$store,
    )
  }

  public get isReady(): boolean {
    return this.prerequisitesMet && this.statusVerified
  }

  public get ffaListing(): FfaListing|undefined {
    if (!this.status || !this.listingHash) { return undefined }
    return this.ffaListingsModule.listed.find((l) => l.hash === this.listingHash)
  }

  public appModule: AppModule = getModule(AppModule, this.$store)
  public flashesModule: FlashesModule = getModule(FlashesModule, this.$store)
  public ffaListingsModule: FfaListingsModule = getModule(FfaListingsModule, this.$store)
  public purchaseModule: PurchaseModule = getModule(PurchaseModule, this.$store)
  public votingModule: VotingModule = getModule(VotingModule, this.$store)
  public challengeModule: ChallengeModule = getModule(ChallengeModule, this.$store)

  public statusVerified = false

  public routerTabMapping: RouterTabMapping[] = []
  public listing = Labels.LISTING
  public details = Labels.DETAILS

  @Prop()
  public status?: FfaListingStatus

  @Prop()
  public listingHash?: string

  @Prop()
  public walletAddress?: string

  @Prop()
  public enablePurchaseButton!: boolean

  @Prop({ default: false })
  public requiresWeb3?: boolean

  @Prop({ default: false })
  public requiresMetamask?: boolean

  @Prop({ default: false })
  public requiresParameters?: boolean

  @Prop()
  public selectedTab?: string

  public async created(this: FfaListedView) {
    this.votingModule.reset()
    if (!this.status || !this.listingHash) {
      console.log('no status or listingHash!')
      this.$router.replace('/')
    }

    this.routerTabMapping.push({
      route: {
        name: 'singleListed',
        params: {
          listingHash: this.listingHash!,
        },
      },
      label: this.listing,
    })
    this.routerTabMapping.push({
      route: {
        name: 'singleListedDetails',
        params: {
          listingHash: this.listingHash!,
        },
      },
      label: this.details,
    })

    this.$root.$on(DrawerClosed, this.onDrawerClosed)
    this.$store.subscribe(this.vuexSubscriptions)

    // if (this.prerequisitesMet) {
    //   return
    // }

    await EthereumModule.setEthereum(
      this.requiresWeb3!,
      this.requiresMetamask!,
      this.requiresParameters!,
      this.$store)
  }

  public mounted(this: FfaListedView) {
    this.votingModule.reset()
    this.$root.$emit(CandidateForceUpdate)
    console.log('FfaListedView mounted')
  }

  public async vuexSubscriptions(mutation: MutationPayload, state: any) {

    switch (mutation.type) {

      case 'appModule/setAppReady':

        switch (this.$router.currentRoute.name) {
          case 'singleListed':
          case 'singleListedDetails':
          case 'singleListedPurchase':
          case 'singleListedChallenge':
          case 'singleListedVote':
          case 'singleListedResolve':
            break
          default:
            return
        }

        if (!!!mutation.payload) { return }

        this.statusVerified = true

        const [error, listed, lastListedBlock] = await DatatrustModule.getListed()
        this.ffaListingsModule.setListed(listed!)
        // TODO: Remove hard coded value once we have size field
        if (!!this.ffaListing) { this.ffaListing.size = 0 }
        // this.ffaListing!.size = 0
        this.purchaseModule.setListing(this.ffaListing!)

        await Promise.all([
          this.checkChallenged(),
          EthereumModule.getEtherTokenBalance(this.$store),
          EthereumModule.getEthereumContractAllowance(ContractAddresses.DatatrustAddress, this.$store),
          EthereumModule.getMarketTokenBalance(this.$store),
        ])

        return this.$forceUpdate()

      case 'challengeModule/setListingChallenged':
        // Challenge is a candidate
        if (mutation.payload === true) {
          await VotingProcessModule.updateChallenged(this.listingHash!, this.$store)
        }
        return
      default:
        return
    }
  }

  public filterCandidate(listingHash: string): FfaListing {
    return this.ffaListingsModule.candidates.find((candidate) => candidate.hash === this.listingHash)!
  }

  public onVoteButtonClicked() {
    this.pushNewRoute('singleListedVote')
  }

  public onResolveButtonClicked() {
    this.votingModule.setResolveChallengeStatus(ProcessStatus.Ready)
    this.pushNewRoute('singleListedResolve')
  }

  public pushNewRoute(routeName: string) {
    const resolved = this.$router.resolve({
      name: routeName,
      params: {
        listingHash: this.listingHash!,
      },
    })
    if (this.$router.currentRoute.name === resolved.route.name) {
      return
    }
    this.$router.push(resolved.location)
  }

  private onPurchaseButtonClicked() {
    this.pushNewRoute('singleListedPurchase')
  }

  private onChallengeButtonClicked() {
    this.pushNewRoute('singleListedChallenge')
  }

  // TODO: move to function module
  private async checkChallenged() {
    const listingChallenged = await VotingContractModule.candidateIs(
      this.listingHash!,
      2, // challenge application
      ethereum.selectedAddress,
      this.appModule.web3,
    )

    this.challengeModule.setListingChallenged(listingChallenged)
  }

  private onDrawerClosed() {

    let routeName: string
    switch (this.$router.currentRoute.name) {
      case 'singleListedChallenge':
      case 'singleListedVote':
      case 'singleListedResolve':
        routeName = 'singleListedDetails'
        break
      case 'singleListedPurchase':
        routeName = 'singleListed'
      default:
        return
    }

    if (this.$router.currentRoute.name === routeName) {
      return
    }

    this.$router.push({
      name: routeName,
      params: {
        listingHash: this.listingHash!,
      },
    })
  }
}
</script>
