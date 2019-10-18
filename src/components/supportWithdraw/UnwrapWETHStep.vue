<template>
  <div class="withdraw-unwrap-weth">
    <div class="indicator">
      <ProcessButton
        :buttonText="labelText"
        :clickable="processEnabled"
        :processing="isProcessing"
        :onClickCallback="onClickCallback"/>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import { NoCache } from 'vue-class-decorator'
import { MutationPayload, Store } from 'vuex'
import { VuexModule, getModule } from 'vuex-module-decorators'

import AppModule from '../../vuexModules/AppModule'
import Web3Module from '../../vuexModules/Web3Module'
import SupportWithdrawModule from '../../vuexModules/SupportWithdrawModule'
import FlashesModule from '../../vuexModules/FlashesModule'

import ProcessButton from '@/components/ui/ProcessButton.vue'

import { Eventable } from '../../interfaces/Eventable'

import { WithdrawStep } from '../../models/WithdrawStep'
import FfaListing from '../../models/FfaListing'
import ContractsAddresses from '../../models/ContractAddresses'
import Flash, { FlashType } from '../../models/Flash'

import EtherTokenContractModule from '../../functionModules/protocol/EtherTokenContractModule'
import EventableModule from '../../functionModules/eventable/EventableModule'

import { Labels } from '../../util/Constants'

import uuid4 from 'uuid/v4'

@Component({
  components: {
    ProcessButton,
  },
})
export default class UnwrapWETHStep extends Vue {

  @NoCache
  public get processEnabled(): boolean {
    return getModule(SupportWithdrawModule, this.$store).withdrawStep === WithdrawStep.UnwrapWETH &&
      getModule(AppModule, this.$store).etherTokenBalance > 0
  }

  @NoCache
  public get isProcessing(): boolean {
    return getModule(SupportWithdrawModule, this.$store).withdrawStep === WithdrawStep.UnwrapWETHPending
  }

  public labelText = Labels.UNWRAP_WETH
  public processId!: string

  public created(this: ApproveSpendingStep) {
    this.$store.subscribe(this.vuexSubscriptions)
  }

  public vuexSubscriptions(mutation: MutationPayload) {

    if (mutation.type !== 'eventModule/append') {
      return
    }

    if (!EventableModule.isEventable(mutation.payload)) {
      return
    }

    const event = mutation.payload as Eventable

    if (!!event.error) {
      const flashesModule = getModule(FlashesModule, this.$store)
      return flashesModule.append(new Flash(event.error, FlashType.error))
    }

    if (!!event.response && event.processId === this.processId) {
      const supportWithdrawModule = getModule(SupportWithdrawModule, this.$store)

      return supportWithdrawModule.setUnwrapWETHTransactionId(event.response.result)
    }
  }

  public async onClickCallback() {

    getModule(SupportWithdrawModule, this.$store).setWithdrawStep(WithdrawStep.UnwrapWETHPending)

    this.processId = uuid4()
    console.log(getModule(AppModule, this.$store).etherTokenBalance)
    debugger
    EtherTokenContractModule.withdraw(
      ethereum.selectedAddress,
      getModule(AppModule, this.$store).etherTokenBalance,
      this.processId,
      this.$store)
  }
}
</script>