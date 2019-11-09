<template>
  <div class="cooperative-info">
    <div class="swc-message">Total Outstanding Tokens</div>
    <Currency
      class="item"
      :currencySymbol="marketTokenSymbol"
      :currencyValue="totalMarketTokenSupply"
      :currencyPrecision="1"
      :fiatSymbol="usdSymbol"
      :fiatRate="marketTokenToUSDRate"/>

    <div class="swc-message">Reserve</div>
    <Currency
      class="item"
      :currencySymbol="ethereumSymbol"
      :currencyValue="totalReserveEtherTokenSupply"
      :currencyPrecision="1"
      :fiatSymbol="usdSymbol"
      :fiatRate="marketTokenToUSDRate"/>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import { NoCache } from 'vue-class-decorator'
import { getModule } from 'vuex-module-decorators'

import Currency from '../../components/ui/Currency.vue'

import AppModule from '../../vuexModules/AppModule'

import { Labels } from '../../util/Constants'

import '@/assets/style/components/cooperative-info.sass'
import EthereumModule from '../../functionModules/ethereum/EthereumModule'

@Component({
  components: {
    Currency,
  },
})
export default class CooperativeInfo extends Vue { 

  protected marketTokenSymbol = Labels.CMT
  protected ethereumSymbol = Labels.ETH
  protected etherTokenSymbol = Labels.WETH
  protected usdSymbol = `$${Labels.USD}`

  public appModule = getModule(AppModule, this.$store)

  @NoCache
  protected get totalMarketTokenSupply(): number {
    const wei = Math.max(this.appModule.totalMarketTokenSupply, 0)
    return Number(EthereumModule.weiToEther(wei, this.appModule.web3))
  }

  protected get marketTokenToUSDRate(): number {
    if (this.appModule.supportPrice <= 0) { return 0 }
    return (Math.max(this.appModule.supportPrice, 0) * Math.max(this.appModule.ethereumToUSDRate)) / 1000000000
  }

  @NoCache
  protected get totalReserveEtherTokenSupply(): number {
    const wei = Math.max(this.appModule.totalReserveEtherTokenSupply, 0.00)
    return Number(EthereumModule.weiToEther(wei, this.appModule.web3))
  }

  protected get etherTokenToUSDRate(): number {
    return Math.max(this.appModule.ethereumToUSDRate, 0.00)
  }
}
</script>
