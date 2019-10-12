<template>
  <div class="erc20-token tile is-hcentered">
    <div
      class="create-token tile is-8" >
      <ProcessButton
        :processing="isProcessing"
        :buttonText="labelText"
        :noToggle="true"
        :clickable="needsToken"
        :clickEvent="clickEvent"
        @wrap-token-click="onWrapTokenClick"
        />
    </div>

    <!-- <div
      class="ether-token-balance tile is-8"
      v-else>
      <div class="indicator tile is-2"></div>
      <div class="label tile">
        {{ marketTokenBalance }}
      </div> -->
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import { NoCache } from 'vue-class-decorator'
import { MutationPayload, Store } from 'vuex'
import { VuexModule, getModule } from 'vuex-module-decorators'

import AppModule from '../../vuexModules/AppModule'
import Web3Module from '../../vuexModules/Web3Module'
import PurchaseModule from '../../vuexModules/PurchaseModule'
import EventModule from '../../vuexModules/EventModule'
import FlashesModule from '../../vuexModules/FlashesModule'

import ProcessButton from '@/components/ui/ProcessButton.vue'

import { Eventable } from '../../interfaces/Eventable'

import { PurchaseStep } from '../../models/PurchaseStep'
import FfaListing from '../../models/FfaListing'
import Flash, { FlashType } from '../../models/Flash'
import { FfaDatatrustTaskType } from '../../models/DatatrustTaskDetails'

import PurchaseProcessModule from '../../functionModules/components/PurchaseProcessModule'
import TaskPollerManagerModule from '../../functionModules/components/TaskPollerManagerModule'
import EtherTokenContractModule from '../../functionModules/protocol/EtherTokenContractModule'
import EventableModule from '../../functionModules/eventable/EventableModule'

import { Labels } from '../../util/Constants'
import { WrapTokenClick } from '../../models/Events'

import uuid4 from 'uuid/v4'

import '@/assets/style/components/erc20-token-step.sass'

@Component({
  components: {
    ProcessButton,
  },
})
export default class Erc20TokenStep extends Vue {
  public purchaseModule = getModule(PurchaseModule, this.$store)
  public appModule = getModule(AppModule, this.$store)
  public flashesModule = getModule(FlashesModule, this.$store)

  public erc20TokenProcessId!: string
  public erc20TokenMinedProcessId!: string

  public get labelText(): string {
    return Labels.WRAP_ETH
  }

  public get clickEvent(): string {
    return WrapTokenClick
  }

  @NoCache
  public get needsToken(): boolean {
    return true
    return this.purchaseModule.purchaseStep === PurchaseStep.CreateToken ||
      this.purchaseModule.purchaseStep === PurchaseStep.TokenPending
  }

  @NoCache
  public get isProcessing(): boolean {
    return this.purchaseModule.purchaseStep === PurchaseStep.TokenPending
  }

  @NoCache
  public get marketTokenBalance(): string {
    return `${this.appModule.marketTokenBalance}`
  }


  public created(this: Erc20TokenStep) {
    this.$store.subscribe(this.vuexSubscriptions)
  }

  public async vuexSubscriptions(mutation: MutationPayload) {

    if (mutation.type !== 'eventModule/append') { return }

    if (!EventableModule.isEventable(mutation.payload)) { return }

    const event = mutation.payload as Eventable

    if (!!event.error) {
      return this.flashesModule.append(new Flash(mutation.payload.error, FlashType.error))
    }

    if (!!event.response && event.processId === this.erc20TokenProcessId) {
      // Create poller for tx mining.
      const txHash = event.response.result
      return TaskPollerManagerModule.createPoller(
        txHash,
        this.purchaseModule.listing.hash,
        FfaDatatrustTaskType.wrapETH,
        this.$store,
      )
    }

    if (!!event.response && event.processId === this.erc20TokenMinedProcessId) {
      await PurchaseProcessModule.checkEtherTokenBalance(this.$store)
    }
  }

  public async onWrapTokenClick() {
    this.purchaseModule.setPurchaseStep(PurchaseStep.TokenPending)

    const amount = PurchaseProcessModule.getPurchasePrice(this.$store)

    this.erc20TokenProcessId = uuid4()
    this.erc20TokenMinedProcessId = uuid4()
    this.purchaseModule.setErc20TokenMinedProcessId(this.erc20TokenMinedProcessId)

    await EtherTokenContractModule.deposit(
      ethereum.selectedAddress,
      amount,
      this.erc20TokenProcessId,
      this.$store)
  }
}
</script>