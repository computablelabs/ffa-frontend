<template>
  <div class="voting-details">
    <header class="voting-details-header">
      <font-awesome-icon 
        size="2x"
        :icon="['fa', 'exclamation-circle']" />
      <span>Voting Details</span>
    </header>
    <VotingDetailsBar
      v-if="!isListed"
      :yeaVotes="yeaVotes"
      :nayVotes="nayVotes"
      :passPercentage="passPercentage"
    />
    <VotingDetailsIndex 
      v-if="!isListed"
      :votingFinished="votingFinished"
      :yeaVotes="yeaVotes"
    /> 
    <VotingDetailsIndex 
      v-if="!isListed"
      :votingFinished="votingFinished"
      :nayVotes="nayVotes"
    /> 
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
          @clicked="onVoteClick"
        />
        <div data-votes-info="votes">You have cast {{votes}} vote(s). {{possibleVotes}} more vote(s) possible</div>
      </div>
      <ProcessButton
        v-show="votingFinished && !isListed"
        buttonText="Resolve Application"
        :clickable="votingFinished"
        :noToggle="true"
        @clicked="onResolveAppClick" 
      />
    </section>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import { getModule } from 'vuex-module-decorators'
import { MutationPayload } from 'vuex'

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
  @Prop() public votingFinished!: boolean
  @Prop() public listed!: boolean
  @Prop() public listing!: FfaListing

  @Prop() private yeaVotes!: number
  @Prop() private nayVotes!: number
  @Prop() private passPercentage!: number

  private appModule: AppModule = getModule(AppModule, this.$store)
  private votingModule: VotingModule = getModule(VotingModule, this.$store)
  private web3Module: Web3Module = getModule(Web3Module, this.$store)

  private resolveProcessId!: string

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
    // TODO: Improve how to deal with lsited version of details
    // If explicitly told that listing listed, return that instead
    if (!!this.listed) { return this.listed }
    return this.votingModule.listingListed
  }

  protected async vuexSubscriptions(mutation: MutationPayload, state: any) {
    switch (mutation.type) {
      case `appModule/setAppReady`:
        if (!this.listed) {
          return await Promise.all([
            VotingProcessModule.updateMarketTokenBalance(this.$store),
            VotingProcessModule.updateStaked(this.$store),
            this.setIsListed(),
          ])
        }
        return
      default:
        return
    }
  }

  private async created() {
    this.$store.subscribe(this.vuexSubscriptions)
  }

  private onVoteClick() {
    this.$root.$emit(OpenDrawer)
  }

  private async onResolveAppClick() {
    this.resolveProcessId = uuid4()

    await ListingContractModule.resolveApplication(
      this.listing.hash,
      ethereum.selectedAddress,
      this.resolveProcessId,
      this.$store,
    )
  }

  private async setIsListed() {
    const isListed = await ListingContractModule.isListed(
      this.listing.hash,
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
