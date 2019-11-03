<template>
  <section class="voting-details-bar-container">
    <div class="bar">
      <svg width="400px" height="30px" viewBox="0 0 400 30" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
      <defs>
        <rect id="path-1" x="0" y="0" width="400" height="14" rx="5"></rect>
      </defs>
      <g id="details/voing/bar-graph" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
          <g id="Group" transform="translate(0.000000, 8.000000)">
              <mask id="mask-2" fill="white">
                  <use xlink:href="#path-1"></use>
              </mask>
              <use class="background" id="Rectangle" xlink:href="#path-1"></use>
              <rect class="reject" mask="url(#mask-2)" x="0" y="0" :width="rejectWidth" height="14"></rect>
              <rect class="accept" mask="url(#mask-2)" x="0" y="0" :width="acceptWidth" height="14"></rect>
          </g>
          <rect class="divider" id="Rectangle" :x="dividerX" y="5" width="3" height="20"></rect>
      </g>
      </svg>
    </div>
    <div class="labels">
      <span data-vote-type="accept">{{ this.acceptString }}</span>
      <span data-vote-type="reject">{{ this.rejectString }}</span>
    </div>
  </section>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch} from 'vue-property-decorator'

import FfaListing from '../../models/FfaListing'
import { Labels } from '../../util/Constants'

import '@/assets/style/components/voting-details-bar.sass'

import pluralize from 'pluralize'

@Component
export default class VotingDetailsBar extends Vue {

  public accept = Labels.ACCEPT
  public reject = Labels.REJECT
  public width = 400

  @Prop() public yeaVotes!: number
  @Prop() public nayVotes!: number
  @Prop() public passPercentage!: number

  get acceptWidth(): string {
    const totalVotes = this.yeaVotes + this.nayVotes
    const width = totalVotes === 0 ? 0 : ((this.yeaVotes / totalVotes) * this.width)
    return `${width}`
  }

  get rejectWidth(): string {
    // accept paints on top, so width is either full width or 0
    return this.nayVotes === 0 ? '0' : `${this.width}`
  }

  get dividerX(): string {
    return `${(this.passPercentage / 100) * this.width}`
  }

  get acceptString(): string {
    const percent = this.yeaVotes === 0 ? '' : `(${this.percent(this.yeaVotes)})`
    return `${this.yeaVotes} ${Labels.ACCEPT} ${pluralize(Labels.VOTE, this.yeaVotes, false)} ${percent}`
  }

  get rejectString(): string {
    const percent = this.nayVotes === 0 ? '' : `(${this.percent(this.nayVotes)})`
    return `${this.nayVotes} ${Labels.REJECT} ${pluralize(Labels.VOTE, this.nayVotes, false)} ${percent}`
  }

  private totalVotes(): number {
    return this.yeaVotes + this.nayVotes
  }

  private percent(n: number): string {
    const total = this.totalVotes()
    return total === 0 ? `0%` : `${((n / total) * 100).toFixed(1)}%`
  }
}
</script>
