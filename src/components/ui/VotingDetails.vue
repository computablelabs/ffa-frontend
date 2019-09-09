<template>
  <div class="voting-details">
    <header class="voting-details-header">
      <font-awesome-icon 
        size="2x"
        :icon="['fa', 'exclamation-circle']" />
      <span>Voting Details</span>
    </header>
    <VotingDetailsBar
      :yeaVotes="yeaVotes"
      :nayVotes="nayVotes"
      :passPercentage="passPercentage" />
    <VotingDetailsIndex 
      :votingFinished="votingFinished"
      :yeaVotes="yeaVotes" /> 
    <VotingDetailsIndex 
      :votingFinished="votingFinished"
      :nayVotes="nayVotes" /> 
    <section class="market-info-wrapper">
      <div class="market-info">
        <div >Community requires {{convertPercentage(passPercentage)}} accept votes to list
        </div>
        <div v-show="!votingFinished">Voting locks up {{stake}} MKT</div>
        <div v-show="!votingFinished">Voting closes {{voteBy}} at 8:00 pm</div>
      </div>
    </section>
    <section class="voting">
      <div v-show="!votingFinished">
        <button class="button">Vote</button>
        <div>You have cast 0 out of 23 possible votes</div>
      </div>
    </section>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import VotingDetailsBar from './VotingDetailsBar.vue'
import VotingDetailsIndex from './VotingDetailsIndex.vue'
import '@/assets/style/components/voting-details.sass'

@Component({
  components: {
    VotingDetailsBar,
    VotingDetailsIndex,
  },
})
export default class VotingDetails extends Vue {
  @Prop() public votingFinished!: boolean

  @Prop() private stake!: number
  @Prop() private voteBy!: number
  @Prop() private yeaVotes!: number
  @Prop() private nayVotes!: number
  @Prop() private passPercentage!: number

  private convertPercentage(inputNum: number): string {
    return `${inputNum.toString()}%`
  }
}
</script>
