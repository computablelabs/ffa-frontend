import ListingContract from '@computable/computablejs/dist/contracts/listing'
import { TransactOpts } from '@computable/computablejs/dist/interfaces'
import { LISTING_ABI} from '@computable/computablejs/dist/constants'
import { call, buildTransaction } from '@computable/computablejs/dist/helpers'
import ContractAddresses from '../ContractAddresses'

import Web3 from 'web3'

export default class Listing {

  private web3!: Web3
  private account!: string
  private listing!: ListingContract
  private transactionOptions: TransactOpts

  constructor(account: string) {
    this.account = account
    this.listing = new ListingContract(this.account)
    this.transactionOptions = {}
  }

  public abi(): any[] {
    return LISTING_ABI
  }

  public async init(web3: Web3) {
    this.web3 = web3
    await this.listing.at(web3, ContractAddresses.ListingAddress)
  }

  public async list(listingHash: string) {
    const method =  await this.listing.list(listingHash, this.transactionOptions)
    const unsigned = await buildTransaction(this.web3, method)
    await ethereum.send(unsigned)
  }

  public async isListed(listingHash: string): Promise<boolean> {
    const method = await this.listing.isListed(listingHash, this.transactionOptions)
    const response = await call(method)
    return response as boolean
  }

  public async claimBytesAccessed(listingHash: string) {
    const method = await this.listing.claimBytesAccessed(listingHash, this.transactionOptions)
    const unsigned = await buildTransaction(this.web3, method)
    await ethereum.send(unsigned)
  }

  public async getGas(methodName: string): Promise<number> {
    return await this.listing.getGas(methodName)
  }
}
