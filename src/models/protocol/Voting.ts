import ProtocolSuper from './ProtocolSuper'
import VotingContract from '@computable/computablejs/dist/contracts/voting'
import { TransactOpts } from '@computable/computablejs/dist/interfaces'
import { VOTING_ABI} from '@computable/computablejs/dist/constants'
import { call, buildTransaction } from '@computable/computablejs/dist/helpers'
import ContractAddresses from '../ContractAddresses'
import { Errors } from '../../util/Constants'

import Web3 from 'web3'

export default class Voting extends ProtocolSuper {

  private voting!: VotingContract

  constructor() {
    if (!ethereum.selectedAddress || ethereum.selectedAddress.length === 0) {
      throw new Error(Errors.NO_ETHEREUM_PUBLIC_KEY)
    }
    super()
    this.voting = new VotingContract(ethereum.selectedAddress)
  }

  public async init(web3: Web3) {
    this.web3 = web3
    await this.voting.at(web3, ContractAddresses.VotingAddress)
  }

  public async isCandidate(listingHash: string): Promise<boolean> {
    const method = await this.voting.isCandidate(listingHash, this.transactOpts)
    const response = await call(method)
    return response as boolean
  }

  public async vote(listingHash: string, isYea: boolean, callback: (result: any, error: any) => void): Promise<string> {
    const vote = isYea ? 1 : 0
    const method =  await this.voting.vote(listingHash, vote, this.transactOpts)
    return this.sendTransaction(method, callback)
  }

  public get abi(): any[] {
    return VOTING_ABI
  }

  protected get contractAddress(): string {
    return ContractAddresses.VotingAddress
  }
}
