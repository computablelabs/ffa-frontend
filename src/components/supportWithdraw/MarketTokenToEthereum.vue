<template>
  <div class="currency-to-currency">
    <div class="arrow-and-currency">
      <Currency
        class="from-currency"
        :currencySymbol="marketTokenSymbol"
        :currencyValue="marketTokens"
        :currencyPrecision="2"
        :hideFiat="true"/>
      <div class="arrow"></div>
    </div>
    <Currency
      class="to-currency"
      :currencySymbol="ethSymbol"
      :currencyValue="marketTokenValueInEth"
      :currencyPrecision="4"
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

import '@/assets/style/ui/currency-to-currency.sass'

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
