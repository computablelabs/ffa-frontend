<template>
  <div>
    <SubwayItem :isIconTop="true">Upload {{voteBy}}</SubwayItem>
    <SubwayItem :isIconTop="true">Submitted To Market</SubwayItem>
    <SubwayItem :isIconTop="true">Voting by community started</SubwayItem>
    <SubwayItem :isIconTop="true" v-show="votingFinished">Voting by community closed {{voteBy}}</SubwayItem>
    <VotingDetails 
      :votingFinished="votingFinished"
      :stake="stake"
      :voteBy="voteBy"
      :yeaVotes='yeaVotes'
      :nayVotes='nayVotes'
      :passPercentage='plurality' />
    <SubwayItem :isIconTop="false" v-show="votingFinished">Candidate listed in market</SubwayItem>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import VotingDetails from './VotingDetails.vue'
import SubwayItem from './SubwayItem.vue'

@Component({
  components: {
    VotingDetails,
    SubwayItem,
  },
})
export default class VerticalSubway extends Vue {
  @Prop() public votingFinished!: boolean

  @Prop() public plurality!: number

  @Prop() public stake!: number
  @Prop() public voteBy!: number
  @Prop() public yeaVotes!: number
  @Prop() public nayVotes!: number
}
</script>
