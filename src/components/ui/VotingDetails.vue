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
      :yeaVotes="yeaVotes" /> 
    <VotingDetailsIndex 
      :nayVotes="nayVotes" /> 
    <section class="market-info-wrapper">
      <div class="market-info">
        <div>Community requires {{convertPercentage(passPercentage)}} accept votes to list</div>
        <div>Voting locks up 1.0 MKT</div>
        <div>Voting closes Jun 20 at 8:00 pm</div>
      </div>
    </section>
    <section class="voting">
      <div>
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
  @Prop() private yeaVotes!: number
  @Prop() private nayVotes!: number
  @Prop() private passPercentage!: number

  private convertPercentage(inputNum: number): string {
    return `${inputNum.toString()}%`
  }

}
</script>
