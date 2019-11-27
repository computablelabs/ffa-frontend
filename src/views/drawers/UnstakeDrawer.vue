<template>
  <div class="unstake-drawer-wrapper">
    <div class="unstake-error"
      v-if="isError">
      CHANGE ME {{ errorText }}
    </div>
    <div
      class="unstake-process"
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
          Unstaking
        </div>
      </BlockchainExecutingMessage>

      <DrawerMessage
        v-if="isComplete">
        <div slot="messageSlot" class="check-light-icon drawer-message">
          Unstake complete
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
import FlashesModule from '../../vuexModules/FlashesModule'

import EthereumModule from '../../functionModules/ethereum/EthereumModule'
import EventableModule from '../../functionModules/eventable/EventableModule'
import TaskPollerModule from '../../functionModules/task/TaskPollerModule'

import { Labels, Errors } from '../../util/Constants'

import ContractAddresses from '../../models/ContractAddresses'
import {
  CloseDrawer,
  OpenDrawer,
  Unstaked } from '../../models/Events'
import Flash, { FlashType } from '../../models/Flash'

import { Eventable } from '../../interfaces/Eventable'

import { FfaDatatrustTaskType } from '../../models/DatatrustTaskDetails'
import { ProcessStatus } from '../../models/ProcessStatus'

import BaseDrawer from './BaseDrawer.vue'
import ProcessButton from '@/components/ui/ProcessButton.vue'
import BlockchainExecutingMessage from '@/components/ui/BlockchainExecutingMessage.vue'
import DrawerMessage from '@/components/ui/DrawerMessage.vue'
import VotingContractModule from '../../functionModules/protocol/VotingContractModule'

// import '@/assets/style/components/unstake-drawer.sass'

@Component({
  components: {
    ProcessButton,
    BlockchainExecutingMessage,
    DrawerMessage,
  },
})
export default class UnstakeDrawer extends BaseDrawer {

  public labelText = Labels.UNSTAKE
  public errorText = Errors.UNSTAKE_FAILED

  public unstakeProcessId = ''
  public unstakeTransactionId = ''
  public unsubscribe!: () => void

  public votingModule = getModule(VotingModule, this.$store)
  public flashesModule = getModule(FlashesModule, this.$store)

  @Prop()
  public listingHash!: string

  @Prop()
  public unstakeTaskType!: FfaDatatrustTaskType

  public get isReady(): boolean {

    return this.votingModule.unstakeStatus === ProcessStatus.Ready
  }

  public get isExecuting(): boolean {
    return this.votingModule.unstakeStatus === ProcessStatus.Executing
  }

  public get isComplete(): boolean {
    return this.votingModule.unstakeStatus === ProcessStatus.Complete
  }

  public get isError(): boolean {
    return this.votingModule.unstakeStatus === ProcessStatus.Error
  }

  public created() {
    this.unsubscribe = this.$store.subscribe(this.vuexSubscriptions)
  }

  public mounted() {
    getModule(VotingModule, this.$store).resetUnstake()
    getModule(DrawerModule, this.$store).setDrawerOpenClass('open200')
    this.$nextTick(() => {
      this.$root.$emit(OpenDrawer)
      getModule(DrawerModule, this.$store).setDrawerCanClose(true)
    })
    console.log('UnstakeDrawer mounted')
  }

  public beforeDestroy() {
    this.unsubscribe()
  }

  public async vuexSubscriptions(mutation: MutationPayload) {
    if (mutation.type === 'votingModule/setUnstakeStatus') {

      switch (mutation.payload) {

        case ProcessStatus.Executing:
          return this.drawerModule.setDrawerCanClose(false)

        case ProcessStatus.Complete:
          return this.drawerModule.setDrawerCanClose(true)
          return this.$root.$emit(Unstaked)

        default:
          return this.drawerModule.setDrawerCanClose(true)
      }
    }

    if (mutation.type !== 'eventModule/append') {
      return
    }

    if (!EventableModule.isEventable(mutation.payload)) { return }

    const event = mutation.payload as Eventable

    if (event.processId !== this.unstakeProcessId) { return }

    if (event.error) {
      this.votingModule.resetUnstake()
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

    if (event.processId !== this.unstakeProcessId) {
      return
    }

    this.unstakeProcessId = ''
    this.unstakeTransactionId = event.response.result

    TaskPollerModule.createTaskPollerForEthereumTransaction(
      this.unstakeTransactionId,
      this.listingHash,
      event.processId,
      FfaDatatrustTaskType.unstake,
      this.$store)
  }

  protected onClickCallback() {

    this.unstakeProcessId = uuid4()
    this.votingModule.setUnstakeStatus(ProcessStatus.Executing)

    VotingContractModule.unstake(
      ethereum.selectedAddress,
      this.listingHash,
      this.unstakeProcessId,
      this.$store)
  }
}
</script>