import { Transaction } from '../../global'
import ListingContract from '@computable/computablejs/dist/contracts/listing'
import { buildTransaction, call } from '@computable/computablejs/dist/helpers'
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
import FfaListingsModule from 'vuexModules/FfaListingsModule'
import FfaListing from 'models/FfaListing'

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

    this.sendTransaction(account, method, web3Module, flashesModule, listModule, uploadModule, success)
  }

  public static async isListed(account: string,
                               web3Module: Web3Module,
                               flashesModule: FlashesModule,
                               listModule: ListModule,
                               uploadModule: UploadModule,
                               transactOpts: TransactOpts,
                               inputListing: FfaListing,
                               success: (response: any,
                                         flashesModule: FlashesModule,
                                         listModule: ListModule,
                                         uploadModule: UploadModule) => void) {
    const listing = await ListingModule.getListing(account, web3Module.web3)
    const method = await listing.isListed(inputListing.hash, transactOpts)
    return await call(method)
  }

  public static async resolveApplication(account: string,
                                         web3Module: Web3Module,
                                         flashesModule: FlashesModule,
                                         listModule: ListModule,
                                         ffaListingsModule: FfaListingsModule,
                                         uploadModule: UploadModule,
                                         transactOpts: TransactOpts,
                                         inputListing: FfaListing,
                                         success: (response: any,
                                                   flashesModule: FlashesModule,
                                                   listModule: ListModule,
                                                   uploadModule: UploadModule) => void) {
    const listing = await ListingModule.getListing(account, web3Module.web3)
    const method =  await listing.resolveApplication(inputListing.hash, transactOpts)

    // remove inputListing from vuex state
    ffaListingsModule.removeFromListed(inputListing)
    this.sendTransaction(account, method, web3Module, flashesModule, listModule, uploadModule, success)
  }

  public static async sendTransaction(account: string,
                                      method: [Transaction, TransactOpts],
                                      web3Module: Web3Module,
                                      flashesModule: FlashesModule,
                                      listModule: ListModule,
                                      uploadModule: UploadModule,
                                      success: (response: any,
                                                flashesModule: FlashesModule,
                                                listModule: ListModule,
                                                uploadModule: UploadModule) => void) {
    //  get gas estimate using method[0]
    // @ts-ignore
    const est = await method[0].estimateGas({from: account})
    const unsigned = await buildTransaction(web3Module.web3, method)
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
