<template>
  <section class="voting-distribution">
    <div>
      <div class="voting-percentages">
        <span data-vote-type="accept">{{ accept }}: {{this.acceptPercentage}}</span>
        <span data-vote-type="reject">{{ reject }}: {{this.rejectPercentage}}</span>
      </div>
      <div class="voting-bar">
        <div class="progress-bar" :style="progressStyleObject"></div>
        <div class="pass-marker" :style="passMarkerStyleObject"></div>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch} from 'vue-property-decorator'

import FfaListing from '../../models/FfaListing'
import { Labels } from '../../util/Constants'

import '@/assets/style/components/voting-details.sass'

@Component
export default class VotingDetailsBar extends Vue {

  public accept = Labels.ACCEPT
  public reject = Labels.REJECT

  @Prop() public yeaVotes!: number
  @Prop() public nayVotes!: number
  @Prop() public passPercentage!: number

  get acceptPercentage(): string {
    if (this.totalVotes === 0) { return '0%' }
    const acceptPercent = (this.yeaVotes / (this.totalVotes) * 100).toFixed(1).toString()
    return `${acceptPercent}%`
  }

  get rejectPercentage(): string {
    if (this.totalVotes === 0) { return '0%' }
    const rejectPercent = (this.nayVotes / (this.totalVotes) * 100).toFixed(1).toString()
    return `${rejectPercent}%`
  }

  get progressStyleObject(): object {
    return { width: this.acceptPercentage }
  }

  get passMarkerStyleObject(): object {
    return { width: `${this.passPercentage.toString()}%` }
  }

  get totalVotes(): number {
    return this.yeaVotes + this.nayVotes
  }
}
</script>
