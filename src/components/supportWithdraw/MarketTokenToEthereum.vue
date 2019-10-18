<template>
  <div class="market-token-to-ethereum">
    <Currency
      :currencySymbol="marketTokenSymbol"
      :currencyValue="marketTokens"
      :currencyPrecision="1"
      :hideFiat="true"/>
    <div class="arrow"></div>
    <Currency
      :currencySymbol="ethSymbol"
      :currencyValue="marketTokenValueInEth"
      :currencyPrecision="6"
      :fiatSymbol="usdSymbol"
      :fiatRate="ethereumToUSDRate" />
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
export default class MarketTokenToEthereum extends Vue {

  @Prop({default: 1.00})
  public marketTokens!: number

  protected ethSymbol = Labels.ETH
  protected usdSymbol = `$${Labels.USD}`


  public get marketTokenValueInEth(): number {
    const appModule = getModule(AppModule, this.$store)
    return Math.max(appModule.marketTokenToEthereumRate, 0.00) * this.marketTokens
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
}
</script>
