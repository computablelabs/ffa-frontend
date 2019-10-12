<template>
  <div class="support-process">
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

import { SupportStep } from '../../models/SupportStep'

import EthereumToMarketToken from './EthereumToMarketToken.vue'
import SupportErc20TokenStep from './SupportErc20TokenStep.vue'
import SupportApproveSpendingStep from './SupportApproveSpendingStep.vue'

import { Labels } from '../../util/Constants'

@Component({
  components: {
    EthereumToMarketToken,
    SupportErc20TokenStep,
    SupportApproveSpendingStep,
  },
})
export default class SupportProcess extends Vue {

  public get isComplete(): boolean {
    const module = getModule(SupportWithdrawModule, this.$store)
    return module.supportStep === SupportStep.Complete
  }

  public get isWrapEth(): boolean {
    const module = getModule(SupportWithdrawModule, this.$store)
    return module.supportStep === SupportStep.WrapEth
  }

  public get hasError(): boolean {
    return !!this.errorMessage && this.errorMessage.length > 0
  }

  public ethEditable = true
  public ethValue = 0
  protected errorMessage!: string

  public created(this: SupportProcess) {
    this.$store.subscribe(this.vuexSubscriptions)

    SupportWithdrawProcessModule.getSupportPrice(this.$store)
  }

  public onEthValueChanged(value: number) {
    this.ethValue = value

    const appModule = getModule(AppModule, this.$store)
    const supportWithdrawModule = getModule(SupportWithdrawModule, this.$store)
    if (this.ethValue > appModule.ethereumBalance) {
      this.errorMessage = `ETH ${this.ethValue} is more than your balance`
      supportWithdrawModule.setSupportStep(SupportStep.InsufficientEth)
    } else {
      this.errorMessage = ''
      if (supportWithdrawModule.supportStep === SupportStep.InsufficientEth) {
        supportWithdrawModule.setSupportStep(SupportStep.WrapEth)
      }
    }
  }

  protected vuexSubscriptions(mutation: MutationPayload, state: any) {

   if (mutation.type !== 'supportWithdrawModule/setSupportState') {
      return
    }

   switch (mutation.payload) {
      case SupportStep.InsufficientEth:
      case SupportStep.WrapEth:
        this.ethEditable = true
        return
      default:
        this.ethEditable = false
        return
    }
  }
}
</script>