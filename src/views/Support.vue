<template>
  <section id="support">
    <div
      class="support-view"
      v-if="isReady">

      <div class="left-bar">
        <div class="top"><YourTokens /></div>
        <div class="middle"><SupportCooperative /></div>
        <div class="bottom"><WithdrawFromCooperative /></div>
      </div>

      <div class="market-token-chart-container">
        <CooperativeInfo />
      </div>

    </div>
    <EthereumLoader v-else />
  </section>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import { NoCache } from 'vue-class-decorator'
import { MutationPayload } from 'vuex'
import { getModule } from 'vuex-module-decorators'
import AppModule from '../vuexModules/AppModule'
import SupportWithdrawModule from '../vuexModules/SupportWithdrawModule'
import DrawerModule from '../vuexModules/DrawerModule'

import SharedModule from '../functionModules/components/SharedModule'
import EthereumModule from '../functionModules/ethereum/EthereumModule'
import EtherTokenContractModule from '../functionModules/protocol/EtherTokenContractModule'
import SupportWithdrawProcessModule from '../functionModules/components/SupportWithdrawProcessModule'

import EthereumLoader from '../components/ui/EthereumLoader.vue'
import YourTokens from '@/components/supportWithdraw/YourTokens.vue'
import SupportCooperative from '@/components/supportWithdraw/SupportCooperative.vue'
import WithdrawFromCooperative from '@/components/supportWithdraw/WithdrawFromCooperative.vue'
import CooperativeInfo from '@/components/supportWithdraw/CooperativeInfo.vue'

import { OpenDrawer,
  CloseDrawer,
  DrawerClosed,
  MetamaskAccountChanged } from '../models/Events'
import ContractAddresses from '../models/ContractAddresses'
import { SupportStep } from '../models/SupportStep'
import { WithdrawStep } from '../models/WithdrawStep'

import axios, { CancelTokenSource } from 'axios'

import '@/assets/style/views/support.sass'

@Component({
  components: {
    EthereumLoader,
    YourTokens,
    SupportCooperative,
    WithdrawFromCooperative,
    CooperativeInfo,
  },
})
export default class Support extends Vue {

  public appModule = getModule(AppModule, this.$store)

  @Prop({ default: false })
  public requiresWeb3?: boolean

  @Prop({ default: false })
  public requiresMetamask?: boolean

  @Prop({ default: false })
  public requiresParameters?: boolean

  public appReady = false
  public allowanceFetched = false
  public drawerModule = getModule(DrawerModule, this.$store)
  public unsubscribe!: () => void
  public cancelTokenSource!: CancelTokenSource

  @NoCache
  public get isReady(): boolean {
    const prerequisitesMet = SharedModule.isReady(
      this.requiresWeb3!,
      this.requiresMetamask!,
      this.requiresParameters!,
      this.$store,
    )
    return prerequisitesMet &&
      this.appModule.appReady
  }

  public async created() {

    if (!this.$router.currentRoute.redirectedFrom &&
      (this.$router.currentRoute.name === 'supportCooperative' ||
      this.$router.currentRoute.name === 'withdraw')) {

      this.drawerClosed()
    }

    this.unsubscribe = this.$store.subscribe(this.vuexSubscriptions)
    this.$root.$on(DrawerClosed, this.drawerClosed)
    this.$root.$on(MetamaskAccountChanged, this.metamaskAccountChanged)

    await EthereumModule.setEthereum(
      this.requiresWeb3!,
      this.requiresMetamask!,
      this.requiresParameters!,
      this.$store)
  }

  public async beforeDestroy() {
    if (this.cancelTokenSource) {
      this.cancelTokenSource.cancel()
    }
    this.$root.$off(DrawerClosed, this.drawerClosed)
    this.$root.$off(MetamaskAccountChanged, this.metamaskAccountChanged)
    this.unsubscribe()
  }

  protected async vuexSubscriptions(mutation: MutationPayload, state: any) {

    switch (mutation.type) {

      case 'appModule/setAppReady':

        await Promise.all([
          EthereumModule.getMarketTokenBalance(this.$store),
          EthereumModule.getEtherTokenContractAllowance(ContractAddresses.ReserveAddress!, this.$store),
          EthereumModule.getEtherTokenBalance(this.$store),
          EthereumModule.getEthereumBalance(this.$store),
          EthereumModule.getLastBlock(this.appModule),
        ])

        if (this.cancelTokenSource) {
          this.cancelTokenSource.cancel()
        }
        this.cancelTokenSource = axios.CancelToken.source()

        return await SupportWithdrawProcessModule.getUserListeds(this.cancelTokenSource!.token, this.$store)

      case 'appModule/setEtherTokenReserveAllowance':
        return this.allowanceFetched = true

      default:
        return
    }
  }

  private drawerClosed() {
    if (!this.$router.currentRoute.name!.startsWith('support') &&
      !this.$router.currentRoute.name!.startsWith('withdraw')) {
      return
    }
    getModule(SupportWithdrawModule, this.$store).resetAll()

    const resolved = this.$router.resolve({name: 'supportHome'})
    if (this.$router.currentRoute.path === resolved.route.path) {
      return
    }
    this.$router.push(resolved.location)
  }

  private async metamaskAccountChanged() {

    if (EthereumModule.ethereumDisabled()) {
      this.appModule.reset()
    }

    await EthereumModule.setEthereum(
      this.requiresWeb3!,
      this.requiresMetamask!,
      this.requiresParameters!,
      this.$store)

    this.$forceUpdate()
  }
}
</script>
