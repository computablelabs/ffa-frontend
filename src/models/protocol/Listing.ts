import ProtocolSuper from './ProtocolSuper'
import ListingContract from '@computable/computablejs/dist/contracts/listing'
import { LISTING_ABI} from '@computable/computablejs/dist/constants'
import { call, buildTransaction } from '@computable/computablejs/dist/helpers'
import ContractAddresses from '../ContractAddresses'
import { Errors } from '../../util/Constants'
import { enable } from '../../util/Metamask'

import Web3 from 'web3'
import { Transaction } from 'web3/types'
import { RpcRequest, TransactionParameters } from 'global'

export default class Listing extends ProtocolSuper {

  private listing!: ListingContract

  constructor() {
    if (!ethereum.selectedAddress || ethereum.selectedAddress.length === 0) {
      throw new Error(Errors.NO_ETHEREUM_PUBLIC_KEY)
    }
    super()
    this.listing = new ListingContract(ethereum.selectedAddress)
  }

  public async init(web3: Web3) {
    this.web3 = web3
    await this.listing.at(web3, this.contractAddress)
  }

  public async list(listingHash: string, callback: (result: any, error: any) => void): Promise<string> {
    const method =  await this.listing.list(listingHash, this.transactOpts)
    return this.sendTransaction(method, callback)
  }

  public async isListed(listingHash: string): Promise<boolean> {
    const method = await this.listing.isListed(listingHash, this.transactOpts)
    const response = await call(method)
    return response as boolean
  }

  public async claimBytesAccessed(listingHash: string, callback: (result: any, error: any) => void): Promise<string> {
    const method =  await this.listing.claimBytesAccessed(listingHash, this.transactOpts)
    return this.sendTransaction(method, callback)
  }

  public get abi(): any[] {
    return LISTING_ABI
  }

  protected get contractAddress(): string {
    return ContractAddresses.ListingAddress
  }
}
