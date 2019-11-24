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

  public mounted() {
    this.marketTokensToWithdraw = getModule(AppModule, this.$store).marketTokenBalance
    SupportWithdrawProcessModule.setWithdrawStep(this.$store)
    console.log('WithdrawProcess mounted')
  }

  public updated() {
    SupportWithdrawProcessModule.setWithdrawStep(this.$store)
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
}
</script>