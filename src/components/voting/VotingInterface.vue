<template>
  <div class="voting-drawer-container">
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
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import { getModule } from 'vuex-module-decorators'
import { Store, MutationPayload } from 'vuex'
import { NoCache } from 'vue-class-decorator'

import { Placeholders } from '../../util/Constants'

import ContractAddresses from '../../models/ContractAddresses'
import ContractsAddresses from '../../models/ContractAddresses'

import FfaListing from '../../models/FfaListing'
import { CloseDrawer } from '../../models/Events'
import Flash, { FlashType } from '../../models/Flash'
import { ProcessStatus } from '../../models/ProcessStatus'

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

import ProcessButton from '../../components/ui/ProcessButton.vue'

import uuid4 from 'uuid/v4'
import DatatrustModule from '../../functionModules/datatrust/DatatrustModule'
import DatatrustTaskDetails, { FfaDatatrustTaskType } from '../../models/DatatrustTaskDetails'
import DatatrustTask from '../../models/DatatrustTask'
import DatatrustTaskModule from '../../vuexModules/DatatrustTaskModule'

@Component({
  components: {
    ProcessButton,
  },
})
export default class VotingInterface extends Vue {
  public approvalProcessId!: string
  public votingProcessId!: string

  public approvalMinedProcessId!: string
  public votingMinedProcessId!: string

  public votingModule: VotingModule = getModule(VotingModule, this.$store)
  public ffaListingsModule: FfaListingsModule = getModule(FfaListingsModule, this.$store)
  public web3Module: Web3Module = getModule(Web3Module, this.$store)
  public purchaseModule: PurchaseModule = getModule(PurchaseModule, this.$store)
  public flashesModule: FlashesModule = getModule(FlashesModule, this.$store)
  public datatrustTaskModule: DatatrustTaskModule = getModule(DatatrustTaskModule, this.$store)

  public placeholder = Placeholders.COMMENT
  public notFirstVote = false

  @NoCache
  public get candidate(): FfaListing {
    return this.votingModule.candidate
  }

  public async created() {
    this.$store.subscribe(this.vuexSubscriptions)
  }

  public async vuexSubscriptions(mutation: MutationPayload) {
    if (mutation.type !== 'eventModule/append') { return }

    if (!EventableModule.isEventable(mutation.payload)) { return }

    const event = mutation.payload as Eventable

    if (!!event.error) {
      this.votingModule.setStatus(ProcessStatus.Ready)
      return this.flashesModule.append(new Flash(mutation.payload.error, FlashType.error))
    }

    if (!!event.response && event.processId === this.approvalProcessId) {
      // Start polling for approval mined
      // await this.votingTransactionSuccess(event.response)
    }

    if (!!event.response && event.processId === this.votingProcessId) {
      // Start polling for transaction mined
      const txHash = event.response.result
      // this.txHash = txHash

      const [error, uuid] = await DatatrustModule.createTask(txHash)

      if (!!error) { console.log(error) }

      this.createPoller(uuid!, FfaDatatrustTaskType.voteListing)
    }

    if (!!event.response && event.processId === this.votingMinedProcessId) {
      // console.log(await this.web3Module.web3.eth.getTransaction(this.txHash))
      // console.log(await this.web3Module.web3.eth.getBlockNumber())
      await this.votingTransactionSuccess(event.response)
    }
  }

  protected async votingTransactionSuccess(response: any) {
    await Promise.all([
      VotingProcessModule.updateCandidateDetails(this.$store),
      VotingProcessModule.updateStaked(this.$store),
      PurchaseProcessModule.updateMarketTokenBalance(this.$store),
    ])

    this.votingModule.setStatus(ProcessStatus.Ready)
  }

  protected async allowance(): Promise<string> {
    return await MarketTokenContractModule.allowance(
      ethereum.selectedAddress,
      this.web3Module.web3,
      ethereum.selectedAddress,
      ContractsAddresses.VotingAddress)
  }

  protected async setVotingApproval() {
    const userCMTBalance = await this.getBalance()
    this.approvalProcessId = uuid4()
    this.approvalMinedProcessId = uuid4()
    this.votingModule.setApprovalMinedProcessId(this.approvalMinedProcessId)

    await MarketTokenContractModule.approve(
      ethereum.selectedAddress,
      this.web3Module.web3,
      ContractAddresses.VotingAddress,
      userCMTBalance,
      this.approvalProcessId,
      this.$store)
  }

  protected async vote(votesYes: boolean) {
    this.votingProcessId = uuid4()
    this.votingMinedProcessId = uuid4()
    this.votingModule.setVotingMinedProcessId(this.votingMinedProcessId)

    await VotingContractModule.vote(
      votesYes,
      this.candidate.hash,
      ethereum.selectedAddress,
      this.votingProcessId,
      this.$store,
    )
  }

  protected async getBalance(): Promise<string> {
    return await MarketTokenContractModule.getBalance(
      ethereum.selectedAddress,
      this.web3Module.web3,
    )
  }

  private async onVotingButtonClick(votesYes: boolean) {
    this.$root.$emit(CloseDrawer)
    this.votingModule.setStatus(ProcessStatus.Executing)

    const votingContractApproval = Number(await this.allowance())

    if (votingContractApproval < this.votingModule.candidate.stake) {
      // Approve user's entire CMT balance
      await this.setVotingApproval()
      // await this.wait(1.25 * Config.BlockchainWaitTime)
    }
    await this.vote(votesYes)
  }

  private createPoller(uuid: string, taskType: FfaDatatrustTaskType ) {
    const datatrustTaskDetail = new DatatrustTaskDetails(
      this.candidate.hash,
      taskType,
    )
    const datatrustTask = new DatatrustTask(uuid, datatrustTaskDetail)
    this.datatrustTaskModule.addTask(datatrustTask)
  }


  private async wait(ms: number): Promise<any> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}
</script>