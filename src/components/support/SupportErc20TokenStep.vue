<template>
  <div class="erc20-token">
    <div
      class="create-token"
      v-if="needsToken">
      <div class="indicator">
        <ProcessButton
          :processing="isProcessing"
          :onClickCallback="onClickCallback"/>
      </div>
      <div class="label">
        {{ labelText }}
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

import { Labels } from '../../util/Constants'

import uuid4 from 'uuid/v4'
import DatatrustTaskModule from '../../vuexModules/DatatrustTaskModule'
import DatatrustTask from '../../models/DatatrustTask'
import DatatrustTaskDetails from '../../models/DatatrustTaskDetails'

@Component({
  components: {
    ProcessButton,
  },
})
export default class Erc20TokenStep extends Vue {

  @NoCache
  public get needsToken(): boolean {
    const supportWithdrawModule = getModule(SupportWithdrawModule, this.$store)
    return supportWithdrawModule.supportValue === SupportStep.WrapEth ||
      supportWithdrawModule.supportStep === SupportStep.WrapEthPending
  }

  @NoCache
  public get isProcessing(): boolean {
    const supportWithdrawModule = getModule(SupportWithdrawModule, this.$store)
    return supportWithdrawModule.supportStep === SupportStep.WrapEthPending
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
      const supportWithdrawModule = getModule(SupportWithdrawModule, this.$store)
      const datatrustTaskModule = getModule(DatatrustTaskModule, this.$store)

      // TODO: figure out
      supportWithdrawModule.setErc20TokenTransactionId(event.response)

      const taskDetails = new DatatrustTaskDetails()
      datatrustTaskModule.addTask(new DatatrustTask())
    }
  }

  public onClickCallback() {

    const supportWithdrawModule = getModule(SupportWithdrawModule, this.$store)
    supportWithdrawModule.setSupportStep(SupportStep.WrapEthPending)

    this.processId = uuid4()

    EtherTokenContractModule.deposit(
      ethereum.selectedAddress,
      supportWithdrawModule.supportValue,
      this.processId,
      this.$store)
  }
}
</script>