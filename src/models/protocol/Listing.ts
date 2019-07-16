import ListingContract from '@computable/computablejs/dist/contracts/listing'
import { TransactOpts } from '@computable/computablejs/dist/interfaces'
import { LISTING_ABI } from '@computable/computablejs/dist/constants'
import { deploy, readBytecode } from '@computable/computablejs/dist/helpers'
import ContractAddresses from '../ContractAddresses'
import ServerAddresses from '../ServerAddresses'

import { Transaction } from 'web3/types'

import Web3 from 'web3'

export default class Listing {

  private account!: string
  private w3!: Web3
  private listing!: ListingContract
  private transactionOptions: TransactOpts

  constructor(account: string) {
    this.account = account
    this.listing = new ListingContract(this.account)
    this.transactionOptions = {}
  }

  public async init() {
    this.w3 = new Web3(ServerAddresses.Skynet)

    const bin: string = readBytecode('listing')
    const deployed = await deploy(
      this.w3,
      this.account,
      LISTING_ABI,
      bin,
      [ContractAddresses.MarketTokenAddress,
        ContractAddresses.VotingAddress,
        ContractAddresses.P11rAddress,
        ContractAddresses.ReserveAddress,
        ContractAddresses.DatatrustAddress])

    await this.listing.at(this.w3, deployed.options.address)
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
