<template>
  <div class="voting-drawer-container">

    <div
      class="voting-error"
      v-if="isError">

      CHANGE ME Voting has closed for this listing
    </div>

    <div
      class="voting-interface-wrapper"
      v-else>

      <div class="voting-button-container">
        <VotingApproveSpendingStep
          :listingHash="listingHash"
          :taskType="taskType"
          v-if="needsApproval"/>
        <CastVoteStep
          :listingHash="listingHash"
          v-if="showVoting"/>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import { getModule } from 'vuex-module-decorators'
import { Store, MutationPayload } from 'vuex'
import { NoCache } from 'vue-class-decorator'

import AppModule from '../../vuexModules/AppModule'
import VotingModule from '../../vuexModules/VotingModule'
import FlashesModule from '../../vuexModules/FlashesModule'

import EventableModule from '../../functionModules/eventable/EventableModule'

import { Eventable } from '../../interfaces/Eventable'

import ContractAddresses from '../../models/ContractAddresses'
import FfaListing from '../../models/FfaListing'
import { CloseDrawer } from '../../models/Events'
import Flash, { FlashType } from '../../models/Flash'
import { ProcessStatus } from '../../models/ProcessStatus'
import { FfaDatatrustTaskType } from '../../models/DatatrustTaskDetails'
import { VotingActionStep } from '../../models/VotingActionStep'

import { Placeholders, Labels } from '../../util/Constants'

import uuid4 from 'uuid/v4'

import VotingApproveSpendingStep from './VotingApproveSpendingStep.vue'
import CastVoteStep from './CastVoteStep.vue'

import { eventsReturnValues } from '@computable/computablejs/dist/helpers'

@Component({
  components: {
    VotingApproveSpendingStep,
    CastVoteStep,
  },
})
export default class VotingProcess extends Vue {

  public placeholder = Placeholders.COMMENT

  public voteLabel = Labels.VOTE
  public accept = Labels.ACCEPT
  public reject = Labels.REJECT
  public blockchainMiningMessage = Labels.VOTE

  public taskType = FfaDatatrustTaskType.voteApproveSpending

  public votingModule: VotingModule = getModule(VotingModule, this.$store)
  public appModule: AppModule = getModule(AppModule, this.$store)

  @Prop()
  public listingHash!: string

  public get isError(): boolean {
    return this.votingModule.votingStep === VotingActionStep.Error
  }

  public get needsApproval(): boolean {
    return this.appModule.marketTokenContractAllowance < this.votingModule.stake
  }

  public get showVoting(): boolean {
    return this.votingModule.votingStep >= VotingActionStep.VotingAction
  }

  public get showBlockchainMessage(): boolean {
    return this.votingModule.votingStep === VotingActionStep.ApprovalPending ||
      this.votingModule.votingStep === VotingActionStep.VotingActionPending
  }
}
</script>