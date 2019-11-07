<template>
  <div class="support-cooperative">
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
          CHANGE ME Supporting the collective with {{ ethValue }} ETH
        </div>
      </BlockchainExecutingMessage>

      <DrawerMessage
        v-if="showDrawerMessage">
        <div slot="messageSlot" class="check-light-icon drawer-message">
          CHANGE ME Support of {{ethValue}} ETH approved
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

import ReserveContractModule from '../../functionModules/protocol/ReserveContractModule'
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
export default class SupportCooperativeStep extends Vue {

  @NoCache
  public get processEnabled(): boolean {
    return this.supportWithdrawModule.supportStep === SupportStep.Support
  }

  @NoCache
  public get isProcessing(): boolean {
    return this.supportWithdrawModule.supportStep === SupportStep.SupportPending
  }

  public get hasTransactionId(): boolean {
    if (!this.supportWithdrawModule.supportCollectiveTransactionId) {
      return false
    }
    return this.supportWithdrawModule.supportCollectiveTransactionId.length > 0
  }

  public get showButton(): boolean {
    return !this.hasTransactionId &&
      this.supportWithdrawModule.supportStep < SupportStep.Complete
  }

  public get showBlockchainMessage(): boolean {
    return this.hasTransactionId &&
      this.supportWithdrawModule.supportStep === SupportStep.SupportPending
  }

  public get showDrawerMessage(): boolean {
    return this.supportWithdrawModule.supportStep === SupportStep.Complete
  }
  public processId!: string
  public labelText = Labels.SUPPORT_COOPERATIVE
  public unsubscribe!: () => void

  @Prop()
  public ethValue!: number

  protected supportWithdrawModule = getModule(SupportWithdrawModule, this.$store)
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
        return this.supportWithdrawModule.setSupportStep(SupportStep.Support)

      } else {
        this.supportWithdrawModule.setSupportStep(SupportStep.Error)
        return this.flashesModule.append(new Flash(mutation.payload.error, FlashType.error))
      }
    }

    if (!!event.response && event.processId === this.processId) {
      const supportWithdrawModule = getModule(SupportWithdrawModule, this.$store)
      return supportWithdrawModule.setSupportCollectiveTransactionId(event.response.result)
    }
  }

  public onClickCallback() {

    const supportWithdrawModule = getModule(SupportWithdrawModule, this.$store)

    supportWithdrawModule.setSupportStep(SupportStep.SupportPending)
    this.processId = uuid4()

    ReserveContractModule.support(
      ethereum.selectedAddress,
      supportWithdrawModule.supportValue,
      this.processId,
      this.$store)
  }
}
</script>