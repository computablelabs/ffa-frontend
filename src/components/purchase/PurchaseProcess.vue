<template>
  <div class="purchase-process tile is-vertical is-ancestor">
    <Erc20TokenStep />
    <ApproveSpendingStep />
    <PurchaseListingStep />
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { NoCache } from 'vue-class-decorator'
import { getModule } from 'vuex-module-decorators'
import { MutationPayload } from 'vuex'

import DrawerModule, { DrawerState } from '../../vuexModules/DrawerModule'
import Web3Module from '../../vuexModules/Web3Module'
import PurchaseModule from '../../vuexModules/PurchaseModule'

import Status from '@/components/ui/Status.vue'
import DrawerMessage from '@/components/ui/DrawerMessage.vue'
import Erc20TokenStep from '@/components/purchase/Erc20TokenStep.vue'
import ApproveSpendingStep from '@/components/purchase/ApproveSpendingStep.vue'
import PurchaseListingStep from '@/components/purchase/PurchaseListingStep.vue'

import { ProcessStatus, ProcessStatusLabelMap } from '../../models/ProcessStatus'
import { PurchaseStep } from '../../models/PurchaseStep'
import FfaListing from '../../models/FfaListing'

import FfaProcessModule from '../../interfaces/vuex/FfaProcessModule'

import PurchaseProcessModule from '../../functionModules/components/PurchaseProcessModule'

import { Messages, Errors } from '../../util/Constants'

const appVuexModule = 'appModule'

@Component({
  components: {
    Erc20TokenStep,
    ApproveSpendingStep,
    PurchaseListingStep,
  },
})
export default class PurchaseProcess extends Vue {
  public purchaseModule = getModule(PurchaseModule, this.$store)

  @Prop()
  public listing?: FfaListing

  public get purchaseStep(): PurchaseStep {
    return this.purchaseModule.purchaseStep
  }

  public get isProcessingToken(): boolean {
    return this.purchaseStep === PurchaseStep.TokenPending
  }

  public get isProcessingSpending(): boolean {
    return this.purchaseStep === PurchaseStep.ApprovalPending
  }

  public get isProcessingPurchase(): boolean {
    return this.purchaseStep === PurchaseStep.PurchasePending
  }

  public created(this: PurchaseProcess) {
    // this.$store.subscribe(this.vuexSubscriptions)
  }

  public mounted(this: PurchaseProcess) {
    const drawerModule = getModule(DrawerModule, this.$store)
    drawerModule.setDrawerState(DrawerState.beforeProcessing)
    console.log('PurchaseProcess mounted')
  }

  // protected async vuexSubscriptions(mutation: MutationPayload, state: any) {

  //   const purchaseModule = getModule(PurchaseModule, this.$store)

  //   switch (mutation.type) {
  //     case 'drawerModule/setDrawerMode':
  //       if (mutation.payload !== DrawerState.processing) {
  //         return
  //       }
  //       return purchaseModule.setStatus(ProcessStatus.Ready)
  //     case 'purchaseModule/setErc20TokenTransactionId':
  //       if (mutation.payload.length === 0) {
  //         return
  //       }
  //       return await PurchaseProcessModule.checkEtherTokenBalance(this.$store)
  //     case 'purchaseModule/setApprovePaymentTransactionId':
  //       if (mutation.payload.length === 0) {
  //         return
  //       }
  //       return await PurchaseProcessModule.checkDatatrustContractAllowance(this.$store)
  //       return
  //     case 'purchaseModule/setPurchaseListingTransactionId':
  //       // TODO
  //       return
  //     default:
  //       return
  //   }
  // }
}
</script>
