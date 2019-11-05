<template>
  <section class="votes-wrapper">
    <div>
      <div class="votes-header">
        <!-- insert bar icon here -->
        <span class="votes-info">{{voteCount}} {{voteType}} Votes</span>
      </div>
      <div v-show="!isVotingClosed">
        <div class="hash-wrapper"><span class="hash">0x123</span></div>
        <div class="hash-wrapper"><span class="hash">0x234</span><span class="comment">Love Cats</span></div>
        <div class="hash-wrapper"><span class="hash">0xfff</span></div>
        <div class="hash-wrapper"><span class="hash">0xokay</span></div>
        <div class="hash-wrapper"><span class="hash">0xo0y</span></div>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch} from 'vue-property-decorator'
import '@/assets/style/components/voting-details.sass'

@Component
export default class VotingDetailsIndex extends Vue {
  @Prop()
  public isVotingClosed!: boolean

  @Prop()
  public yeaVotes?: number

  @Prop()
  public nayVotes?: number


  get voteType(): string {
    if (this.yeaVotes === 0) { return 'Accept' }
    return !!this.yeaVotes ? 'Accept' : 'Reject'
  }

  get voteCount(): string {
    if (this.yeaVotes === 0) { return '0' }
    return `${this.yeaVotes || this.nayVotes}`
  }
}
</script>
