<template>
  <div class="voting-approve-spending">
    <ProcessButton
      :buttonText="labelText"
      :clickable="processEnabled"
      :processing="isProcessing"
      :onClickCallback="onClickCallback"
      v-if="showButton"/>

    <BlockchainExecutingMessage
      v-if="showBlockchainMessage">
      <div slot="messageSlot" class="executing-message">
        CHANGE ME Approving {{ ethValue }} ETH in spending
      </div>
    </BlockchainExecutingMessage>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import { getModule } from 'vuex-module-decorators'
import { Store, MutationPayload } from 'vuex'
import { NoCache } from 'vue-class-decorator'

import AppModule from '../../vuexModules/AppModule'
import VotingModule from '../../vuexModules/VotingModule'
import ChallengeModule from '../../vuexModules/ChallengeModule'
import FlashesModule from '../../vuexModules/FlashesModule'

import TaskPollerModule from '../../functionModules/task/TaskPollerModule'
import EventableModule from '../../functionModules/eventable/EventableModule'
import EthereumModule from '../../functionModules/ethereum/EthereumModule'

import { Eventable } from '../../interfaces/Eventable'

import ContractAddresses from '../../models/ContractAddresses'
import Flash, { FlashType } from '../../models/Flash'
import { ProcessStatus } from '../../models/ProcessStatus'
import DatatrustTaskDetails, { FfaDatatrustTaskType } from '../../models/DatatrustTaskDetails'
import DatatrustTask from '../../models/DatatrustTask'
import { VotingActionStep } from '../../models/VotingActionStep'

import MarketTokenContractModule from '../../functionModules/protocol/MarketTokenContractModule'

import { Placeholders, Labels, Errors } from '../../util/Constants'

import ProcessButton from '../../components/ui/ProcessButton.vue'
import BlockchainExecutingMessage from '../../components/ui/BlockchainExecutingMessage.vue'

import { eventsReturnValues } from '@computable/computablejs/dist/helpers'

import uuid4 from 'uuid/v4'

@Component({
  components: {
    ProcessButton,
    BlockchainExecutingMessage,
  },
})
export default class VotingApproveSpendingStep extends Vue {

  public labelText = Labels.APPROVE_SPENDING
  public approvalProcessId!: string

  public appModule = getModule(AppModule, this.$store)
  public votingModule = getModule(VotingModule, this.$store)
  public challengeModule = getModule(ChallengeModule, this.$store)
  public flashesModule = getModule(FlashesModule, this.$store)

  public unsubscribe!: () => void

  @Prop()
  public listingHash!: string

  @Prop()
  public taskType!: FfaDatatrustTaskType

  public get processEnabled(): boolean {
    if (this.taskType === FfaDatatrustTaskType.challengeApproveSpending) {
      return this.challengeModule.status === ProcessStatus.Ready
    }
    return this.votingModule.status === ProcessStatus.Ready
  }

  public get showButton(): boolean {
    return this.votingOrChallengeModuleStep === VotingActionStep.ApproveSpending
  }

  public get isProcessing(): boolean {
    return this.votingOrChallengeModuleStep === VotingActionStep.ApprovalPending
  }

  public get showBlockchainMessage(): boolean {
    return this.votingOrChallengeModuleStep === VotingActionStep.ApprovalPending
  }

  public get ethValue(): string {
    return EthereumModule.weiToEther(this.appModule.stake, this.appModule.web3)
  }

  private get votingOrChallengeModuleStep(): VotingActionStep {
    return (this.taskType === FfaDatatrustTaskType.challengeApproveSpending) ? this.challengeModule.challengeStep :
      this.votingModule.votingStep
  }

  public created() {
    this.unsubscribe = this.$store.subscribe(this.vuexSubscriptions)
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

    if (event.processId !== this.approvalProcessId) {
      return
    }

    if (event.error) {
      if (this.taskType === FfaDatatrustTaskType.voteApproveSpending) {
        this.votingModule.setStatus(ProcessStatus.Ready)
        this.votingModule.setVotingStep(VotingActionStep.ApproveSpending)
      } else {
        this.challengeModule.setStatus(ProcessStatus.Ready)
        this.challengeModule.setChallengeStep(VotingActionStep.ApproveSpending)
      }
      if (event.error.message.indexOf(Errors.USER_DENIED_SIGNATURE) > 0) {
        return
      }
      return this.flashesModule.append(new Flash(mutation.payload.error, FlashType.error))
    }

    this.approvalProcessId = ''

    TaskPollerModule.createTaskPollerForEthereumTransaction(
      event.response.result,
      this.listingHash,
      this.taskType,
      this.$store)
  }

  protected async onClickCallback(): Promise<void> {
    const userCMTBalance = await MarketTokenContractModule.balanceOf(
      ethereum.selectedAddress,
      this.appModule.web3)

    console.log(`Approving ${userCMTBalance} market token`)

    this.approvalProcessId = uuid4()

    await MarketTokenContractModule.approve(
      ethereum.selectedAddress,
      ContractAddresses.VotingAddress!,
      userCMTBalance,
      this.approvalProcessId,
      this.appModule.web3,
      this.$store)

    if (this.taskType === FfaDatatrustTaskType.challengeApproveSpending) {
      this.challengeModule.setChallengeStep(VotingActionStep.ApprovalPending)
    } else {
      this.votingModule.setVotingStep(VotingActionStep.ApprovalPending)
    }
  }
}
</script>