<template>
  <div class="support-approve-spending">
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

import { SupportStep } from '../../models/SupportStep'
import FfaListing from '../../models/FfaListing'
import ContractAddresses from '../../models/ContractAddresses'
import Flash, { FlashType } from '../../models/Flash'
import { DrawerBlockchainStepState } from '../../models/DrawerBlockchainStepState'

import EtherTokenContractModule from '../../functionModules/protocol/EtherTokenContractModule'
import EventableModule from '../../functionModules/eventable/EventableModule'
import SupportWithdrawProcessModule from '../../functionModules/components/SupportWithdrawProcessModule'

import { Labels, Errors } from '../../util/Constants'

import DrawerBlockchainStep from '../ui/DrawerBlockchainStep.vue'

import uuid4 from 'uuid/v4'

@Component({
  components: {
    DrawerBlockchainStep,
  },
})
export default class SupportApproveSpendingStep extends Vue {

  public processId!: string
  public unsubscribe!: () => void

  public supportWithdrawModule =  getModule(SupportWithdrawModule, this.$store)
  public flashesModule = getModule(FlashesModule, this.$store)

  public get drawerLabel(): string {
    switch (this.supportWithdrawModule.supportStep) {

      case SupportStep.Error:
      case SupportStep.ApproveSpending:
        return `CHANGE ME ${Labels.APPROVE_SPENDING}`

      case SupportStep.ApprovalPending:
        return `CHANGE ME ${Labels.APPROVE_SPENDING}`

      default:
        return `CHANGE ME ${Labels.APPROVE_SPENDING}`
    }
  }

  public get drawerStepState(): DrawerBlockchainStepState {
    switch (this.supportWithdrawModule.supportStep) {

      case SupportStep.InsufficientETH:
      case SupportStep.ApproveSpending:
        return DrawerBlockchainStepState.ready

      case SupportStep.WrapETH:
      case SupportStep.WrapETHPending:
        return DrawerBlockchainStepState.upcoming

      case SupportStep.ApprovalPending:
        return DrawerBlockchainStepState.processing

      default:
        return DrawerBlockchainStepState.completed
    }
  }

  @Prop()
  public ethValue!: number

  @Prop()
  public onButtonClick!: () => void

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
      if (event.error.message.indexOf(Errors.USER_DENIED_SIGNATURE) > 0) {
        return this.supportWithdrawModule.setSupportStep(SupportStep.ApproveSpending)

      } else {
        this.supportWithdrawModule.setSupportStep(SupportStep.Error)
        return this.flashesModule.append(new Flash(mutation.payload.error, FlashType.error))
      }
    }

    if (!!event.response && event.processId === this.processId) {
      return this.supportWithdrawModule.setApprovePaymentTransactionId(event.response.result)
    }
  }

  public onClickCallback() {

    if (SupportWithdrawProcessModule.hasEnoughReserveApproval(this.$store)) {
      return this.supportWithdrawModule.setSupportStep(SupportStep.Support)
    }

    this.supportWithdrawModule.setSupportStep(SupportStep.ApprovalPending)
    this.processId = uuid4()

    EtherTokenContractModule.approve(
      ethereum.selectedAddress,
      ContractAddresses.ReserveAddress!,
      this.supportWithdrawModule.supportValue,
      this.processId,
      this.$store)

    if (this.onButtonClick) {
      this.onButtonClick()
    }
  }
}
</script>