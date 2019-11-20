<template>
  <div class="support-cooperative">
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
export default class SupportCooperativeStep extends Vue {

  public processId = ''
  public unsubscribe!: () => void

  public get drawerLabel(): string {
    switch (this.supportWithdrawModule.supportStep) {

      case SupportStep.Error:
      case SupportStep.Support:
        return `${Labels.SUPPORT_COOPERATIVE}`

      case SupportStep.SupportPending:
        return `${Labels.SUPPORT_COOPERATIVE}`

      default:
        return `${Labels.SUPPORT_COOPERATIVE}`
    }
  }

  public get drawerStepState(): DrawerBlockchainStepState {
    switch (this.supportWithdrawModule.supportStep) {

      case SupportStep.Error:
      case SupportStep.InsufficientETH:
      case SupportStep.Support:
        return DrawerBlockchainStepState.ready

      case SupportStep.WrapETH:
      case SupportStep.WrapETHPending:
      case SupportStep.ApproveSpending:
      case SupportStep.ApprovalPending:
        return DrawerBlockchainStepState.upcoming

      case SupportStep.SupportPending:
        return DrawerBlockchainStepState.processing

      default:
        return DrawerBlockchainStepState.completed
    }
  }

  @Prop()
  public ethValue!: number

  @Prop()
  public onButtonClick!: () => void

  protected supportWithdrawModule = getModule(SupportWithdrawModule, this.$store)
  protected flashesModule = getModule(FlashesModule, this.$store)

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
        return this.supportWithdrawModule.setSupportStep(SupportStep.Support)

      } else {
        this.supportWithdrawModule.setSupportStep(SupportStep.Error)
        return this.flashesModule.append(new Flash(mutation.payload.error, FlashType.error))
      }
    }

    if (!!event.response && event.processId === this.processId) {
      const supportWithdrawModule = getModule(SupportWithdrawModule, this.$store)
      return supportWithdrawModule.setSupportCollectiveTransactionId(event.response.result)
    }
  }

  public onClickCallback() {

    const supportWithdrawModule = getModule(SupportWithdrawModule, this.$store)

    supportWithdrawModule.setSupportStep(SupportStep.SupportPending)
    this.processId = uuid4()

    ReserveContractModule.support(
      ethereum.selectedAddress,
      supportWithdrawModule.supportValue,
      this.processId,
      this.$store)

    if (this.onButtonClick) {
      this.onButtonClick()
    }
  }
}
</script>