import {
  Module,
  VuexModule,
  Mutation } from 'vuex-module-decorators'
import FfaProcessModule from '../interfaces/vuex/FfaProcessModule'
import { ProcessStatus } from '../models/ProcessStatus'
import FfaListing, { FfaListingStatus } from '../../src/models/FfaListing'
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
  public status: ProcessStatus = ProcessStatus.NotReady
  public percentComplete = 0
  public voteInFavor = false
  public candidate = emptyListing
  public staked = 0
  public stake = 0
  public voteBy = 0
  public votingTransactionId = ''
  public listingDidPass = false
  public yeaVotes = 0
  public nayVotes = 0

  @Mutation
  public reset() {
    this.status = ProcessStatus.Ready
    this.candidate = emptyListing
    this.staked = 0
    this.yeaVotes = 0
    this.nayVotes = 0
  }

  @Mutation
  public prepare(voteInFavor: boolean) {
    this.voteInFavor = voteInFavor
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
  public setVotingTransactionId(transactionId: string) {
    this.votingTransactionId = transactionId
  }

  @Mutation
  public setYeaVotes(yeaVotes: string) {
    this.yeaVotes = Number(yeaVotes)
  }

  @Mutation
  public setNayVotes(nayVotes: string) {
    this.nayVotes = Number(nayVotes)
  }

  get namespace(): string {
    return 'votingModule'
  }

  get processStatus(): ProcessStatus {
    return this.status
  }

  get votingFinished(): boolean {
    return new Date() > FfaListingViewModule.epochConverter(this.candidate.voteBy)
  }
}
