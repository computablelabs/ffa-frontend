<template>
  <div class="erc20-token tile is-hcentered">
    <div
      class="create-token tile is-8"
      v-if="needsToken">
      <div class="indicator tile is-2">
        <ProcessButton
          :processing="isProcessing"
          :onClickCallback="onClickCallback"/>
      </div>
      <div class="label tile">
        {{ labelText }}
      </div>
    </div>
    <div
      class="market-token-balance tile is-8"
      v-else>
      <div class="indicator tile is-2"></div>
      <div class="label tile">
        {{ marketTokenBalance }}
      </div>
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

import PurchaseProcessModule from '../../functionModules/components/PurchaseProcessModule'
import EtherTokenContractModule from '../../functionModules/protocol/EtherTokenContractModule'
import EventableModule from '../../functionModules/eventable/EventableModule'

import { Labels } from '../../util/Constants'

import uuid4 from 'uuid/v4'

@Component({
  components: {
    ProcessButton,
  },
})
export default class Erc20TokenStep extends Vue {

  @NoCache
  public get needsToken(): boolean {
    const purchaseModule = getModule(PurchaseModule, this.$store)
    return purchaseModule.purchaseStep === PurchaseStep.CreateToken ||
      purchaseModule.purchaseStep === PurchaseStep.TokenPending
  }

  @NoCache
  public get isProcessing(): boolean {
    const purchaseModule = getModule(PurchaseModule, this.$store)
    return purchaseModule.purchaseStep === PurchaseStep.TokenPending
  }

  public get labelText(): string {
    return Labels.WRAP_ETH
  }

  @NoCache
  public get marketTokenBalance(): string {
    const appModule = getModule(AppModule, this.$store)
    return `${appModule.marketTokenBalance}`
  }

  public processId!: string

  public created(this: Erc20TokenStep) {
    this.$store.subscribe(this.vuexSubscriptions)
  }

  public vuexSubscriptions(mutation: MutationPayload) {

    if (mutation.type !== 'eventModule/append') {
      return
    }

    if (!EventableModule.isEventable(mutation.payload)) {
      return
    }

    const event = mutation.payload as Eventable

    if (!!event.error) {
      const flashesModule = getModule(FlashesModule, this.$store)
      return flashesModule.append(new Flash(mutation.payload.error, FlashType.error))
    }

    if (!!event.response && event.processId === this.processId) {
      const purchaseModule = getModule(PurchaseModule, this.$store)
      purchaseModule.setErc20TokenTransactionId(event.response)
    }
  }

  public onClickCallback() {

    const purchaseModule = getModule(PurchaseModule, this.$store)
    purchaseModule.setPurchaseStep(PurchaseStep.TokenPending)

    const amount = PurchaseProcessModule.getPurchasePrice(this.$store)

    this.processId = uuid4()

    EtherTokenContractModule.deposit(
      ethereum.selectedAddress,
      amount,
      this.processId,
      this.$store)
  }
}
</script>