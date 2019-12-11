<template>
  <div class="support-erc20-token">
    <div class="create-token">
      <DrawerBlockchainStep
        :label="drawerLabel"
        :state="drawerStepState"
        :onButtonClick="onClickCallback"/>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import { NoCache } from 'vue-class-decorator'
import { MutationPayload, Store } from 'vuex'
import { VuexModule, getModule } from 'vuex-module-decorators'

import AppModule from '../../vuexModules/AppModule'
import SupportWithdrawModule from '../../vuexModules/SupportWithdrawModule'
import EventModule from '../../vuexModules/EventModule'
import FlashesModule from '../../vuexModules/FlashesModule'

import { Eventable } from '../../interfaces/Eventable'

import { SupportStep } from '../../models/SupportStep'
import FfaListing from '../../models/FfaListing'
import Flash, { FlashType } from '../../models/Flash'
import { DrawerBlockchainStepState } from '../../models/DrawerBlockchainStepState'
import { FfaDatatrustTaskType } from '../../models/DatatrustTaskDetails'

import EtherTokenContractModule from '../../functionModules/protocol/EtherTokenContractModule'
import EventableModule from '../../functionModules/eventable/EventableModule'
import SupportWithdrawProcessModule from '../../functionModules/components/SupportWithdrawProcessModule'
import TaskPollerModule from '../../functionModules/task/TaskPollerModule'

import { Labels, Errors } from '../../util/Constants'

import DrawerBlockchainStep from '../ui/DrawerBlockchainStep.vue'

import uuid4 from 'uuid/v4'

@Component({
  components: {
    DrawerBlockchainStep,
  },
})
export default class SupportErc20TokenStep extends Vue {

  public processId = ''
  public unsubscribe!: () => void

  public supportWithdrawModule = getModule(SupportWithdrawModule, this.$store)
  public flashesModule = getModule(FlashesModule, this.$store)

  public get drawerLabel(): string {
    switch (this.supportWithdrawModule.supportStep) {

      case SupportStep.InsufficientETH:
      case SupportStep.WrapETH:
        return `${Labels.WRAP_ETH}`

      case SupportStep.WrapETHPending:
        return `${Labels.WRAP_ETH}`

      default:
        return `${Labels.WRAP_ETH}`
    }
  }

  public get drawerStepState(): DrawerBlockchainStepState {
    switch (this.supportWithdrawModule.supportStep) {

      case SupportStep.Error:
      case SupportStep.InsufficientETH:
      case SupportStep.WrapETH:
        return DrawerBlockchainStepState.ready

      case SupportStep.WrapETHPending:
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
      this.supportWithdrawModule.setSupportStep(SupportStep.WrapETH)
      if (!event.error.message || event.error.message.indexOf(Errors.USER_DENIED_SIGNATURE) >= 0) {
        return
      }
      return this.flashesModule.append(new Flash(event.error.message, FlashType.error))
    }

    if (!!event.response && event.processId === this.processId) {
      this.supportWithdrawModule.setErc20TokenTransactionId(event.response.result)
      return TaskPollerModule.createTaskPollerForEthereumTransaction(
        event.response.result,
        '',
        event.processId,
        FfaDatatrustTaskType.supportWrapETH,
        this.$store)
    }
  }

  public wrapEthInterceptor(): boolean {
    if (SupportWithdrawProcessModule.hasEnoughWeth(this.$store)) {
      this.supportWithdrawModule.setSupportStep(SupportStep.ApproveSpending)
      return false
    }
    return true
  }

  public onClickCallback() {

    if (SupportWithdrawProcessModule.hasEnoughWeth(this.$store)) {
      return this.supportWithdrawModule.setSupportStep(SupportStep.ApproveSpending)
    }

    this.supportWithdrawModule.setSupportStep(SupportStep.WrapETHPending)
    this.processId = uuid4()

    EtherTokenContractModule.deposit(
          ethereum.selectedAddress,
          this.supportWithdrawModule.supportValue,
          this.processId,
          this.$store)

    if (this.onButtonClick) {
      this.onButtonClick()
    }
  }
}
</script>