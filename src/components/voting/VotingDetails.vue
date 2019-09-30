<template>
  <div class="voting-details">
    <header class="voting-details-header">
      <font-awesome-icon 
        size="2x"
        :icon="['fa', 'exclamation-circle']" />
      <span>Voting Details</span>
    </header>
    <VotingDetailsBar
      :candidate="candidate"
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
        <div>Community requires {{convertPercentage(passPercentage)}} accept votes to list</div>
        <div v-show="!votingFinished" data-market-info="stake">Voting locks up {{convertedStake}} CMT</div>
        <div v-show="!votingFinished" data-market-info="voteBy">Voting closes {{candidateVoteBy}}</div>
      </div>
    </section>
    <section class="voting">
      <div v-show="!votingFinished && hasEnoughCMT">
        <button 
          class="button"
          @click="onVotingButtonClick"
          >Vote</button>
        <div data-votes-info="votes">You have cast {{votes}} vote(s). {{possibleVotes}} more vote(s) possible</div>
      </div>
    </section>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import VotingDetailsBar from './VotingDetailsBar.vue'
import VotingDetailsIndex from './VotingDetailsIndex.vue'
import '@/assets/style/components/voting-details.sass'
import FfaListingViewModule from '../../functionModules/views/FfaListingViewModule'
import TokenFunctionModule from '../../functionModules/token/TokenFunctionModule'
import { OpenDrawer } from '../../models/Events'
import PurchaseProcessModule from '../../functionModules/components/PurchaseProcessModule'
import VotingProcessModule from '../../functionModules/components/VotingProcessModule'
import AppModule from '../../vuexModules/AppModule'
import { getModule } from 'vuex-module-decorators'
import VotingModule from '../../vuexModules/VotingModule'
import FfaListing from '../../models/FfaListing'

@Component({
  components: {
    VotingDetailsBar,
    VotingDetailsIndex,
  },
})
export default class VotingDetails extends Vue {
  @Prop() public votingFinished!: boolean
  @Prop() public candidate!: FfaListing

  @Prop() private yeaVotes!: number
  @Prop() private nayVotes!: number
  @Prop() private passPercentage!: number

  private appModule: AppModule = getModule(AppModule, this.$store)
  private votingModule: VotingModule = getModule(VotingModule, this.$store)

  get candidateVoteBy(): Date {
    return FfaListingViewModule.epochConverter(this.voteBy)
  }

  get marketTokenBalance(): number {
    return this.appModule.marketTokenBalance
  }

  get hasEnoughCMT(): boolean {
    return this.marketTokenBalance > this.convertedStake
  }

  get convertedStake(): number {
    return TokenFunctionModule.weiConverter(this.stake)
  }

  get possibleVotes(): number {
    return Math.floor(this.marketTokenBalance / this.stake)
  }

  get voteBy(): number {
    return this.candidate.voteBy
  }

  get stake(): number {
    return this.candidate.stake
  }

  get votes(): number {
    return this.votingModule.staked / this.stake
  }

  private async created() {
    await PurchaseProcessModule.updateMarketTokenBalance(this.$store)
    await VotingProcessModule.updateStaked(this.$store)
  }

  private convertPercentage(inputNum: number): string {
    return `${inputNum.toString()}%`
  }

  private onVotingButtonClick() {
    this.$root.$emit(OpenDrawer)
  }
}
</script>
