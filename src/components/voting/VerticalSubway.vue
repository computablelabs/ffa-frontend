<template>
  <div>
    <h2 class="candidate-view-title">{{listingTitle}}</h2>
    <SubwayItem :isIconTop="true">{{ fileUploaded }} {{shareDate}}</SubwayItem>
    <SubwayItem :isIconTop="true">{{ submittedToCooperative }}</SubwayItem>
    <SubwayItem :isIconTop="true">{{ votingStarted }}</SubwayItem>
    <VotingDetails
      :resolved="isListed"
      :resolvesChallenge='false'
      :votingFinished="votingFinished"
      :listing="listing"
      :listingHash="listingHash"
      :yeaVotes="yeaVotes"
      :nayVotes="nayVotes"
      :passPercentage='plurality'
      @vote-clicked="$emit('vote-clicked')" />
    <SubwayItem
      v-show="votingFinished"
      :isIconTop="false"
      >
      {{ votingEnded }}
    </SubwayItem>
    <SubwayItem
      class="subway-result-message"
      v-show="votingFinished"
      :isIconTop="false"
      data-vote-result="result">
      {{ listingResult }}
    </SubwayItem>

    <!-- Challenge info -->
    <SubwayItem
      v-if="isChallenged"
      :isIconTop="true">
      {{ listingWasChallenged }} DATE PLACEHOLDER
    </SubwayItem>
    <VotingDetails
      v-if="isChallenged"
      :resolved="!isChallenged"
      :resolvesChallenge='true'
      :votingFinished="votingFinished"
      :listing="listing"
      :listingHash="listingHash"
      :yeaVotes="yeaVotes"
      :nayVotes="nayVotes"
      :passPercentage='plurality'
      @vote-clicked="$emit('vote-clicked')" />
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch} from 'vue-property-decorator'
import { getModule } from 'vuex-module-decorators'
import { MutationPayload } from 'vuex'

import AppModule from '../../vuexModules/AppModule'
import VotingModule from '../../vuexModules/VotingModule'
import ChallengeModule from '../../vuexModules/ChallengeModule'

import FfaListingViewModule from '../../functionModules/views/FfaListingViewModule'
import VotingContractModule from '../../functionModules/protocol/VotingContractModule'

import FfaListing, { FfaListingStatus } from '../../models/FfaListing'

import VotingDetails from './VotingDetails.vue'
import SubwayItem from './SubwayItem.vue'

import { Labels } from '../../util/Constants'

@Component({
  components: {
    VotingDetails,
    SubwayItem,
  },
})
export default class VerticalSubway extends Vue {

  public fileUploaded = Labels.FILE_UPLOADED
  public submittedToCooperative = Labels.SUBMITTED_TO_COORPERATIVE
  public votingStarted = Labels.VOTING_STARTED
  public votingEnded = Labels.VOTING_ENDED
  public listingWasChallenged = Labels.LISTING_WAS_CHALLENGED

  public appModule = getModule(AppModule, this.$store)
  public challengeModule = getModule(ChallengeModule, this.$store)
  public votingModule = getModule(VotingModule, this.$store)

  @Prop() public plurality!: number
  @Prop() public listing!: FfaListing
  @Prop() public listingStatus!: FfaListingStatus
  @Prop() public challenged!: boolean
  @Prop() public listingHash!: string

  get isListed(): boolean {
    return this.listingStatus === FfaListingStatus.listed
  }

  get isChallenged(): boolean {
    return this.challengeModule.listingChallenged
  }

  get listingTitle(): string {
    return !!this.listing ? this.listing.title : ''
  }

  get shareDate(): number {
    return !!this.listing ? this.listing.shareDate : 0
  }

  get yeaVotes(): number {
    return this.votingModule.yeaVotes
  }

  get nayVotes(): number {
    return this.votingModule.nayVotes
  }

  get voteBy(): Date {
    return FfaListingViewModule.epochConverter(this.votingModule.voteBy)
  }

  get listingResult(): string {
    if (!!this.isListed) {this.votingModule.setListingDidPass(true)}
    return (this.votingModule.listingDidPass) ? Labels.SUBWAY_LISTED : Labels.SUBWAY_REJECTED
  }

  get votingFinished(): boolean {
    // TODO: Will have to integrate w/ poller to update UI to reflect voting finished
    return this.votingModule.votingFinished
  }

  get voteByText(): string {
    return `${Labels.VOTING_BY_COMMINITY_CLOSED} ${this.voteBy}`
  }

  protected async created() {
    this.votingModule.setListingDidPass(await this.listingDidPass())
  }

  protected async listingDidPass(): Promise<boolean> {
    if (!!this.isListed) { return true }
    // const hash = !!this.listing ? this.listing.hash : this.listingHash
    const voting = await VotingContractModule.getVoting(
      ethereum.selectedAddress,
      this.appModule.web3,
    )

    const pollClosed = await voting.deployed!.methods.pollClosed(this.listingHash).call()

    if (pollClosed) {
      return await VotingContractModule.didPass(
        this.listingHash,
        this.appModule.plurality,
        ethereum.selectedAddress,
        this.appModule.web3,
      )
    }

    return true
  }
}
</script>
