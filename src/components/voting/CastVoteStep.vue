<template>
  <div>
    <div 
      v-if="choiceUpcoming"
      class="voting-button-container">
      <DrawerBlockchainStep
        :label="voteUpcoming"
        :state="drawerBlockchainStepStateUpcoming"
        :onButtonClick="undefined"/>
    </div>
    <div 
      v-if="!choiceUpcoming"
      class="voting-button-container">
      <DrawerBlockchainStep
        :label="accept"
        :state="acceptVoteState"
        :onButtonClick="voteAccept"/>
      <DrawerBlockchainStep
        :label="reject"
        :state="rejectVoteState"
        :onButtonClick="voteReject"/>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import { getModule } from 'vuex-module-decorators'
import { Store, MutationPayload } from 'vuex'

import AppModule from '../../vuexModules/AppModule'
import VotingModule from '../../vuexModules/VotingModule'
import FlashesModule from '../../vuexModules/FlashesModule'

import TaskPollerManagerModule from '../../functionModules/components/TaskPollerManagerModule'
import EventableModule from '../../functionModules/eventable/EventableModule'
import TaskPollerModule from '../../functionModules/task/TaskPollerModule'

import { Eventable } from '../../interfaces/Eventable'

import Flash, { FlashType } from '../../models/Flash'
import { ProcessStatus } from '../../models/ProcessStatus'
import { FfaDatatrustTaskType } from '../../models/DatatrustTaskDetails'
import { VotingActionStep } from '../../models/VotingActionStep'
import { DrawerBlockchainStepState } from '../../models/DrawerBlockchainStepState'

import VotingContractModule from '../../functionModules/protocol/VotingContractModule'

import { Placeholders, Labels, Errors } from '../../util/Constants'

import DrawerBlockchainStep from '../ui/DrawerBlockchainStep.vue'

import uuid4 from 'uuid/v4'
import Drawer from '../ui/Drawer.vue'

import '@/assets/style/components/cast-vote-step.sass'

@Component({
  components: {
    DrawerBlockchainStep,
  },
})
export default class CastVoteStep extends Vue {

  public placeholder = Placeholders.COMMENT

  public accept = Labels.ACCEPT
  public reject = Labels.REJECT
  public voteUpcoming = Labels.VOTE_BUTTON

  public voteValue: boolean|undefined
  public votingProcessId!: string
  public votingTransactionId!: string

  public appModule: AppModule = getModule(AppModule, this.$store)
  public votingModule: VotingModule = getModule(VotingModule, this.$store)
  public flashesModule: FlashesModule = getModule(FlashesModule, this.$store)

  public unsubscribe!: () => void

  public get drawerLabel(): string {
    switch (this.votingModule.votingStep) {

      case VotingActionStep.Error:
      case VotingActionStep.VotingAction:
        return `${Labels.VOTE}`

      case VotingActionStep.ApproveSpending:
      case VotingActionStep.ApprovalPending:
        return `${Labels.VOTE}`

      case VotingActionStep.VotingActionPending:
        return `${Labels.VOTE}`

      default:
        return `${Labels.VOTE}`
    }
  }

  public get drawerStepState(): DrawerBlockchainStepState {
    switch (this.votingModule.votingStep) {

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

  public get choiceUpcoming(): boolean {
    switch (this.votingModule.votingStep) {

      case VotingActionStep.Error:
      case VotingActionStep.ApproveSpending:
      case VotingActionStep.ApprovalPending:
        return true

      default:
        return false
    }
  }

  public get acceptVoteState(): DrawerBlockchainStepState {
    switch (this.votingModule.votingStep) {

      case VotingActionStep.ApproveSpending:
      case VotingActionStep.ApprovalPending:
        return DrawerBlockchainStepState.upcoming

      case VotingActionStep.Error:
      case VotingActionStep.VotingAction:
        return DrawerBlockchainStepState.ready

      case VotingActionStep.VotingActionPending:
        return this.voteValue ?
          DrawerBlockchainStepState.processing : DrawerBlockchainStepState.hidden

      case VotingActionStep.Complete:
        return DrawerBlockchainStepState.completed
    }
  }

  public get rejectVoteState(): DrawerBlockchainStepState {
    if (this.votingModule.votingStep === VotingActionStep.VotingActionPending) {
      return this.voteValue ?
        DrawerBlockchainStepState.hidden : DrawerBlockchainStepState.processing
    }
    return this.acceptVoteState
  }

  public get drawerBlockchainStepStateUpcoming(): DrawerBlockchainStepState {
    return DrawerBlockchainStepState.upcoming
  }

  @Prop()
  public listingHash!: string

  public get showBlockchainMessage(): boolean {
    return this.votingModule.votingStep === VotingActionStep.VotingActionPending
  }

  public get disabled(): any {
    return this.votingModule.votingStep === VotingActionStep.VotingActionPending ? 'disabled' : false
  }

  public created() {
    this.unsubscribe = this.$store.subscribe(this.vuexSubscriptions)
  }

  public mounted() {
    this.voteValue = undefined
  }

  public beforeDestroy() {
    this.unsubscribe()
  }

  public async vuexSubscriptions(mutation: MutationPayload) {

    if (mutation.type !== 'eventModule/append') {
      return
    }

    if (!EventableModule.isEventable(mutation.payload)) { return }

    const event = mutation.payload as Eventable

    if (!event.response) {
      // TODO: handle error
    }

    if (!event.processId || event.processId === '') {
      return
    }

    if (event.processId !== this.votingProcessId) {
      return
    }

    if (event.error) {
      if (event.error.message.indexOf(Errors.USER_DENIED_SIGNATURE) > 0) {
        return this.votingModule.setVotingStep(VotingActionStep.VotingAction)

      } else {
        this.votingModule.setVotingStep(VotingActionStep.Error)
        return this.flashesModule.append(new Flash(mutation.payload.error, FlashType.error))
      }
    }

    this.votingProcessId = ''
    this.votingTransactionId = event.response.result

    TaskPollerModule.createTaskPollerForEthereumTransaction(
      this.votingTransactionId,
      this.listingHash,
      FfaDatatrustTaskType.voteListing,
      this.$store)
  }

  protected async voteAccept() {
    this.voteValue = true
    this.castVote(true)
  }

  protected async voteReject() {
    this.voteValue = false
    this.castVote(false)
  }

  protected async castVote(votesYes: boolean) {

    this.votingProcessId = uuid4()

    VotingContractModule.vote(
      votesYes,
      this.listingHash,
      ethereum.selectedAddress,
      this.votingProcessId,
      this.$store,
    )
    this.votingModule.setVotingStep(VotingActionStep.VotingActionPending)
  }
}
</script>