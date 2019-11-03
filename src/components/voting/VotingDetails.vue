<template>
  <div class="voting-details">

    <header class="voting-details-header">
      <!-- insert exclamation here -->
      <span>{{ votingDetails }}</span>
    </header>
    <div class="content">
      <VotingDetailsBar
        v-if="!isResolved"
        :candidate="candidate"
        :yeaVotes="yeaVotes"
        :nayVotes="nayVotes"
        :passPercentage="passPercentage"
      />
      <div v-show="votingFinished && isResolved">
        {{ votingCardTextOnceListed }}
      </div>
      <div v-show="!votingFinished && !isResolved" class="market-info">
        <div class="percentage-required">
          {{ acceptVotesToListText }}
        </div>
        <div
          v-show="!votingFinished && !isResolved"
          data-market-info="stake">
          {{ votingLocksUpText }} !!!
        </div>
        <div
          v-show="!votingFinished && !isResolved"
          data-market-info="voteBy">
         {{ votingClosesText }}
        </div>
      </div>
      <div class="voting-button" v-show="!votingFinished && hasEnoughCMT && !isResolved">
        <ProcessButton
          buttonText="Vote"
          :clickable="!votingFinished"
          :processing="isProcessing"
          :noToggle="true"
          @clicked="$emit('vote-clicked')"
        />
        <div class="votes-possible" data-votes-info="votes">
          {{ votesCastText }}
        </div>
      </div>
      <ProcessButton
        class="voting-button"
        v-if="resolvesChallenge"
        v-show="votingFinished && !isResolved"
        :processing="isResolveChallengeProcessing"
        buttonText="Resolve Challenge"
        :clickable="votingFinished"
        :noToggle="true"
        @clicked="onResolveChallengeClick"
      />
      <ProcessButton
        class="voting-button"
        v-show="votingFinished && !isResolved"
        buttonText="Resolve Application"
        :processing="isResolveAppProcessing"
        :clickable="votingFinished"
        :noToggle="true"
        @clicked="onResolveAppClick"
      />
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
import EventableModule from '../../functionModules/eventable/EventableModule'
import PurchaseProcessModule from '../../functionModules/components/PurchaseProcessModule'
import TaskPollerModule from '../../functionModules/task/TaskPollerModule'
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
import DateFormat from 'dateformat'

import '@/assets/style/components/voting-details.sass'

@Component({
  components: {
    VotingDetailsBar,
    VotingDetailsIndex,
    ProcessButton,
  },
})
export default class VotingDetails extends Vue {

  public votingDetails = Labels.VOTING_DETAILS
  public voteButtonText = Labels.VOTE
  public resolveButtonText = Labels.RESOLVE

  public appModule = getModule(AppModule, this.$store)
  public votingModule = getModule(VotingModule, this.$store)
  public ffaListingsModule = getModule(FfaListingsModule, this.$store)
  public flashesModule = getModule(FlashesModule, this.$store)
  public challengeModule = getModule(ChallengeModule, this.$store)

  @Prop()
  public listingHash!: string

  @Prop()
  public listingStatus!: FfaListingStatus

  @Prop()
  public yeaVotes!: number

  @Prop()
  public nayVotes!: number

  @Prop()
  public passPercentage!: number

  @Prop()
  public voteBy!: number

  @Prop()
  public isVotingClosed!: boolean

  @Prop()
  public shouldRenderChallenge!: boolean

  @Prop()
  public isUnderChallenge!: boolean

  @Prop()
  public onVoteButtonClicked!: () => void

  @Prop()
  public onResolveButtonClicked!: () => void

  get marketTokenBalance(): number {
    return this.appModule.marketTokenBalance
  }

  get stakeInEth(): number {
    return Number(EthereumModule.weiToEther(this.appModule.stake, this.appModule.web3))
  }

  get possibleVotes(): number {
    return Math.floor(this.marketTokenBalance / this.appModule.stake)
  }

  get totalVotes(): number {
    return this.yeaVotes + this.nayVotes
  }

  get acceptVotesToListText(): string {
    return `${Labels.COMMNUNITY_REQUIRES} ` +
      `${this.appendPercent(this.passPercentage)} ` +
      `${Labels.ACCEPT_VOTES_TO_LIST}`
  }

  get votingLocksUpText(): string {
    return `${Labels.VOTING_LOCKS_UP} ${this.stakeInEth} ${Labels.CMT}`
  }

  get votingClosesText(): string {
    const dateOptions = { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' }
    const timeOptions = { hour: 'numeric', minute: 'numeric' }
    const dateString = this.candidateVoteBy.toLocaleDateString('en-US', dateOptions)
    const timeString = this.candidateVoteBy.toLocaleTimeString('en-US', timeOptions)

    return `${Labels.VOTING_CLOSES} ${dateString} at ${timeString}`
  }

  get votesCastText(): string {
    return `${Labels.YOU_HAVE_CAST} ${this.votes} ${Labels.OUT_OF} ${pluralize(Labels.VOTE, this.possibleVotes, true)}.`
  }

  get votingCardTextOnceListed(): string {
    return this.votingModule.listingDidPass ? Labels.VOTING_CARD_LISTED : Labels.VOTING_CARD_REJECTED
  }

  get showResolve(): boolean {
    if (this.listingStatus === FfaListingStatus.candidate) {
      return this.isVotingClosed
    } else {
      return this.isUnderChallenge && this.isVotingClosed
    }
  }

  get showVote(): boolean {
    return !this.isVotingClosed
  }

  public created() {
    this.$root.$on(CandidateForceUpdate, this.forceUpdate)
  }

  public beforeDestroy() {
    this.$root.$off(CandidateForceUpdate, this.forceUpdate)
  }

  public appendPercent(inputNum: number): string {
    return `${inputNum.toString()}%`
  }

  public forceUpdate() {
    this.$forceUpdate()
  }

  @Watch('listingHash')
  public onListingHashChanged(newListingHash: string, oldListingHash: string) {
    this.$forceUpdate()
  }

  @Watch('voteBy')
  public onVoteByChange(newVoteBy: number, oldVoteBy: number) {
    this.$forceUpdate()
  }

  @Watch('isVotingClosed')
  public onIsVotingClosedChange(newIsVotingClosed: boolean, oldVotingClosed: boolean) {
    this.$forceUpdate()
  }
}
</script>
