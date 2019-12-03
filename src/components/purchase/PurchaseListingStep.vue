<template>
  <div class="purchase-listing">
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
import Flash, { FlashType } from '../../models/Flash'
import { FfaDatatrustTaskType } from '../../models/DatatrustTaskDetails'
import { ProcessStatus } from '../../models/ProcessStatus'
import { DrawerBlockchainStepState } from '../../models/DrawerBlockchainStepState'

import PurchaseProcessModule from '../../functionModules/components/PurchaseProcessModule'
import TaskPollerManagerModule from '../../functionModules/components/TaskPollerManagerModule'
import DatatrustContractModule from '../../functionModules/protocol/DatatrustContractModule'
import EventableModule from '../../functionModules/eventable/EventableModule'
import DatatrustModule from '../../functionModules/datatrust/DatatrustModule'
import TaskPollerModule from '../../functionModules/task/TaskPollerModule'

import { Labels, Errors } from '../../util/Constants'

import DrawerBlockchainStep from '../ui/DrawerBlockchainStep.vue'

import uuid4 from 'uuid/v4'

import '@/assets/style/components/purchase-listing-step.sass'

@Component({
  components: {
    DrawerBlockchainStep,
  },
})
export default class PurchaseListingStep extends Vue {

  public purchaseModule = getModule(PurchaseModule, this.$store)
  public flashesModule = getModule(FlashesModule, this.$store)
  public appModule = getModule(AppModule, this.$store)

  public purchaseProcessId = ''
  public purchaseMinedProcessId = ''

  public unsubscribe!: () => void

  public get drawerLabel(): string {
    switch (this.purchaseModule.purchaseStep) {

      case PurchaseStep.Error:
      case PurchaseStep.PurchaseListing:
        return `${Labels.PURCHASE}`

      case PurchaseStep.PurchasePending:
        return `${Labels.PURCHASE}`

      default:
        return `${Labels.PURCHASE}`
    }
  }

  public get drawerStepState(): DrawerBlockchainStepState {
    switch (this.purchaseModule.purchaseStep) {

      case PurchaseStep.Error:
      case PurchaseStep.PurchaseListing:
        return DrawerBlockchainStepState.ready

      case PurchaseStep.CreateToken:
      case PurchaseStep.TokenPending:
      case PurchaseStep.ApproveSpending:
      case PurchaseStep.ApprovalPending:
        return DrawerBlockchainStepState.upcoming

      case PurchaseStep.PurchasePending:
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

    if (event.processId !== this.purchaseProcessId) { return }

    if (!!event.error) {
      this.purchaseModule.setPurchaseStep(PurchaseStep.PurchaseListing)
      if (!event.error.message || event.error.message.indexOf(Errors.USER_DENIED_SIGNATURE) >= 0) {
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
        FfaDatatrustTaskType.buyListing,
        this.$store,
      )
    }
  }

  public async onClickCallback() {
    this.purchaseProcessId = uuid4()
    this.purchaseMinedProcessId = uuid4()
    this.purchaseModule.setPurchaseListingMinedProcessId(this.purchaseMinedProcessId)

    this.purchaseModule.setPurchaseStep(PurchaseStep.PurchasePending)

    const deliveryHash = DatatrustModule.generateDeliveryHash(
      this.purchaseModule.listing.hash,
      this.$store,
    )

    await DatatrustContractModule.purchase(
      ethereum.selectedAddress,
      deliveryHash,
      this.purchaseModule.listing.size,
      this.purchaseProcessId,
      this.$store,
    )
  }
}
</script>
