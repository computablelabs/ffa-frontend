<template>
  <div class="voting-details">
    <header class="voting-details-header">
      <!-- insert exclamation here -->
      <span>Voting Details</span>
    </header>
    <VotingDetailsBar
      v-if="!isResolved"
      :candidate="candidate"
      :yeaVotes="yeaVotes"
      :nayVotes="nayVotes"
      :passPercentage="passPercentage"
    />
    <VotingDetailsIndex
      v-if="!isResolved"
      :votingFinished="votingFinished"
      :yeaVotes="yeaVotes"
    />
    <VotingDetailsIndex
      v-if="!isResolved"
      :votingFinished="votingFinished"
      :nayVotes="nayVotes"
    />
    <section class="market-info-wrapper">
      <div class="market-info">
        <div>Community requires {{convertPercentage(passPercentage)}} accept votes to list</div>
        <div
          v-show="!votingFinished && !isResolved"
          data-market-info="stake">Voting locks up {{convertedStake}} CMT</div>
        <div
          v-show="!votingFinished && !isResolved"
          data-market-info="voteBy">Voting closes {{candidateVoteBy}}</div>
      </div>
    </section>
    <section class="voting">
      <div v-show="!votingFinished && hasEnoughCMT && !isResolved">
        <ProcessButton
          buttonText="Vote"
          :clickable="!votingFinished"
          :processing="isProcessing"
          :noToggle="true"
          @clicked="$emit('vote-clicked')"
        />
        <div data-votes-info="votes">You have cast {{votes}} vote(s). {{possibleVotes}} more vote(s) possible</div>
      </div>
      <ProcessButton
        v-if="resolvesChallenge"
        v-show="votingFinished && !isResolved"
        :processing="isResolveChallengeProcessing"
        buttonText="Resolve Challenge"
        :clickable="votingFinished"
        :noToggle="true"
        @clicked="onResolveChallengeClick"
      />
      <ProcessButton
        v-else
        v-show="votingFinished && !isResolved"
        buttonText="Resolve Application"
        :processing="isResolveAppProcessing"
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
import EventableModule from '../../functionModules/eventable/EventableModule'
import PurchaseProcessModule from '../../functionModules/components/PurchaseProcessModule'
import TaskPollerManagerModule from '../../functionModules/components/TaskPollerManagerModule'
import VotingProcessModule from '../../functionModules/components/VotingProcessModule'
import ListingContractModule from '../../functionModules/protocol/ListingContractModule'
import VotingContractModule from '../../functionModules/protocol/VotingContractModule'

import { OpenDrawer } from '../../models/Events'
import FfaListing from '../../models/FfaListing'
import Flash, { FlashType } from '../../models/Flash'
import DatatrustTaskDetails, { FfaDatatrustTaskType } from '../../models/DatatrustTaskDetails'

import AppModule from '../../vuexModules/AppModule'
import VotingModule from '../../vuexModules/VotingModule'
import FlashesModule from '../../vuexModules/FlashesModule'
import FfaListingsModule from '../../vuexModules/FfaListingsModule'
import ChallengeModule from '../../vuexModules/ChallengeModule'

import { Eventable } from '../../interfaces/Eventable'

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
  @Prop() public resolved!: boolean
  @Prop() public resolvesChallenge!: boolean
  @Prop() public listing!: FfaListing
  @Prop() public listingHash!: string
  @Prop() public candidate!: FfaListing

  @Prop() private yeaVotes!: number
  @Prop() private nayVotes!: number
  @Prop() private passPercentage!: number

  private appModule = getModule(AppModule, this.$store)
  private votingModule = getModule(VotingModule, this.$store)
  private ffaListingsModule = getModule(FfaListingsModule, this.$store)
  private flashesModule = getModule(FlashesModule, this.$store)
  private challengeModule = getModule(ChallengeModule, this.$store)

  private resolveAppProcessId!: string
  private resolveAppMinedProcessId!: string

  private resolveChallengeProcessId!: string
  private resolveChallengeMinedProcessId!: string

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

  get isListed(): boolean {
    return this.votingModule.listingListed
  }

  get isResolveAppProcessing(): boolean {
    return this.votingModule.resolveAppStatus !== ProcessStatus.Ready
  }

  get isResolveChallengeProcessing(): boolean {
    return this.votingModule.resolveChallengeStatus !== ProcessStatus.Ready
  }

  get isResolved(): boolean {
    if (this.resolvesChallenge) { return !this.challengeModule.listingChallenged }
    if (!!this.resolved) { return this.resolved }
    return this.isListed
  }

  protected async vuexSubscriptions(mutation: MutationPayload, state: any) {
    if (mutation.type !== 'eventModule/append') {
      switch (mutation.type) {
        case `appModule/setAppReady`:
          if (!this.isResolved) {
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

    if (!EventableModule.isEventable(mutation.payload)) { return }

    const event = mutation.payload as Eventable

    if (!!event.error) {
      this.votingModule.setStatus(ProcessStatus.Ready)
      return this.flashesModule.append(new Flash(mutation.payload.error, FlashType.error))
    }

    if (!!event.response && event.processId === this.resolveAppProcessId) {
      const txHash = event.response.result
      this.votingModule.setResolveAppStatus(ProcessStatus.NotReady)

      await TaskPollerManagerModule.createPoller(
        txHash,
        this.listingHash,
        FfaDatatrustTaskType.resolveApplication,
        this.$store,
      )
    }

    if (!!event.response && event.processId === this.resolveAppMinedProcessId) {
      this.votingModule.setResolveAppStatus(ProcessStatus.Ready)
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

    if (!!event.response && event.processId === this.resolveChallengeMinedProcessId) {
      this.votingModule.setResolveChallengeStatus(ProcessStatus.Ready)
      this.challengeModule.setListingChallenged(false)
      this.$forceUpdate()
      return
    }
  }

  private async created() {
    this.$store.subscribe(this.vuexSubscriptions)
  }

  private async onResolveAppClick() {
    this.resolveAppProcessId = uuid4()
    this.resolveAppMinedProcessId = uuid4()
    this.votingModule.setResolveAppMinedProcessId(this.resolveAppMinedProcessId)

    await ListingContractModule.resolveApplication(
      this.listingHash,
      ethereum.selectedAddress,
      this.resolveAppProcessId,
      this.$store,
    )
  }

  private async onResolveChallengeClick() {
    this.resolveChallengeProcessId = uuid4()
    this.resolveChallengeMinedProcessId = uuid4()
    this.votingModule.setResolveChallengeMinedProcessId(this.resolveChallengeMinedProcessId)

    await ListingContractModule.resolveChallenge(
      this.listingHash,
      ethereum.selectedAddress,
      this.resolveChallengeProcessId,
      this.$store,
    )
  }

  private async setIsListed() {
    const isListed = await ListingContractModule.isListed(
      this.listingHash,
      ethereum.selectedAddress,
      this.appModule.web3,
    )
    this.votingModule.setListingListed(isListed)
  }

  private convertPercentage(inputNum: number): string {
    return `${inputNum.toString()}%`
  }
}
</script>
