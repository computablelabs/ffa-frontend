<template>
  <div>
    <SubwayItem :isIconTop="true">Upload Jun 11</SubwayItem>
    <SubwayItem :isIconTop="true">Submitted To Market</SubwayItem>
    <SubwayItem :isIconTop="true">Voting by community started</SubwayItem>
    <SubwayItem :isIconTop="true" v-show="votingFinished">Voting by community closed Jun 18</SubwayItem>
    <VotingDetails 
      :votingFinished="votingFinished"
      :yeaVotes='0'
      :nayVotes='0'
      :passPercentage='50' />
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

  @Prop() public yeaVotes!: number
  @Prop() public nayVotes!: number
  @Prop() public passPercentage!: number
}
</script>
