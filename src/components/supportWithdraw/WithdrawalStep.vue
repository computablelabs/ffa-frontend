<template>
  <div class="withdraw-withdrawal">
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
          CHANGE ME Withdrawing from collective
        </div>
      </BlockchainExecutingMessage>

      <DrawerMessage
        v-if="showDrawerMessage">
        <div slot="messageSlot" class="check-light-icon drawer-message">
          CHANGE ME Withdrawal complete
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
import ContractAddresses from '../../models/ContractAddresses'
import Flash, { FlashType } from '../../models/Flash'

import ReserveContractModule from '../../functionModules/protocol/ReserveContractModule'
import EventableModule from '../../functionModules/eventable/EventableModule'

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
export default class WithdrawalStep extends Vue {

  @NoCache
  public get processEnabled(): boolean {
    return this.supportWithdrawModule.withdrawStep === WithdrawStep.Withdraw &&
      getModule(AppModule, this.$store).marketTokenBalance > 0
  }

  @NoCache
  public get isProcessing(): boolean {
    return this.supportWithdrawModule.withdrawStep === WithdrawStep.WithdrawPending
  }

    public get hasTransactionId(): boolean {
    if (!this.supportWithdrawModule.withdrawTransactionId) {
      return false
    }
    return this.supportWithdrawModule.withdrawTransactionId.length > 0
  }

  public get showButton(): boolean {
    return !this.hasTransactionId &&
      this.supportWithdrawModule.withdrawStep < WithdrawStep.UnwrapWETH
  }

  public get showBlockchainMessage(): boolean {
    return this.hasTransactionId &&
      this.supportWithdrawModule.withdrawStep === WithdrawStep.WithdrawPending
  }

  public get showDrawerMessage(): boolean {
    return this.supportWithdrawModule.withdrawStep >= WithdrawStep.UnwrapWETH
  }
  public labelText = Labels.WITHDRAW_FROM_COOPERATIVE
  public processId!: string

  protected supportWithdrawModule =  getModule(SupportWithdrawModule, this.$store)

  public created(this: WithdrawalStep) {
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
      return getModule(FlashesModule, this.$store).append(new Flash(event.error, FlashType.error))
    }

    if (!!event.response && event.processId === this.processId) {
      return this.supportWithdrawModule.setWithdrawTransactionId(event.response.result)
    }
  }

  public onClickCallback() {
    const appModule = getModule(AppModule, this.$store)

    this.supportWithdrawModule.setWithdrawValue(appModule.marketTokenBalance)
    this.supportWithdrawModule.setWithdrawStep(WithdrawStep.WithdrawPending)

    this.processId = uuid4()

    ReserveContractModule.withdraw(
      ethereum.selectedAddress,
      this.processId,
      this.$store)
  }
}
</script>