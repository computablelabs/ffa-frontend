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
        :passPercentage="passPercentage" />
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

      <div class="voting-button" v-show="!isVotingClosed && hasEnoughCMT && !isListed">
        <div class="process-button">
          <a class="button is-primary is-large"
            @click="onVoteButtonClicked">
            {{ voteButtonText }}
          </a>
        </div>
        <div class="votes-possible" data-votes-info="votes">
          {{ votesCastText }}
        </div>
      </div>

      <div class="process-button voting-button">
        <a class="button is-primary is-large"
          v-if="resolvesChallenge"
          v-show="isVotingClosed && !isResolved"
          @click="onResolveChallengeButtonClicked">
          {{ resolveChallengeButtonText }}
        </a>
      </div>

      <div class="process-button voting-button">
        <a class="button is-primary is-large"
          v-show="isVotingClosed && !isResolved"
          @click="onResolveApplicationButtonClicked">
          {{ resolveApplicationButtonText }}
        </a>
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

import { OpenDrawer } from '../../models/Events'
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

@Component({
  components: {
    VotingDetailsBar,
    VotingDetailsIndex,
    ProcessButton,
  },
})
export default class VotingDetails extends Vue {

  @Prop()
  public votingFinished!: boolean

  @Prop()
  public listed!: boolean

  @Prop()
  public resolved!: boolean

  @Prop()
  public resolvesChallenge!: boolean

  @Prop()
  public listing!: FfaListing

  @Prop()
  public listingHash!: string

  @Prop()
  public candidate!: FfaListing

  @Prop()
  public yeaVotes!: number

  @Prop()
  public listingStatus!: FfaListingStatus

  @Prop()
  public nayVotes!: number

  @Prop()
  public voteBy!: number

  @Prop()
  public passPercentage!: number

  @Prop()
  public isVotingClosed!: boolean

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

  public votingDetails = Labels.VOTING_DETAILS
  public voteButtonText = Labels.VOTE
  public resolveApplicationButtonText = Labels.RESOLVE_APPLICATION
  public resolveChallengeButtonText = Labels.RESOLVE_CHALLENGE

  public resolveAppProcessId!: string
  public resolveAppTransactionId!: string
  public resolveChallengeProcessId!: string
  public resolveChallengeTransactionId!: string

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
      `${this.convertPercentage(this.passPercentage)} ` +
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

  public async vuexSubscriptions(mutation: MutationPayload, state: any) {
    if (mutation.type !== 'eventModule/append') {
      switch (mutation.type) {
        case 'appModule/setAppReady':
          if (!this.isResolved) {
            return await Promise.all([
              EthereumModule.getMarketTokenBalance(this.$store),
              VotingProcessModule.updateStaked(this.$store),
            ])
          }
          return
        default:
          return
      }
    }

    if (!EventableModule.isEventable(mutation.payload)) { return }

    const event = mutation.payload as Eventable

    if (!!event.error) {
      this.votingModule.setStatus(ProcessStatus.Ready)
      return this.flashesModule.append(new Flash(mutation.payload.error, FlashType.error))
    }

    if (!!event.response && event.processId === this.resolveAppProcessId) {
      const txHash = event.response.result
      this.votingModule.setResolveApplicationStatus(ProcessStatus.NotReady)

      await TaskPollerManagerModule.createPoller(
        txHash,
        this.listingHash,
        FfaDatatrustTaskType.resolveApplication,
        this.$store,
      )
    }

    if (!!event.response && event.processId === this.resolveAppTransactionId) {
      this.votingModule.setResolveApplicationStatus(ProcessStatus.Ready)
      this.ffaListingsModule.removeCandidate(this.listingHash)
      if (!this.votingModule.listingDidPass) {
        this.$router.push({name: 'allListings'})
      } else {
        this.$forceUpdate()
      }
      return
    }

    if (!!event.response && event.processId === this.resolveChallengeProcessId) {
      const txHash = event.response.result
      this.votingModule.setResolveChallengeStatus(ProcessStatus.NotReady)

      await TaskPollerManagerModule.createPoller(
        txHash,
        this.listingHash,
        FfaDatatrustTaskType.resolveChallenge,
        this.$store,
      )
    }

    if (!!event.response && event.processId === this.resolveChallengeTransactionId) {
      this.votingModule.setResolveChallengeStatus(ProcessStatus.Ready)
      this.challengeModule.setListingChallenged(false)
      this.$forceUpdate()
      return
    }
  }

  public async created() {
    this.$store.subscribe(this.vuexSubscriptions)
  }

  // public async onResolveApplicationButtonClicked() {
  //   this.resolveAppProcessId = uuid4()
  //   this.resolveAppTransactionId = uuid4()
  //   this.votingModule.setResolveAppTransactionId(this.resolveAppTransactionId)

  //   await ListingContractModule.resolveApplication(
  //     this.listingHash,
  //     ethereum.selectedAddress,
  //     this.resolveAppProcessId,
  //     this.$store,
  //   )
  // }

  // public async onResolveChallengeButtonClicked() {
  //   this.resolveChallengeProcessId = uuid4()
  //   this.resolveChallengeTransactionId = uuid4()
  //   this.votingModule.setResolveChallengeTransactionId(this.resolveChallengeTransactionId)

  //   await ListingContractModule.resolveChallenge(
  //     this.listingHash,
  //     ethereum.selectedAddress,
  //     this.resolveChallengeProcessId,
  //     this.$store,
  //   )
  // }

  public async setIsListed() {
    const isListed = await ListingContractModule.isListed(
      this.listingHash,
      ethereum.selectedAddress,
      this.appModule.web3,
    )
    this.votingModule.setListingListed(isListed)
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
