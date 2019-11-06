
import ListingContract from '@computable/computablejs/dist/contracts/listing'
import { call } from '@computable/computablejs/dist/helpers'

import { Store } from 'vuex'
import { getModule } from 'vuex-module-decorators'

import MetamaskModule from '../metamask/MetamaskModule'

import AppModule from '../../vuexModules/AppModule'
import FlashesModule from '../../vuexModules/FlashesModule'
import FfaListingsModule from '../../vuexModules/FfaListingsModule'

import ProtocolListing from '../../interfaces/ProtocolListing'

import ContractAddresses from '../../models/ContractAddresses'
import Flash from '../../models/Flash'
import { FlashType } from '../../models/Flash'

import { Errors } from '../../util/Constants'

import Web3 from 'web3'


export default class ListingModule {

  public static async getListingContract(account: string, web3: Web3): Promise<ListingContract> {
    const contract = new ListingContract(account)
    const initialized = await contract.at(web3, ContractAddresses.ListingAddress!)
    if (!initialized) {
      throw new Error(Errors.HOC_AT_FAILED)
    }
    return contract
  }

  public static async postListing(
    account: string,
    listingHash: string,
    processId: string,
    appStore: Store<any>) {

    getModule(FlashesModule, appStore).append(
      new Flash(`listingHash: ${listingHash}`, FlashType.info))

    const listing = await ListingModule.getListingContract(
      account,
      getModule(AppModule, appStore).web3)

    const method =  await listing.list(listingHash)

    MetamaskModule.buildAndSendTransaction(
      account, method, ContractAddresses.ListingAddress!, processId, appStore)
  }

  public static async isListed(
    listingHash: string,
    account: string,
    web3: Web3): Promise<boolean> {

    const listing = await ListingModule.getListingContract(account, web3)
    const method = await listing.isListed(listingHash)
    return await call(method)
  }

  public static async resolveApplication(
    listingHash: string,
    account: string,
    processId: string,
    appStore: Store<any>) {

    const listingContract = await ListingModule.getListingContract(
      account,
      getModule(AppModule, appStore).web3)

    const method =  await listingContract.resolveApplication(listingHash)

    MetamaskModule.buildAndSendTransaction(
      account, method, ContractAddresses.ListingAddress!, processId, appStore)

    // remove listing from vuex state
    // getModule(FfaListingsModule, appStore).removeFromListed(listingHash)
  }

  public static async resolveChallenge(
    listingHash: string,
    account: string,
    processId: string,
    appStore: Store<any>) {

    const appModule = getModule(AppModule, appStore)
    const ffaListingsModule = getModule(FfaListingsModule, appStore)

    const listingContract = await ListingModule.getListingContract(account, appModule.web3)
    const method =  await listingContract.resolveChallenge(listingHash)

    MetamaskModule.buildAndSendTransaction(
      account, method, ContractAddresses.ListingAddress!, processId, appStore)

    // remove candidate from vuex state
    ffaListingsModule.removeCandidate(listingHash)
  }

  public static async challenge(
    listingHash: string,
    account: string,
    processId: string,
    appStore: Store<any>) {

    const listingContract = await ListingModule.getListingContract(
      account,
      getModule(AppModule, appStore).web3)

    const method =  await listingContract.challenge(listingHash)
    // remove listing from vuex state
    getModule(FfaListingsModule, appStore).removeFromListed(listingHash)

    MetamaskModule.buildAndSendTransaction(
      account, method, ContractAddresses.ListingAddress!, processId, appStore)
  }

  public static async getAllListingsForAccount(
    account: string,
    appStore: Store<any>): Promise<ProtocolListing[]> {

    const listingContract = await ListingModule.getListingContract(
      account,
      getModule(AppModule, appStore).web3)

    return await listingContract.deployed!.getPastEvents(
      'Listed',
      {
        filter: {
          owner: account,
        },
        fromBlock: 0, // TODO: change this to genesis block
        toBlock: 'latest',
      })
  }

  public static async claimAccessReward(
    listingHash: string,
    account: string,
    processId: string,
    appStore: Store<any>) {

    const listingContract = await ListingModule.getListingContract(
      account,
      getModule(AppModule, appStore).web3)

    const method =  await listingContract.claimAccessReward(listingHash)

    MetamaskModule.buildAndSendTransaction(
      account, method, ContractAddresses.ListingAddress!, processId, appStore)
  }
}
