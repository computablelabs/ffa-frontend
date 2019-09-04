<template>
  <div class="voting-details">
    <header class="voting-details-header">
      <font-awesome-icon 
        size="2x"
        :icon="['fa', 'exclamation-circle']" />
      <span>Voting Details</span>
    </header>
    
    <VotingDetailsBar
      :yeaVotes="125"
      :nayVotes="69"
      :passPercentage="100" />

    <section class="votes-wrapper">
      <div>
        <div class="votes-header">
          <i class="fas fa-lg fa-bars"></i>
          <span class="accept-votes-info">125 Accept Votes</span>
        </div>
        <div class="hash-wrapper"><span class="hash">0x123</span></div>
        <div class="hash-wrapper"><span class="hash">0x234</span> <span class="comment">Love Cats</span></div>
        <div class="hash-wrapper"><span class="hash">0xfff</span></div>
        <div class="hash-wrapper"><span class="hash">0xokay</span></div>
        <div class="hash-wrapper"><span class="hash">0xo0y</span></div>
      </div>
    </section>

    <section class="votes-wrapper">
      <div>
        <div class="votes-header">
          <i class="fas fa-lg fa-bars"></i>
          <span class="accept-votes-info">69 Reject Votes</span>
        </div>
        <div class="hash-wrapper"><span class="hash">0xj23</span></div>
        <div class="hash-wrapper"><span class="hash">0x193</span> <span class="comment">Hate Cats</span></div>
        <div class="hash-wrapper"><span class="hash">0x113</span></div>
        <div class="hash-wrapper"><span class="hash">0x193</span></div>
        <div class="hash-wrapper"><span class="hash">0x1t3</span></div>
      </div>
    </section>

    <section class="market-info-wrapper">
      <div class="market-info">
        <div>Community requires 66% accept votes to list</div>
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
import { Vue, Component } from 'vue-property-decorator'
import VotingDetailsBar from './VotingDetailsBar.vue'
import '@/assets/style/components/voting-details.sass'

@Component({
  components: {
    VotingDetailsBar,
  },
})
export default class VotingDetails extends Vue {
}
</script>
