<template>
  <div class="purchase-listing tile is-hcentered">
    <div class="purchase tile is-8">
      <div class="indicator tile is-2">
        <ProcessButton
          :processing="isProcessing"
          :onClickCallback="onClickCallback"/>
      </div>
      <div class="label tile">
        {{ labelText }}
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

import ProcessButton from '@/components/ui/ProcessButton.vue'

import { PurchaseStep } from '../../models/PurchaseStep'
import FfaListing from '../../models/FfaListing'

import PurchaseProcessModule from '../../functionModules/components/PurchaseProcessModule'
import DatatrustContractModule from '../../functionModules/protocol/DatatrustContractModule'

import { Labels } from '../../util/Constants'

import uuid4 from 'uuid/v4'

@Component({
  components: {
    ProcessButton,
  },
})
export default class PurchaseListingStep extends Vue {

  @NoCache
  public get isProcessing(): boolean {
    const purchaseModule = getModule(PurchaseModule, this.$store)
    return purchaseModule.purchaseStep === PurchaseStep.PurchasePending
  }

  public get labelText(): string {
    return Labels.BUY_LISTING
  }

  public processId!: string

  public onClickCallback() {

    const purchaseModule = getModule(PurchaseModule, this.$store)

    const listingHash = purchaseModule.listing.hash
    const amount = PurchaseProcessModule.getPurchasePrice(this.$store)

    purchaseModule.setPurchaseStep(PurchaseStep.PurchasePending)

    DatatrustContractModule.purchase(
      ethereum.selectedAddress,
      listingHash,
      amount,
      this.processId,
      this.$store,
      {})
  }

  protected purchaseTransactionSuccess(response: any, appStore: Store<any>): any {
    const purchaseModule = getModule(PurchaseModule, this.$store)
    purchaseModule.setPurchaseListingTransactionId(response.result)
  }
}
</script>