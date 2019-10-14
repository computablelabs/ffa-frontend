<template>
  <div class="withdraw-process">
    <div
      class="withdraw-process-initialize"
      v-if="isInitialize">
    </div>
    <div
      class="withdraw-process-loaded"
      v-else>
      <div v-if="!isComplete">
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
          <CollectIncomeStep />
          <WithdrawalStep />
          <UnwrapWETHStep />
        </div>
      </div>
      <WithdrawProcessComplete
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

import SupportWithdrawProcessModule from '../../functionModules/components/SupportWithdrawProcessModule'
import TaskPollerModule from '../../functionModules/task/TaskPollerModule'

import { WithdrawStep } from '../../models/WithdrawStep'

import MarketTokenToEthereum from './MarketTokenToEthereum.vue'
import CollectIncomeStep from './CollectIncomeStep.vue'
import WithdrawalStep from './WithdrawalStep.vue'
import UnwrapWETHStep from './UnwrapWETHStep.vue'
import WithdrawProcessComplete from './WithdrawProcessComplete.vue'

import { Labels } from '../../util/Constants'
import DatatrustTaskDetails, { FfaDatatrustTaskType } from '../../models/DatatrustTaskDetails'
import DatatrustTask from '../../models/DatatrustTask'
import DatatrustTaskModule from '../../vuexModules/DatatrustTaskModule'

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

  public get isInitialize(): boolean {
    const module = getModule(SupportWithdrawModule, this.$store)
    return module.withdrawStep === WithdrawStep.Initialize
  }

  public get isComplete(): boolean {
    const module = getModule(SupportWithdrawModule, this.$store)
    return module.withdrawStep === WithdrawStep.Complete
  }

  public get marketTokens(): number {
    const appModule = getModule(AppModule, this.$store)
    return Math.max(appModule.marketTokenBalance, 0.0)
  }

  public get hasError(): boolean {
    const supportWithdrawModule = getModule(SupportWithdrawModule, this.$store)
    return supportWithdrawModule.withdrawStep === WithdrawStep.Error
  }

  protected errorMessage!: string
  protected marketTokensToWithdraw!: number

  public async created(this: WithdrawProcess) {
    this.$store.subscribe(this.vuexSubscriptions)

    await SupportWithdrawProcessModule.getSupportPrice(this.$store)
    await SupportWithdrawProcessModule.getUserListings(this.$store)

    const appModule = getModule(AppModule, this.$store)
    this.marketTokensToWithdraw = appModule.marketTokenBalance
    const supportWithdrawModule = getModule(SupportWithdrawModule, this.$store)
    const nextStep = supportWithdrawModule.listingHashes.length > 0 ?
      WithdrawStep.CollectIncome : WithdrawStep.Withdraw

    supportWithdrawModule.setWithdrawStep(nextStep)
  }

  protected async vuexSubscriptions(mutation: MutationPayload, state: any) {
    switch (mutation.type) {
      case 'supportWithdrawModule/setWithdrawState':
        return this.processWithdrawState(mutation.payload)

      case 'supportWithdrawModule/addCollectIncomeTransactionId':
        return TaskPollerModule.createTaskPoller(
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
        const appModule = getModule(AppModule, this.$store)
        this.marketTokensToWithdraw = appModule.marketTokenBalance
        return supportWithdrawModule.withdrawStep = WithdrawStep.Withdraw

      case 'supportWithdrawModule/setWithdrawTransactionId':
        return TaskPollerModule.createTaskPoller(
          mutation.payload,
          '',
          FfaDatatrustTaskType.withdraw,
          this.$store)

      case 'supportWithdrawModule/setUnwrapWETHTransactionId':
        return TaskPollerModule.createTaskPoller(
          mutation.payload,
          '',
          FfaDatatrustTaskType.unwrapWETH,
          this.$store)

      default:
        return
    }
  }

  protected processWithdrawState(step: WithdrawStep) {
    switch (step) {
      case WithdrawStep.CollectIncome:
      case WithdrawStep.CollectIncomePending:
      case WithdrawStep.Withdraw:
      case WithdrawStep.WithdrawPending:
      case WithdrawStep.UnwrapWETH:
      case WithdrawStep.UnwrapWETHPending:
      case WithdrawStep.Complete:
        return
    }
  }
}
</script>