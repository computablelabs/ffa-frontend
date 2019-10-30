import { Store } from 'vuex'
import { getModule } from 'vuex-module-decorators'

import VotingModule from '../../vuexModules/VotingModule'
import FfaListingsModule from '../../vuexModules/FfaListingsModule'
import AppModule from '../../vuexModules/AppModule'

import VotingContractModule from '../../functionModules/protocol/VotingContractModule'
import MarketTokenContractModule from '../../functionModules/protocol/MarketTokenContractModule'

import FfaListing, { FfaListingStatus } from '../../models/FfaListing'

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
  0,
)

export default class VotingProcessModule {
  public static async updateStaked(store: Store<any>): Promise<number> {
    const votingModule = getModule(VotingModule, store)

    const staked = await VotingContractModule.getStake(
      votingModule.candidate.hash,
      ethereum.selectedAddress,
      getModule(AppModule, store).web3) as number

    votingModule.setStaked(staked)
    return staked
  }

  public static async updateCandidateDetails(store: Store<any>, listingHash?: string) {

    const votingModule = getModule(VotingModule, store)
    const ffaListingsModule = getModule(FfaListingsModule, store)
    const hash = listingHash || votingModule.candidate.hash

    const candidate = await VotingContractModule.getCandidate(
      hash,
      ethereum.selectedAddress,
      getModule(AppModule, store).web3)

    const [
      stake,
      voteBy,
      newYeaVotes,
      newNayVotes,
    ] = [
      (candidate as any)[2],
      (candidate as any)[3],
      (candidate as any)[4],
      (candidate as any)[5],
    ]

    votingModule.setStake(Number(stake))
    votingModule.setVoteBy(Number(voteBy))
    votingModule.setYeaVotes(newYeaVotes)
    votingModule.setNayVotes(newNayVotes)


    ffaListingsModule.setCandidateDetails({
      listingHash: hash,
      newCandidateDetails: candidate,
    })
  }

  public static async updateChallenged(listingHash: string, store: Store<any>) {
    const appModule = getModule(AppModule, store)
    const ffaListingsModule = getModule(FfaListingsModule, store)
    const votingModule = getModule(VotingModule, store)

    const candidate = await VotingContractModule.getCandidate(
      listingHash,
      ethereum.selectedAddress,
      appModule.web3,
    )

    const [
      owner,
      stake,
      voteBy,
      newYeaVotes,
      newNayVotes,
    ] = [
      (candidate as any)[1],
      (candidate as any)[2],
      (candidate as any)[3],
      (candidate as any)[4],
      (candidate as any)[5],
    ]

    const newCandidate = emptyListing
    newCandidate.hash = listingHash
    newCandidate.status = FfaListingStatus.candidate
    newCandidate.owner = owner
    newCandidate.stake = stake
    newCandidate.voteBy = voteBy
    newCandidate.totalYeaVotes = newYeaVotes
    newCandidate.totalNayVotes = newNayVotes

    ffaListingsModule.addCandidate(newCandidate)

    votingModule.setCandidate(newCandidate)
    votingModule.setStake(Number(stake))
    votingModule.setVoteBy(Number(voteBy))
    votingModule.setYeaVotes(newYeaVotes)
    votingModule.setNayVotes(newNayVotes)
  }
}
