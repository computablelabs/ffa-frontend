import ContractAddresses from '../../models/ContractAddresses'
import { Errors } from '../../util/Constants'

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
    const unsigned = await buildTransaction(web3, method)
    unsigned.to = ContractAddresses.ListingAddress
    unsigned.value = '0x0'
    send(web3, unsigned, flashesModule)
  }
}
