<template>
  <div class="currency-to-currency">
    <Currency
      class="from-currency"
      :currencySymbol="ethSymbol"
      :currencyValue="marketTokenValueInEth"
      :currencyPrecision="4"
      :fiatSymbol="usdSymbol"
      :fiatRate="ethereumToUSDRate"
      :editable="ethEditable"
      :onChange="onEthCurrencyChanged"/>
    <div class="arrow-and-currency">
      <div class="arrow"></div>
      <Currency
        class="to-currency"
        :currencySymbol="marketTokenSymbol"
        :currencyValue="internalMarketTokens"
        :currencyPrecision="2"
        :hideFiat="true"/>
    </div>
  </div>
</template>

<script lang="ts">
import { NoCache } from 'vue-class-decorator'
import { Vue, Component, Prop } from 'vue-property-decorator'
import { getModule } from 'vuex-module-decorators'

import AppModule from '../../vuexModules/AppModule'

import EthereumModule from '../../functionModules/ethereum/EthereumModule'

import Currency from '../../components/ui/Currency.vue'

import { Labels } from '../../util/Constants'
import Servers from '../../util/Servers'

import Web3 from 'web3'

@Component({
  components: {
    Currency,
  },
})
export default class EthereumToMarketToken extends Vue {

  @Prop({default: 1.00})
  public marketTokens!: number

  @Prop({default: false})
  public ethEditable!: boolean

  @Prop()
  public onEthChange!: (ethValue: number) => void

  protected ethSymbol = Labels.ETH
  protected usdSymbol = `$${Labels.USD}`

  protected internalMarketTokens = 0

  @NoCache
  public get marketTokenValueInEth(): number {

    const appModule = getModule(AppModule, this.$store)
    if (!appModule.web3 || !appModule.web3.utils || appModule.supportPrice <= 0) {
      return 0
    }
    const weiToMarketToken = (this.marketTokens * appModule.supportPrice) / 1000000000
    return weiToMarketToken // this is a ratio, ergo eth, not a fixed price in wei
  }

  public get ethereumToUSDRate(): number {
    const appModule = getModule(AppModule, this.$store)
    return Math.max(appModule.ethereumToUSDRate, 0.00)
  }

  public get marketTokenSymbol(): string {
    return Labels.CMT
  }

  public get buttonText(): string {
    return Labels.START_SUPPORT
  }

  public created() {
    this.internalMarketTokens = this.marketTokens
  }

  public onEthCurrencyChanged(newInput: number) {
    const appModule = getModule(AppModule, this.$store)
    this.internalMarketTokens = Math.max(appModule.ethereumToMarketTokenRate, 0.00) * newInput
    if (this.onEthChange) {
      this.onEthChange(newInput)
    }
  }
}
</script>
