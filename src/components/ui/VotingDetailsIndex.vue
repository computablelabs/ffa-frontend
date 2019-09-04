<template>
  <section class="votes-wrapper">
    <div>
      <div class="votes-header">
        <font-awesome-icon 
          size="lg"
          :icon="['fa', 'bars']" />
        <span class="accept-votes-info">{{yeaVotes || nayVotes}} {{renderVoteType}} Votes</span>
      </div>
      <div class="hash-wrapper"><span class="hash">0x123</span></div>
      <div class="hash-wrapper"><span class="hash">0x234</span> <span class="comment">Love Cats</span></div>
      <div class="hash-wrapper"><span class="hash">0xfff</span></div>
      <div class="hash-wrapper"><span class="hash">0xokay</span></div>
      <div class="hash-wrapper"><span class="hash">0xo0y</span></div>
    </div>
  </section>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch} from 'vue-property-decorator'
import '@/assets/style/components/voting-details.sass'

@Component
export default class VotingDetailsIndex extends Vue {
  @Prop() public yeaVotes?: number
  @Prop() public nayVotes?: number

  get renderVoteType(): string {
    return !!this.yeaVotes ? 'Accept' : 'Reject'
  }
}
</script>
