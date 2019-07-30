import ListingContract from '@computable/computablejs/dist/contracts/listing'
import { TransactOpts } from '@computable/computablejs/dist/interfaces'
import ContractAddresses from '../ContractAddresses'
import ServerAddresses from '../ServerAddresses'
import { Transaction } from 'web3/types'

import Web3 from 'web3'

export default class Listing {

  private account!: string
  private listing!: ListingContract
  private transactionOptions: TransactOpts

  constructor(account: string) {
    this.account = account
    this.listing = new ListingContract(this.account)
    this.transactionOptions = {}
  }

  public async init(web3: Web3) {
    await this.listing.at(web3, ContractAddresses.ListingAddress)
  }

  public async list(listingHash: string) {
    await this.listing.list(listingHash, this.transactionOptions)
  }

  public async isListed(listingHash: string): Promise<boolean> {
    const response = await this.listing.isListed(listingHash, this.transactionOptions)
    const tx = response[0]
    return tx.value as boolean
  }

  public async getGas(methodName: string): Promise<number> {
    return await this.listing.getGas(methodName)
  }

  public async claimBytesAccessed(listingHash: string): Promise<number> {
    const response = await this.listing.claimBytesAccessed(listingHash, this.transactionOptions)
    const tx = response[0]
    return tx.value as number
  }
}
