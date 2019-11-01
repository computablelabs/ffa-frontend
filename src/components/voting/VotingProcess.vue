<template>
  <div class="voting-drawer-container">
    <div class="voting-interface-wrapper">
      <div class="voting-button-container">

        <div class="voting-indicator">
          <BlockchainExecutingMessage
            v-if="showBlockchainMessage">
            <div slot="messageSlot" class="executing-message">
              {{ blockchainMiningMessage }}
            </div>
          </BlockchainExecutingMessage>
          <div
            class="gavel-fix-me"
            v-else>
            {{ voteLabel }}
          </div>
        </div>
        <a class="button voting-interface-button"
          :disabled="disabled"
          @click="onVotingButtonClick(true)">
          {{ accept }}
        </a>
        <a class="button voting-interface-button"
          :disabled="disabled"
          @click="onVotingButtonClick(false)">
          {{ reject }}
        </a>
      </div>
      <textarea
        :placeholder="placeholder"
        class="comment-box"></textarea>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import { getModule } from 'vuex-module-decorators'
import { Store, MutationPayload } from 'vuex'
import { NoCache } from 'vue-class-decorator'

import AppModule from '../../vuexModules/AppModule'
import FfaListingsModule from '../../vuexModules/FfaListingsModule'
import VotingModule from '../../vuexModules/VotingModule'
import FlashesModule from '../../vuexModules/FlashesModule'
import PurchaseModule from '../../vuexModules/PurchaseModule'
import DatatrustTaskModule from '../../vuexModules/DatatrustTaskModule'

import VotingProcessModule from '../../functionModules/components/VotingProcessModule'
import PurchaseProcessModule from '../../functionModules/components/PurchaseProcessModule'
import TaskPollerManagerModule from '../../functionModules/components/TaskPollerManagerModule'
import EventableModule from '../../functionModules/eventable/EventableModule'
import DatatrustModule from '../../functionModules/datatrust/DatatrustModule'
import EthereumModule from '../../functionModules/ethereum/EthereumModule'

import { Eventable } from '../../interfaces/Eventable'

import ContractAddresses from '../../models/ContractAddresses'
import FfaListing from '../../models/FfaListing'
import { CloseDrawer } from '../../models/Events'
import Flash, { FlashType } from '../../models/Flash'
import { ProcessStatus } from '../../models/ProcessStatus'
import DatatrustTaskDetails, { FfaDatatrustTaskType } from '../../models/DatatrustTaskDetails'
import DatatrustTask from '../../models/DatatrustTask'
import { VotingStep } from '../../models/VotingStep'

import MarketTokenContractModule from '../../functionModules/protocol/MarketTokenContractModule'
import VotingContractModule from '../../functionModules/protocol/VotingContractModule'

import { Config } from '../../util/Config'
import { Placeholders, Labels } from '../../util/Constants'

import uuid4 from 'uuid/v4'

import ProcessButton from '../../components/ui/ProcessButton.vue'
import BlockchainExecutingMessage from '../../components/ui/BlockchainExecutingMessage.vue'

import { eventsReturnValues } from '@computable/computablejs/dist/helpers'

@Component({
  components: {
    ProcessButton,
    BlockchainExecutingMessage,
  },
})
export default class VotingProcess extends Vue {

  public placeholder = Placeholders.COMMENT

  public voteLabel = Labels.VOTE
  public accept = Labels.ACCEPT
  public reject = Labels.REJECT
  public blockchainMiningMessage = Labels.VOTE

  public notFirstVote = false
  public votesYes!: boolean

  public approvalProcessId!: string
  public votingProcessId!: string

  public votingModule: VotingModule = getModule(VotingModule, this.$store)
  public ffaListingsModule: FfaListingsModule = getModule(FfaListingsModule, this.$store)
  public appModule: AppModule = getModule(AppModule, this.$store)
  public purchaseModule: PurchaseModule = getModule(PurchaseModule, this.$store)
  public flashesModule: FlashesModule = getModule(FlashesModule, this.$store)
  public datatrustTaskModule: DatatrustTaskModule = getModule(DatatrustTaskModule, this.$store)

  public get isVoting(): boolean {
    return this.votingModule.status === ProcessStatus.Executing
  }

  public get showBlockchainMessage(): boolean {
    return this.votingModule.votingStep === VotingStep.ApprovalPending ||
      this.votingModule.votingStep === VotingStep.VotePending
  }

  public get disabled(): any {
    return this.votingModule.status !== ProcessStatus.Executing ? false : 'disabled'
  }

  @NoCache
  public get candidate(): FfaListing {
    return this.votingModule.candidate
  }

  public async created() {
    this.$store.subscribe(this.vuexSubscriptions)
  }

  public async vuexSubscriptions(mutation: MutationPayload) {

    if (mutation.type === 'votingModule/setVotingStep') {
      switch (mutation.payload) {
        case VotingStep.VotePending:

          if (!this.votingProcessId || this.votingProcessId.length === 0) {
            this.vote(this.votesYes)
          }
          return
        default:
          return
      }

    } else if (mutation.type !== 'eventModule/append') {
      return
    }

    if (!EventableModule.isEventable(mutation.payload)) { return }

    const event = mutation.payload as Eventable

    if (event.error) {
      this.votingModule.setStatus(ProcessStatus.Ready)
      return this.flashesModule.append(new Flash(mutation.payload.error, FlashType.error))
    }

    if (!event.response) {
      // TODO: handle error
    }

    if (!event.processId || event.processId === '') {
      return
    }

    const txHash = event.response.result
    let taskType!: FfaDatatrustTaskType

    if (event.processId === this.approvalProcessId) {

      this.approvalProcessId = ''
      taskType = FfaDatatrustTaskType.voteApproveSpending

    } else if (event.processId === this.votingProcessId) {

      this.votingProcessId = ''
      taskType = FfaDatatrustTaskType.voteListing
    }

    if (taskType === undefined) {
      return
    }

    TaskPollerManagerModule.createPoller(
      txHash,
      this.candidate.hash,
      taskType,
      this.$store)
  }

  protected async votingTransactionSuccess(response: any) {

    this.votingModule.setStatus(ProcessStatus.Ready)
  }

  protected async approve() {
    const delta = this.votingModule.stake - this.appModule.marketTokenContractAllowance
    this.votingModule.setVotingStep(VotingStep.ApprovalPending)
    console.log('approving market token')
    this.approvalProcessId = uuid4()
    MarketTokenContractModule.approve(
      ethereum.selectedAddress,
      ContractAddresses.VotingAddress,
      delta,
      this.approvalProcessId,
      this.appModule.web3,
      this.$store)
  }

  protected async vote(votesYes: boolean) {
    this.votingProcessId = uuid4()
    await VotingContractModule.vote(
      votesYes,
      this.candidate.hash,
      ethereum.selectedAddress,
      this.votingProcessId,
      this.$store,
    )
  }

  private async onVotingButtonClick(votesYes: boolean) {

    if (this.votingModule.status === ProcessStatus.Executing) {
      return
    }
    this.votingModule.setStatus(ProcessStatus.Executing)
    this.votesYes = votesYes

    await EthereumModule.getMarketTokenBalance(this.$store)

    if (this.appModule.marketTokenContractAllowance < this.votingModule.stake) {
      this.approve()
    } else {
      this.vote(votesYes)
    }
  }
}
</script>
