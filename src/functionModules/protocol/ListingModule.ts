import ListingContract from '@computable/computablejs/dist/contracts/listing'
import { buildTransaction } from '@computable/computablejs/dist/helpers'
import { TransactOpts } from '@computable/computablejs/dist/interfaces'

import Web3 from 'web3'

import MetamaskModule from '../../functionModules/metamask/MetamaskModule'

import Web3Module from '../../vuexModules/Web3Module'
import FlashesModule from '../../vuexModules/FlashesModule'
import ListModule from '../../vuexModules/ListModule'
import UploadModule from '../../vuexModules/UploadModule'

import ContractAddresses from '../../models/ContractAddresses'
import Flash from '../../models/Flash'
import { FlashType } from '../../models/Flash'

import { Errors, ZERO_HASHED } from '../../util/Constants'

export default class ListingModule {

  public static async getListing(account: string, web3: Web3): Promise<ListingContract> {
    const listing = new ListingContract(account)
    const initialized = await listing.at(web3, ContractAddresses.ListingAddress)
    if (!initialized) {
      throw new Error(Errors.HOC_AT_FAILED)
    }
    return listing
  }

  public static async postListing(account: string,
                                  web3Module: Web3Module,
                                  flashesModule: FlashesModule,
                                  listModule: ListModule,
                                  uploadModule: UploadModule,
                                  transactOpts: TransactOpts,
                                  success: (response: any,
                                            flashesModule: FlashesModule,
                                            listModule: ListModule,
                                            uploadModule: UploadModule) => void) {

    flashesModule.append(new Flash(`listingHash: ${listModule.listing.hash}`, FlashType.info))
    const listing = await ListingModule.getListing(account, web3Module.web3)
    const method =  await listing.list(listModule.listing.hash, transactOpts)
    // method[0] can be used to estimate the gas vs the abi generated figures
    const est = await method[0].estimateGas({from: account})
    const unsigned = await buildTransaction(web3Module.web3, method)
    // build transaction adds `data` and `nonce` fields, but we still require `to` and `value`
    unsigned.to = ContractAddresses.ListingAddress
    unsigned.value = ZERO_HASHED
    // MM ignores any nonce, let's just remove it
    delete unsigned.nonce
    // take the larger of the two gas estimates to be safe
    if (est > unsigned.gas) {
      unsigned.gas = est
    }
    MetamaskModule.send(web3Module.web3, unsigned, flashesModule, listModule, uploadModule, success)
  }
}
