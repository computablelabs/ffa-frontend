<template>
  <div>
    <div class="voting-button-container">
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
    <textarea
      :placeholder="placeholder"
      class="comment-box"></textarea>
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

import TaskPollerManagerModule from '../../functionModules/components/TaskPollerManagerModule'
import EventableModule from '../../functionModules/eventable/EventableModule'

import { Eventable } from '../../interfaces/Eventable'

import Flash, { FlashType } from '../../models/Flash'
import { ProcessStatus } from '../../models/ProcessStatus'
import DatatrustTaskDetails, { FfaDatatrustTaskType } from '../../models/DatatrustTaskDetails'
import DatatrustTask from '../../models/DatatrustTask'
import { VotingActionStep } from '../../models/VotingActionStep'

import VotingContractModule from '../../functionModules/protocol/VotingContractModule'

import { Placeholders, Labels } from '../../util/Constants'

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
export default class CastVoteStep extends Vue {

  public placeholder = Placeholders.COMMENT

  public voteLabel = Labels.VOTE
  public accept = Labels.ACCEPT
  public reject = Labels.REJECT
  public blockchainMiningMessage = 'CHANGE ME voting'

  public votingProcessId!: string
  public votingTransactionId!: string

  public appModule: AppModule = getModule(AppModule, this.$store)
  public votingModule: VotingModule = getModule(VotingModule, this.$store)
  public flashesModule: FlashesModule = getModule(FlashesModule, this.$store)

  @Prop()
  public listingHash!: string

  public get showBlockchainMessage(): boolean {
    return this.votingModule.votingStep === VotingActionStep.VotingActionPending
  }

  public get disabled(): any {
    return this.votingModule.votingStep === VotingActionStep.VotingActionPending ? 'disabled' : false
  }

  public created() {
    this.$store.subscribe(this.vuexSubscriptions)
  }

  public async vuexSubscriptions(mutation: MutationPayload) {

    if (mutation.type !== 'eventModule/append') {
      return
    }

    if (!EventableModule.isEventable(mutation.payload)) { return }

    const event = mutation.payload as Eventable

    if (event.error) {
      if (event.processId === event.processId) {
        // failed submitting the transaction, i.e. pre metamask
        // TODO: handle
      } else if (event.processId === this.votingTransactionId) {
        // failed creating datatrust task
        // TODO: handle
      }
      console.log('listing cannot be challenged!')
      this.votingTransactionId = ''
      return this.votingModule.setVotingStep(VotingActionStep.Error)
      // return this.flashesModule.append(new Flash(mutation.payload.error, FlashType.error))
    }

    if (!event.response) {
      // TODO: handle error
    }

    if (!event.processId || event.processId === '') {
      return
    }

    if (event.processId !== this.votingProcessId) {
      return
    }

    this.votingProcessId = ''
    this.votingTransactionId = event.response.result

    TaskPollerManagerModule.createPoller(
      this.votingTransactionId,
      this.listingHash,
      FfaDatatrustTaskType.voteListing,
      this.$store)
  }

  protected async onVotingButtonClick(votesYes: boolean) {

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
