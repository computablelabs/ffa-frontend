import ContractAddresses from '../../models/ContractAddresses'
import { Errors } from '../../util/Constants'

import { buildTransaction } from '@computable/computablejs/dist/helpers'
import ListingContract from '@computable/computablejs/dist/contracts/listing'
import { TransactOpts } from '@computable/computablejs/dist/interfaces'

import Web3 from 'web3'

export default class ListingModule {

  public static async getListing(account: string, web3: Web3): Promise<ListingContract> {
    const listing = new ListingContract(account)
    const initialized = await listing.at(web3, ContractAddresses.ListingAddress)
    if (!initialized) {
      throw new Error(Errors.HOC_AT_FAILED)
    }
    return listing
  }

  // TODO: actual metamask/ethereum send() implemention and transaction hash return
  public static async list(account: string, web3: Web3, listingHash: string, transactOpts: TransactOpts) {
    const listing = await ListingModule.getListing(account, web3)
    const method =  await listing.list(listingHash, transactOpts)
    const unsigned = await buildTransaction(web3, method)
    await ethereum.send(unsigned)
  }
}
