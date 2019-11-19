<template>
  <div class="withdraw-collect-income">
    <DrawerBlockchainStep
      :label="drawerLabel"
      :state="drawerStepState"
      :onButtonClick="onClickCallback"/>
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

import { Eventable } from '../../interfaces/Eventable'

import { WithdrawStep } from '../../models/WithdrawStep'
import FfaListing from '../../models/FfaListing'
import ContractAddresses from '../../models/ContractAddresses'
import Flash, { FlashType } from '../../models/Flash'
import { DrawerBlockchainStepState } from '../../models/DrawerBlockchainStepState'

import ReserveContractModule from '../../functionModules/protocol/ReserveContractModule'
import ListingContractModule from '../../functionModules/protocol/ListingContractModule'
import EventableModule from '../../functionModules/eventable/EventableModule'

import { Labels, Errors } from '../../util/Constants'

import DrawerBlockchainStep from '../ui/DrawerBlockchainStep.vue'

import uuid4 from 'uuid/v4'

@Component({
  components: {
    DrawerBlockchainStep,
  },
})
export default class CollectIncomeStep extends Vue {

  public unsubscribe!: () => void

  public processIds: string[] = []

  public supportWithdrawModule =  getModule(SupportWithdrawModule, this.$store)
  public flashesModule = getModule(FlashesModule, this.$store)

  public get drawerLabel(): string {
    switch (this.supportWithdrawModule.withdrawStep) {

      case WithdrawStep.Error:
      case WithdrawStep.CollectIncome:
        return `${Labels.COLLECT_INCOME}`

      case WithdrawStep.CollectIncomePending:
        return `${Labels.COLLECT_INCOME}`

      default:
        return `${Labels.COLLECT_INCOME}`
    }
  }

  public get drawerStepState(): DrawerBlockchainStepState {
    switch (this.supportWithdrawModule.withdrawStep) {

      case WithdrawStep.Error:
      case WithdrawStep.CollectIncome:
        return DrawerBlockchainStepState.ready

      case WithdrawStep.CollectIncomePending:
        return DrawerBlockchainStepState.processing

      default:
        return DrawerBlockchainStepState.completed
    }
  }

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
    if (this.processIds.indexOf(event.processId!) < 0) {
      return
    }

    if (event.error) {
      if (event.error.message.indexOf(Errors.USER_DENIED_SIGNATURE) >= 0) {
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