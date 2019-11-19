<template>
  <div class="withdraw-withdrawal">
    <DrawerBlockchainStep
      :label="drawerLabel"
      :state="drawerStepState"
      :onButtonClick="onClickCallback"/>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import { NoCache } from 'vue-class-decorator'
import { MutationPayload, Store } from 'vuex'
import { VuexModule, getModule } from 'vuex-module-decorators'

import AppModule from '../../vuexModules/AppModule'
import SupportWithdrawModule from '../../vuexModules/SupportWithdrawModule'
import FlashesModule from '../../vuexModules/FlashesModule'

import { Eventable } from '../../interfaces/Eventable'

import { WithdrawStep } from '../../models/WithdrawStep'
import FfaListing from '../../models/FfaListing'
import ContractAddresses from '../../models/ContractAddresses'
import Flash, { FlashType } from '../../models/Flash'
import { DrawerBlockchainStepState } from '../../models/DrawerBlockchainStepState'

import ReserveContractModule from '../../functionModules/protocol/ReserveContractModule'
import EventableModule from '../../functionModules/eventable/EventableModule'

import { Labels, Errors } from '../../util/Constants'

import DrawerBlockchainStep from '../ui/DrawerBlockchainStep.vue'

import uuid4 from 'uuid/v4'

@Component({
  components: {
    DrawerBlockchainStep,
  },
})
export default class WithdrawalStep extends Vue {

  public processId = ''
  public unsubscribe!: () => void

  public supportWithdrawModule =  getModule(SupportWithdrawModule, this.$store)
  public flashesModule = getModule(FlashesModule, this.$store)

  public get drawerLabel(): string {
    switch (this.supportWithdrawModule.withdrawStep) {

      case WithdrawStep.Error:
      case WithdrawStep.Withdraw:
        return `${Labels.START_WITHDRAWAL}`

      case WithdrawStep.WithdrawPending:
        return `${Labels.START_WITHDRAWAL}`

      default:
        return `${Labels.START_WITHDRAWAL}`
    }
  }

  public get drawerStepState(): DrawerBlockchainStepState {
    switch (this.supportWithdrawModule.withdrawStep) {

      case WithdrawStep.Error:
      case WithdrawStep.Withdraw:
        return DrawerBlockchainStepState.ready

      case WithdrawStep.CollectIncome:
      case WithdrawStep.CollectIncomePending:
        return DrawerBlockchainStepState.upcoming

      case WithdrawStep.WithdrawPending:
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

  public vuexSubscriptions(mutation: MutationPayload) {

    if (mutation.type !== 'eventModule/append') {
      return
    }

    if (!EventableModule.isEventable(mutation.payload)) {
      return
    }

    const event = mutation.payload as Eventable

    if (event.processId !== this.processId) {
      return
    }

    if (event.error) {
      if (event.error.message.indexOf(Errors.USER_DENIED_SIGNATURE) >= 0) {
        return this.supportWithdrawModule.setWithdrawStep(WithdrawStep.Withdraw)

      } else {
        this.supportWithdrawModule.setWithdrawStep(WithdrawStep.Error)
        return this.flashesModule.append(new Flash(mutation.payload.error, FlashType.error))
      }
    }

    if (!!event.response && event.processId === this.processId) {
      return this.supportWithdrawModule.setWithdrawTransactionId(event.response.result)
    }
  }

  public onClickCallback() {
    const appModule = getModule(AppModule, this.$store)

    this.supportWithdrawModule.setWithdrawValue(appModule.marketTokenBalance)
    this.supportWithdrawModule.setWithdrawStep(WithdrawStep.WithdrawPending)

    this.processId = uuid4()

    ReserveContractModule.withdraw(
      ethereum.selectedAddress,
      this.processId,
      this.$store)
  }
}
</script>