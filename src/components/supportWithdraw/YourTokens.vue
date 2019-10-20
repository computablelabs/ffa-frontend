<template>
  <div class="your-tokens">
    <h2>{{ title }}</h2>
    <div class="market-token-row">
      <Currency
        :currencySymbol="marketTokenSymbol"
        :currencyValue="marketTokenBalance"
        :currencyPrecision="1"
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
import { NoCache } from 'vue-class-decorator'

import { getModule } from 'vuex-module-decorators'
import AppModule from '../../vuexModules/AppModule'

import Currency from '../../components/ui/Currency.vue'

import { Labels } from '../../util/Constants'
import Web3Module from '../../vuexModules/Web3Module'

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

  @NoCache
  protected get marketTokenBalance(): number {
    const web3Module = getModule(Web3Module, this.$store)
    const appModule = getModule(AppModule, this.$store)
    if (!web3Module.web3 || !web3Module.web3.utils) {
      return 0
    }

    const wei = Math.max(appModule.marketTokenBalance, 0)
    const eth = web3Module.web3.utils.fromWei(wei.toFixed(0))
    return Number(eth)
  }

  protected get marketTokenToUSDRate(): number {
    const appModule = getModule(AppModule, this.$store)
    if (appModule.supportPrice <= 0) {
      return 0
    }
    return (Math.max(appModule.supportPrice, 0) * Math.max(appModule.ethereumToUSDRate)) / 1000000000
  }

  @NoCache
  protected get ethereumBalance(): number {
    const appModule = getModule(AppModule, this.$store)
    return Math.max(appModule.ethereumBalance, 0.00)
  }

  protected get ethereumToUSDRate(): number {
    const appModule = getModule(AppModule, this.$store)
    return Math.max(appModule.ethereumToUSDRate, 0.00)
  }

  @NoCache
  protected get etherTokenBalance(): number {
    const appModule = getModule(AppModule, this.$store)
    const web3Module = getModule(Web3Module, this.$store)
    const wei = Math.max(appModule.etherTokenBalance, 0.00)
    const eth = web3Module.web3.utils.fromWei(wei.toFixed(0))
    return Number(eth)
  }

  protected get etherTokenToUSDRate(): number {
    const appModule = getModule(AppModule, this.$store)
    return Math.max(appModule.ethereumToUSDRate, 0.00)
  }
}
</script>
