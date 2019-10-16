<template>
  <div class="challenge-drawer-wrapper">
    <h2>Challenge this listing</h2>
    <p>You must stake {{challengeStake}} CMT to challenge a listing.</p>
    <p>Your balance is {{marketTokenBalance}} CMT.</p>
    <p>If your challenge succeeds, you will get your stake back.</p>
    <p>If your challenge fails, you will lose your stake.</p>
    <!-- Approve CMT -->
    <ProcessButton
      v-if="needsApproval"
      :processing="isProcessing"
      :buttonText="approveLabel"
      :noToggle="true"
      :clickable="true"
      :clickEvent="approveSpendingEvent"
      @approve-spending-click="onApproveSpendingClick"
    />
    <!-- Challenge listing -->
    <ProcessButton
      :processing="isProcessing"
      :buttonText="challengeLabel"
      :noToggle="true"
      :clickable="true"
    />
  </div>
</template>

<script lang="ts">
import { NoCache } from 'vue-class-decorator'
import { Component, Vue, Prop } from 'vue-property-decorator'
import { getModule } from 'vuex-module-decorators'
import { MutationPayload } from 'vuex'

import uuid4 from 'uuid/v4'

import AppModule from '../../vuexModules/AppModule'

import TokenFunctionModule from '../../functionModules/token/TokenFunctionModule'
import MarketTokenContractModule from '../../functionModules/protocol/MarketTokenContractModule'
import PurchaseProcessModule from '../../functionModules/components/PurchaseProcessModule'
import EtherTokenContractModule from '../../functionModules/protocol/EtherTokenContractModule'
import EventableModule from '../../functionModules/eventable/EventableModule'

import { Labels } from '../../util/Constants'

import ContractAddresses from '../../models/ContractAddresses'
import { ApproveSpendingClick } from '../../models/Events'
import Flash, { FlashType } from '../../models/Flash'

import BaseDrawer from './BaseDrawer.vue'
import ProcessButton from '@/components/ui/ProcessButton.vue'

import '@/assets/style/components/challenge-drawer.sass'
import Web3Module from '../../vuexModules/Web3Module'
import VotingModule from '../../vuexModules/VotingModule'
import FlashesModule from '../../vuexModules/FlashesModule'
import TaskPollerManagerModule from '../../functionModules/components/TaskPollerManagerModule'
import { FfaDatatrustTaskType } from '../../models/DatatrustTaskDetails'
import { Eventable } from '../../interfaces/Eventable'
import VotingProcessModule from '../../functionModules/components/VotingProcessModule'


@Component({
  components: {
    ProcessButton,
  },
})
export default class PurchaseDrawer extends BaseDrawer {
  @Prop()
  public listingHash!: string

  public appModule = getModule(AppModule, this.$store)
  public web3Module = getModule(Web3Module, this.$store)
  public votingModule = getModule(VotingModule, this.$store)
  public flashesModule = getModule(FlashesModule, this.$store)

  public approvalProcessId!: string
  public approvalMinedProcessId!: string

  public get approveLabel(): string {
    return Labels.ALLOW_STAKING
  }

  public get challengeLabel(): string {
    return Labels.CHALLENGE_LISTING
  }

  public get approveSpendingEvent(): string {
    return ApproveSpendingClick
  }

  public get challengeStake(): number {
    return TokenFunctionModule.weiConverter(this.appModule.stake)
  }

  public get marketTokenBalance(): number {
    return TokenFunctionModule.weiConverter(this.appModule.marketTokenBalance)
  }

  public get needsApproval(): boolean {
    return this.votingModule.marketTokenApproved < this.appModule.stake
  }

  public async created() {
    this.$store.subscribe(this.vuexSubscriptions)
  }

  public async vuexSubscriptions(mutation: MutationPayload) {
    if (mutation.type !== 'eventModule/append') {
      switch (mutation.type) {
        case 'appModule/setAppReady':
          return await Promise.all([
            VotingProcessModule.updateMarketTokenBalance(this.$store),
            this.getAllowance(),
          ])
        default:
          return
      }
     }

    if (!EventableModule.isEventable(mutation.payload)) { return }

    const event = mutation.payload as Eventable

    if (!!event.error) {
      return this.flashesModule.append(new Flash(event.error, FlashType.error))
    }

    if (!!event.response && event.processId === this.approvalProcessId) {
      const txHash = event.response.result
      return TaskPollerManagerModule.createPoller(
        txHash,
        this.listingHash,
        FfaDatatrustTaskType.approveCMT,
        this.$store,
      )
    }

    if (!!event.response && event.processId === this.approvalMinedProcessId) {
      // Update available allowance
      await this.getAllowance()
    }
  }

  public async getAllowance(): Promise<void> {
    const allowance =  await MarketTokenContractModule.allowance(
      ethereum.selectedAddress,
      this.web3Module.web3,
      ethereum.selectedAddress,
      ContractAddresses.VotingAddress,
    )
    this.votingModule.setMarketTokenApproved(Number(allowance))
  }

  public async getMarketTokenBalance(): Promise<string> {
    return await MarketTokenContractModule.getBalance(
      ethereum.selectedAddress,
      this.web3Module.web3,
    )
  }

  public async onApproveSpendingClick() {
    const userCMTBalance = await this.getMarketTokenBalance()
    this.approvalProcessId = uuid4()
    this.approvalMinedProcessId = uuid4()
    this.votingModule.setApprovalMinedProcessId(this.approvalMinedProcessId)

    await MarketTokenContractModule.approve(
      ethereum.selectedAddress,
      this.web3Module.web3,
      ContractAddresses.VotingAddress,
      userCMTBalance,
      this.approvalProcessId,
      this.$store,
    )
  }
}
</script>