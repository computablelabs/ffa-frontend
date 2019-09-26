<template>
  <div class="approve-spending tile is-hcentered">
    <div
      class="approve-datatrust tile is-8"
      v-if="needsApproval">
      <div class="indicator tile is-2">
        <ProcessButton
          :processing="isProcessing"
          :onClickCallback="onClickCallback"/>
      </div>
      <div class="label tile">
        {{ labelText }}
      </div>
    </div>
    <div
      class="datatrust-allowance tile is-8"
      v-else>
      <div class="indicator tile is-2"></div>
      <div class="label tile">
        {{ datatrustContractAllowance }}
      </div>
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
import PurchaseModule from '../../vuexModules/PurchaseModule'
import FlashesModule from '../../vuexModules/FlashesModule'

import ProcessButton from '@/components/ui/ProcessButton.vue'

import { Eventable } from '../../interfaces/Eventable'

import { PurchaseStep } from '../../models/PurchaseStep'
import FfaListing from '../../models/FfaListing'
import ContractsAddresses from '../../models/ContractAddresses'
import Flash, { FlashType } from '../../models/Flash'

import PurchaseProcessModule from '../../functionModules/components/PurchaseProcessModule'
import EtherTokenContractModule from '../../functionModules/protocol/EtherTokenContractModule'
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
  public get needsApproval(): boolean {
    const purchaseModule = getModule(PurchaseModule, this.$store)
    return purchaseModule.purchaseStep === PurchaseStep.ApproveSpending ||
      purchaseModule.purchaseStep === PurchaseStep.ApprovalPending
  }

  @NoCache
  public get isProcessing(): boolean {
    const purchaseModule = getModule(PurchaseModule, this.$store)
    return purchaseModule.purchaseStep === PurchaseStep.ApprovalPending
  }

  public get labelText(): string {
    return Labels.APPROVE_SPENDING
  }

  @NoCache
  public get datatrustContractAllowance(): string {
    const appModule = getModule(AppModule, this.$store)
    return `${appModule.datatrustContractAllowance}`
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

    if (!!event.response) {
      const purchaseModule = getModule(PurchaseModule, this.$store)
      return purchaseModule.setApprovePaymentTransactionId(event.response.result)
    }
  }

  public onClickCallback() {

    const purchaseModule = getModule(PurchaseModule, this.$store)

    const amount = PurchaseProcessModule.getPurchasePrice(this.$store)

    purchaseModule.setPurchaseStep(PurchaseStep.ApprovalPending)

    this.processId = uuid4()

    EtherTokenContractModule.approve(
      ethereum.selectedAddress,
      ContractsAddresses.DatatrustAddress,
      amount,
      this.processId,
      this.$store,
      {})
  }
}
</script>