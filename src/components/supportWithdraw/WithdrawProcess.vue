<template>
  <div class="withdraw-process">
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
        <WithdrawalStep />
        <UnwrapWETHStep />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { NoCache } from 'vue-class-decorator'
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

import '@/assets/style/components/withdraw-process.sass'


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

  protected supportWithdrawModule = getModule(SupportWithdrawModule, this.$store)
  protected errorMessage = ''
  protected marketTokensToWithdraw!: number
  protected unsubscribe!: () => void

  public get isComplete(): boolean {
    return this.supportWithdrawModule.withdrawStep === WithdrawStep.Complete
  }

  public get showCollectIncome(): boolean {
    return this.supportWithdrawModule.listingHashes.length > 0
  }

  @NoCache
  public get marketTokens(): number {
    const marketTokenBalance = getModule(AppModule, this.$store).marketTokenBalance
    const withdrawValue = this.supportWithdrawModule.withdrawValue
    const marketTokens = Math.max(marketTokenBalance, withdrawValue)
    return SupportWithdrawProcessModule.weiToMarketTokens(marketTokens, this.$store)
  }

  public get hasError(): boolean {
    return this.supportWithdrawModule.withdrawStep === WithdrawStep.Error
  }

  public created(this: WithdrawProcess) {
    this.unsubscribe = this.$store.subscribe(this.vuexSubscriptions)

    this.marketTokensToWithdraw = getModule(AppModule, this.$store).marketTokenBalance
  }

  public mounted() {
    SupportWithdrawProcessModule.setWithdrawStep(this.$store)
    console.log('WithdrawProcess mounted')
  }

  public updated() {
    SupportWithdrawProcessModule.setWithdrawStep(this.$store)
  }

  public beforeDestroy() {
    this.unsubscribe()
  }

  protected async vuexSubscriptions(mutation: MutationPayload, state: any) {

    switch (mutation.type) {

      case 'supportWithdrawModule/setWithdrawState':
        return this.processWithdrawState(mutation.payload)

      case 'supportWithdrawModule/addCollectIncomeTransactionId':
        if (!mutation.payload || (mutation.payload as string).length === 0) {
          return
        }
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
        if (!mutation.payload || (mutation.payload as string).length === 0) {
          return
        }
        return TaskPollerModule.createTaskPollerForEthereumTransaction(
          mutation.payload,
          '',
          FfaDatatrustTaskType.withdraw,
          this.$store)

      case 'supportWithdrawModule/setUnwrapWETHTransactionId':
        if (!mutation.payload || (mutation.payload as string).length === 0) {
          return
        }
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

    switch (step) {
      case WithdrawStep.CollectIncome:
        if (appModule.marketTokenBalance <= 0) {
          this.supportWithdrawModule.setWithdrawStep(WithdrawStep.UnwrapWETH)
        }
        return

      case WithdrawStep.CollectIncomePending:
        return

      case WithdrawStep.Withdraw:
        if (appModule.marketTokenBalance <= 0) {
          this.supportWithdrawModule.setWithdrawStep(WithdrawStep.UnwrapWETH)
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