<template>
  <div class="withdraw-unwrap-weth">
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
export default class UnwrapWETHStep extends Vue {

  public processId = ''
  public unsubscribe!: () => void

  public supportWithdrawModule =  getModule(SupportWithdrawModule, this.$store)
  public flashesModule = getModule(FlashesModule, this.$store)

  public get drawerLabel(): string {
    switch (this.supportWithdrawModule.withdrawStep) {

      case WithdrawStep.Error:
      case WithdrawStep.Withdraw:
        return `${Labels.UNWRAP_WETH}`

      case WithdrawStep.WithdrawPending:
        return `${Labels.UNWRAP_WETH}`

      default:
        return `${Labels.UNWRAP_WETH}`
    }
  }

  public get drawerStepState(): DrawerBlockchainStepState {
    switch (this.supportWithdrawModule.withdrawStep) {

      case WithdrawStep.Error:
      case WithdrawStep.UnwrapWETH:
        return DrawerBlockchainStepState.ready

      case WithdrawStep.CollectIncome:
      case WithdrawStep.CollectIncomePending:
      case WithdrawStep.Withdraw:
      case WithdrawStep.WithdrawPending:
        return DrawerBlockchainStepState.upcoming

      case WithdrawStep.UnwrapWETHPending:
        return DrawerBlockchainStepState.processing

      default:
        return DrawerBlockchainStepState.completed
    }
  }

  public get wethValue(): number {
    if (!this.supportWithdrawModule.withdrawValue) {
      return 0
    }
    return SupportWithdrawProcessModule.weiToMarketTokens(
      this.supportWithdrawModule.withdrawValue,
      this.$store)
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
      this.supportWithdrawModule.setWithdrawStep(WithdrawStep.UnwrapWETH)
      if (!event.error.message || event.error.message.indexOf(Errors.USER_DENIED_SIGNATURE) >= 0) {
        return
      }
      return this.flashesModule.append(new Flash(event.error.message, FlashType.error))
    }

    if (!!event.response && event.processId === this.processId) {
      const supportWithdrawModule = getModule(SupportWithdrawModule, this.$store)

      return supportWithdrawModule.setUnwrapWETHTransactionId(event.response.result)
    }
  }

  public async onClickCallback() {

    getModule(SupportWithdrawModule, this.$store).setWithdrawStep(WithdrawStep.UnwrapWETHPending)

    this.processId = uuid4()

    EtherTokenContractModule.withdraw(
      ethereum.selectedAddress,
      getModule(AppModule, this.$store).etherTokenBalance,
      this.processId,
      this.$store)
  }
}
</script>