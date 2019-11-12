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
        {{ labelText }}
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
import ChallengeModule from '../../vuexModules/ChallengeModule'

import TaskPollerModule from '../../functionModules/task/TaskPollerModule'
import EventableModule from '../../functionModules/eventable/EventableModule'

import { Eventable } from '../../interfaces/Eventable'

import ContractAddresses from '../../models/ContractAddresses'
import Flash, { FlashType } from '../../models/Flash'
import { ProcessStatus } from '../../models/ProcessStatus'
import DatatrustTaskDetails, { FfaDatatrustTaskType } from '../../models/DatatrustTaskDetails'
import DatatrustTask from '../../models/DatatrustTask'
import { VotingActionStep } from '../../models/VotingActionStep'

import ListingContractModule from '../../functionModules/protocol/ListingContractModule'
import EthereumModule from '../../functionModules/ethereum/EthereumModule'

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
export default class VotingChallengeStep extends Vue {

  public labelText = Labels.CHALLENGE_LISTING

  public challengeProcessId!: string
  public challengeTransactionId!: string

  public appModule = getModule(AppModule, this.$store)
  public challengeModule = getModule(ChallengeModule, this.$store)

  public unsubscribe!: () => void

  @Prop()
  public listingHash!: string

  public get processEnabled(): boolean {
    return this.challengeModule.challengeStep === VotingActionStep.VotingAction
  }

  public get showButton(): boolean {
    return this.challengeModule.challengeStep <= VotingActionStep.VotingAction
  }

  public get isProcessing(): boolean {
    return this.challengeModule.challengeStep === VotingActionStep.VotingActionPending
  }

  public get showBlockchainMessage(): boolean {
    return this.challengeModule.challengeStep === VotingActionStep.VotingActionPending
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
      if (event.error.message.indexOf(Errors.USER_DENIED_SIGNATURE) > 0) {
        // user cancelled
        this.challengeModule.setStatus(ProcessStatus.Ready)
        this.challengeModule.setChallengeStep(VotingActionStep.VotingAction)
        return
      }

      if (event.processId === event.processId) {
        // failed submitting the transaction, i.e. pre metamask
        // TODO: handle
      } else if (event.processId === this.challengeTransactionId) {
        // failed creating datatrust task
        // TODO: handle
      }
      console.log('listing cannot be challenged!')
      this.challengeTransactionId = ''
      return this.challengeModule.setChallengeStep(VotingActionStep.Error)
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