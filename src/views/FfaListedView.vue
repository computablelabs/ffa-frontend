<template>
  <section id='ffa-listed'>
    <h1>Listed View</h1>
    <h2>status: {{ status }} </h2>
    <h2>listing hash: {{ listingHash }}</h2>
    <h2>wallet address: {{ walletAddress }}</h2>
    <h2>purchased: {{ hasPurchased }}</h2>
    <h2>status verified: {{ statusVerified }}</h2>
    <div
      v-if="isReady"
      class="metadata-container" >
      <div class="voting-info-wrapper">
        <TabsHeader
          :tabs="tabs"
          :selected="selected"
          @clicked="(tab) => selected = tab"
        />
<<<<<<< HEAD
        <!-- listing tab selected -->
=======
        <!-- details tab selected -->
>>>>>>> Fix Ffalisted syntax issue
        <StaticFileMetadata
          v-show="selected === listingTab"
          :ffaListing="ffaListing"
        />
        <button
          v-if="enablePurchaseButton"
          v-show="selected === listingTab"
          @click="onPurchaseClick"
          data-purchase="true">Purchase</button>

        <!-- details tab selected -->
        <button 
          v-show="selected === detailsTab"
          @click="onChallengeClick"
          data-challenge="true">Challenge listing</button>
        <VerticalSubway
          v-show="selected === detailsTab"
          :listed="true"
          :listing="candidate"
          :challenged="false"
          :plurality="plurality"
        />
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
import Web3Module from '../vuexModules/Web3Module'
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

import FfaListing, { FfaListingStatus } from '../models/FfaListing'
import { ProcessStatus } from '../models/ProcessStatus'
import ContractsAddresses from '../models/ContractAddresses'
import { OpenDrawer } from '../models/Events'

import { Errors, Labels, Messages } from '../util/Constants'

import VerticalSubway from '../components/voting/VerticalSubway.vue'
import StaticFileMetadata from '../components/ui/StaticFileMetadata.vue'
import EthereumLoader from '../components/ui/EthereumLoader.vue'
import TabsHeader from '../components/ui/TabsHeader.vue'
import FileUploader from '../components/listing/FileUploader.vue'

import '@/assets/style/views/ffa-listed-view.sass'

import Web3 from 'web3'
import VotingContractModule from '../functionModules/protocol/VotingContractModule'


const vuexModuleName = 'newListingModule'
const appVuexModule = 'appModule'

@Component({
  components: {
    StaticFileMetadata,
    EthereumLoader,
    FileUploader,
    TabsHeader,
    VerticalSubway,
  },
})
export default class FfaListedView extends Vue {

  public get hasPurchased(): boolean {
    return false
  }

  protected get plurality() {
    return this.appModule.plurality
  }

  public get isReady(): boolean {
    const prerequisitesMet = SharedModule.isReady(
      this.requiresWeb3!,
      this.requiresMetamask!,
      this.requiresParameters!,
      this.$store,
    )

    return prerequisitesMet && this.statusVerified
  }

  public get ffaListing(): FfaListing|undefined {
    if (!this.status && !this.listingHash) { return undefined }
    return this.ffaListingsModule.listed.find((l) => l.hash === this.listingHash)
  }

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

  public appModule: AppModule = getModule(AppModule, this.$store)
  public web3Module: Web3Module = getModule(Web3Module, this.$store)
  public flashesModule: FlashesModule = getModule(FlashesModule, this.$store)
  public ffaListingsModule: FfaListingsModule = getModule(FfaListingsModule, this.$store)
  public purchaseModule: PurchaseModule = getModule(PurchaseModule, this.$store)
  public votingModule: VotingModule = getModule(VotingModule, this.$store)
  public challengeModule: ChallengeModule = getModule(ChallengeModule, this.$store)

  public statusVerified = false

  public listingTab = 'Listing'
  public detailsTab = 'Details'
  public tabs = [this.listingTab, this.detailsTab]
  public selected: string = this.listingTab

  get candidate(): FfaListing {
    return this.ffaListingsModule.candidates.find((candidate) => candidate.hash === this.listingHash)!
  }

  public async created(this: FfaListedView) {
    if (!this.status || !this.listingHash) {
      console.log('no status or listingHash!')
      this.$router.replace('/')
    }

    this.$store.subscribe(this.vuexSubscriptions)

    await EthereumModule.setEthereum(
      this.requiresWeb3!,
      this.requiresMetamask!,
      this.requiresParameters!,
      this.$store)
  }

  public mounted(this: FfaListedView) {
    console.log('FfaListedView mounted')
  }

  protected async vuexSubscriptions(mutation: MutationPayload, state: any) {
    switch (mutation.type) {
      case `appModule/setAppReady`:

        if (!!!mutation.payload) { return }

        const redirect = await FfaListingViewModule.getStatusRedirect(
          ethereum.selectedAddress,
          this.listingHash!,
          this.status!,
          this.$router.currentRoute.fullPath,
          this.web3Module,
        )

        if (!!redirect) { return this.$router.replace(redirect!) }

        this.statusVerified = true
        console.log(`==> ${this.statusVerified}`)

        const [error, listed, lastListedBlock] = await DatatrustModule.getListed()
        this.ffaListingsModule.setListed(listed!)
        // TODO: Remove hard coded value once we have size field
        if (!!this.ffaListing) { this.ffaListing.size = 0}
        // this.ffaListing!.size = 0
        this.purchaseModule.setListing(this.ffaListing!)
        await this.checkChallenged()

        // Check and set necessary purchase module steps
        await PurchaseProcessModule.checkEtherTokenBalance(this.$store)
        await PurchaseProcessModule.checkDatatrustContractAllowance(this.$store)

        // Set Market Token Balance
        await VotingProcessModule.updateMarketTokenBalance(this.$store)

        return this.$forceUpdate()
      case 'challengeModule/setListingChallenged':
        // Challenge is a candidate
        if (mutation.payload === true) {
          const [candidateError, candidates, lastCandidateBlock] = await DatatrustModule.getCandidates()
          this.ffaListingsModule.setCandidates(candidates!)

          // Update the candidate information from the blockchain call
          await VotingProcessModule.updateCandidateDetails(this.$store, this.listingHash!)

          const candidate = this.filterCandidate(this.listingHash!)
          this.votingModule.setCandidate(candidate)
        }
        return
      default:
        return
    }
  }

  private filterCandidate(listingHash: string): FfaListing {
    return this.ffaListingsModule.candidates.find((candidate) => candidate.hash === this.listingHash)!
  }

  private async checkChallenged() {
    const listingChallenged = await VotingContractModule.candidateIs(
      this.listingHash!,
      2, // challenge application
      ethereum.selectedAddress,
      this.web3Module.web3,
    )
    this.challengeModule.setListingChallenged(listingChallenged)
  }

  private onPurchaseClick() {
    this.$root.$emit(OpenDrawer)
  }

  private onChallengeClick() {
    this.$root.$emit(OpenDrawer)
  }
}
</script>
