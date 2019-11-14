<template>
  <div class="resolve-drawer-wrapper">
    <div class="resolve-error"
      v-if="isError">
      CHANGE ME {{ errorText }}
    </div>
    <div
      class="resolve-process"
      v-else>

      <DrawerBlockchainStep
        :label="drawerLabel"
        :state="drawerStepState"
        :onButtonClick="onClickCallback"/>
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
import {
  CloseDrawer,
  OpenDrawer,
  ApplicationResolved,
  ChallengeResolved } from '../../models/Events'
import Flash, { FlashType } from '../../models/Flash'
import { DrawerBlockchainStepState } from '../../models/DrawerBlockchainStepState'

import { Eventable } from '../../interfaces/Eventable'

import { FfaDatatrustTaskType } from '../../models/DatatrustTaskDetails'
import { ProcessStatus } from '../../models/ProcessStatus'

import BaseDrawer from './BaseDrawer.vue'
import DrawerBlockchainStep from '../../components/ui/DrawerBlockchainStep.vue'

// import '@/assets/style/components/resolve-drawer.sass'

@Component({
  components: {
    DrawerBlockchainStep,
  },
})
export default class ResolveDrawer extends BaseDrawer {

  public resolveProcessId!: string
  public resolveTransactionId!: string
  public unsubscribe!: () => void

  public votingModule = getModule(VotingModule, this.$store)

  @Prop()
  public listingHash!: string

  @Prop()
  public resolveTaskType!: FfaDatatrustTaskType

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

  public get labelText(): string {
    return this.resolveTaskType === FfaDatatrustTaskType.resolveChallenge ?
      this.resolveChallengeText :
      this.resolveApplicationText
  }

  public get resolveChallengeText(): string {
    return Labels.RESOLVE_CHALLENGE
  }

  public get resolveApplicationText(): string {
    return Labels.RESOLVE_APPLICATION
  }

  public get drawerLabel(): string {
    switch (this.status) {

      case ProcessStatus.Error:
      case ProcessStatus.Ready:
        return `CHANGE ME ${this.labelText}`

      case ProcessStatus.Executing:
        return `CHANGE ME ${this.labelText}`

      default:
        return `CHANGE ME ${this.labelText}`
    }
  }

  public get drawerStepState(): DrawerBlockchainStepState {
    switch (this.status) {

      case ProcessStatus.Error:
      case ProcessStatus.Ready:
        return DrawerBlockchainStepState.ready

      case ProcessStatus.Executing:
        return DrawerBlockchainStepState.processing

      default:
        return DrawerBlockchainStepState.completed
    }
  }

  public created() {
    this.unsubscribe = this.$store.subscribe(this.vuexSubscriptions)
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

  public beforeDestroy() {
    this.unsubscribe()
  }

  public async vuexSubscriptions(mutation: MutationPayload) {
    if (mutation.type === 'votingModule/setResolveApplicationStatus' ||
      mutation.type === 'votingModule/setResolveApplicationStatus') {

      switch (mutation.payload) {

        case ProcessStatus.Executing:
          return this.drawerModule.setDrawerCanClose(false)

        case ProcessStatus.Complete:
          return this.drawerModule.setDrawerCanClose(true)
          if (mutation.type === 'votingModule/setResolveApplicationStatus') {
            return this.$root.$emit(ApplicationResolved)
          }
          return this.$root.$emit(ChallengeResolved)

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
      if (event.error.message.indexOf(Errors.USER_DENIED_SIGNATURE) > 0) {
        if (this.resolveTaskType === FfaDatatrustTaskType.resolveChallenge) {
          return this.votingModule.setResolveChallengeStatus(ProcessStatus.Ready)
        }
        return this.votingModule.setResolveApplicationStatus(ProcessStatus.Ready)
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