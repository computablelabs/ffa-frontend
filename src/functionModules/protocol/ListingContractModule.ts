
import ListingContract from '@computable/computablejs/dist/contracts/listing'
import { call } from '@computable/computablejs/dist/helpers'
import { TransactOpts } from '@computable/computablejs/dist/interfaces'

import { Store } from 'vuex'
import { getModule } from 'vuex-module-decorators'

import MetamaskModule from '../metamask/MetamaskModule'

import Web3Module from '../../vuexModules/Web3Module'
import FlashesModule from '../../vuexModules/FlashesModule'
import FfaListingsModule from '../../vuexModules/FfaListingsModule'

import ContractAddresses from '../../models/ContractAddresses'
import Flash from '../../models/Flash'
import { FlashType } from '../../models/Flash'

import { Errors } from '../../util/Constants'

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

  public static async postListing(
    account: string,
    listingHash: string,
    appStore: Store<any>,
    success: (
      response: any,
      appStore: Store<any>) => void,
    transactOpts: TransactOpts) {

    const flashesModule = getModule(FlashesModule, appStore)
    const web3Module = getModule(Web3Module, appStore)

    flashesModule.append(new Flash(`listingHash: ${listingHash}`, FlashType.info))

    const listing = await ListingModule.getListing(account, web3Module.web3)
    const method =  await listing.list(listingHash, transactOpts)

    MetamaskModule.buildAndSendTransaction(
      account, method, ContractAddresses.ListingAddress, appStore, success)
  }

  public static async isListed(
    listingHash: string,
    account: string,
    web3: Web3,
    transactOpts: TransactOpts): Promise<boolean> {

    const listing = await ListingModule.getListing(account, web3)
    const method = await listing.isListed(listingHash, transactOpts)
    return await call(method)
  }

  public static async resolveApplication(
    listingHash: string,
    account: string,
    appStore: Store<any>,
    success: (
      response: any,
      appStore: Store<any>) => void,
    transactOpts: TransactOpts) {

    const web3Module = getModule(Web3Module, appStore)
    const ffaListingsModule = getModule(FfaListingsModule, appStore)

    const listingContract = await ListingModule.getListing(account, web3Module.web3)
    const method =  await listingContract.resolveApplication(listingHash, transactOpts)

    // remove listing from vuex state
    ffaListingsModule.removeFromListed(listingHash)

    MetamaskModule.buildAndSendTransaction(
      account, method, ContractAddresses.ListingAddress, appStore, success)
  }

  public static async challenge(
    listingHash: string,
    account: string,
    appStore: Store<any>,
    success: (
      response: any,
      appStore: Store<any>) => void,
    transactOpts: TransactOpts) {

    const web3Module = getModule(Web3Module, appStore)
    const ffaListingsModule = getModule(FfaListingsModule, appStore)

    const listingContract = await ListingModule.getListing(account, web3Module.web3)
    const method =  await listingContract.challenge(listingHash, transactOpts)

    // remove listing from vuex state
    ffaListingsModule.removeFromListed(listingHash)

    MetamaskModule.buildAndSendTransaction(
      account, method, ContractAddresses.ListingAddress, appStore, success)
  }
}
