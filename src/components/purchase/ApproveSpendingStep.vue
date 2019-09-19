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

import ProcessButton from '@/components/ui/ProcessButton.vue'

import { PurchaseStep } from '../../models/PurchaseStep'
import FfaListing from '../../models/FfaListing'

import PurchaseProcessModule from '../../functionModules/components/PurchaseProcessModule'
import EtherTokenContractModule from '../../functionModules/protocol/EtherTokenContractModule'

import { Labels } from '../../util/Constants'
import ContractsAddresses from '../../models/ContractAddresses'

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

  public onClickCallback() {

    const purchaseModule = getModule(PurchaseModule, this.$store)

    const amount = PurchaseProcessModule.getPurchasePrice(this.$store)

    purchaseModule.setPurchaseStep(PurchaseStep.ApprovalPending)

    EtherTokenContractModule.approve(
      ethereum.selectedAddress,
      ContractsAddresses.DatatrustAddress,
      amount,
      this.$store,
      this.approvalTransactionSuccess,
      {})
  }

  protected approvalTransactionSuccess(response: any, appStore: Store<any>): any {
    const purchaseModule = getModule(PurchaseModule, this.$store)
    purchaseModule.setApprovePaymentTransactionId(response.result)
  }
}
</script>