<template>
  <div
    class="challenge-error"
    v-if="isError">
    CHANGE ME This listing can no longer be challenged
  </div>
  <div
    class="challenge-drawer-wrapper"
    v-else>
    <h2>Challenge this listing</h2>
    <p>You must stake {{stakeInEth}} CMT to challenge a listing.</p>
    <p>Your balance is {{marketTokenBalance}} CMT.</p>
    <p>If your challenge succeeds, you will get your stake back.</p>
    <p>If your challenge fails, you will lose your stake.</p>

    <VotingApproveSpendingStep
      :listingHash="listingHash"
      :taskType="taskType"
      v-if="needsApproval"/>

    <VotingChallengeStep
      :listingHash="listingHash"
      v-if="showChallenge"/>

    <DrawerMessage
      v-if="isComplete">
      <div slot="messageSlot" class="check-light-icon drawer-message">
        CHANGE ME Listing Challenged
      </div>
    </DrawerMessage>
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
import DrawerModule from '../../vuexModules/DrawerModule'

import EthereumModule from '../../functionModules/ethereum/EthereumModule'

import { Labels } from '../../util/Constants'

import ContractAddresses from '../../models/ContractAddresses'
import { ApproveSpendingClick, ChallengeClick, OpenDrawer } from '../../models/Events'
import Flash, { FlashType } from '../../models/Flash'
import { ProcessStatus } from '../../models/ProcessStatus'

import { Eventable } from '../../interfaces/Eventable'

import { FfaDatatrustTaskType } from '../../models/DatatrustTaskDetails'
import { VotingActionStep } from '../../models/VotingActionStep'
import { CloseDrawer } from '../../models/Events'

import BaseDrawer from './BaseDrawer.vue'
import VotingApproveSpendingStep from '@/components/voting/VotingApproveSpendingStep.vue'
import VotingChallengeStep from '@/components/voting/VotingChallengeStep.vue'

import BigNumber from 'bignumber.js'

import '@/assets/style/components/challenge-drawer.sass'

@Component({
  components: {
    VotingApproveSpendingStep,
    VotingChallengeStep,
  },
})
export default class ChallengeDrawer extends BaseDrawer {

  @Prop()
  public listingHash!: string

  public taskType = FfaDatatrustTaskType.challengeApproveSpending

  public appModule = getModule(AppModule, this.$store)
  public challengeModule = getModule(ChallengeModule, this.$store)

  public get isError(): boolean {
    return this.challengeModule.challengeStep === VotingActionStep.Error
  }

  public get stakeInEth(): string {
    return Number(EthereumModule.weiToEther(this.appModule.stake, this.appModule.web3)).toFixed(3)
  }

  public get marketTokenBalance(): string {
    const big = new BigNumber(this.appModule.marketTokenBalance)
    const bn = this.appModule.web3.utils.toBN(big)
    return Number(this.appModule.web3.utils.fromWei(bn)).toFixed(3)
  }

  public get needsApproval(): boolean {
    // console.log(`${this.appModule.marketTokenContractAllowance}`)
    // console.log(`${this.appModule.stake}`)
    // console.log(`${this.appModule.marketTokenContractAllowance < this.appModule.stake}`)
    return this.appModule.marketTokenContractAllowance < this.appModule.stake &&
      this.challengeModule.challengeStep < VotingActionStep.VotingAction
  }

  public get showChallenge(): boolean {
    return this.challengeModule.challengeStep === VotingActionStep.VotingAction ||
      this.challengeModule.challengeStep === VotingActionStep.VotingActionPending
  }

  public get isComplete(): boolean {
    return this.challengeModule.challengeStep === VotingActionStep.Complete
  }

  public created() {
    this.$store.subscribe(this.vuexSubscriptions)
  }

  public mounted() {
    this.challengeModule.setStatus(ProcessStatus.Ready)
    this.challengeModule.setChallengeStep(VotingActionStep.ApproveSpending)
    getModule(DrawerModule, this.$store).setDrawerOpenClass('open200')
    this.$nextTick(() => {
      this.$root.$emit(OpenDrawer)
      getModule(DrawerModule, this.$store).setDrawerCanClose(true)
    })
    console.log('ChallengeDrawer mounted')
  }

  public async vuexSubscriptions(mutation: MutationPayload) {
    if (mutation.type === 'challengeModule/setChallengeStep') {
      switch (mutation.payload) {

        case VotingActionStep.ApprovalPending:
        case VotingActionStep.VotingActionPending:
          return this.drawerModule.setDrawerCanClose(false)

        default:
          return this.drawerModule.setDrawerCanClose(true)
      }
    }
  }
}
</script>
