<template>
  <div class="withdraw-withdrawal">
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

import ReserveContractModule from '../../functionModules/protocol/ReserveContractModule'
import EventableModule from '../../functionModules/eventable/EventableModule'

import { Labels } from '../../util/Constants'

import uuid4 from 'uuid/v4'

@Component({
  components: {
    ProcessButton,
  },
})
export default class WithdrawalStep extends Vue {

  @NoCache
  public get processEnabled(): boolean {
    return getModule(SupportWithdrawModule, this.$store).withdrawStep === WithdrawStep.Withdraw &&
      getModule(AppModule, this.$store).marketTokenBalance > 0
  }

  @NoCache
  public get isProcessing(): boolean {
    return getModule(SupportWithdrawModule, this.$store).withdrawStep === WithdrawStep.WithdrawPending
  }

  public labelText = Labels.WITHDRAW_FROM_COOPERATIVE
  public processId!: string

  public created(this: WithdrawalStep) {
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
      return getModule(FlashesModule, this.$store).append(new Flash(event.error, FlashType.error))
    }

    if (!!event.response && event.processId === this.processId) {
      return getModule(SupportWithdrawModule, this.$store).setWithdrawTransactionId(event.response.result)
    }
  }

  public onClickCallback() {

    getModule(SupportWithdrawModule, this.$store).setWithdrawStep(WithdrawStep.WithdrawPending)

    this.processId = uuid4()

    ReserveContractModule.withdraw(
      ethereum.selectedAddress,
      this.processId,
      this.$store)
  }
}
</script>