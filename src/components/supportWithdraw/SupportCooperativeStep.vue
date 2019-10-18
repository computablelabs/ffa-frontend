<template>
  <div class="support-cooperative">
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

import ReserveContractModule from '../../functionModules/protocol/ReserveContractModule'
import EventableModule from '../../functionModules/eventable/EventableModule'

import { Labels } from '../../util/Constants'

import uuid4 from 'uuid/v4'

@Component({
  components: {
    ProcessButton,
  },
})
export default class SupportCooperativeStep extends Vue {

  @NoCache
  public get processEnabled(): boolean {
    return getModule(SupportWithdrawModule, this.$store).supportStep === SupportStep.Support
  }

  @NoCache
  public get isProcessing(): boolean {
    return getModule(SupportWithdrawModule, this.$store).supportStep === SupportStep.SupportPending
  }

  public processId!: string
  public labelText = Labels.SUPPORT_COOPERATIVE

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

    supportWithdrawModule.setSupportStep(SupportStep.SupportPending)

    this.processId = uuid4()
    console.log(`supporting with ${supportWithdrawModule.supportValue} wei`)
    ReserveContractModule.support(
      ethereum.selectedAddress,
      supportWithdrawModule.supportValue,
      this.processId,
      this.$store)
  }
}
</script>