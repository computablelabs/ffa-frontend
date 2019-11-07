<template>
  <div class="approve-spending tile is-hcentered">
    <div class="approve-datatrust tile is-8">
      <ProcessButton
        :processing="isProcessing"
        :buttonText="labelText"
        :noToggle="true"
        :clickable="needsApproval"
        :onClickCallback="onApproveSpendingClick" />
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import { NoCache } from 'vue-class-decorator'
import { MutationPayload, Store } from 'vuex'
import { VuexModule, getModule } from 'vuex-module-decorators'

import AppModule from '../../vuexModules/AppModule'
import PurchaseModule from '../../vuexModules/PurchaseModule'
import FlashesModule from '../../vuexModules/FlashesModule'

import ProcessButton from '@/components/ui/ProcessButton.vue'

import { Eventable } from '../../interfaces/Eventable'

import { PurchaseStep } from '../../models/PurchaseStep'
import FfaListing from '../../models/FfaListing'
import ContractAddresses from '../../models/ContractAddresses'
import Flash, { FlashType } from '../../models/Flash'
import { FfaDatatrustTaskType } from '../../models/DatatrustTaskDetails'

import PurchaseProcessModule from '../../functionModules/components/PurchaseProcessModule'
import TaskPollerManagerModule from '../../functionModules/components/TaskPollerManagerModule'
import EtherTokenContractModule from '../../functionModules/protocol/EtherTokenContractModule'
import EventableModule from '../../functionModules/eventable/EventableModule'

import { Labels, Errors } from '../../util/Constants'

import uuid4 from 'uuid/v4'

import '@/assets/style/components/approve-spending-step.sass'

@Component({
  components: {
    ProcessButton,
  },
})
export default class PurchaseApproveSpendingStep extends Vue {
  public purchaseModule = getModule(PurchaseModule, this.$store)
  public appModule = getModule(AppModule, this.$store)
  public flashesModule = getModule(FlashesModule, this.$store)

  public approvalProcessId!: string
  public approvalMinedProcessId!: string

  @NoCache
  public get needsApproval(): boolean {
    return this.purchaseModule.purchaseStep === PurchaseStep.ApproveSpending ||
      this.purchaseModule.purchaseStep === PurchaseStep.ApprovalPending
  }

  @NoCache
  public get isProcessing(): boolean {
    return this.purchaseModule.purchaseStep === PurchaseStep.ApprovalPending
  }

  public get labelText(): string {
    return Labels.APPROVE_SPENDING
  }

  @NoCache
  public get datatrustContractAllowance(): string {
    return `${this.appModule.datatrustContractAllowance}`
  }

  public processId!: string
  public unsubscribe!: () => void

  public created() {
    this.unsubscribe = this.$store.subscribe(this.vuexSubscriptions)
  }

  public beforeDestroy() {
    this.unsubscribe()
  }

  public async vuexSubscriptions(mutation: MutationPayload) {

    if (mutation.type !== 'eventModule/append') { return }

    if (!EventableModule.isEventable(mutation.payload)) { return }

    const event = mutation.payload as Eventable

    if (event.processId !== this.approvalProcessId) { return }

    if (!!event.error) {
      if (event.error.message.indexOf(Errors.USER_DENIED_SIGNATURE) > 0) {
        return this.purchaseModule.setPurchaseStep(PurchaseStep.ApproveSpending)
      } 
      this.purchaseModule.setPurchaseStep(PurchaseStep.Error)
      return this.flashesModule.append(new Flash(mutation.payload.error, FlashType.error))
    }

    if (!!event.response) {
      const txHash = event.response.result
      return TaskPollerManagerModule.createPoller(
        txHash,
        this.purchaseModule.listing.hash,
        FfaDatatrustTaskType.approveCET,
        this.$store,
      )
    }
  }

  public onApproveSpendingClick() {
    const amount = PurchaseProcessModule.getPurchasePrice(this.$store)

    this.approvalProcessId = uuid4()
    this.purchaseModule.setApprovalMinedProcessId(this.approvalMinedProcessId)

    this.purchaseModule.setPurchaseStep(PurchaseStep.ApprovalPending)

    EtherTokenContractModule.approve(
      ethereum.selectedAddress,
      ContractAddresses.DatatrustAddress!,
      amount,
      this.approvalProcessId,
      this.$store,
    )

    this.purchaseModule.setPurchaseStep(PurchaseStep.ApprovalPending)
  }
}
</script>