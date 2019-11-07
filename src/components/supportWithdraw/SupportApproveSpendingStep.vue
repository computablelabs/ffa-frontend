<template>
  <div class="support-approve-spending">
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
          CHANGE ME Approving {{ ethValue }} ETH in spending
        </div>
      </BlockchainExecutingMessage>

      <DrawerMessage
        v-if="showDrawerMessage">
        <div slot="messageSlot" class="check-light-icon drawer-message">
          CHANGE ME Spending {{ethValue}} ETH approved
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

import { SupportStep } from '../../models/SupportStep'
import FfaListing from '../../models/FfaListing'
import ContractAddresses from '../../models/ContractAddresses'
import Flash, { FlashType } from '../../models/Flash'

import EtherTokenContractModule from '../../functionModules/protocol/EtherTokenContractModule'
import EventableModule from '../../functionModules/eventable/EventableModule'
import SupportWithdrawProcessModule from '../../functionModules/components/SupportWithdrawProcessModule'

import { Labels, Errors } from '../../util/Constants'

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
export default class SupportApproveSpendingStep extends Vue {

  public unsubscribe!: () => void

  @NoCache
  public get processEnabled(): boolean {
    return this.supportWithdrawModule.supportStep === SupportStep.ApproveSpending
  }

  @NoCache
  public get isProcessing(): boolean {
    return this.supportWithdrawModule.supportStep === SupportStep.ApprovalPending
  }

  public get hasTransactionId(): boolean {
    if (!this.supportWithdrawModule.approvePaymentTransactionId) {
      return false
    }
    return this.supportWithdrawModule.approvePaymentTransactionId.length > 0
  }

  public get showButton(): boolean {
    return !this.hasTransactionId &&
      this.supportWithdrawModule.supportStep < SupportStep.Support
  }

  public get showBlockchainMessage(): boolean {
    return this.hasTransactionId &&
      this.supportWithdrawModule.supportStep === SupportStep.ApprovalPending
  }

  public get showDrawerMessage(): boolean {
    return this.supportWithdrawModule.supportStep >= SupportStep.Support
  }

  @NoCache
  public get datatrustContractAllowance(): string {
    return `${getModule(AppModule, this.$store).datatrustContractAllowance}`
  }
  public processId!: string
  public labelText = Labels.APPROVE_SPENDING

  @Prop()
  public ethValue!: number

  protected supportWithdrawModule =  getModule(SupportWithdrawModule, this.$store)
  protected flashesModule = getModule(FlashesModule, this.$store)

  public created() {
    this.unsubscribe = this.$store.subscribe(this.vuexSubscriptions)
  }

  public beforeDestroy() {
    this.unsubscribe()
  }

  public vuexSubscriptions(mutation: MutationPayload) {

    if (mutation.type !== 'eventModule/append') {
      return
    }

    if (!EventableModule.isEventable(mutation.payload)) {
      return
    }

    const event = mutation.payload as Eventable

    if (event.processId !== this.processId) {
      return
    }

    if (event.error) {
      if (event.error.message.indexOf(Errors.USER_DENIED_SIGNATURE) > 0) {
        return this.supportWithdrawModule.setSupportStep(SupportStep.ApproveSpending)

      } else {
        this.supportWithdrawModule.setSupportStep(SupportStep.Error)
        return this.flashesModule.append(new Flash(mutation.payload.error, FlashType.error))
      }
    }

    if (!!event.response && event.processId === this.processId) {
      return this.supportWithdrawModule.setApprovePaymentTransactionId(event.response.result)
    }
  }

  public onClickCallback() {

    if (SupportWithdrawProcessModule.hasEnoughReserveApproval(this.$store)) {
      return this.supportWithdrawModule.setSupportStep(SupportStep.Support)
    }

    this.supportWithdrawModule.setSupportStep(SupportStep.ApprovalPending)
    this.processId = uuid4()

    EtherTokenContractModule.approve(
      ethereum.selectedAddress,
      ContractAddresses.ReserveAddress!,
      this.supportWithdrawModule.supportValue,
      this.processId,
      this.$store)
  }
}
</script>