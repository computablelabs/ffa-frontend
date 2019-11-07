<template>
  <div class="support-process">
    <SupportProcessComplete
      :marketTokens="marketTokens"
      v-if="isComplete"/>
    <div v-else>
      <EthereumToMarketToken
        :ethEditable="ethEditable"
        :onEthChange="onEthValueChanged"/>
      <div
        class="error-message-container"
        v-if="hasError">
        <span class="error-message">
          {{ errorMessage }}
        </span>
      </div>
      <div class="status-container">
        <SupportErc20TokenStep
          :ethValue="ethValue"/>
        <SupportApproveSpendingStep
          :ethValue="ethValue"/>
        <SupportCooperativeStep
         :ethValue="ethValue"/>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import { NoCache } from 'vue-class-decorator'
import { MutationPayload } from 'vuex'
import { getModule } from 'vuex-module-decorators'
import appStore from '../../store'
import AppModule from '../../vuexModules/AppModule'
import SupportWithdrawModule from '../../vuexModules/SupportWithdrawModule'
import DrawerModule from '../../vuexModules/DrawerModule'

import SupportWithdrawProcessModule from '../../functionModules/components/SupportWithdrawProcessModule'
import TaskPollerModule from '../../functionModules/task/TaskPollerModule'

import { Eventable } from '../../interfaces/Eventable'

import { SupportStep } from '../../models/SupportStep'

import EthereumToMarketToken from './EthereumToMarketToken.vue'
import SupportErc20TokenStep from './SupportErc20TokenStep.vue'
import SupportApproveSpendingStep from './SupportApproveSpendingStep.vue'
import SupportCooperativeStep from './SupportCooperativeStep.vue'
import SupportProcessComplete from './SupportProcessComplete.vue'

import { Labels } from '../../util/Constants'
import { FfaDatatrustTaskType } from '../../models/DatatrustTaskDetails'

@Component({
  components: {
    EthereumToMarketToken,
    SupportErc20TokenStep,
    SupportApproveSpendingStep,
    SupportCooperativeStep,
    SupportProcessComplete,
  },
})
export default class SupportProcess extends Vue {

  public ethEditable = true
  public ethValue = 0
  protected errorMessage!: string
  protected supportWithdrawModule = getModule(SupportWithdrawModule, this.$store)
  public unsubscribe!: () => void

  public get isComplete(): boolean {
    return getModule(SupportWithdrawModule, this.$store).supportStep === SupportStep.Complete
  }

  @NoCache
  public get hasError(): boolean {
    return this.supportWithdrawModule.supportStep === SupportStep.Error ||
      this.supportWithdrawModule.supportStep === SupportStep.InsufficientETH
   }

  @NoCache
  public get marketTokens(): number {
    return SupportWithdrawProcessModule.supportValueToMarketTokens(this.$store)
  }

  public created() {
    this.unsubscribe = this.$store.subscribe(this.vuexSubscriptions)
  }

  public mounted() {
    console.log('SupportProcess mounted')
  }

  public beforeDestroy() {
    this.unsubscribe()
  }

  public onEthValueChanged(value: number) {
    this.ethValue = value
    const appModule = getModule(AppModule, this.$store)

    if (SupportWithdrawProcessModule.hasEnoughEth(this.ethValue, this.$store)) {
      this.errorMessage = ''
      this.supportWithdrawModule.setSupportStep(SupportStep.WrapETH)

      const wei = appModule.web3.utils.toWei(this.ethValue.toString())
      this.supportWithdrawModule.setSupportValue(Number(wei))

    } else {

      this.errorMessage = `ETH ${this.ethValue} is more than your balance`
      this.supportWithdrawModule.setSupportStep(SupportStep.InsufficientETH)
    }
  }

  protected vuexSubscriptions(mutation: MutationPayload, state: any) {

    switch (mutation.type) {

      case 'supportWithdrawModule/setSupportStep':
        return this.processSupportState(mutation.payload)

      case 'supportWithdrawModule/setErc20TokenTransactionId':
        if (!mutation.payload || (mutation.payload as string).length === 0) {
          return
        }

        return TaskPollerModule.createTaskPollerForEthereumTransaction(
          mutation.payload,
          '',
          FfaDatatrustTaskType.supportWrapETH,
          this.$store)

      case 'supportWithdrawModule/setApprovePaymentTransactionId':
        if (!mutation.payload || (mutation.payload as string).length === 0) {
          return
        }
        return TaskPollerModule.createTaskPollerForEthereumTransaction(
          mutation.payload,
          '',
          FfaDatatrustTaskType.supportApproveSpending,
          this.$store)

      case 'supportWithdrawModule/setSupportCollectiveTransactionId':
        if (!mutation.payload || (mutation.payload as string).length === 0) {
          return
        }
        return TaskPollerModule.createTaskPollerForEthereumTransaction(
          mutation.payload,
          '',
          FfaDatatrustTaskType.support,
          this.$store)

      default:
        return
    }
  }

  protected processSupportState(step: SupportStep) {
      switch (step) {
      case SupportStep.InsufficientETH:
      case SupportStep.WrapETH:
        this.ethEditable = true
        return

      default:
        this.ethEditable = false
        return
    }
  }
}
</script>