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
import { Store } from 'vuex'
import { Placeholders } from '../../util/Constants'
import VotingContractModule from '../../functionModules/protocol/VotingContractModule'
import VotingModule from '../../vuexModules/VotingModule'
import { getModule } from 'vuex-module-decorators'
import FfaListing from '../../models/FfaListing'
import MarketTokenContractModule from '../../functionModules/protocol/MarketTokenContractModule'
import Web3Module from '../../vuexModules/Web3Module'
import ContractAddresses from '../../models/ContractAddresses'
import ContractsAddresses from '../../models/ContractAddresses'
import { Config } from '../../util/Config'
import FfaListingsModule from '../../vuexModules/FfaListingsModule'
import VotingProcessModule from '../../functionModules/components/VotingProcessModule'
import PurchaseProcessModule from '../../functionModules/components/PurchaseProcessModule'

@Component
export default class VotingInterface extends Vue {

  private placeholder = Placeholders.COMMENT
  private votingModule: VotingModule = getModule(VotingModule, this.$store)
  private ffaListingsModule: FfaListingsModule = getModule(FfaListingsModule, this.$store)
  private web3Module: Web3Module = getModule(Web3Module, this.$store)

  get candidate(): FfaListing {
    return this.votingModule.candidate
  }

  protected async votingTransactionSuccess(response: any, appStore: Store<any>) {
    this.votingModule.setVotingTransactionId(response)

    await this.wait(1.25 * Config.BlockchainWaitTime)

    // Update UI with new info
    await Promise.all([
      VotingProcessModule.updateCandidateDetails(this.$store),
      VotingProcessModule.updateStaked(this.$store),
      PurchaseProcessModule.updateMarketTokenBalance(this.$store),
    ])
  }

  protected async votingApprovalSuccess(response: any, appStore: Store<any>) {
    return
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
      this.$store,
      this.votingApprovalSuccess)
  }

  protected async vote(votesYes: boolean) {
    await VotingContractModule.vote(
      votesYes,
      this.candidate.hash,
      ethereum.selectedAddress,
      this.$store,
      this.votingTransactionSuccess,
      {},
    )
  }

  private async onVotingButtonClick(votesYes: boolean) {
    if (Number(await this.allowance()) < this.votingModule.candidate.stake) {
      await this.setVotingApproval()
      await this.wait(Config.BlockchainWaitTime)
    }
    await this.vote(votesYes)
  }

  private async wait(ms: number): Promise<any> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

}
</script>