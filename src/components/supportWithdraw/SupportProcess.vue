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
          v-if="showWrapEth"/>
        <SupportApproveSpendingStep
          v-if="needsApproval"/>
        <SupportCooperativeStep />
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

  public get isComplete(): boolean {
    return getModule(SupportWithdrawModule, this.$store).supportStep === SupportStep.Complete
  }

  public get showWrapEth(): boolean {
    return getModule(SupportWithdrawModule, this.$store).supportStep < SupportStep.ApproveSpending
  }

  public get hasError(): boolean {
    const supportWithdrawModule = getModule(SupportWithdrawModule, this.$store)
    return supportWithdrawModule.supportStep === SupportStep.Error ||
      supportWithdrawModule.supportStep === SupportStep.InsufficientETH
   }

  @NoCache
  public get marketTokens(): number {
    return SupportWithdrawProcessModule.supportValueToMarketTokens(this.$store)
  }

  public get needsWETH(): boolean {
    if (!getModule(AppModule, this.$store).web3 || !getModule(AppModule, this.$store).web3.utils) {
      return false
    }
    const etherTokenBalanceInEth = getModule(AppModule, this.$store).etherTokenBalance.toString()
    const etherTokenBalanceInWei =
      getModule(AppModule, this.$store).web3.utils.toWei(etherTokenBalanceInEth)
    return Number(etherTokenBalanceInWei) < getModule(SupportWithdrawModule, this.$store).supportValue
  }

  public get needsApproval(): boolean {
    return getModule(AppModule, this.$store).reserveContractAllowance <
      getModule(SupportWithdrawModule, this.$store).supportValue
  }

  public ethEditable = true
  public ethValue = 0
  protected errorMessage!: string

  public created(this: SupportProcess) {
    this.$store.subscribe(this.vuexSubscriptions)
  }

  public onEthValueChanged(value: number) {
    this.ethValue = value
    const appModule = getModule(AppModule, this.$store)
    const supportWithdrawModule = getModule(SupportWithdrawModule, this.$store)

    if (SupportWithdrawProcessModule.hasEnoughEth(this.ethValue, this.$store)) {
      this.errorMessage = ''
      supportWithdrawModule.setSupportStep(SupportStep.WrapETH)

      const wei = appModule.web3.utils.toWei(this.ethValue.toString())
      supportWithdrawModule.setSupportValue(Number(wei))

    } else {

      this.errorMessage = `ETH ${this.ethValue} is more than your balance`
      supportWithdrawModule.setSupportStep(SupportStep.InsufficientETH)

    }
  }

  protected vuexSubscriptions(mutation: MutationPayload, state: any) {

    switch (mutation.type) {
      case 'supportWithdrawModule/setSupportStep':
        return this.processSupportState(mutation.payload)

      case 'supportWithdrawModule/setErc20TokenTransactionId':
        console.log('supportWithdrawModule/setErc20TokenTransactionId event!')
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

      case 'eventModule/append':
        if (!mutation.payload.error) {
          return
        }
        this.handleError(mutation.payload as Eventable)

      default:
        return
    }
  }

  protected processSupportState(step: SupportStep) {

    const appModule = getModule(AppModule, this.$store)
    const supportWithdrawModule = getModule(SupportWithdrawModule, this.$store)
    switch (step) {

      case SupportStep.InsufficientETH:
      case SupportStep.WrapETH:
        this.ethEditable = true
        return

      case SupportStep.ApproveSpending:
        this.ethEditable = false
        if (SupportWithdrawProcessModule.hasEnoughReserveApproval(this.$store)) {
          supportWithdrawModule.setSupportStep(SupportStep.Support)
        }

      default:
        this.ethEditable = false
        return
    }
  }

  protected handleError(error: Eventable) {
    if (!error.error) {
      return
    }

    const supportWithdrawModule = getModule(SupportWithdrawModule, this.$store)
    switch (supportWithdrawModule.supportStep) {

      case SupportStep.WrapETHPending:
        return supportWithdrawModule.setSupportStep(SupportStep.WrapETH)

      case SupportStep.ApprovalPending:
        return supportWithdrawModule.setSupportStep(SupportStep.ApproveSpending)

      case SupportStep.SupportPending:
        return supportWithdrawModule.setSupportStep(SupportStep.Support)

      default:
        return
    }
  }
}
</script>