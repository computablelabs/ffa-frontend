import ContractAddresses from '../../models/ContractAddresses'
import { Errors, ZERO_HASHED } from '../../util/Constants'

import { buildTransaction } from '@computable/computablejs/dist/helpers'
import ListingContract from '@computable/computablejs/dist/contracts/listing'
import { TransactOpts } from '@computable/computablejs/dist/interfaces'

import { getModule } from 'vuex-module-decorators'
import FlashesModule from '../../modules/FlashesModule'
import store from '../../store'
import Flash from '../../models/Flash'
import { FlashType } from '../../models/Flash'

import { send } from '../../util/Metamask'

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

  public static async list(account: string, web3: Web3, listingHash: string, transactOpts: TransactOpts) {
    const flashesModule = getModule(FlashesModule, store)
    flashesModule.append(new Flash(`listingHash: ${listingHash}`, FlashType.info))
    const listing = await ListingModule.getListing(account, web3)
    const method =  await listing.list(listingHash, transactOpts)
    // method[0] can be used to estimate the gas vs the abi generated figures
    const est = await method[0].estimateGas({from: account})
    const unsigned = await buildTransaction(web3, method)
    // build transaction adds `data` and `nonce` fields, but we still require `to` and `value`
    unsigned.to = ContractAddresses.ListingAddress
    unsigned.value = ZERO_HASHED
    // MM ignores any nonce, let's just remove it
    delete unsigned.nonce
    // take the larger of the two gas estimates to be safe
    if (est > unsigned.gas) {
      unsigned.gas = est
    }
    send(web3, unsigned, flashesModule)
  }
}
