<template>
  <div class="voting-drawer-container">
    <div
      class="voting-error"
      v-if="isError">
      Voting has closed for this listing
    </div>
    <div
      class="voting-interface-wrapper"
      v-else>
      <VotingApproveSpendingStep
        :listingHash="listingHash"
        :taskType="taskType" />
      <CastVoteStep
        :listingHash="listingHash" />
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import { getModule } from 'vuex-module-decorators'
import { NoCache } from 'vue-class-decorator'

import AppModule from '../../vuexModules/AppModule'
import VotingModule from '../../vuexModules/VotingModule'

import { Eventable } from '../../interfaces/Eventable'

import { FfaDatatrustTaskType } from '../../models/DatatrustTaskDetails'
import { VotingActionStep } from '../../models/VotingActionStep'

import { Placeholders, Labels } from '../../util/Constants'

import VotingApproveSpendingStep from './VotingApproveSpendingStep.vue'
import CastVoteStep from './CastVoteStep.vue'

@Component({
  components: {
    VotingApproveSpendingStep,
    CastVoteStep,
  },
})
export default class VotingProcess extends Vue {

  public placeholder = Placeholders.COMMENT

  public taskType = FfaDatatrustTaskType.voteApproveSpending

  public appModule = getModule(AppModule, this.$store)
  public votingModule = getModule(VotingModule, this.$store)

  @Prop()
  public listingHash!: string

  public get needsApproval(): boolean {
    return this.appModule.marketTokenVotingContractAllowance < this.votingModule.stake
  }

  public get isError(): boolean {
    return this.votingModule.votingStep === VotingActionStep.Error
  }
}
</script>
