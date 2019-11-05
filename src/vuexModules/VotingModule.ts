import {
  Module,
  VuexModule,
  Mutation } from 'vuex-module-decorators'
import FfaProcessModule from '../interfaces/vuex/FfaProcessModule'
import { ProcessStatus } from '../models/ProcessStatus'
import FfaListing, { FfaListingStatus } from '../../src/models/FfaListing'
import { VotingActionStep } from '../models/VotingActionStep'
import FfaListingViewModule from '../../src/functionModules/views/FfaListingViewModule'

const emptyListing = new FfaListing(
  '',
  '',
  '',
  '',
  '',
  '',
  0,
  '',
  [],
  FfaListingStatus.new,
  0,
  0)

@Module({ namespaced: true, name: 'votingModule' })
export default class VotingModule extends VuexModule implements FfaProcessModule {
  public status = ProcessStatus.NotReady
  public resolveChallengeStatus = ProcessStatus.Ready
  public percentComplete = 0
  public candidate = emptyListing
  public staked = 0
  public stake = 0
  public voteBy = 0
  public listingDidPass = false
  public candidateIsApp = false
  public yeaVotes = 0
  public nayVotes = 0
  public votingStep = VotingActionStep.ApproveSpending
  public resolveApplicationStatus = ProcessStatus.Ready

  public votingTransactionId = '' // TODO: rename
  public approvalTransactionId = '' // TODO: renmae
  public challengeTransactionId = '' // TODO: renmae
  public resolveTransactionId = '' // TODO: renmae
  public resolveChallengeTransactionId = '' // TODO: renmae

  @Mutation
  public reset() {
    // this.resolveAppStatus = ProcessStatus.Ready
    // this.resolveChallengeStatus = ProcessStatus.Ready
    this.status = ProcessStatus.NotReady
    this.candidate = emptyListing
    this.staked = 0
    this.yeaVotes = 0
    this.nayVotes = 0
    this.votingStep = VotingActionStep.ApproveSpending
    this.voteBy = 0
    this.stake = 0
    this.listingDidPass = false
  }

  @Mutation
  public resetVoting() {
    this.status = ProcessStatus.Ready
    this.votingStep = VotingActionStep.ApproveSpending
  }

  @Mutation
  public resetResolveApplication() {
    this.resolveApplicationStatus = ProcessStatus.Ready
  }

  @Mutation
  public prepare() {
    // do nothing
  }

  @Mutation
  public setPercentComplete(percentComplete: number) {
    this.percentComplete = percentComplete
  }

  @Mutation
  public setStatus(status: ProcessStatus) {
    this.status = status
  }

  @Mutation
  public setResolveApplicationStatus(status: ProcessStatus) {
    this.resolveApplicationStatus = status
  }

  @Mutation
  public setResolveChallengeStatus(status: ProcessStatus) {
    this.resolveChallengeStatus = status
  }

  @Mutation
  public setCandidate(candidate: FfaListing) {
    this.candidate = candidate
  }

  @Mutation
  public setStaked(staked: number) {
    this.staked = staked
  }

  @Mutation
  public setStake(stake: number) {
    this.stake = stake
  }

  @Mutation
  public setVoteBy(voteBy: number) {
    this.voteBy = voteBy
  }

  @Mutation
  public setListingDidPass(listingDidPass: boolean) {
    this.listingDidPass = listingDidPass
  }

  @Mutation
  public setCandidateIsApp(candidateIsApp: boolean) {
    this.candidateIsApp = candidateIsApp
  }

  @Mutation
  public setVotingTransactionId(transactionId: string) {
    this.votingTransactionId = transactionId
  }

  @Mutation
  public setApprovalTransactionId(transactionId: string) {
    this.approvalTransactionId = transactionId
  }

  @Mutation
  public setResolveAppTransactionId(transactionId: string) {
    this.resolveTransactionId = transactionId
  }

  @Mutation
  public setResolveChallengeTransactionId(transactionId: string) {
    this.resolveChallengeTransactionId = transactionId
  }

  @Mutation
  public setYeaVotes(yeaVotes: string) {
    this.yeaVotes = Number(yeaVotes)
  }

  @Mutation
  public setNayVotes(nayVotes: string) {
    this.nayVotes = Number(nayVotes)
  }

  @Mutation
  public setVotingStep(votingStep: VotingActionStep) {
    this.votingStep = votingStep
  }

  get namespace(): string {
    return 'votingModule'
  }

  get processStatus(): ProcessStatus {
    return this.status
  }
}
