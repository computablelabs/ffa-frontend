<template>
  <div>
    <SubwayItem :isIconTop="true">Upload Jun 11</SubwayItem>
    <SubwayItem :isIconTop="true">Submitted To Market</SubwayItem>
    <SubwayItem :isIconTop="true">Voting by community started</SubwayItem>
    <VotingDetails 
      :yeaVotes='yeaVotes'
      :nayVotes='nayVotes'
      :passPercentage='passPercentage' />
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import VotingDetails from './VotingDetails.vue'
import SubwayItem from './SubwayItem.vue'

@Component({
  components: {
    VotingDetails,
    SubwayItem,
  },
})
export default class VerticalSubway extends Vue {
  private yeaVotes: number = 125
  private nayVotes: number = 70
  private passPercentage: number = 66
}
</script>
