<template>
  <div class="purchase-listing tile is-hcentered">
    <div class="purchase tile is-8">
      <ProcessButton
        :processing="isProcessing"
        :buttonText="labelText"
        :noToggle="true"
        :clickable="notPurchased"
        :onClickCallback="onPurchaseListingClick" />
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
import Flash, { FlashType } from '../../models/Flash'
import { FfaDatatrustTaskType } from '../../models/DatatrustTaskDetails'
import { ProcessStatus } from '../../models/ProcessStatus'

import PurchaseProcessModule from '../../functionModules/components/PurchaseProcessModule'
import TaskPollerManagerModule from '../../functionModules/components/TaskPollerManagerModule'
import DatatrustContractModule from '../../functionModules/protocol/DatatrustContractModule'
import EventableModule from '../../functionModules/eventable/EventableModule'
import DatatrustModule from '../../functionModules/datatrust/DatatrustModule'
import TaskPollerModule from '../../functionModules/task/TaskPollerModule'

import { Labels, Errors } from '../../util/Constants'

import uuid4 from 'uuid/v4'

import '@/assets/style/components/purchase-listing-step.sass'

@Component({
  components: {
    ProcessButton,
  },
})
export default class PurchaseListingStep extends Vue {

  public purchaseModule = getModule(PurchaseModule, this.$store)
  public flashesModule = getModule(FlashesModule, this.$store)
  public appModule = getModule(AppModule, this.$store)

  public purchaseProcessId!: string
  public purchaseMinedProcessId!: string

  public unsubscribe!: () => void

  public get labelText(): string {
    return Labels.BUY_LISTING
  }

  public get notPurchased(): boolean {
    return this.purchaseModule.purchaseStep !== PurchaseStep.Complete
  }

  @NoCache
  public get isProcessing(): boolean {
    return this.purchaseModule.purchaseStep === PurchaseStep.PurchasePending
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
      if (event.error.message.indexOf(Errors.USER_DENIED_SIGNATURE) > 0) {
        return this.purchaseModule.setPurchaseStep(PurchaseStep.PurchaseListing)
      }

      this.purchaseModule.setPurchaseStep(PurchaseStep.Error)
      return this.flashesModule.append(new Flash(mutation.payload.error, FlashType.error))
    }

    if (!!event.response) {
      const txHash = event.response.result
      return TaskPollerModule.createTaskPollerForEthereumTransaction(
        txHash,
        this.purchaseModule.listing.hash,
        FfaDatatrustTaskType.buyListing,
        this.$store,
      )
    }
  }

  public async onPurchaseListingClick() {
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
