<template>
  <div>
    <h2 class="candidate-view-title" >{{candidate.title}}</h2>
    <SubwayItem :isIconTop="true">Upload {{candidate.shareDate}}</SubwayItem>
    <SubwayItem :isIconTop="true">Submitted To Market</SubwayItem>
    <SubwayItem :isIconTop="true">Voting by community started</SubwayItem>
    <SubwayItem 
      :isIconTop="true" 
      v-show="votingFinished"
      >Voting by community closed {{voteBy}}</SubwayItem>
    <VotingDetails 
      :votingFinished="votingFinished"
      :candidate="candidate"
      :yeaVotes="yeaVotes"
      :nayVotes="nayVotes"
      :passPercentage='plurality' />
    <SubwayItem :isIconTop="false" v-show="votingFinished" data-vote-result="result">{{listingResult}}</SubwayItem>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch} from 'vue-property-decorator'
import { getModule } from 'vuex-module-decorators'

import VotingDetails from './VotingDetails.vue'
import SubwayItem from './SubwayItem.vue'

import FfaListing from '../../models/FfaListing'

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
  @Prop() public candidate!: FfaListing

  private appModule: AppModule = getModule(AppModule, this.$store)
  private web3Module: Web3Module = getModule(Web3Module, this.$store)
  private votingModule: VotingModule = getModule(VotingModule, this.$store)

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
    return (this.votingModule.listingDidPass) ? 'Candidate listed in market' : 'Candidate rejected'
  }

  get votingFinished(): boolean {
    // TODO: Will have to integrate w/ poller to update UI to reflect voting finished
    return this.votingModule.votingFinished
  }

  protected async created() {
    this.votingModule.setListingDidPass(await this.isListed())
  }

  protected async isListed(): Promise<boolean> {
    const voting = await VotingContractModule.getVoting(
      ethereum.selectedAddress,
      this.web3Module.web3,
    )

    const pollClosed = await voting.deployed!.methods.pollClosed(this.candidate.hash).call()

    if (pollClosed) {
      return await VotingContractModule.didPass(
        this.candidate.hash,
        this.appModule.plurality,
        ethereum.selectedAddress,
        this.web3Module.web3,
      )
    }

    return true
  }
}
</script>
