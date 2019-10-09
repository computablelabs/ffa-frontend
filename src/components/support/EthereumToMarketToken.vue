<template>
  <div class="ethereum-to-market-token">
    <currency
      :currencySymbol="ethSymbol"
      :currencyValue="marketTokenValueInEth"
      :currencyPrecision="3"
      :fiatSymbol="usdSymbol"
      :fiatValue="ethereumValueInUSD"/>
    <div class="arrow"></div>
    <currency
      :currencySymbol="marketTokenSymbol"
      :currencyValue="marketTokens"
      :currencyPrecision="1"
      :hideFiat="true"/>
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
export default class EthereumToMarketToken extends Vue {

  @Prop({default: 1.00})
  public marketTokens!: number

  protected ethSymbol = Labels.ETH
  protected usdSymbol = `$${Labels.USD}`

  public get marketTokenValueInEth(): number {
    const appModule = getModule(AppModule, this.$store)

    return Math.max(appModule.marketTokenToEthereumRate, 0.00) * this.marketTokens
  }

  public get ethereumValueInUSD(): number {
    const appModule = getModule(AppModule, this.$store)

    return Math.max(appModule.marketTokenToEthereumRate, 0.00) *
      Math.max(appModule.ethereumToUSDRate, 0.00) *
      this.marketTokens
  }

  public get marketTokenSymbol(): string {
    return Labels.CMT
  }

  public get buttonText(): string {
    return Labels.START_SUPPORT
  }
}
</script>
