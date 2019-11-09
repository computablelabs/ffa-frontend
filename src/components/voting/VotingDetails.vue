<template>
  <div class="voting-details">

    <header class="voting-details-header">
      <!-- insert exclamation here -->
      <span>{{ votingDetails }}</span>
    </header>

    <div class="content">
      <VotingDetailsBar
        v-if="!isResolved"
        :yeaVotes="yeaVotes"
        :nayVotes="nayVotes"
        :plurality="plurality" />

      <div v-show="isVotingClosed && isResolved">
        {{ votingCardTextOnceListed }}
      </div>

      <div v-show="!isVotingClosed && !isResolved" class="market-info">
        <div class="percentage-required">
          {{ acceptVotesToListText }}
        </div>

        <div
          data-market-info="stake">
          {{ votingLocksUpText }}
        </div>

        <div
          data-market-info="voteBy">
         {{ votingClosesText }}
        </div>

      </div>

      <div class="voting-button" v-show="showVotingButton">
        <button 
            @click="onVoteButtonClicked"
            :disabled="voteButtonDisabled"
            class="button is-primary is-medium">
            {{ voteButtonText }}
        </button>

        <div class="votes-possible" data-votes-info="votes">
          {{ votesCastText }}
        </div>
      </div>

      <div class="process-button voting-button">
        <button class="button is-primary is-large"
          v-if="resolvesChallenge"
          v-show="isVotingClosed"
          @click="onResolveChallengeButtonClicked">
          {{ resolveChallengeButtonText }}
        </button>
        <button class="button is-primary is-large"
          v-else
          v-show="isVotingClosed && !isResolved"
          @click="onResolveApplicationButtonClicked">
          {{ resolveApplicationButtonText }}
        </button>
      </div>

    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import { getModule } from 'vuex-module-decorators'
import { MutationPayload } from 'vuex'

import VotingDetailsBar from './VotingDetailsBar.vue'
import VotingDetailsIndex from './VotingDetailsIndex.vue'
import ProcessButton from '../ui/ProcessButton.vue'

import FfaListingViewModule from '../../functionModules/views/FfaListingViewModule'
import TokenFunctionModule from '../../functionModules/token/TokenFunctionModule'
import EventableModule from '../../functionModules/eventable/EventableModule'
import PurchaseProcessModule from '../../functionModules/components/PurchaseProcessModule'
import TaskPollerManagerModule from '../../functionModules/components/TaskPollerManagerModule'
import VotingProcessModule from '../../functionModules/components/VotingProcessModule'
import ListingContractModule from '../../functionModules/protocol/ListingContractModule'
import VotingContractModule from '../../functionModules/protocol/VotingContractModule'
import EthereumModule from '../../functionModules/ethereum/EthereumModule'

import { Eventable } from '../../interfaces/Eventable'

import { OpenDrawer, CandidateForceUpdate } from '../../models/Events'
import FfaListing, { FfaListingStatus } from '../../models/FfaListing'
import Flash, { FlashType } from '../../models/Flash'
import DatatrustTaskDetails, { FfaDatatrustTaskType } from '../../models/DatatrustTaskDetails'
import { ProcessStatus } from '../../models/ProcessStatus'

import AppModule from '../../vuexModules/AppModule'
import VotingModule from '../../vuexModules/VotingModule'
import FlashesModule from '../../vuexModules/FlashesModule'
import FfaListingsModule from '../../vuexModules/FfaListingsModule'
import ChallengeModule from '../../vuexModules/ChallengeModule'

import { Labels } from '../../util/Constants'

import uuid4 from 'uuid/v4'
import pluralize from 'pluralize'

import '@/assets/style/components/voting-details.sass'
import DrawerModule, { DrawerState } from '../../vuexModules/DrawerModule'

@Component({
  components: {
    VotingDetailsBar,
    VotingDetailsIndex,
    ProcessButton,
  },
})
export default class VotingDetails extends Vue {

  @Prop()
  public listingHash!: string

  @Prop()
  public listingStatus!: FfaListingStatus

  @Prop()
  public resolved!: boolean

  @Prop()
  public resolvesChallenge!: boolean

  @Prop()
  public yeaVotes!: number

  @Prop()
  public nayVotes!: number

  @Prop()
  public voteBy!: number

  @Prop()
  public plurality!: number

  @Prop()
  public isVotingClosed!: boolean

  @Prop()
  public hasJwt!: boolean

  @Prop()
  public onPreviewButtonClicked!: () => void

  @Prop()
  public onVoteButtonClicked!: () => void

  @Prop()
  public onResolveApplicationButtonClicked!: () => void

  @Prop()
  public onResolveChallengeButtonClicked!: () => void

  public appModule = getModule(AppModule, this.$store)
  public votingModule = getModule(VotingModule, this.$store)
  public ffaListingsModule = getModule(FfaListingsModule, this.$store)
  public flashesModule = getModule(FlashesModule, this.$store)
  public challengeModule = getModule(ChallengeModule, this.$store)
  public drawerModule = getModule(DrawerModule, this.$store)

  public votingDetails = Labels.VOTING_DETAILS
  public voteButtonText = Labels.VOTE
  public resolveApplicationButtonText = Labels.RESOLVE_APPLICATION
  public resolveChallengeButtonText = Labels.RESOLVE_CHALLENGE
  public unstakeButtonText = Labels.UNSTAKE
  public previewButtonText = Labels.PREVIEW

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

  get stake(): number {
    return this.votingModule.stake
  }

  get votes(): number {
    return this.yeaVotes + this.nayVotes
  }

  get isProcessing(): boolean {
    return this.votingModule.status !== ProcessStatus.Ready
  }

  get isListed(): boolean {
    return this.listingStatus === FfaListingStatus.listed
  }

  get isResolved(): boolean {
    if (this.resolvesChallenge) { return !this.challengeModule.listingChallenged }
    if (!!this.resolved) { return this.resolved }
    return this.isListed
  }

  get acceptVotesToListText(): string {
    return `${Labels.COMMNUNITY_REQUIRES} ` +
      `${this.convertPercentage(this.plurality)} ` +
      `${Labels.ACCEPT_VOTES_TO_LIST}`
  }

  get votingLocksUpText(): string {
    return `${Labels.VOTING_LOCKS_UP} ${this.convertedStake} ${Labels.CMT}`
  }

  get votingClosesText(): string {
    const dateOptions = { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' }
    const timeOptions = { hour: 'numeric', minute: 'numeric' }
    const dateString = new Date(this.voteBy).toLocaleDateString('en-US', dateOptions)
    const timeString = new Date(this.voteBy).toLocaleTimeString('en-US', timeOptions)

    return `${Labels.VOTING_CLOSES} ${dateString} at ${timeString}`
  }

  get votesCastText(): string {
    return `${Labels.YOU_HAVE_CAST} ${this.votes} ${Labels.OUT_OF} ${pluralize(Labels.VOTE, this.possibleVotes, true)}.`
  }

  get votingCardTextOnceListed(): string {
    return this.votingModule.listingDidPass ? Labels.VOTING_CARD_LISTED : Labels.VOTING_CARD_REJECTED
  }

  get showVotingButton(): boolean {
    if (this.listingStatus === FfaListingStatus.candidate) {
      return !this.resolvesChallenge && !this.isVotingClosed
    }
    return this.resolvesChallenge && !this.isVotingClosed
  }

  get voteButtonDisabled(): boolean {
    return this.drawerModule.status === DrawerState.processing
  }

  public async created() {
    this.$root.$on(CandidateForceUpdate, this.forceUpdate)
  }

  public beforeDestroy() {
    this.$root.$off(CandidateForceUpdate, this.forceUpdate)
  }
   public forceUpdate() {
    this.$forceUpdate()
  }

  public convertPercentage(inputNum: number): string {
    return `${inputNum.toString()}%`
  }

  @Watch('voteBy')
  public onVoteByChange(newVoteBy: number, oldVoteBy: number) {
    this.$forceUpdate()
  }
}
</script>
