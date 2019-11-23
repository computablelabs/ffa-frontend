<template>
  <div class="voting-challenge">
    <DrawerBlockchainStep
      :label="drawerLabel"
      :state="drawerStepState"
      :onButtonClick="onClickCallback"/>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import { getModule } from 'vuex-module-decorators'
import { Store, MutationPayload } from 'vuex'
import { NoCache } from 'vue-class-decorator'

import AppModule from '../../vuexModules/AppModule'
import ChallengeModule from '../../vuexModules/ChallengeModule'
import FlashesModule from '../../vuexModules/FlashesModule'

import TaskPollerModule from '../../functionModules/task/TaskPollerModule'
import EventableModule from '../../functionModules/eventable/EventableModule'

import { Eventable } from '../../interfaces/Eventable'

import ContractAddresses from '../../models/ContractAddresses'
import Flash, { FlashType } from '../../models/Flash'
import { ProcessStatus } from '../../models/ProcessStatus'
import DatatrustTaskDetails, { FfaDatatrustTaskType } from '../../models/DatatrustTaskDetails'
import DatatrustTask from '../../models/DatatrustTask'
import { VotingActionStep } from '../../models/VotingActionStep'
import { DrawerBlockchainStepState } from '../../models/DrawerBlockchainStepState'

import ListingContractModule from '../../functionModules/protocol/ListingContractModule'
import EthereumModule from '../../functionModules/ethereum/EthereumModule'

import { Placeholders, Labels, Errors } from '../../util/Constants'

import DrawerBlockchainStep from '../ui/DrawerBlockchainStep.vue'

import { eventsReturnValues } from '@computable/computablejs/dist/helpers'

import uuid4 from 'uuid/v4'

@Component({
  components: {
    DrawerBlockchainStep,
  },
})
export default class VotingChallengeStep extends Vue {

  public labelText = Labels.CHALLENGE_LISTING

  public challengeProcessId = ''
  public challengeTransactionId = ''

  public appModule = getModule(AppModule, this.$store)
  public challengeModule = getModule(ChallengeModule, this.$store)
  public flashesModule = getModule(FlashesModule, this.$store)

  public unsubscribe!: () => void

  @Prop()
  public listingHash!: string

  public get drawerLabel(): string {
    switch (this.challengeModule.challengeStep) {

      case VotingActionStep.Error:
      case VotingActionStep.VotingAction:
        return `${Labels.CHALLENGE_LISTING}`

      case VotingActionStep.ApproveSpending:
      case VotingActionStep.ApprovalPending:
        return `${Labels.CHALLENGE_LISTING}`

      case VotingActionStep.VotingActionPending:
        return `${Labels.CHALLENGE_LISTING}`

      default:
        return `${Labels.CHALLENGE_LISTING}`
    }
  }

  public get drawerStepState(): DrawerBlockchainStepState {
    switch (this.challengeModule.challengeStep) {
      case VotingActionStep.Error:
      case VotingActionStep.VotingAction:
        return DrawerBlockchainStepState.ready

      case VotingActionStep.ApproveSpending:
      case VotingActionStep.ApprovalPending:
        return DrawerBlockchainStepState.upcoming

      case VotingActionStep.VotingActionPending:
        return DrawerBlockchainStepState.processing

      default:
        return DrawerBlockchainStepState.completed
    }
  }

  public created() {
    this.unsubscribe = this.$store.subscribe(this.vuexSubscriptions)
  }

  public beforeDestroy() {
    this.unsubscribe()
  }

  public async vuexSubscriptions(mutation: MutationPayload) {

    if (mutation.type === 'challendModule/setChallengeStep' &&
      mutation.payload === VotingActionStep.Complete) {
      this.challengeTransactionId = ''
      return
    }

    if (mutation.type !== 'eventModule/append') {
      return
    }

    if (!EventableModule.isEventable(mutation.payload)) { return }

    const event = mutation.payload as Eventable

    if (event.error) {
      this.challengeModule.setChallengeStep(VotingActionStep.VotingAction)
      this.challengeModule.setStatus(ProcessStatus.Ready)
      if (!event.error.message || event.error.message.indexOf(Errors.USER_DENIED_SIGNATURE) >= 0) {
        return
      }
      return this.flashesModule.append(new Flash(event.error.message, FlashType.error))
    }

    if (!event.response) {
      // TODO: handle error
    }

    if (!event.processId || event.processId === '') {
      return
    }

    if (event.processId !== this.challengeProcessId) {
      return
    }

    this.challengeProcessId = ''
    this.challengeTransactionId = event.response.result

    TaskPollerModule.createTaskPollerForEthereumTransaction(
      this.challengeTransactionId,
      this.listingHash,
      event.processId,
      FfaDatatrustTaskType.challengeListing,
      this.$store)
  }

  protected async onClickCallback() {

    this.challengeProcessId = uuid4()

    await ListingContractModule.challenge(
      this.listingHash,
      ethereum.selectedAddress,
      this.challengeProcessId,
      this.$store)

    this.challengeModule.setChallengeStep(VotingActionStep.VotingActionPending)
  }
}
</script>