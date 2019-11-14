<template>
  <div class="purchase-erc20-token">
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
import PurchaseModule from '../../vuexModules/PurchaseModule'
import EventModule from '../../vuexModules/EventModule'
import FlashesModule from '../../vuexModules/FlashesModule'

import { Eventable } from '../../interfaces/Eventable'

import { PurchaseStep } from '../../models/PurchaseStep'
import FfaListing from '../../models/FfaListing'
import Flash, { FlashType } from '../../models/Flash'
import { FfaDatatrustTaskType } from '../../models/DatatrustTaskDetails'
import { DrawerBlockchainStepState } from '../../models/DrawerBlockchainStepState'

import PurchaseProcessModule from '../../functionModules/components/PurchaseProcessModule'
import TaskPollerManagerModule from '../../functionModules/components/TaskPollerManagerModule'
import EtherTokenContractModule from '../../functionModules/protocol/EtherTokenContractModule'
import EventableModule from '../../functionModules/eventable/EventableModule'
import TaskPollerModule from '../../functionModules/task/TaskPollerModule'

import { Labels, Errors } from '../../util/Constants'

import DrawerBlockchainStep from '../ui/DrawerBlockchainStep.vue'

import uuid4 from 'uuid/v4'

import '@/assets/style/components/erc20-token-step.sass'

@Component({
  components: {
    DrawerBlockchainStep,
  },
})
export default class PurchaseErc20TokenStep extends Vue {
  public purchaseModule = getModule(PurchaseModule, this.$store)
  public appModule = getModule(AppModule, this.$store)
  public flashesModule = getModule(FlashesModule, this.$store)

  public erc20TokenProcessId!: string
  public erc20TokenMinedProcessId!: string

  public unsubscribe!: () => void

  public get drawerLabel(): string {
    switch (this.purchaseModule.purchaseStep) {

      case PurchaseStep.Error:
      case PurchaseStep.CreateToken:
        return `CHANGE ME ${Labels.WRAP_ETH}`

      case PurchaseStep.TokenPending:
        return `CHANGE ME ${Labels.WRAP_ETH}`

      default:
        return `CHANGE ME ${Labels.WRAP_ETH}`
    }
  }

  public get drawerStepState(): DrawerBlockchainStepState {
    switch (this.purchaseModule.purchaseStep) {

      case PurchaseStep.Error:
      case PurchaseStep.CreateToken:
        return DrawerBlockchainStepState.ready

      case PurchaseStep.TokenPending:
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

  public async vuexSubscriptions(mutation: MutationPayload) {

    if (mutation.type !== 'eventModule/append') { return }

    if (!EventableModule.isEventable(mutation.payload)) { return }

    const event = mutation.payload as Eventable

    if (event.processId !== this.erc20TokenProcessId) { return }

    if (!!event.error) {
      if (event.error.message.indexOf(Errors.USER_DENIED_SIGNATURE) > 0) {
        return this.purchaseModule.setPurchaseStep(PurchaseStep.CreateToken)
      }

      this.purchaseModule.setPurchaseStep(PurchaseStep.Error)
      return this.flashesModule.append(new Flash(mutation.payload.error, FlashType.error))
    }

    if (!!event.response) {
      // Create poller for tx mining.
      const txHash = event.response.result
      return TaskPollerModule.createTaskPollerForEthereumTransaction(
        txHash,
        this.purchaseModule.listing.hash,
        FfaDatatrustTaskType.wrapETH,
        this.$store,
      )
    }
  }

  public async onClickCallback() {
    const amount = PurchaseProcessModule.getPurchasePrice(this.$store)
    this.erc20TokenProcessId = uuid4()
    this.erc20TokenMinedProcessId = uuid4()

    this.purchaseModule.setErc20TokenMinedProcessId(this.erc20TokenMinedProcessId)

    await EtherTokenContractModule.deposit(
      ethereum.selectedAddress,
      amount,
      this.erc20TokenProcessId,
      this.$store)

    this.purchaseModule.setPurchaseStep(PurchaseStep.TokenPending)
  }

}
</script>