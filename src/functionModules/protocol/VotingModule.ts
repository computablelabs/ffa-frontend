import ContractAddresses from '../../models/ContractAddresses'
import { Errors } from '../../util/Constants'

import { buildTransaction } from '@computable/computablejs/dist/helpers'
import VotingContract from '@computable/computablejs/dist/contracts/voting'
import { TransactOpts } from '@computable/computablejs/dist/interfaces'

import Web3 from 'web3'

export default class VotingModule {

  public static async getVoting(account: string, web3: Web3): Promise<VotingContract> {
    const voting = new VotingContract(account)
    const initialized = await voting.at(web3, ContractAddresses.VotingAddress)
    if (!initialized) {
      throw new Error(Errors.HOC_AT_FAILED)
    }
    return voting
  }

  // TODO: actual metamask/ethereum send() implemention and transaction hash return
  public static async vote(
    account: string,
    web3: Web3,
    listingHash: string,
    votesYes: boolean,
    transactOpts: TransactOpts) {

    const voteVal = votesYes ? 1 : 0
    const voting = await VotingModule.getVoting(account, web3)
    const method =  await voting.vote(listingHash, voteVal, transactOpts)
    const unsigned = await buildTransaction(web3, method)
    await ethereum.send(unsigned)
  }
}
