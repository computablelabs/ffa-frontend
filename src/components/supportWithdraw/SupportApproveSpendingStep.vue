<template>
  <div class="support-approve-spending">
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

import { SupportStep } from '../../models/SupportStep'
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
export default class SupportApproveSpendingStep extends Vue {

  @NoCache
  public get processEnabled(): boolean {
    return getModule(SupportWithdrawModule, this.$store).supportStep === SupportStep.ApproveSpending
  }

  @NoCache
  public get isProcessing(): boolean {
    return getModule(SupportWithdrawModule, this.$store).supportStep === SupportStep.ApprovalPending
  }

  @NoCache
  public get datatrustContractAllowance(): string {
    return `${getModule(AppModule, this.$store).datatrustContractAllowance}`
  }

  public processId!: string
  public labelText = Labels.APPROVE_SPENDING

  public created(this: SupportApproveSpendingStep) {
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
      return supportWithdrawModule.setApprovePaymentTransactionId(event.response.result)
    }
  }

  public onClickCallback() {

    const supportWithdrawModule = getModule(SupportWithdrawModule, this.$store)

    supportWithdrawModule.setSupportStep(SupportStep.ApprovalPending)

    this.processId = uuid4()

    EtherTokenContractModule.approve(
      ethereum.selectedAddress,
      ContractsAddresses.ReserveAddress,
      supportWithdrawModule.supportValue,
      this.processId,
      this.$store)
  }
}
</script>