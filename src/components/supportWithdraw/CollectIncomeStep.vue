<template>
  <div class="withdraw-collect-income">
    <div class="indicator">
      <ProcessButton
        :buttonText="labelText"
        :processing="isProcessing"
        :onClickCallback="onClickCallback"
        v-if="showButton"/>

      <BlockchainExecutingMessage
        v-if="showBlockchainMessage">
        <div slot="messageSlot" class="executing-message">
          CHANGE ME Collecting income
        </div>
      </BlockchainExecutingMessage>

      <DrawerMessage
        v-if="showDrawerMessage">
        <div slot="messageSlot" class="check-light-icon drawer-message">
          CHANGE ME Income collected
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
import ListingContractModule from '../../functionModules/protocol/ListingContractModule'
import EventableModule from '../../functionModules/eventable/EventableModule'

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
export default class CollectIncomeStep extends Vue {

  @NoCache
  public get isProcessing(): boolean {
    const supportWithdrawModule = getModule(SupportWithdrawModule, this.$store)
    return supportWithdrawModule.withdrawStep === WithdrawStep.CollectIncomePending
  }

  public get hasTransactionId(): boolean {
    if (!this.supportWithdrawModule.collectIncomeTransactionIds) {
      return false
    }
    return this.supportWithdrawModule.collectIncomeTransactionIds.length > 0
  }

  public get showButton(): boolean {
    return !this.hasTransactionId &&
      this.supportWithdrawModule.withdrawStep >= WithdrawStep.CollectIncome &&
      this.supportWithdrawModule.withdrawStep < WithdrawStep.Withdraw
  }

  public get showBlockchainMessage(): boolean {
    return this.hasTransactionId &&
      this.supportWithdrawModule.withdrawStep === WithdrawStep.CollectIncomePending
  }

  public get showDrawerMessage(): boolean {
    return this.supportWithdrawModule.withdrawStep >= WithdrawStep.Withdraw
  }
  public labelText = Labels.COLLECT_INCOME
  public processIds: string[] = []

  protected supportWithdrawModule =  getModule(SupportWithdrawModule, this.$store)
  protected flashesModule = getModule(FlashesModule, this.$store)

  public created(this: CollectIncomeStep) {
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

    if (this.processIds.indexOf(event.processId!) < 0) {
      return
    }

    if (event.error) {
      if (event.error.message.indexOf(Errors.USER_DENIED_SIGNATURE) > 0) {
        return this.supportWithdrawModule.setWithdrawStep(WithdrawStep.CollectIncome)

      } else {
        this.supportWithdrawModule.setWithdrawStep(WithdrawStep.Error)
        return this.flashesModule.append(new Flash(mutation.payload.error, FlashType.error))
      }
    }

    if (!!event.response && !!event.processId && this.processIds.indexOf(event.processId!) >= 0) {
      const supportWithdrawModule = getModule(SupportWithdrawModule, this.$store)

      return supportWithdrawModule.addCollectIncomeTransactionId(event.response.result)
    }
  }

  public async onClickCallback() {

    const supportWithdrawModule = getModule(SupportWithdrawModule, this.$store)

    supportWithdrawModule.setWithdrawStep(WithdrawStep.CollectIncomePending)

    supportWithdrawModule.listingHashes.forEach((hash) => {

      const newProcessId = uuid4()
      this.processIds.push(newProcessId)

      ListingContractModule.claimAccessReward(
        hash,
        ethereum.selectedAddress,
        newProcessId,
        this.$store)
    })
  }
}
</script>