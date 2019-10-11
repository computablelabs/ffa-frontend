<template>
  <div class="your-tokens">
    <h2>{{ title }}</h2>
    <div class="market-token-row">
      <Currency
        :currencySymbol="marketTokenSymbol"
        :currencyValue="marketTokenBalance"
        :fiatSymbol="usdSymbol"
        :fiatRate="marketTokenToUSDRate"/>
    </div>
    <div class="ethereum-row">
      <Currency
        :currencySymbol="ethereumSymbol"
        :currencyValue="ethereumBalance"
        :currencyPrecision="3"
        :fiatSymbol="usdSymbol"
        :fiatRate="ethereumToUSDRate"/>
    </div>
    <div class="eth-token-row">
      <Currency
        :currencySymbol="etherTokenSymbol"
        :currencyValue="etherTokenBalance"
        :currencyPrecision="3"
        :fiatSymbol="usdSymbol"
        :fiatRate="etherTokenToUSDRate"/>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import { getModule } from 'vuex-module-decorators'

import AppModule from '../../vuexModules/AppModule'

import Currency from '../../components/ui/Currency.vue'

import { Labels } from '../../util/Constants'

@Component({
  components: {
    Currency,
  },
})
export default class YourTokens extends Vue {

  protected title: string = Labels.YOUR_TOKENS
  protected marketTokenSymbol = Labels.CMT
  protected ethereumSymbol = Labels.ETH
  protected etherTokenSymbol = Labels.WETH

  protected usdSymbol = `$${Labels.USD}`

  protected get marketTokenBalance(): number {
    const appModule = getModule(AppModule, this.$store)
    return Math.max(appModule.marketTokenBalance, 0.00)
  }

  protected get marketTokenToUSDRate(): number {
    const appModule = getModule(AppModule, this.$store)
    return Math.max(appModule.marketTokenToUSDRate, 0.00)
  }

  protected get ethereumBalance(): number {
    const appModule = getModule(AppModule, this.$store)
    return Math.max(appModule.ethereumBalance, 0.00)
  }

  protected get ethereumToUSDRate(): number {
    const appModule = getModule(AppModule, this.$store)
    return Math.max(appModule.ethereumToUSDRate, 0.00)
  }

  protected get etherTokenBalance(): number {
    const appModule = getModule(AppModule, this.$store)
    return Math.max(appModule.etherTokenBalance, 0.00)
  }

  protected get etherTokenToUSDRate(): number {
    const appModule = getModule(AppModule, this.$store)
    return Math.max(appModule.ethereumToUSDRate, 0.00)
  }
}
</script>
