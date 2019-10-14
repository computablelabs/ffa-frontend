<template>
  <div class="support-cooperative">
    <div class="indicator">
      <ProcessButton
        :processing="isProcessing"
        :onClickCallback="onClickCallback"/>
    </div>
    <div class="label">
      {{ labelText }}
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

import ReserveContractModule from '../../functionModules/protocol/ReserveContractModule'
import EventableModule from '../../functionModules/eventable/EventableModule'

import { Labels } from '../../util/Constants'

import uuid4 from 'uuid/v4'

@Component({
  components: {
    ProcessButton,
  },
})
export default class ApproveSpendingStep extends Vue {

  @NoCache
  public get isProcessing(): boolean {
    const supportWithdrawModule = getModule(SupportWithdrawModule, this.$store)
    return supportWithdrawModule.supportStep === SupportStep.SupportPending
  }

  public get labelText(): string {
    return Labels.APPROVE_SPENDING
  }

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
      return supportWithdrawModule.setSupportCollectiveTransactionId(event.response.result)
    }
  }

  public onClickCallback() {

    const supportWithdrawModule = getModule(SupportWithdrawModule, this.$store)

    supportWithdrawModule.setSupportStep(SupportStep.ApprovalPending)

    this.processId = uuid4()

    ReserveContractModule.support(
      ethereum.selectedAddress,
      supportWithdrawModule.supportValue,
      this.processId,
      this.$store)
  }
}
</script>