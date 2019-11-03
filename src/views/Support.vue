<template>
  <section id="support">
    <div
      class="support-view"
      v-if="isReady">
      <div class="left-bar">
        <div class="top">
          <YourTokens />
        </div>
        <div class="middle">
          <SupportCooperative />
        </div>
        <div class="bottom">
          <WithdrawFromCooperative />
        </div>
      </div>
      <div class="market-token-chart-container">
        <image src="http://placekitten.com/640/640"/>
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

import { OpenDrawer, CloseDrawer, DrawerClosed } from '../models/Events'
import ContractAddresses from '../models/ContractAddresses'
import { SupportStep } from '../models/SupportStep'
import { WithdrawStep } from '../models/WithdrawStep'
import Drawer from '../components/ui/Drawer.vue'

@Component({
  components: {
    EthereumLoader,
    YourTokens,
    SupportCooperative,
    WithdrawFromCooperative,
  },
})
export default class Support extends Vue {

  @Prop({ default: false })
  public requiresWeb3?: boolean

  @Prop({ default: false })
  public requiresMetamask?: boolean

  @Prop({ default: false })
  public requiresParameters?: boolean

  public appReady = false
  public allowanceFetched = false
  private drawerModule = getModule(DrawerModule, this.$store)

  @NoCache
  public get isReady(): boolean {
    const prerequisitesMet = SharedModule.isReady(
      this.requiresWeb3!,
      this.requiresMetamask!,
      this.requiresParameters!,
      this.$store,
    )
    console.log(`${prerequisitesMet} ${this.allowanceFetched} ${getModule(AppModule, this.$store).appReady}`)
    return prerequisitesMet &&
      this.allowanceFetched &&
      getModule(AppModule, this.$store).appReady
  }

  public async created() {

    this.$store.subscribe(this.vuexSubscriptions)
    this.$root.$on(DrawerClosed, this.drawerClosed)

    EthereumModule.setEthereum(
      this.requiresWeb3!,
      this.requiresMetamask!,
      this.requiresParameters!,
      this.$store)
  }

  public async beforeDestroy() {
    this.$root.$off(DrawerClosed, this.drawerClosed)
  }

  protected async vuexSubscriptions(mutation: MutationPayload, state: any) {

    switch (mutation.type) {

      case 'appModule/setAppReady':

        switch (this.$router.currentRoute.name) {
          case 'supportHome':
          case 'supportCooperative':
          case 'withdraw':
            break
          default:
            return
        }

        await Promise.all([
          EthereumModule.getMarketTokenBalance(this.$store),
          EthereumModule.getEthereumContractAllowance(ContractAddresses.ReserveAddress, this.$store),
          EthereumModule.getEtherTokenBalance(this.$store),
          EthereumModule.getEthereumBalance(this.$store),
        ])

        this.allowanceFetched = true

        return await SupportWithdrawProcessModule.getUserListings(this.$store)

      case 'appModule/setReserveContractAllowance':
        return this.allowanceFetched = true

      default:
        return
    }
  }

  private drawerClosed() {

    getModule(SupportWithdrawModule, this.$store).resetAll()

    const resolved = this.$router.resolve({name: 'supportHome'})
    if (this.$router.currentRoute.path === resolved.route.path) {
      return
    }
    this.$router.push(resolved.location)
  }
}
</script>
