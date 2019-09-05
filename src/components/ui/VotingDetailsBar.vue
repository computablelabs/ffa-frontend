<template>
  <section class="voting-distribution">
    <div>
      <div class="voting-percentages">
        <span data-vote-type="accept">Accept: {{this.acceptPercentage}}</span>
        <span data-vote-type="reject">Reject: {{this.rejectPercentage}}</span>
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
import '@/assets/style/components/voting-details.sass'

@Component
export default class VotingDetailsBar extends Vue {
  @Prop() public yeaVotes!: number
  @Prop() public nayVotes!: number
  @Prop() public passPercentage!: number

  get acceptPercentage(): string {
    const acceptPercent = (this.yeaVotes / (this.yeaVotes + this.nayVotes) * 100).toFixed(1).toString()
    return `${acceptPercent}%`
  }

  get rejectPercentage(): string {
    const rejectPercent = (this.nayVotes / (this.nayVotes + this.yeaVotes) * 100).toFixed(1).toString()
    return `${rejectPercent}%`
  }

  get progressStyleObject(): object {
    return {
      width: this.acceptPercentage,
    }
  }

  get passMarkerStyleObject(): object {
    return {
      width: `${this.passPercentage.toString()}%`,
    }
  }
}
</script>
