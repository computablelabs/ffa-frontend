<template>
  <div>
    <SubwayItem :isIconTop="true">Upload {{candidate.shareDate}}</SubwayItem>
    <SubwayItem :isIconTop="true">Submitted To Market</SubwayItem>
    <SubwayItem :isIconTop="true">Voting by community started</SubwayItem>
    <SubwayItem 
      :isIconTop="true" 
      v-show="votingFinished"
      >Voting by community closed {{voteBy}}</SubwayItem>
    <VotingDetails 
      :votingFinished="votingFinished"
      :stake="candidate.stake"
      :voteBy="candidate.voteBy"
      :yeaVotes='candidate.totalYeaVotes'
      :nayVotes='candidate.totalNayVotes'
      :passPercentage='plurality' />
    <SubwayItem :isIconTop="false" v-show="votingFinished" data-vote-result="result">{{listingResult}}</SubwayItem>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import VotingDetails from './VotingDetails.vue'
import SubwayItem from './SubwayItem.vue'
import FfaListing from '../../models/FfaListing'
import FfaListingViewModule from '../../functionModules/views/FfaListingViewModule'
import VotingContractModule from '../../functionModules/protocol/VotingContractModule'
import AppModule from '../../vuexModules/AppModule'
import { getModule } from 'vuex-module-decorators'
import Web3Module from '../../vuexModules/Web3Module'
import VotingModule from '../../vuexModules/VotingModule'

@Component({
  components: {
    VotingDetails,
    SubwayItem,
  },
})
export default class VerticalSubway extends Vue {
  @Prop() public votingFinished!: boolean

  @Prop() public plurality!: number
  @Prop() public candidate!: FfaListing

  private appModule: AppModule = getModule(AppModule, this.$store)
  private web3Module: Web3Module = getModule(Web3Module, this.$store)
  private votingModule: VotingModule = getModule(VotingModule, this.$store)

  get voteBy(): Date {
    return FfaListingViewModule.epochConverter(this.candidate.voteBy)
  }

  get listingResult(): string {
    const listed = 'Candidate listed in market'
    const rejected = 'Candidate rejected'
    return (this.votingModule.listingDidPass) ? listed : rejected
  }

  protected async created() {
    this.votingModule.setListingDidPass(await this.isListed())
  }

  protected async isListed(): Promise<boolean> {
    return await VotingContractModule.didPass(
      this.candidate.hash,
      this.appModule.plurality,
      ethereum.selectedAddress,
      this.web3Module.web3,
      {},
    )
  }
}
</script>
