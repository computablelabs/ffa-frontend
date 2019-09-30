<template>
  <div class="voting-interface-wrapper">
    <div class="voting-button-container">
      <font-awesome-icon 
        size="2x"
        class="voting-icon"
        :icon="['fa', 'gavel']" />
      <span>Vote</span>
      <button 
        @click="onVotingButtonClick(true)"
        class="button voting-interface-button">Accept</button>
      <button 
        @click="onVotingButtonClick(false)"
        class="button voting-interface-button">Reject</button>
    </div>
    <textarea 
      :placeholder="placeholder"
      class="comment-box"></textarea>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import { getModule } from 'vuex-module-decorators'
import { Store, MutationPayload } from 'vuex'

import { Placeholders } from '../../util/Constants'

import ContractAddresses from '../../models/ContractAddresses'
import ContractsAddresses from '../../models/ContractAddresses'

import FfaListing from '../../models/FfaListing'
import { CloseDrawer } from '../../models/Events'
import Flash, { FlashType } from '../../models/Flash'

import { Config } from '../../util/Config'

import FfaListingsModule from '../../vuexModules/FfaListingsModule'
import Web3Module from '../../vuexModules/Web3Module'
import VotingModule from '../../vuexModules/VotingModule'
import FlashesModule from '../../vuexModules/FlashesModule'
import PurchaseModule from '../../vuexModules/PurchaseModule'

import VotingProcessModule from '../../functionModules/components/VotingProcessModule'
import PurchaseProcessModule from '../../functionModules/components/PurchaseProcessModule'
import EventableModule from '../../functionModules/eventable/EventableModule'

import MarketTokenContractModule from '../../functionModules/protocol/MarketTokenContractModule'
import VotingContractModule from '../../functionModules/protocol/VotingContractModule'

import { Eventable } from '../../interfaces/Eventable'

import uuid4 from 'uuid/v4'

@Component
export default class VotingInterface extends Vue {

  public processId!: string

  public votingModule: VotingModule = getModule(VotingModule, this.$store)
  public ffaListingsModule: FfaListingsModule = getModule(FfaListingsModule, this.$store)
  public web3Module: Web3Module = getModule(Web3Module, this.$store)
  public purchaseModule: PurchaseModule = getModule(PurchaseModule, this.$store)
  public flashesModule: FlashesModule = getModule(FlashesModule, this.$store)

  public placeholder = Placeholders.COMMENT


  get candidate(): FfaListing {
    return this.votingModule.candidate
  }

  public created() {
    this.$store.subscribe(this.vuexSubscriptions)
  }

  public async vuexSubscriptions(mutation: MutationPayload) {

    if (mutation.type !== 'eventModule/append') {
      return
    }

    if (!EventableModule.isEventable(mutation.payload)) {
      return
    }

    const event = mutation.payload as Eventable

    if (!!event.error) {
      return this.flashesModule.append(new Flash(mutation.payload.error, FlashType.error))
    }

    if (!!event.response && event.processId === this.processId) {
      await this.votingTransactionSuccess(event.response)
    }
  }

  protected async votingTransactionSuccess(response: any) {
    this.votingModule.setVotingTransactionId(response)

    // TODO: Replace with polling mechanism
    await this.wait(1.25 * Config.BlockchainWaitTime)

    // Update UI with new info
    await Promise.all([
      VotingProcessModule.updateCandidateDetails(this.$store),
      VotingProcessModule.updateStaked(this.$store),
      PurchaseProcessModule.updateMarketTokenBalance(this.$store),
    ])
  }

  protected async allowance(): Promise<string> {
    return await MarketTokenContractModule.allowance(
      ethereum.selectedAddress,
      this.web3Module.web3,
      ethereum.selectedAddress,
      ContractsAddresses.VotingAddress)
  }

  protected async setVotingApproval() {
    await MarketTokenContractModule.approve(
      ethereum.selectedAddress,
      this.web3Module.web3,
      ContractAddresses.VotingAddress,
      String(this.votingModule.candidate.stake),
      this.processId,
      this.$store)
  }

  protected async vote(votesYes: boolean) {
    await VotingContractModule.vote(
      votesYes,
      this.candidate.hash,
      ethereum.selectedAddress,
      this.processId,
      this.$store,
      {},
    )
  }

  private async onVotingButtonClick(votesYes: boolean) {
    this.$root.$emit(CloseDrawer)
    this.processId = uuid4()
    if (Number(await this.allowance()) < this.votingModule.candidate.stake) {
      await this.setVotingApproval()
      await this.wait(1.25 * Config.BlockchainWaitTime)
    }
    await this.vote(votesYes)
  }

  private async wait(ms: number): Promise<any> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

}
</script>