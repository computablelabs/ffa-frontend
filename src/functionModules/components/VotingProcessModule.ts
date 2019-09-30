import { Store } from 'vuex'
import { getModule } from 'vuex-module-decorators'

import Web3Module from '../../vuexModules/Web3Module'
import VotingModule from '../../vuexModules/VotingModule'
import VotingContractModule from '../../functionModules/protocol/VotingContractModule'
import FfaListingsModule from '../../vuexModules/FfaListingsModule'

export default class VotingProcessModule {
  public static async updateStaked(store: Store<any>): Promise<number> {
    const web3Module = getModule(Web3Module, store)
    const votingModule = getModule(VotingModule, store)

    const staked = await VotingContractModule.getStake(
      votingModule.candidate.hash,
      ethereum.selectedAddress,
      web3Module.web3) as number

    votingModule.setStaked(staked)
    return staked
  }

  public static async updateCandidateDetails(store: Store<any>, listingHash: string) {
    const web3Module = getModule(Web3Module, store)
    const votingModule = getModule(VotingModule, store)
    const ffaListingsModule = getModule(FfaListingsModule, store)

    const candidate = await VotingContractModule.getCandidate(
      listingHash,
      ethereum.selectedAddress,
      web3Module.web3)

    const [newYeaVotes, newNayVotes] = [(candidate as any)[4], (candidate as any)[5]]
    votingModule.updateYeaVotes(newYeaVotes)
    votingModule.updateNayVotes(newNayVotes)

    ffaListingsModule.setCandidateDetails({
      listingHash,
      newCandidateDetails: candidate,
    })

  }
}