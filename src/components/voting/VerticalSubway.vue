<template>
  <div>
    <h2 class="candidate-view-title">{{listingTitle}}</h2>
    <SubwayItem :isIconTop="true">File Uploaded {{shareDate}}</SubwayItem>
    <SubwayItem :isIconTop="true">Submitted To Cooperative</SubwayItem>
    <SubwayItem :isIconTop="true">Voting started</SubwayItem>
    <VotingDetails
      :resolved="isListed"
      :resolvesChallenge='false'
      :votingFinished="votingFinished"
      :listing="listing"
      :listingHash="listingHash"
      :yeaVotes="yeaVotes"
      :nayVotes="nayVotes"
      :passPercentage='plurality'
      @vote-clicked="$emit('vote-clicked')"
    />
    <SubwayItem
      v-show="votingFinished"
      :isIconTop="false"
      >Voting ended</SubwayItem>
    <SubwayItem
      v-show="votingFinished"
      :isIconTop="false"
      data-vote-result="result">{{listingResult}}</SubwayItem>

    <!-- Challenge info -->
    <SubwayItem
      v-if="isChallenged"
      :isIconTop="true">Listing was challenged DATE PLACEHOLDER</SubwayItem>
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
      @vote-clicked="$emit('vote-clicked')"
    />
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch} from 'vue-property-decorator'
import { getModule } from 'vuex-module-decorators'
import { MutationPayload } from 'vuex'

import VotingDetails from './VotingDetails.vue'
import SubwayItem from './SubwayItem.vue'

import FfaListing, { FfaListingStatus } from '../../models/FfaListing'

import FfaListingViewModule from '../../functionModules/views/FfaListingViewModule'
import VotingContractModule from '../../functionModules/protocol/VotingContractModule'

import AppModule from '../../vuexModules/AppModule'
import VotingModule from '../../vuexModules/VotingModule'
import ChallengeModule from '../../vuexModules/ChallengeModule'

@Component({
  components: {
    VotingDetails,
    SubwayItem,
  },
})
export default class VerticalSubway extends Vue {

  @Prop() public plurality!: number
  @Prop() public listing!: FfaListing

  @Prop() public listingStatus!: FfaListingStatus

  @Prop() public challenged!: boolean
  @Prop() public listingHash!: string

  public appModule = getModule(AppModule, this.$store)
  public challengeModule = getModule(ChallengeModule, this.$store)
  public votingModule = getModule(VotingModule, this.$store)

  get isListed(): boolean {
    return this.listingStatus === FfaListingStatus.listed
  }

  get isChallenged(): boolean {
    return this.challengeModule.listingChallenged
  }

  get listingTitle(): string {
    return this.listing!! ? this.listing.title : ''
  }

  get shareDate(): number {
    return this.listing!! ? this.listing.shareDate : 0
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
    return (this.votingModule.listingDidPass) ? 'Candidate listed in cooperative' : 'Candidate rejected from cooperative'
  }

  get votingFinished(): boolean {
    // TODO: Will have to integrate w/ poller to update UI to reflect voting finished
    return this.votingModule.votingFinished
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
