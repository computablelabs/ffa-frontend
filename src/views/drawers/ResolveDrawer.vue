<template>
  <div class="resolve-drawer-wrapper">
    <div class="resolve-error"
      v-if="isError">
      CHANGE ME {{ errorText }}
    </div>
    <div
      class="resolve-process"
      v-else>
      <ProcessButton
        :buttonText="labelText"
        :clickable="isReady"
        :processing="isExecuting"
        :onClickCallback="onClickCallback"
        v-if="isReady"/>

      <BlockchainExecutingMessage
        v-if="isExecuting">
        <div slot="messageSlot" class="executing-message">
          CHANGE ME Resolving
        </div>
      </BlockchainExecutingMessage>

      <DrawerMessage
        v-if="isComplete">
        <div slot="messageSlot" class="check-light-icon drawer-message">
          CHANGE ME Listing Application Resolved
        </div>
      </DrawerMessage>
    </div>
  </div>
</template>

<script lang="ts">
import { NoCache } from 'vue-class-decorator'
import { Component, Vue, Prop } from 'vue-property-decorator'
import { getModule } from 'vuex-module-decorators'
import { MutationPayload } from 'vuex'

import uuid4 from 'uuid/v4'

import AppModule from '../../vuexModules/AppModule'
import VotingModule from '../../vuexModules/VotingModule'
import DrawerModule from '../../vuexModules/DrawerModule'

import EthereumModule from '../../functionModules/ethereum/EthereumModule'
import EventableModule from '../../functionModules/eventable/EventableModule'
import TaskPollerModule from '../../functionModules/task/TaskPollerModule'
import ListingContractModule from '../../functionModules/protocol/ListingContractModule'

import { Labels, Errors } from '../../util/Constants'

import ContractAddresses from '../../models/ContractAddresses'
import { CloseDrawer, OpenDrawer, ApplicationResolved } from '../../models/Events'
import Flash, { FlashType } from '../../models/Flash'

import { Eventable } from '../../interfaces/Eventable'

import { FfaDatatrustTaskType } from '../../models/DatatrustTaskDetails'
import { ProcessStatus } from '../../models/ProcessStatus'

import BaseDrawer from './BaseDrawer.vue'
import ProcessButton from '@/components/ui/ProcessButton.vue'
import BlockchainExecutingMessage from '@/components/ui/BlockchainExecutingMessage.vue'
import DrawerMessage from '@/components/ui/DrawerMessage.vue'

// import '@/assets/style/components/resolve-drawer.sass'

@Component({
  components: {
    ProcessButton,
    BlockchainExecutingMessage,
    DrawerMessage,
  },
})
export default class ResolveDrawer extends BaseDrawer {

  public labelText = Labels.RESOLVE

  public resolveProcessId!: string
  public resolveTransactionId!: string

  public votingModule = getModule(VotingModule, this.$store)

  @Prop()
  public listingHash!: string

  @Prop()
  public resolveTaskType!: FfaDatatrustTaskType

  public get isReady(): boolean {

    return this.status === ProcessStatus.Ready
  }

  public get isExecuting(): boolean {
    return this.status === ProcessStatus.Executing
  }

  public get isComplete(): boolean {
    return this.status === ProcessStatus.Complete
  }

  public get isError(): boolean {
    return this.status === ProcessStatus.Error
  }

  public get status(): ProcessStatus {
    if (this.resolveTaskType === FfaDatatrustTaskType.resolveChallenge) {
      return this.votingModule.resolveChallengeStatus
    }
    return this.votingModule.resolveApplicationStatus
  }

  public get errorText(): string {
    return this.resolveTaskType === FfaDatatrustTaskType.resolveChallenge ?
      Errors.ERROR_RESOLVING_CHALLENGE :
      Errors.ERROR_RESOLVING_APPLICATION
  }

  public created() {
    this.$store.subscribe(this.vuexSubscriptions)
  }

  public mounted() {
    getModule(VotingModule, this.$store).resetResolveApplication()
    getModule(DrawerModule, this.$store).setDrawerOpenClass('open200')
    this.$nextTick(() => {
      this.$root.$emit(OpenDrawer)
      getModule(DrawerModule, this.$store).setDrawerCanClose(true)
    })
    console.log('ChallengeDrawer mounted')
  }

  public async vuexSubscriptions(mutation: MutationPayload) {
    if (mutation.type === 'votingModule/setResolveApplicationStatus') {
      switch (mutation.payload) {

        case ProcessStatus.Executing:
          return this.drawerModule.setDrawerCanClose(false)

        case ProcessStatus.Complete:
          this.$root.$emit(ApplicationResolved)
        default:
          return this.drawerModule.setDrawerCanClose(true)
      }
    }

    if (mutation.type !== 'eventModule/append') {
      return
    }

    if (!EventableModule.isEventable(mutation.payload)) { return }

    const event = mutation.payload as Eventable

    if (event.error) {
      if (event.processId === event.processId) {
        // failed submitting the transaction, i.e. pre metamask
        // TODO: handle
      } else if (event.processId === this.resolveTransactionId) {
        // failed creating datatrust task
        // TODO: handle
      }
      console.log('listing cannot be resolved!')
      this.resolveTransactionId = ''
      if (this.resolveTaskType === FfaDatatrustTaskType.resolveChallenge) {
        return this.votingModule.setResolveChallengeStatus(ProcessStatus.Error)
      }
      return this.votingModule.setResolveApplicationStatus(ProcessStatus.Error)
    }

    if (!event.response) {
      // TODO: handle error
    }

    if (!event.processId || event.processId === '') {
      return
    }

    if (event.processId !== this.resolveProcessId) {
      return
    }

    this.resolveProcessId = ''
    this.resolveTransactionId = event.response.result

    TaskPollerModule.createTaskPollerForEthereumTransaction(
      this.resolveTransactionId,
      this.listingHash,
      this.resolveTaskType,
      this.$store)
  }

  protected onClickCallback() {

    this.resolveProcessId = uuid4()

    if (this.resolveTaskType === FfaDatatrustTaskType.resolveChallenge) {

      this.votingModule.setResolveChallengeStatus(ProcessStatus.Executing)
      ListingContractModule.resolveChallenge(
        this.listingHash,
        ethereum.selectedAddress,
        this.resolveProcessId,
        this.$store)

    } else {

      this.votingModule.setResolveApplicationStatus(ProcessStatus.Executing)
      ListingContractModule.resolveApplication(
        this.listingHash,
        ethereum.selectedAddress,
        this.resolveProcessId,
        this.$store)
    }
  }
}
</script>
