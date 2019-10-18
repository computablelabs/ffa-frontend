<template>
  <div class="withdraw-process">
    <div class="withdraw-process-loaded">
      <WithdrawProcessComplete
        :marketTokens="marketTokens"
        v-if="isComplete"/>
      <div v-else>
        <MarketTokenToEthereum
          :marketTokens="marketTokens" />
        <div
          class="error-message-container"
          v-if="hasError">
          <span class="error-message">
            {{ errorMessage }}
          </span>
        </div>
        <div class="status-container">
          <CollectIncomeStep
            v-if="showCollectIncome"/>
          <WithdrawalStep
            v-if="showWithdrawal"/>
          <UnwrapWETHStep />
        </div>
      </div>
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

import SupportWithdrawProcessModule from '../../functionModules/components/SupportWithdrawProcessModule'
import TaskPollerModule from '../../functionModules/task/TaskPollerModule'


import { Eventable } from '../../interfaces/Eventable'

import { WithdrawStep } from '../../models/WithdrawStep'

import MarketTokenToEthereum from './MarketTokenToEthereum.vue'
import CollectIncomeStep from './CollectIncomeStep.vue'
import WithdrawalStep from './WithdrawalStep.vue'
import UnwrapWETHStep from './UnwrapWETHStep.vue'
import WithdrawProcessComplete from './WithdrawProcessComplete.vue'

import { Labels } from '../../util/Constants'
import { FfaDatatrustTaskType } from '../../models/DatatrustTaskDetails'

@Component({
  components: {
    MarketTokenToEthereum,
    CollectIncomeStep,
    WithdrawalStep,
    UnwrapWETHStep,
    WithdrawProcessComplete,
  },
})
export default class WithdrawProcess extends Vue {

  public get isComplete(): boolean {
    return getModule(SupportWithdrawModule, this.$store).withdrawStep === WithdrawStep.Complete
  }

  public get showCollectIncome(): boolean {
    return getModule(SupportWithdrawModule, this.$store).withdrawStep < WithdrawStep.Withdraw
  }

  public get showWithdrawal(): boolean {
    return getModule(SupportWithdrawModule, this.$store).withdrawStep < WithdrawStep.UnwrapWETH
  }

  public get marketTokens(): number {
    return SupportWithdrawProcessModule.weiToMarketTokens(
      Math.max(getModule(AppModule, this.$store).marketTokenBalance, 0.0),
      this.$store)
  }

  public get hasError(): boolean {
    return getModule(SupportWithdrawModule, this.$store).withdrawStep === WithdrawStep.Error
  }

  protected errorMessage!: string
  protected marketTokensToWithdraw!: number

  public created(this: WithdrawProcess) {
    this.$store.subscribe(this.vuexSubscriptions)

    this.marketTokensToWithdraw = getModule(AppModule, this.$store).marketTokenBalance
  }

  public mounted(this: WithdrawProcess) {
    console.log('WithdrawProcess mounted')
    SupportWithdrawProcessModule.checkForIncome(this.$store)
  }

  public beforeUpdate(this: WithdrawProcess) {
    console.log('WithdrawProcess beforeUpdate')
  }

  public updated(this: WithdrawProcess) {
    console.log('WithdrawProcess updated')
  }

  protected async vuexSubscriptions(mutation: MutationPayload, state: any) {
    switch (mutation.type) {
      case 'supportWithdrawModule/setWithdrawState':
        return this.processWithdrawState(mutation.payload)

      case 'supportWithdrawModule/addCollectIncomeTransactionId':
        return TaskPollerModule.createTaskPollerForEthereumTransaction(
          mutation.payload,
          '',
          FfaDatatrustTaskType.collectIncome,
          this.$store)

      case 'supportWithdrawModule/removeCollectIncomeTransactionId':
        const supportWithdrawModule = getModule(SupportWithdrawModule, this.$store)
        if (supportWithdrawModule.collectIncomeTransactionIds.length > 0) {
          return
        }
        await SupportWithdrawProcessModule.afterCollectIncome(this.$store)
        this.marketTokensToWithdraw = getModule(AppModule, this.$store).marketTokenBalance
        return supportWithdrawModule.withdrawStep = WithdrawStep.Withdraw

      case 'supportWithdrawModule/setWithdrawTransactionId':
        return TaskPollerModule.createTaskPollerForEthereumTransaction(
          mutation.payload,
          '',
          FfaDatatrustTaskType.withdraw,
          this.$store)

      case 'supportWithdrawModule/setUnwrapWETHTransactionId':
        return TaskPollerModule.createTaskPollerForEthereumTransaction(
          mutation.payload,
          '',
          FfaDatatrustTaskType.unwrapWETH,
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

  protected processWithdrawState(step: WithdrawStep) {

    const appModule = getModule(AppModule, this.$store)
    const supportWithdrawModule = getModule(SupportWithdrawModule, this.$store)

    switch (step) {
      case WithdrawStep.CollectIncome:
        if (appModule.marketTokenBalance <= 0) {
          supportWithdrawModule.setWithdrawStep(WithdrawStep.UnwrapWETH)
        }
        return

      case WithdrawStep.CollectIncomePending:
        return

      case WithdrawStep.Withdraw:
        if (appModule.marketTokenBalance <= 0) {
          supportWithdrawModule.setWithdrawStep(WithdrawStep.UnwrapWETH)
        }
        return

      case WithdrawStep.WithdrawPending:
      case WithdrawStep.UnwrapWETH:
      case WithdrawStep.UnwrapWETHPending:
      case WithdrawStep.Complete:
        return
    }
  }


  protected handleError(error: Eventable) {
    if (!error.error) {
      return
    }

    const supportWithdrawModule = getModule(SupportWithdrawModule, this.$store)
    switch (supportWithdrawModule.withdrawStep) {

      case WithdrawStep.CollectIncomePending:
        return supportWithdrawModule.setWithdrawStep(WithdrawStep.CollectIncome)

      case WithdrawStep.WithdrawPending:
        return supportWithdrawModule.setWithdrawStep(WithdrawStep.Withdraw)

      case WithdrawStep.UnwrapWETHPending:
        return supportWithdrawModule.setWithdrawStep(WithdrawStep.UnwrapWETH)

      default:
        return
    }
  }
}
</script>