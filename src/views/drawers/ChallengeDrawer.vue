<template>
  <div class="challenge-drawer-wrapper">
    <div
      class="drawer-close"
      @click="onCloseClick">
      X
    </div>
    <h2>Challenge this listing</h2>
    <p>You must stake {{challengeStake}} CMT to challenge a listing.</p>
    <p>Your balance is {{marketTokenBalance}} CMT.</p>
    <p>If your challenge succeeds, you will get your stake back.</p>
    <p>If your challenge fails, you will lose your stake.</p>
    <!-- Approve CMT -->
    <ProcessButton
      v-if="needsApproval"
      :processing="isApprovalProcessing"
      :buttonText="approveLabel"
      :noToggle="true"
      :clickable="true"
      :clickEvent="approveSpendingEvent"
      @approve-spending-click="onApproveClick"
    />
    <!-- Challenge listing -->
    <ProcessButton
      v-if="canChallenge"
      :processing="isChallengeProcessing"
      :buttonText="challengeLabel"
      :noToggle="true"
      :clickable="true"
      :clickEvent="challengeEvent"
      @challenge-listing-click="onChallengeClick"
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
import ChallengeModule from '../../vuexModules/ChallengeModule'

import TokenFunctionModule from '../../functionModules/token/TokenFunctionModule'
import MarketTokenContractModule from '../../functionModules/protocol/MarketTokenContractModule'
import EtherTokenContractModule from '../../functionModules/protocol/EtherTokenContractModule'
import ListingContractModule from '../../functionModules/protocol/ListingContractModule'
import PurchaseProcessModule from '../../functionModules/components/PurchaseProcessModule'
import EventableModule from '../../functionModules/eventable/EventableModule'
import TaskPollerManagerModule from '../../functionModules/components/TaskPollerManagerModule'
import VotingProcessModule from '../../functionModules/components/VotingProcessModule'

import { Labels } from '../../util/Constants'

import ContractAddresses from '../../models/ContractAddresses'
import { ApproveSpendingClick, ChallengeClick } from '../../models/Events'
import Flash, { FlashType } from '../../models/Flash'

import BaseDrawer from './BaseDrawer.vue'
import ProcessButton from '@/components/ui/ProcessButton.vue'

import '@/assets/style/components/challenge-drawer.sass'
import Web3Module from '../../vuexModules/Web3Module'
import VotingModule from '../../vuexModules/VotingModule'
import FlashesModule from '../../vuexModules/FlashesModule'

import { Eventable } from '../../interfaces/Eventable'

import { FfaDatatrustTaskType } from '../../models/DatatrustTaskDetails'
import { ChallengeStep } from '../../models/ChallengeStep'
import { CloseDrawer } from '../../models/Events'

@Component({
  components: {
    ProcessButton,
  },
})
export default class ChallengeDrawer extends BaseDrawer {
  @Prop()
  public listingHash!: string

  public appModule = getModule(AppModule, this.$store)
  public web3Module = getModule(Web3Module, this.$store)
  public votingModule = getModule(VotingModule, this.$store)
  public flashesModule = getModule(FlashesModule, this.$store)
  public challengeModule = getModule(ChallengeModule, this.$store)

  public approvalProcessId!: string
  public approvalMinedProcessId!: string

  public challengeProcessId!: string
  public challengeMinedProcessId!: string

  public get approveLabel(): string {
    return Labels.ALLOW_STAKING
  }

  public get challengeLabel(): string {
    return Labels.CHALLENGE_LISTING
  }

  public get approveSpendingEvent(): string {
    return ApproveSpendingClick
  }

  public get challengeEvent(): string {
    return ChallengeClick
  }

  public get challengeStake(): number {
    // In ETH value
    return TokenFunctionModule.weiConverter(this.appModule.stake)
  }

  public get marketTokenBalance(): number {
    return TokenFunctionModule.weiConverter(this.appModule.marketTokenBalance)
  }

  public get isApprovalProcessing(): boolean {
    return this.challengeModule.challengeStep === ChallengeStep.ApprovalPending
  }

  public get isChallengeProcessing(): boolean {
    return this.challengeModule.challengeStep === ChallengeStep.ChallengePending
  }

  public get needsApproval(): boolean {
    return this.votingModule.marketTokenApproved < this.appModule.stake
  }

  public get hasEnoughMarketToken(): boolean {
    return this.appModule.marketTokenBalance > this.appModule.stake
  }

  public get canChallenge(): boolean {
    return !this.needsApproval && this.hasEnoughMarketToken
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
      // approval transaction success
      this.challengeModule.setChallengeStep(ChallengeStep.ApprovalPending)

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
      this.challengeModule.setChallengeStep(ChallengeStep.ChallengeListing)

      await this.getAllowance()
    }

    if (!!event.response && event.processId === this.challengeProcessId) {
      this.challengeModule.setChallengeStep(ChallengeStep.ChallengePending)

      const txHash = event.response.result
      return TaskPollerManagerModule.createPoller(
        txHash,
        this.listingHash,
        FfaDatatrustTaskType.challengeListing,
        this.$store,
      )
    }

    if (!!event.response && event.processId === this.challengeMinedProcessId) {
      this.challengeModule.setChallengeStep(ChallengeStep.Complete)
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
    return await MarketTokenContractModule.balanceOf(
      ethereum.selectedAddress,
      this.web3Module.web3,
    )
  }

  public async onApproveClick() {
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

  public async onChallengeClick() {
    this.challengeProcessId = uuid4()
    this.challengeMinedProcessId = uuid4()
    this.challengeModule.setChallengeMinedProcessId(this.approvalMinedProcessId)

    await ListingContractModule.challenge(
      this.listingHash,
      ethereum.selectedAddress,
      this.challengeProcessId,
      this.$store,
    )
  }

  public onCloseClick() {
    this.$root.$emit(CloseDrawer)
    // this.$router.go(-1)
  }
}
</script>