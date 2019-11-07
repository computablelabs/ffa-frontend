<template>
  <div class="purchase-process tile is-vertical is-ancestor">
    <PurchaseErc20TokenStep />
    <PurchaseApproveSpendingStep />
    <PurchaseListingStep />
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { NoCache } from 'vue-class-decorator'
import { getModule } from 'vuex-module-decorators'
import { MutationPayload } from 'vuex'

import DrawerModule, { DrawerState } from '../../vuexModules/DrawerModule'
import PurchaseModule from '../../vuexModules/PurchaseModule'

import Status from '@/components/ui/Status.vue'
import DrawerMessage from '@/components/ui/DrawerMessage.vue'
import PurchaseErc20TokenStep from '@/components/purchase/PurchaseErc20TokenStep.vue'
import PurchaseApproveSpendingStep from '@/components/purchase/PurchaseApproveSpendingStep.vue'
import PurchaseListingStep from '@/components/purchase/PurchaseListingStep.vue'

import { ProcessStatus, ProcessStatusLabelMap } from '../../models/ProcessStatus'
import { PurchaseStep } from '../../models/PurchaseStep'
import FfaListing from '../../models/FfaListing'

import FfaProcessModule from '../../interfaces/vuex/FfaProcessModule'

import PurchaseProcessModule from '../../functionModules/components/PurchaseProcessModule'

import { Messages, Errors } from '../../util/Constants'

@Component({
  components: {
    PurchaseErc20TokenStep,
    PurchaseApproveSpendingStep,
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

  public mounted(this: PurchaseProcess) {
    const drawerModule = getModule(DrawerModule, this.$store)
    drawerModule.setDrawerState(DrawerState.beforeProcessing)
    console.log('PurchaseProcess mounted')
  }
}
</script>
