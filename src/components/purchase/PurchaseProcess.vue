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

import PurchaseProcessModule from '../../functionModules/components/PurchaseProcessModule'
import TaskPollerModule from '../../functionModules/task/TaskPollerModule'

import { ProcessStatus, ProcessStatusLabelMap } from '../../models/ProcessStatus'
import { PurchaseStep } from '../../models/PurchaseStep'
import FfaListing from '../../models/FfaListing'

import FfaProcessModule from '../../interfaces/vuex/FfaProcessModule'

import PurchaseErc20TokenStep from '@/components/purchase/PurchaseErc20TokenStep.vue'
import PurchaseApproveSpendingStep from '@/components/purchase/PurchaseApproveSpendingStep.vue'
import PurchaseListingStep from '@/components/purchase/PurchaseListingStep.vue'

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

  public unsubscribe!: () => void

  @Prop()
  public listing?: FfaListing

  public get purchaseStep(): PurchaseStep {
    return this.purchaseModule.purchaseStep
  }

  public mounted() {
    const drawerModule = getModule(DrawerModule, this.$store)
    console.log('PurchaseProcess mounted')
  }
}
</script>
