<template>
  <div>
    <h2 v-if="!isListed" class="candidate-view-title">{{listingTitle}}</h2>
    <SubwayItem v-if="!isListed" :isIconTop="true">Upload {{shareDate}}</SubwayItem>
    <SubwayItem v-if="!isListed" :isIconTop="true">Submitted To Market</SubwayItem>
    <SubwayItem v-if="!isListed" :isIconTop="true">Voting by community started</SubwayItem>
    <SubwayItem 
      v-if="!isListed"
      v-show="votingFinished"
      :isIconTop="true" 
      >Voting by community closed {{voteBy}}</SubwayItem>
    <VotingDetails 
      :resolved="isListed"
      :resolvesChallenge='false'
      :votingFinished="votingFinished"
      :listing="listing"
      :yeaVotes="yeaVotes"
      :nayVotes="nayVotes"
      :passPercentage='plurality' 
      @vote-clicked="$emit('vote-clicked')"
    />
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
import Web3Module from '../../vuexModules/Web3Module'
import VotingModule from '../../vuexModules/VotingModule'

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

  public appModule: AppModule = getModule(AppModule, this.$store)
  public web3Module: Web3Module = getModule(Web3Module, this.$store)
  public votingModule: VotingModule = getModule(VotingModule, this.$store)

  get isListed(): boolean {
    // candidate still considered 'listed' even if challenged
    if (this.listingStatus === FfaListingStatus.listed) { return true }
    if (this.listingStatus === FfaListingStatus.candidate && this.isChallenged) { return true }
    return false
  }

  get isChallenged(): boolean {
    return !!this.challenged
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
    return (this.votingModule.listingDidPass) ? 'Candidate listed in market' : 'Candidate rejected'
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
      this.web3Module.web3,
    )

    const pollClosed = await voting.deployed!.methods.pollClosed(this.listingHash).call()

    if (pollClosed) {
      return await VotingContractModule.didPass(
        this.listingHash,
        this.appModule.plurality,
        ethereum.selectedAddress,
        this.web3Module.web3,
      )
    }

    return true
  }
}
</script>
