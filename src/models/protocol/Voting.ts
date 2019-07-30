import VotingContract from '@computable/computablejs/dist/contracts/voting'
import { TransactOpts } from '@computable/computablejs/dist/interfaces'
import { VOTING_ABI} from '@computable/computablejs/dist/constants'
import { call, buildTransaction } from '@computable/computablejs/dist/helpers'
import ContractAddresses from '../ContractAddresses'

import Web3 from 'web3'

export default class Voting {

  private web3!: Web3
  private account!: string
  private voting!: VotingContract
  private transactionOptions: TransactOpts

  constructor(account: string) {
    this.account = account
    this.voting = new VotingContract(this.account)
    this.transactionOptions = {}
  }

  public abi(): any[] {
    return VOTING_ABI
  }

  public async init(web3: Web3) {
    this.web3 = web3
    await this.voting.at(web3, ContractAddresses.VotingAddress)
  }

  public async isCandidate(listingHash: string): Promise<boolean> {
    const method = await this.voting.isCandidate(listingHash, this.transactionOptions)
    const response = await call(method)
    return response as boolean
  }

  public async vote(listingHash: string, isYea: boolean) {
    const vote = isYea ? 1 : 0
    const method =  await this.voting.vote(listingHash, vote, this.transactionOptions)
    const unsigned = await buildTransaction(this.web3, method)
    await ethereum.send(unsigned)
  }

  public async getGas(methodName: string): Promise<number> {
    return await this.voting.getGas(methodName)
  }
}
