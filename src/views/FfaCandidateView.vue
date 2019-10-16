<template>
  <section id='ffa-candidate'>
    <h1>Candidate View</h1>
    <h2>status: {{ status }} </h2>
    <h2>listing hash: {{ listingHash }}</h2>
    <h2>wallet address: {{ walletAddress }}</h2>
    <h2>stats verified : {{ statusVerified }}</h2>
    <div v-if="isReady" class="vsubway-wrapper">
      <div class='message'>
        Ready
      </div>
      <div class="voting-info-wrapper">
        <TabsHeader
          :tabs="tabs"
          :selected="selected"
          @clicked="(tab) => selected = tab" />
        <StaticFileMetadata
          v-show="candidateExists && selected === listingTab"
          :ffaListing="candidate" />
        <VerticalSubway
          v-show="candidateExists && selected === detailsTab"
          :candidate="candidate"
          :plurality="plurality" />
      </div>
    </div>
    <EthereumLoader v-else />
  </section>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import { NoCache } from 'vue-class-decorator'
import { MutationPayload } from 'vuex'
import axios from 'axios'

import { getModule } from 'vuex-module-decorators'
import Web3Module from '../vuexModules/Web3Module'
import FlashesModule from '../vuexModules/FlashesModule'
import NewListingModule from '../vuexModules/NewListingModule'
import UploadModule from '../vuexModules/UploadModule'
import FfaListingsModule from '../vuexModules/FfaListingsModule'
import AppModule from '../vuexModules/AppModule'
import VotingModule from '../vuexModules/VotingModule'

import SharedModule from '../functionModules/components/SharedModule'
import FfaListingViewModule from '../functionModules/views/FfaListingViewModule'
import VotingProcessModule from '../functionModules/components/VotingProcessModule'
import PurchaseProcessModule from '../functionModules/components/PurchaseProcessModule'
import DatatrustModule from '../functionModules/datatrust/DatatrustModule'
import EthereumModule from '../functionModules/ethereum/EthereumModule'

import VotingContractModule from '../../src/functionModules/protocol/VotingContractModule'
import ParameterizerContractModule from '../functionModules/protocol/ParameterizerContractModule'

import FfaListing, { FfaListingStatus } from '../models/FfaListing'
import { ProcessStatus } from '../models/ProcessStatus'
import ContractsAddresses from '../models/ContractAddresses'

import { Errors, Labels, Messages } from '../util/Constants'

import EthereumLoader from '../components/ui/EthereumLoader.vue'
import StaticFileMetadata from '../components/ui/StaticFileMetadata.vue'
import TabsHeader from '../components/ui/TabsHeader.vue'

import VerticalSubway from '../components/voting/VerticalSubway.vue'
import VotingInterface from '../components/voting/VotingInterface.vue'

import Web3 from 'web3'

import CandidateObject from '../../src/interfaces/Candidate'

import '@/assets/style/components/voting.sass'

const vuexModuleName = 'newListingModule'
const appVuexModule = 'appModule'
const ffaListingsVuexModule = 'ffaListingsModule'

@Component({
  components: {
    EthereumLoader,
    VerticalSubway,
    StaticFileMetadata,
    VotingInterface,
    TabsHeader,
  },
})
export default class FfaCandidateView extends Vue {

  public get canVote(): boolean {
    return this.appModule.canVote
  }

  protected get isReady(): boolean {
    const prerequisitesMet = SharedModule.isReady(
      this.requiresWeb3!,
      this.requiresMetamask!,
      this.requiresParameters!,
      this.$store)

    return prerequisitesMet && this.statusVerified && this.candidateFetched
  }

  protected get plurality() {
    return this.appModule.plurality
  }

  @Prop()
  public status?: FfaListingStatus

  @Prop()
  public listingHash?: string

  @Prop()
  public walletAddress?: string

  @Prop({ default: false })
  public requiresWeb3?: boolean

  @Prop({ default: false })
  public requiresMetamask?: boolean

  @Prop({ default: false })
  public requiresParameters?: boolean

  private statusVerified = false
  private candidateFetched = false

  private listingTab = 'Listing'
  private detailsTab = 'Details'
  private tabs = [this.listingTab, this.detailsTab]

  private selected: string = this.listingTab

  private appModule: AppModule = getModule(AppModule, this.$store)
  private web3Module: Web3Module = getModule(Web3Module, this.$store)
  private votingModule: VotingModule = getModule(VotingModule, this.$store)
  private flashesModule: FlashesModule = getModule(FlashesModule, this.$store)
  private ffaListingsModule: FfaListingsModule = getModule(FfaListingsModule, this.$store)

  public async mounted(this: FfaCandidateView) {
    console.log('FfaCandidateView mounted')
  }

  protected async created(this: FfaCandidateView) {
    this.votingModule.reset()
    if (!this.status || !this.listingHash) {
      this.$router.replace('/')
    }

    this.$store.subscribe(this.vuexSubscriptions)

    await EthereumModule.setEthereum(
      this.requiresWeb3!,
      this.requiresMetamask!,
      this.requiresParameters!,
      this.$store)
 }

  protected async vuexSubscriptions(mutation: MutationPayload, state: any) {
    switch (mutation.type) {
      case `${appVuexModule}/setAppReady`:

        if (!!!mutation.payload) { return }

        const redirect = await FfaListingViewModule.getStatusRedirect(
          ethereum.selectedAddress,
          this.listingHash!,
          this.status!,
          this.$router.currentRoute.fullPath,
          this.web3Module)

        if (!!redirect) { return this.$router.replace(redirect!) }

        this.statusVerified = true
        console.log(`==> ${this.statusVerified}`)

        const [error, candidates, lastCandidateBlock] = await DatatrustModule.getCandidates()
        this.ffaListingsModule.setCandidates(candidates!)

        // Update the candidate information from the blockchain call
        await VotingProcessModule.updateCandidateDetails(this.$store, this.listingHash!)

        const candidate = this.filterCandidate(this.listingHash!)
        this.votingModule.setCandidate(candidate)

        return this.$forceUpdate()
      case `${ffaListingsVuexModule}/setCandidateDetails`:
        this.candidateFetched = true
        return this.$forceUpdate()
    }
  }

  get candidate(): FfaListing {
    return this.ffaListingsModule.candidates.find((candidate) => candidate.hash === this.listingHash)!
  }

  get candidateExists(): boolean {
    return this.candidateFetched && !!this.candidate
  }

  private filterCandidate(listingHash: string): FfaListing {
    return this.ffaListingsModule.candidates.find((candidate) => candidate.hash === this.listingHash)!
  }

  @Watch('candidateExists')
  private onCandidateChanged(newCandidate: string, oldCandidate: string) {
    this.$forceUpdate()
  }
}
</script>
