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
    <SubwayItem :isIconTop="false" v-show="votingFinished">Candidate listed in market</SubwayItem>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import VotingDetails from './VotingDetails.vue'
import SubwayItem from './SubwayItem.vue'
import FfaListing from '../../models/FfaListing'
import FfaListingViewModule from '../../functionModules/views/FfaListingViewModule'

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

  get voteBy(): Date {
    return FfaListingViewModule.epochConverter(this.candidate.voteBy)
  }
}
</script>
