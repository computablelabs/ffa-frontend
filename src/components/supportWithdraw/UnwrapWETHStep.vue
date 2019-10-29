<template>
  <div class="withdraw-unwrap-weth">
    <div class="indicator">
      <ProcessButton
        :buttonText="labelText"
        :clickable="processEnabled"
        :processing="isProcessing"
        :onClickCallback="onClickCallback"
        v-if="showButton"/>

      <BlockchainExecutingMessage
        v-if="showBlockchainMessage">
        <div slot="messageSlot" class="executing-message">
          CHANGE ME Unwrapping {{ wethValue }} WETH
        </div>
      </BlockchainExecutingMessage>

      <DrawerMessage
        v-if="showDrawerMessage">
        <div slot="messageSlot" class="check-light-icon drawer-message">
          CHANGE ME Unwrapper {{ wethValue }} WETH
        </div>
      </DrawerMessage>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import { NoCache } from 'vue-class-decorator'
import { MutationPayload, Store } from 'vuex'
import { VuexModule, getModule } from 'vuex-module-decorators'

import AppModule from '../../vuexModules/AppModule'
import SupportWithdrawModule from '../../vuexModules/SupportWithdrawModule'
import FlashesModule from '../../vuexModules/FlashesModule'

import ProcessButton from '@/components/ui/ProcessButton.vue'

import { Eventable } from '../../interfaces/Eventable'

import { WithdrawStep } from '../../models/WithdrawStep'
import FfaListing from '../../models/FfaListing'
import ContractsAddresses from '../../models/ContractAddresses'
import Flash, { FlashType } from '../../models/Flash'

import EtherTokenContractModule from '../../functionModules/protocol/EtherTokenContractModule'
import EventableModule from '../../functionModules/eventable/EventableModule'
import SupportWithdrawProcessModule from '../../functionModules/components/SupportWithdrawProcessModule'

import { Labels } from '../../util/Constants'

import BlockchainExecutingMessage from '../ui/BlockchainExecutingMessage.vue'
import DrawerMessage from '../ui/DrawerMessage.vue'

import uuid4 from 'uuid/v4'

@Component({
  components: {
    ProcessButton,
    BlockchainExecutingMessage,
    DrawerMessage,
  },
})
export default class UnwrapWETHStep extends Vue {

  public get processEnabled(): boolean {
    return getModule(SupportWithdrawModule, this.$store).withdrawStep === WithdrawStep.UnwrapWETH &&
      getModule(AppModule, this.$store).etherTokenBalance > 0
  }

  public get wethValue(): number {
    if (!this.supportWithdrawModule.withdrawValue) {
      return 0
    }
    return SupportWithdrawProcessModule.weiToMarketTokens(
      this.supportWithdrawModule.withdrawValue,
      this.$store)
  }

  public get isProcessing(): boolean {
    return getModule(SupportWithdrawModule, this.$store).withdrawStep === WithdrawStep.UnwrapWETHPending
  }

  public get hasTransactionId(): boolean {
    if (!this.supportWithdrawModule.unwrapWETHTransacctionId) {
      return false
    }
    return this.supportWithdrawModule.unwrapWETHTransacctionId.length > 0
  }

  public get showButton(): boolean {
    return !this.hasTransactionId &&
      this.supportWithdrawModule.withdrawStep < WithdrawStep.Complete
  }

  public get showBlockchainMessage(): boolean {
    return this.hasTransactionId &&
      this.supportWithdrawModule.withdrawStep === WithdrawStep.UnwrapWETHPending
  }

  public get showDrawerMessage(): boolean {
    return this.supportWithdrawModule.withdrawStep >= WithdrawStep.Complete
  }
  public labelText = Labels.UNWRAP_WETH
  public processId!: string

  protected supportWithdrawModule =  getModule(SupportWithdrawModule, this.$store)

  public created(this: UnwrapWETHStep) {
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
      return flashesModule.append(new Flash(event.error, FlashType.error))
    }

    if (!!event.response && event.processId === this.processId) {
      const supportWithdrawModule = getModule(SupportWithdrawModule, this.$store)

      return supportWithdrawModule.setUnwrapWETHTransactionId(event.response.result)
    }
  }

  public async onClickCallback() {

    getModule(SupportWithdrawModule, this.$store).setWithdrawStep(WithdrawStep.UnwrapWETHPending)

    this.processId = uuid4()

    EtherTokenContractModule.withdraw(
      ethereum.selectedAddress,
      getModule(AppModule, this.$store).etherTokenBalance,
      this.processId,
      this.$store)
  }
}
</script>