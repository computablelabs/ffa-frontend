<template>
  <div class="support-erc20-token">
    <div class="create-token">
      <div class="indicator">
        <ProcessButton
          :buttonText="labelText"
          :clickable="processEnabled"
          :clickInterceptor="wrapEthInterceptor"
          :processing="isProcessing"
          :onClickCallback="onClickCallback"
          v-if="showButton"/>

        <BlockchainExecutingMessage
          v-if="showBlockchainMessage">
          <div slot="messageSlot" class="executing-message">
            CHANGE ME Wrapping {{ ethValue }} ETH
          </div>
        </BlockchainExecutingMessage>

        <DrawerMessage
          v-if="showDrawerMessage">
          <div slot="messageSlot" class="check-light-icon drawer-message">
            CHANGE ME Wrapped ETH
          </div>
        </DrawerMessage>
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
import SupportWithdrawModule from '../../vuexModules/SupportWithdrawModule'
import EventModule from '../../vuexModules/EventModule'
import FlashesModule from '../../vuexModules/FlashesModule'

import ProcessButton from '@/components/ui/ProcessButton.vue'

import { Eventable } from '../../interfaces/Eventable'

import { SupportStep } from '../../models/SupportStep'
import FfaListing from '../../models/FfaListing'
import Flash, { FlashType } from '../../models/Flash'

import EtherTokenContractModule from '../../functionModules/protocol/EtherTokenContractModule'
import EventableModule from '../../functionModules/eventable/EventableModule'
import SupportWithdrawProcessModule from '../../functionModules/components/SupportWithdrawProcessModule'

import { Labels, Errors } from '../../util/Constants'

import BlockchainExecutingMessage from '../ui/BlockchainExecutingMessage.vue'
import DrawerMessage from '../ui/DrawerMessage.vue'

import uuid4 from 'uuid/v4'
import DatatrustTaskModule from '../../vuexModules/DatatrustTaskModule'
import DatatrustTask from '../../models/DatatrustTask'
import DatatrustTaskDetails from '../../models/DatatrustTaskDetails'

@Component({
  components: {
    ProcessButton,
    BlockchainExecutingMessage,
    DrawerMessage,
  },
})
export default class SupportErc20TokenStep extends Vue {

  public get processEnabled(): boolean {
    return this.supportWithdrawModule.supportStep === SupportStep.WrapETH
  }

  public get isProcessing(): boolean {
    return this.supportWithdrawModule.supportStep === SupportStep.WrapETHPending
  }

  public get marketTokenBalance(): string {
    const appModule = getModule(AppModule, this.$store)
    return `${appModule.marketTokenBalance}`
  }

  public get hasTransactionId(): boolean {
    if (!this.supportWithdrawModule.erc20TokenTransactionId) {
      return false
    }
    return this.supportWithdrawModule.erc20TokenTransactionId.length > 0
  }

  public get showButton(): boolean {
    console.log(`${this.supportWithdrawModule.supportStep} vs ${SupportStep.ApproveSpending}`)
    return !this.hasTransactionId &&
      this.supportWithdrawModule.supportStep < SupportStep.ApproveSpending
  }

  public get showBlockchainMessage(): boolean {
    return this.hasTransactionId &&
      this.supportWithdrawModule.supportStep === SupportStep.WrapETHPending
  }

  public get showDrawerMessage(): boolean {
    return this.supportWithdrawModule.supportStep >= SupportStep.ApproveSpending
  }
  public labelText = Labels.WRAP_ETH
  public processId!: string

  @Prop()
  public ethValue!: number

  protected supportWithdrawModule = getModule(SupportWithdrawModule, this.$store)
  protected flashesModule = getModule(FlashesModule, this.$store)

  public created() {
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

    if (event.processId !== this.processId) {
      return
    }

    if (event.error) {
      if (event.error.message.indexOf(Errors.USER_DENIED_SIGNATURE) > 0) {
        this.processId = ''
        return this.supportWithdrawModule.setSupportStep(SupportStep.WrapETH)

      } else {
        this.supportWithdrawModule.setSupportStep(SupportStep.Error)
        return this.flashesModule.append(new Flash(mutation.payload.error, FlashType.error))
      }
    }

    if (!!event.response && event.processId === this.processId) {
      this.supportWithdrawModule.setErc20TokenTransactionId(event.response.result)
      this.processId = ''
    }
  }

  public wrapEthInterceptor(): boolean {
    if (SupportWithdrawProcessModule.hasEnoughWeth(this.$store)) {
      this.supportWithdrawModule.setSupportStep(SupportStep.ApproveSpending)
      return false
    }
    return true
  }

  public onClickCallback() {

    if (SupportWithdrawProcessModule.hasEnoughWeth(this.$store)) {
      return this.supportWithdrawModule.setSupportStep(SupportStep.ApproveSpending)
    }

    this.supportWithdrawModule.setSupportStep(SupportStep.WrapETHPending)
    this.processId = uuid4()

    EtherTokenContractModule.deposit(
          ethereum.selectedAddress,
          this.supportWithdrawModule.supportValue,
          this.processId,
          this.$store)
    }
  }
</script>