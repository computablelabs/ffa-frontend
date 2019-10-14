<template>
  <div class="support-process">
    <div
      class="support-process-initialize"
      v-if="isInitialize">

    </div>
    <div
      class="support-process-loaded"
      v-else>
      <div v-if="!isComplete">
        <EthereumToMarketToken
          :ethEditable="ethEditable"
          :onChange="onEthValueChanged"/>
        <div
          class="error-message-container"
          v-if="hasError">
          <span class="error-message">
            {{ errorMessage }}
          </span>
        </div>
        <div class="status-container">
          <SupportErc20TokenStep />
          <SupportApproveSpendingStep />
          <SupportCooperativeStep />
        </div>
      </div>
      <SupportProcessComplete
        :label="completeLabel"
        :marketTokens="marketTokens"
        v-if="isComplete"/>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import { MutationPayload } from 'vuex'
import { getModule } from 'vuex-module-decorators'
import appStore from '../../store'
import AppModule from '../../vuexModules/AppModule'
import SupportWithdrawModule from '../../vuexModules/SupportWithdrawModule'
import Web3Module from '../../vuexModules/Web3Module'

import SupportWithdrawProcessModule from '../../functionModules/components/SupportWithdrawProcessModule'
import TaskPollerModule from '../../functionModules/task/TaskPollerModule'

import { SupportStep } from '../../models/SupportStep'

import EthereumToMarketToken from './EthereumToMarketToken.vue'
import SupportErc20TokenStep from './SupportErc20TokenStep.vue'
import SupportApproveSpendingStep from './SupportApproveSpendingStep.vue'
import SupportCooperativeStep from './SupportCooperativeStep.vue'
import SupportProcessComplete from './SupportProcessComplete.vue'

import { Labels } from '../../util/Constants'
import DatatrustTaskDetails, { FfaDatatrustTaskType } from '../../models/DatatrustTaskDetails'
import DatatrustTask from '../../models/DatatrustTask'
import DatatrustTaskModule from '../../vuexModules/DatatrustTaskModule'

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

  public get isInitialize(): boolean {
    const module = getModule(SupportWithdrawModule, this.$store)
    return module.supportStep === SupportStep.Initialize
  }

  public get isComplete(): boolean {
    const module = getModule(SupportWithdrawModule, this.$store)
    return module.supportStep === SupportStep.Complete
  }

  public get isWrapETH(): boolean {
    const module = getModule(SupportWithdrawModule, this.$store)
    return module.supportStep === SupportStep.WrapETH
  }

  public get hasError(): boolean {
    const module = getModule(SupportWithdrawModule, this.$store)
    return module.supportStep === SupportStep.Error ||
      module.supportStep === SupportStep.InsufficientETH
   }

  public get marketTokens(): number {
    return SupportWithdrawProcessModule.supportValueToMarketTokens(this.$store)
  }

  public ethEditable = true
  public ethValue = 0
  protected errorMessage!: string

  public async created(this: SupportProcess) {
    const supportWithdrawModule = getModule(SupportWithdrawModule, this.$store)

    this.$store.subscribe(this.vuexSubscriptions)

    await SupportWithdrawProcessModule.getSupportPrice(this.$store)

    supportWithdrawModule.setSupportStep(SupportStep.WrapETH)
  }

  public onEthValueChanged(value: number) {
    this.ethValue = value

    const appModule = getModule(AppModule, this.$store)
    const supportWithdrawModule = getModule(SupportWithdrawModule, this.$store)

    if (this.ethValue > appModule.ethereumBalance) {

      this.errorMessage = `ETH ${this.ethValue} is more than your balance`
      supportWithdrawModule.setSupportStep(SupportStep.InsufficientETH)

    } else {

      this.errorMessage = ''
      supportWithdrawModule.setSupportStep(SupportStep.WrapETH)

      const web3Module = getModule(Web3Module, this.$store)
      const bn = web3Module.web3.utils.toBN(value)
      const wei = web3Module.web3.utils.toWei(bn)
      supportWithdrawModule.setSupportValue(Number(wei))
    }
  }

  protected vuexSubscriptions(mutation: MutationPayload, state: any) {
    switch (mutation.type) {
      case 'supportWithdrawModule/setSupportState':
        return this.processSupportState(mutation.payload)

      case 'supportWithdrawModule/setErc20TokenTransactionId':
        return TaskPollerModule.createTaskPoller(
          mutation.payload,
          '',
          FfaDatatrustTaskType.supportWrapETH,
          this.$store)

      case 'supporWithdrawModule/setApprovePaymentTransactionId':
        return TaskPollerModule.createTaskPoller(
          mutation.payload,
          '',
          FfaDatatrustTaskType.supportApproveSpending,
          this.$store)

      case 'supportWithdrawModule/setSupportCollectiveTransactionId':
        return TaskPollerModule.createTaskPoller(
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