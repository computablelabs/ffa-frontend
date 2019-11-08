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
  public static async updateStaked(listingHash: string, store: Store<any>): Promise<number> {
    const votingModule = getModule(VotingModule, store)

    const staked = await VotingContractModule.getStake(
      listingHash,
      ethereum.selectedAddress,
      getModule(AppModule, store).web3)
    console.log(`staked: ${staked}`)
    votingModule.setStaked(Number(staked))
    return staked
  }

  public static async updateCandidateDetails(listingHash: string, store: Store<any>) {
    console.log(`updateCandidateDetails called with listingHash: ${listingHash}`)
    const votingModule = getModule(VotingModule, store)
    const ffaListingsModule = getModule(FfaListingsModule, store)

    const candidate = await VotingContractModule.getCandidate(
      listingHash,
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
    votingModule.setVoteBy(Number(voteBy) * 1000)
    votingModule.setYeaVotes(newYeaVotes)
    votingModule.setNayVotes(newNayVotes)

    ffaListingsModule.setCandidateDetails({
      listingHash,
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

    const newListed = emptyListing
    newListed.hash = listingHash
    newListed.status = FfaListingStatus.candidate
    newListed.owner = owner
    newListed.stake = stake

    newListed.totalYeaVotes = newYeaVotes
    newListed.totalNayVotes = newNayVotes

    ffaListingsModule.addToListed(newListed)

    votingModule.setCandidate(newListed)
    votingModule.setStake(Number(stake))
    votingModule.setVoteBy(Number(voteBy) * 1000)
    votingModule.setYeaVotes(newYeaVotes)
    votingModule.setNayVotes(newNayVotes)

    ffaListingsModule.setListedDetails({
      listingHash,
      newListedDetails: newListed,
    })
  }
}
