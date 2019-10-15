<template>
  <div class="purchase-listing tile is-hcentered">
    <div class="purchase tile is-8">
      <ProcessButton
        :processing="isProcessing"
        :buttonText="labelText"
        :noToggle="true"
        :clickable="true"
        :clickEvent="clickEvent"
        @purchase-listing-click="onPurchaseListingClick"
        />
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
import Flash, { FlashType } from '../../models/Flash'
import { FfaDatatrustTaskType } from '../../models/DatatrustTaskDetails'

import PurchaseProcessModule from '../../functionModules/components/PurchaseProcessModule'
import TaskPollerManagerModule from '../../functionModules/components/TaskPollerManagerModule'
import DatatrustContractModule from '../../functionModules/protocol/DatatrustContractModule'
import EventableModule from '../../functionModules/eventable/EventableModule'


import { Labels } from '../../util/Constants'
import { PurchaseListingClick } from '../../models/Events'

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

  public get labelText(): string {
    return Labels.BUY_LISTING
  }

  public get clickEvent(): string {
    return PurchaseListingClick
  }

  @NoCache
  public get isProcessing(): boolean {
    return this.purchaseModule.purchaseStep === PurchaseStep.PurchasePending
  }

  public created() {
    this.$store.subscribe(this.vuexSubscriptions)
  }

  public async vuexSubscriptions(mutation: MutationPayload) {

    if (mutation.type !== 'eventModule/append') { return }
    if (!EventableModule.isEventable(mutation.payload)) { return }

    const event = mutation.payload as Eventable

    if (!!event.error) {
      return this.flashesModule.append(new Flash(mutation.payload.error, FlashType.error))
    }

    if (!!event.response && event.processId === this.purchaseProcessId) {
      const txHash = event.response.result
      return TaskPollerManagerModule.createPoller(
        txHash,
        this.purchaseModule.listing.hash,
        FfaDatatrustTaskType.buyListing,
        this.$store,
      )
    }

    if (!!event.response && event.processId === this.purchaseMinedProcessId) {
      this.purchaseModule.setPurchaseStep(PurchaseStep.Complete)
    }
  }

  public async onPurchaseListingClick() {
    const amount = PurchaseProcessModule.getPurchasePrice(this.$store)

    this.purchaseProcessId = uuid4()
    this.purchaseMinedProcessId = uuid4()
    this.purchaseModule.setPurchaseListingMinedProcessId(this.purchaseMinedProcessId)

    this.purchaseModule.setPurchaseStep(PurchaseStep.PurchasePending)

    await DatatrustContractModule.purchase(
      ethereum.selectedAddress,
      this.purchaseModule.listing.hash,
      amount,
      this.purchaseProcessId,
      this.$store)
  }

}
</script>