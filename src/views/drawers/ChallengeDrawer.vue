<template>

  <div
    class="challenge-error"
    v-if="isError">
    CHANGE ME An Error occurred
  </div>

  <div
    class="challenge-drawer-wrapper"
    v-else>

    <h1>Challenge listing</h1>
    <p class="space-below">
      You must stake
      <span class="token dark">CMT</span>
      {{ stakeInEth }}
    </p>
    <p>If your challenge succeeds, you will get your stake back</p>
    <p class="space-below">If your challenge fails, you will lose your stake</p>

    <VotingApproveSpendingStep
      v-if="showApproval"
      :listingHash="listingHash"
      :taskType="challengeTaskType"/>

    <VotingChallengeStep
      v-if="showChallenge"
      :listingHash="listingHash"/>

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

import AppModule from '../../vuexModules/AppModule'
import ChallengeModule from '../../vuexModules/ChallengeModule'
import DrawerModule from '../../vuexModules/DrawerModule'

import EthereumModule from '../../functionModules/ethereum/EthereumModule'

import { Eventable } from '../../interfaces/Eventable'

import ContractAddresses from '../../models/ContractAddresses'
import { ChallengeClick, OpenDrawer } from '../../models/Events'
import Flash, { FlashType } from '../../models/Flash'
import { ProcessStatus } from '../../models/ProcessStatus'
import { FfaDatatrustTaskType } from '../../models/DatatrustTaskDetails'
import { VotingActionStep } from '../../models/VotingActionStep'
import { CloseDrawer } from '../../models/Events'

import BaseDrawer from './BaseDrawer.vue'
import VotingApproveSpendingStep from '@/components/voting/VotingApproveSpendingStep.vue'
import VotingChallengeStep from '@/components/voting/VotingChallengeStep.vue'
import DrawerMessage from '@/components/ui/DrawerMessage.vue'

import { Labels } from '../../util/Constants'

import uuid4 from 'uuid/v4'
import BigNumber from 'bignumber.js'

import '@/assets/style/components/challenge-drawer.sass'

import '@/assets/style/components/challenge-drawer.sass'

@Component({
  components: {
    VotingApproveSpendingStep,
    VotingChallengeStep,
    DrawerMessage,
  },
})
export default class ChallengeDrawer extends BaseDrawer {

  @Prop()
  public listingHash!: string

  public challengeTaskType = FfaDatatrustTaskType.challengeApproveSpending

  public appModule = getModule(AppModule, this.$store)
  public challengeModule = getModule(ChallengeModule, this.$store)

  private willNeedApprovalThisSession = true

  public unsubscribe!: () => void

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

   public get showApproval(): boolean {
    const show = this.challengeModule.challengeStep < VotingActionStep.Complete && this.willNeedApprovalThisSession
    console.log(`show approval: ${show}`)
    return show
  }

  public get showChallenge(): boolean {
    const show = this.challengeModule.challengeStep < VotingActionStep.Complete
    console.log(`show challenge: ${show}`)
    return show
  }

  public get isComplete(): boolean {
    return this.challengeModule.challengeStep === VotingActionStep.Complete
  }

  public created() {
    this.unsubscribe = this.$store.subscribe(this.vuexSubscriptions)
  }

  public async mounted() {
    console.log(`vac is ${VotingActionStep}`)

    await EthereumModule.getMarketTokenContractAllowance(ContractAddresses.VotingAddress!, this.$store)

    this.challengeModule.setStatus(ProcessStatus.Ready)

    let nextStep = VotingActionStep.ApproveSpending
    console.log(`allowance: ${this.appModule.votingContractAllowance}`)
    console.log(`stake: ${this.appModule.stake} `)
    console.log(`bool: ${this.appModule.votingContractAllowance >= this.appModule.stake}`)
    if (this.appModule.votingContractAllowance >= this.appModule.stake) {
      nextStep = VotingActionStep.VotingAction
      this.willNeedApprovalThisSession = false
    }
    console.log(`nextStep: ${nextStep}`)
    this.challengeModule.setChallengeStep(nextStep)

    getModule(DrawerModule, this.$store).setDrawerOpenClass('open-start-challenge')

    this.$nextTick(() => {
      this.$root.$emit(OpenDrawer)
      getModule(DrawerModule, this.$store).setDrawerCanClose(true)
    })

    console.log('ChallengeDrawer mounted')
  }

  public beforeDestroy() {
    this.unsubscribe()
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
