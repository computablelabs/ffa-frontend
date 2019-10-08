<template>
  <div class="voting-details">
    <header class="voting-details-header">
      <font-awesome-icon 
        size="2x"
        :icon="['fa', 'exclamation-circle']" />
      <span>Voting Details</span>
    </header>
    <VotingDetailsBar
      :candidate="candidate"
      :yeaVotes="yeaVotes"
      :nayVotes="nayVotes"
      :passPercentage="passPercentage" />
    <VotingDetailsIndex 
      :votingFinished="votingFinished"
      :yeaVotes="yeaVotes" /> 
    <VotingDetailsIndex 
      :votingFinished="votingFinished"
      :nayVotes="nayVotes" /> 
    <section class="market-info-wrapper">
      <div class="market-info">
        <div>Community requires {{convertPercentage(passPercentage)}} accept votes to list</div>
        <div v-show="!votingFinished" data-market-info="stake">Voting locks up {{convertedStake}} CMT</div>
        <div v-show="!votingFinished" data-market-info="voteBy">Voting closes {{candidateVoteBy}}</div>
      </div>
    </section>
    <section class="voting">
      <div v-show="!votingFinished && hasEnoughCMT">
        <ProcessButton
          buttonText="Vote"
          :clickable="!votingFinished"
          :processing="isProcessing"
          :noToggle="true"
          @clicked="onVoteClick"  />
        <div data-votes-info="votes">You have cast {{votes}} vote(s). {{possibleVotes}} more vote(s) possible</div>
      </div>
      <ProcessButton
        v-show="votingFinished && !isListed"
        buttonText="Resolve Application"
        :clickable="votingFinished"
        :noToggle="true"
        @clicked="onResolveAppClick"  />
    </section>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import { getModule } from 'vuex-module-decorators'

import VotingDetailsBar from './VotingDetailsBar.vue'
import VotingDetailsIndex from './VotingDetailsIndex.vue'
import ProcessButton from '../ui/ProcessButton.vue'

import FfaListingViewModule from '../../functionModules/views/FfaListingViewModule'
import TokenFunctionModule from '../../functionModules/token/TokenFunctionModule'
import PurchaseProcessModule from '../../functionModules/components/PurchaseProcessModule'
import VotingProcessModule from '../../functionModules/components/VotingProcessModule'
import ListingContractModule from '../../functionModules/protocol/ListingContractModule'
import VotingContractModule from '../../functionModules/protocol/VotingContractModule'

import { OpenDrawer } from '../../models/Events'
import FfaListing from '../../models/FfaListing'

import AppModule from '../../vuexModules/AppModule'
import VotingModule from '../../vuexModules/VotingModule'
import Web3Module from '../../vuexModules/Web3Module'

import '@/assets/style/components/voting-details.sass'
import { ProcessStatus } from '../../models/ProcessStatus'

import uuid4 from 'uuid/v4'

@Component({
  components: {
    VotingDetailsBar,
    VotingDetailsIndex,
    ProcessButton,
  },
})
export default class VotingDetails extends Vue {

  get candidateVoteBy(): Date {
    return FfaListingViewModule.epochConverter(this.voteBy)
  }

  get marketTokenBalance(): number {
    return this.appModule.marketTokenBalance
  }

  get hasEnoughCMT(): boolean {
    return this.marketTokenBalance > this.convertedStake
  }

  get convertedStake(): number {
    return TokenFunctionModule.weiConverter(this.stake)
  }

  get possibleVotes(): number {
    return Math.floor(this.marketTokenBalance / this.stake)
  }

  get voteBy(): number {
    return this.votingModule.voteBy
  }

  get stake(): number {
    return this.votingModule.stake
  }

  get votes(): number {
    return this.yeaVotes + this.nayVotes
  }

  get isProcessing(): boolean {
    return this.votingModule.status !== ProcessStatus.Ready
  }

  get isListed() {
    return this.votingModule.listingListed
  }

  get candidateIsApp() {
    return this.votingModule.candidateIsApp
  }
  // private get isCandidate() {
  //   return this.votingModule.isCandidate
  // }

  @Prop() public votingFinished!: boolean
  @Prop() public candidate!: FfaListing
  // public votingFinished: boolean = false

  @Prop() private yeaVotes!: number
  @Prop() private nayVotes!: number
  @Prop() private passPercentage!: number

  private resolveProcessId: string

  private appModule: AppModule = getModule(AppModule, this.$store)
  private votingModule: VotingModule = getModule(VotingModule, this.$store)
  private web3Module: Web3Module = getModule(Web3Module, this.$store)


  private async created() {
    await Promise.all([
      PurchaseProcessModule.updateMarketTokenBalance(this.$store),
      VotingProcessModule.updateStaked(this.$store),
      // this.setIsListed(),
      this.setCandidateIsApp(),
      // this.setIsCandidate(),
    ])
    // await this.setIsListed()
  }

  private onVoteClick() {
    this.$root.$emit(OpenDrawer)
  }

  private async onResolveAppClick() {
    this.resolveProcessId = uuid4()

    await ListingContractModule.resolveApplication(
      this.candidate.hash,
      ethereum.selectedAddress,
      this.resolveProcessId,
      this.$store,
    )
  }

  private async setCandidateIsApp() {
    const candidateIsApp = await VotingContractModule.candidateIs(
      this.candidate.hash,
      1,
      ethereum.selectedAddress,
      this.web3Module.web3)
    this.votingModule.setCandidateIsApp(candidateIsApp)
  }

  private async setIsListed() {
    const isListed = await ListingContractModule.isListed(
      this.candidate.hash,
      ethereum.selectedAddress,
      this.web3Module.web3,
    )
    this.votingModule.setListingListed(isListed)
  }

  private convertPercentage(inputNum: number): string {
    return `${inputNum.toString()}%`
  }
}
</script>
