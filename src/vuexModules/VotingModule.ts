import {
  Module,
  VuexModule,
  Mutation } from 'vuex-module-decorators'
import FfaProcessModule from '../interfaces/vuex/FfaProcessModule'
import { ProcessStatus } from '../models/ProcessStatus'
import FfaListing, { FfaListingStatus } from '../../src/models/FfaListing'

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
  public stake = 0
  public votingTransactionId = ''
  public listingDidPass = false

  @Mutation
  public reset() {
    this.status = ProcessStatus.NotReady
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
  public setStake(stake: number) {
    this.stake = stake
  }

  @Mutation
  public setListingDidPass(listingDidPass: boolean) {
    this.listingDidPass = listingDidPass
  }

  @Mutation
  public setVotingTransactionId(transactionId: string) {
    this.votingTransactionId = transactionId
  }

  get namespace(): string {
    return 'votingModule'
  }

  get processStatus(): ProcessStatus {
    return this.status
  }
}
