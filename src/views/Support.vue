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
import Web3Module from '../vuexModules/Web3Module'
import SupportWithdrawModule from '../vuexModules/SupportWithdrawModule'

import SharedModule from '../functionModules/components/SharedModule'
import EthereumModule from '../functionModules/ethereum/EthereumModule'
import EtherTokenContractModule from '../functionModules/protocol/EtherTokenContractModule'

import EthereumLoader from '../components/ui/EthereumLoader.vue'
import YourTokens from '@/components/supportWithdraw/YourTokens.vue'
import SupportCooperative from '@/components/supportWithdraw/SupportCooperative.vue'
import WithdrawFromCooperative from '@/components/supportWithdraw/WithdrawFromCooperative.vue'

import { OpenDrawer } from '../models/Events'
import ContractAddresses from '../models/ContractAddresses'
import { SupportStep } from '../models/SupportStep'

const appVuexModule = 'appModule'

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

  public async created(this: Support) {

    this.$store.subscribe(this.vuexSubscriptions)

    await EthereumModule.setEthereum(
      this.requiresWeb3!,
      this.requiresMetamask!,
      this.requiresParameters!,
      this.$store)
  }

  protected async vuexSubscriptions(mutation: MutationPayload, state: any) {
    switch (mutation.type) {
      case `${appVuexModule}/setAppReady`:

        this.appReady = true

        await EthereumModule.getContractAllowance(
          ContractAddresses.ReserveAddress,
          this.$store)

        this.allowanceFetched = true

        getModule(SupportWithdrawModule, this.$store).setSupportStep(SupportStep.WrapETH)

        return
      default:
        return
    }
  }

  @NoCache
  public get isReady(): boolean {
    const prerequisitesMet = SharedModule.isReady(
      this.requiresWeb3!,
      this.requiresMetamask!,
      this.requiresParameters!,
      this.$store,
    )

    return prerequisitesMet && this.allowanceFetched && this.appReady
  }
}
</script>
