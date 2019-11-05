<template>
  <div class="voting-drawer-container">
    <div class="voting-interface-wrapper">
      <div class="voting-button-container">
        <!-- insert gavel here -->
        <span>{{ voteLabel }}</span>
        <button
          @click="onVotingButtonClick(true)"
          class="button voting-interface-button">{{ accept }}</button>
        <button
          @click="onVotingButtonClick(false)"
          class="button voting-interface-button">{{ reject }}</button>
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

import AppModule from '../../vuexModules/AppModule'
import FfaListingsModule from '../../vuexModules/FfaListingsModule'
import VotingModule from '../../vuexModules/VotingModule'
import FlashesModule from '../../vuexModules/FlashesModule'
import PurchaseModule from '../../vuexModules/PurchaseModule'
import DatatrustTaskModule from '../../vuexModules/DatatrustTaskModule'

import VotingProcessModule from '../../functionModules/components/VotingProcessModule'
import PurchaseProcessModule from '../../functionModules/components/PurchaseProcessModule'
import TaskPollerManagerModule from '../../functionModules/components/TaskPollerManagerModule'
import EventableModule from '../../functionModules/eventable/EventableModule'
import DatatrustModule from '../../functionModules/datatrust/DatatrustModule'
import EthereumModule from '../../functionModules/ethereum/EthereumModule'

import { Eventable } from '../../interfaces/Eventable'

import ContractAddresses from '../../models/ContractAddresses'
import FfaListing from '../../models/FfaListing'
import { CloseDrawer } from '../../models/Events'
import Flash, { FlashType } from '../../models/Flash'
import { ProcessStatus } from '../../models/ProcessStatus'
import DatatrustTaskDetails, { FfaDatatrustTaskType } from '../../models/DatatrustTaskDetails'
import DatatrustTask from '../../models/DatatrustTask'

import MarketTokenContractModule from '../../functionModules/protocol/MarketTokenContractModule'
import VotingContractModule from '../../functionModules/protocol/VotingContractModule'

import { Config } from '../../util/Config'
import { Placeholders, Labels } from '../../util/Constants'

import uuid4 from 'uuid/v4'

import ProcessButton from '../../components/ui/ProcessButton.vue'

@Component({
  components: {
    ProcessButton,
  },
})
export default class VotingInterface extends Vue {

  public placeholder = Placeholders.COMMENT

  public voteLabel = Labels.VOTE
  public accept = Labels.ACCEPT
  public reject = Labels.REJECT

  public notFirstVote = false
  public votesYes!: boolean

  public approvalProcessId!: string
  public votingProcessId!: string

  public approvalMinedProcessId!: string
  public votingMinedProcessId!: string

  public votingModule: VotingModule = getModule(VotingModule, this.$store)
  public ffaListingsModule: FfaListingsModule = getModule(FfaListingsModule, this.$store)
  public appModule: AppModule = getModule(AppModule, this.$store)
  public purchaseModule: PurchaseModule = getModule(PurchaseModule, this.$store)
  public flashesModule: FlashesModule = getModule(FlashesModule, this.$store)
  public datatrustTaskModule: DatatrustTaskModule = getModule(DatatrustTaskModule, this.$store)



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
      const txHash = event.response.result

      await TaskPollerManagerModule.createPoller(
        txHash,
        this.candidate.hash,
        FfaDatatrustTaskType.approveCMT,
        this.$store,
      )
    }

    if (!!event.response && event.processId === this.approvalMinedProcessId) {
      await this.vote(this.votesYes)
    }

    if (!!event.response && event.processId === this.votingProcessId) {
      const txHash = event.response.result

      await TaskPollerManagerModule.createPoller(
        txHash,
        this.candidate.hash,
        FfaDatatrustTaskType.voteListing,
        this.$store,
      )
    }

    if (!!event.response && event.processId === this.votingMinedProcessId) {
      await this.votingTransactionSuccess(event.response)
    }
  }

  protected async votingTransactionSuccess(response: any) {
    await Promise.all([
      VotingProcessModule.updateCandidateDetails(this.$store),
      VotingProcessModule.updateStaked(this.$store),
      EthereumModule.getMarketTokenBalance(this.$store),
    ])

    this.votingModule.setStatus(ProcessStatus.Ready)
  }

  protected async getAllowance(): Promise<string> {
    const allowance =  await MarketTokenContractModule.allowance(
      ethereum.selectedAddress,
      ContractAddresses.VotingAddress,
      this.appModule.web3,
    )
    this.votingModule.setMarketTokenApproved(Number(allowance))
    return allowance
  }

  protected async approveAndVote() {
    const userCMTBalance = await this.getMarketTokenBalance()
    this.approvalProcessId = uuid4()
    this.approvalMinedProcessId = uuid4()
    this.votingModule.setApprovalMinedProcessId(this.approvalMinedProcessId)

    await MarketTokenContractModule.approve(
      ethereum.selectedAddress,
      ContractAddresses.VotingAddress,
      Number(userCMTBalance),
      this.approvalProcessId,
      this.appModule.web3,
      this.$store,
    )
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

  protected async getMarketTokenBalance(): Promise<string> {
    return await MarketTokenContractModule.balanceOf(
      ethereum.selectedAddress,
      this.appModule.web3,
    )
  }

  private async onVotingButtonClick(votesYes: boolean) {
    this.$root.$emit(CloseDrawer)
    this.votingModule.setStatus(ProcessStatus.Executing)
    this.votesYes = votesYes

    await this.getAllowance()
    const enoughApproved =  this.votingModule.marketTokenApproved >= this.votingModule.stake

    enoughApproved ? await this.vote(votesYes) : await this.approveAndVote()
  }
}
</script>
