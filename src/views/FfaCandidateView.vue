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
      <VerticalSubway
        v-if="candidateExists"
        :stake="candidate.stake"
        :voteBy="candidate.voteBy"
        :plurality="plurality"
        :yeaVotes="candidate.totalYeaVotes"
        :nayVotes="candidate.totalNayVotes"
        :votingFinished="false" />
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

import SharedModule from '../functionModules/components/SharedModule'
import FfaListingViewModule from '../functionModules/views/FfaListingViewModule'
import VotingContractModule from '../../src/functionModules/protocol/VotingContractModule'

import FfaListing, { FfaListingStatus } from '../models/FfaListing'
import { ProcessStatus } from '../models/ProcessStatus'
import ContractsAddresses from '../models/ContractAddresses'

import { Errors, Labels, Messages } from '../util/Constants'

import EthereumLoader from '../components/ui/EthereumLoader.vue'
import VerticalSubway from '../components/ui/VerticalSubway.vue'

import Web3 from 'web3'
import EthereumModule from '../functionModules/ethereum/EthereumModule'
import VotingModule from '../vuexModules/VotingModule'

import CandidateObject from '../../src/interfaces/Candidate'
import ParameterizerContractModule from '../functionModules/protocol/ParameterizerContractModule'
import DatatrustModule from '../functionModules/datatrust/DatatrustModule'
import '@/assets/style/components/voting.sass'

const vuexModuleName = 'newListingModule'
const appVuexModule = 'appModule'
const ffaListingsVuexModule = 'ffaListingsModule'

@Component({
  components: {
    EthereumLoader,
    VerticalSubway,
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
                              this.appModule,
                              this.web3Module)
    return prerequisitesMet && this.statusVerified && this.candidateFetched
  }

  protected get plurality() {
    return this.appModule.plurality
  }

  protected get voteBy() {
    return this.appModule.voteBy
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

  @Prop({ default: true })
  public requiresParameters?: boolean

  private statusVerified = false
  private candidateFetched = false

  private appModule: AppModule = getModule(AppModule, this.$store)
  private web3Module: Web3Module = getModule(Web3Module, this.$store)
  private flashesModule: FlashesModule = getModule(FlashesModule, this.$store)
  private ffaListingsModule: FfaListingsModule = getModule(FfaListingsModule, this. $store)

  public async mounted(this: FfaCandidateView) {
    console.log('FfaCandidateView mounted')
  }

  protected async created(this: FfaCandidateView) {

    if (!this.status || !this.listingHash) {
      this.$router.replace('/')
    }

    this.$store.subscribe(this.vuexSubscriptions)
    const endpoint = DatatrustModule.generateDatatrustEndPoint(false, 'application')

    await EthereumModule.setEthereum(
      this.requiresWeb3!,
      this.requiresMetamask!,
      this.requiresParameters!,
      this.appModule,
      this.web3Module,
      this.flashesModule)
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
        const candidate = await VotingContractModule.getCandidate(
                            this.listingHash!,
                            ethereum.selectedAddress,
                            this.web3Module.web3)

        const payload = { listingHash: this.listingHash, newCandidateDetails: candidate }
        this.ffaListingsModule.setCandidateDetails(payload)

        return this.$forceUpdate()
      case `${ffaListingsVuexModule}/setCandidateDetails`:

        this.candidateFetched = true
        return
    }
  }

  get candidate() {
    return this.ffaListingsModule.candidates.find((candidate) => candidate.hash === this.listingHash)
  }

  get candidateExists() {
    return this.candidateFetched && !!this.candidate
  }

  @Watch('candidateExists')
  private onCandidateChanged(newCandidate: string, oldCandidate: string) {
    this.$forceUpdate()
  }
}
</script>
