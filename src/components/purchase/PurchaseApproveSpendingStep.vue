<template>
  <div class="purchase-approve-spending">
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
import PurchaseModule from '../../vuexModules/PurchaseModule'
import FlashesModule from '../../vuexModules/FlashesModule'

import { Eventable } from '../../interfaces/Eventable'

import { PurchaseStep } from '../../models/PurchaseStep'
import FfaListing from '../../models/FfaListing'
import ContractAddresses from '../../models/ContractAddresses'
import Flash, { FlashType } from '../../models/Flash'
import { FfaDatatrustTaskType } from '../../models/DatatrustTaskDetails'
import { DrawerBlockchainStepState } from '../../models/DrawerBlockchainStepState'

import PurchaseProcessModule from '../../functionModules/components/PurchaseProcessModule'
import TaskPollerManagerModule from '../../functionModules/components/TaskPollerManagerModule'
import EtherTokenContractModule from '../../functionModules/protocol/EtherTokenContractModule'
import EventableModule from '../../functionModules/eventable/EventableModule'
import TaskPollerModule from '../../functionModules/task/TaskPollerModule'

import { Labels, Errors } from '../../util/Constants'

import DrawerBlockchainStep from '../ui/DrawerBlockchainStep.vue'

import uuid4 from 'uuid/v4'

import '@/assets/style/components/approve-spending-step.sass'

@Component({
  components: {
    DrawerBlockchainStep,
  },
})
export default class PurchaseApproveSpendingStep extends Vue {
  public purchaseModule = getModule(PurchaseModule, this.$store)
  public appModule = getModule(AppModule, this.$store)
  public flashesModule = getModule(FlashesModule, this.$store)

  public approvalProcessId!: string
  public approvalMinedProcessId!: string

  public processId!: string
  public unsubscribe!: () => void

  public get drawerLabel(): string {
    switch (this.purchaseModule.purchaseStep) {

      case PurchaseStep.Error:
      case PurchaseStep.ApproveSpending:
        return `${Labels.APPROVE_SPENDING}`

      case PurchaseStep.ApprovalPending:
        return `${Labels.APPROVE_SPENDING}`

      default:
        return `${Labels.APPROVE_SPENDING}`
    }
  }

  public get drawerStepState(): DrawerBlockchainStepState {
    switch (this.purchaseModule.purchaseStep) {

      case PurchaseStep.Error:
      case PurchaseStep.ApproveSpending:
        return DrawerBlockchainStepState.ready

      case PurchaseStep.CreateToken:
      case PurchaseStep.TokenPending:
        return DrawerBlockchainStepState.upcoming

      case PurchaseStep.ApprovalPending:
        return DrawerBlockchainStepState.processing

      default:
        return DrawerBlockchainStepState.completed
    }
  }

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
      this.purchaseModule.setPurchaseStep(PurchaseStep.ApproveSpending)

      if (!event.error.message || event.error.message.indexOf(Errors.USER_DENIED_SIGNATURE) > 0) {
        return
      }
      return this.flashesModule.append(new Flash(event.error.message, FlashType.error))
    }

    if (!!event.response) {
      const txHash = event.response.result
      return TaskPollerModule.createTaskPollerForEthereumTransaction(
        txHash,
        event.processId,
        this.purchaseModule.listing.hash,
        FfaDatatrustTaskType.approveCET,
        this.$store,
      )
    }
  }

  public onClickCallback() {
    const amount = PurchaseProcessModule.getPurchasePrice(this.$store)

    this.approvalProcessId = uuid4()
    this.approvalMinedProcessId = uuid4()
    this.purchaseModule.setApprovalMinedProcessId(this.approvalMinedProcessId)

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